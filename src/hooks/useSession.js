import { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '../lib/firebase';
import { 
    doc, 
    onSnapshot, 
    setDoc, 
    getDoc, 
    updateDoc, 
    deleteDoc, 
    deleteField, 
    collection, 
    query, 
    orderBy, 
    limit, 
    startAfter, 
    startAt, 
    endAt, 
    getDocs, 
    writeBatch 
} from 'firebase/firestore';

import { STUDIOS } from '../constants/studios';

// Helper to collect all preset songs from all studios
const getAllPresetSongs = () => {
    const allPresetSongs = [];
    const seenTitles = new Set();
    
    STUDIOS.forEach(studio => {
        const preset = studio.defaultPreset || [];
        preset.forEach(song => {
            if (song.title && song.title.trim()) {
                const titleKey = song.title.toLowerCase().trim();
                if (!seenTitles.has(titleKey)) {
                    seenTitles.add(titleKey);
                    allPresetSongs.push(song);
                }
            }
        });
    });
    return allPresetSongs;
};

export const useSession = (sessionId, role, sessionName) => {
  const [masterNotes, setMasterNotes] = useState("");
  const [personalNotes, setPersonalNotes] = useState("");
  const [songPersonalNotes, setSongPersonalNotes] = useState({}); // Map of songId -> note
  const [songs, setSongs] = useState([]);
  const [library, setLibrary] = useState([]); // Array of library songs loaded
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [hasMoreLibrary, setHasMoreLibrary] = useState(true);
  const hasMoreLibraryRef = useRef(true);
  const lastVisibleRef = useRef(null);
  const libraryLoadingRef = useRef(false);
  
  const [broadcastMessage, setBroadcastMessage] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize Session, Migrate legacy fields, and Subscribe
  useEffect(() => {
    if (!sessionId) return;
    
    let unsubSongs = () => {};
    let unsubSession = () => {};

    const initAndSubscribe = async () => {
        try {
            const docRef = doc(db, 'sessions', sessionId);
            const docSnap = await getDoc(docRef);
            
            // 1. Auto-migration check
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.songs !== undefined || data.library !== undefined) {
                    console.log("Migrating legacy session data to subcollections...");
                    const batch = writeBatch(db);
                    
                    if (data.songs && Array.isArray(data.songs)) {
                        data.songs.forEach((song, idx) => {
                            const songRef = doc(db, 'sessions', sessionId, 'songs', song.id);
                            batch.set(songRef, {
                                ...song,
                                order: idx,
                                title_lowercase: (song.title || '').toLowerCase()
                            });
                        });
                    }
                    
                    if (data.library && Array.isArray(data.library)) {
                        data.library.forEach((libSong) => {
                            const libRef = doc(db, 'sessions', sessionId, 'library', libSong.id);
                            batch.set(libRef, {
                                ...libSong,
                                title_lowercase: (libSong.title || '').toLowerCase()
                            });
                        });
                    }
                    
                    // Delete legacy fields
                    batch.update(docRef, {
                        songs: deleteField(),
                        library: deleteField()
                    });
                    
                    await batch.commit();
                    console.log("Migration complete!");
                }

                // Self-healing migration check for subcollections
                const libQuery = collection(db, 'sessions', sessionId, 'library');
                const libSnap = await getDocs(libQuery);
                const libBatch = writeBatch(db);
                let needsLibUpdate = false;
                libSnap.forEach(d => {
                    const dData = d.data();
                    if (!dData.title_lowercase) {
                        needsLibUpdate = true;
                        libBatch.update(d.ref, {
                            title_lowercase: (dData.title || '').toLowerCase()
                        });
                    }
                });
                if (needsLibUpdate) {
                    await libBatch.commit();
                    console.log("Migration: Added title_lowercase to legacy library docs.");
                }

                const songsQueryRaw = collection(db, 'sessions', sessionId, 'songs');
                const songsSnap = await getDocs(songsQueryRaw);
                const songsBatch = writeBatch(db);
                let needsSongsUpdate = false;
                songsSnap.forEach((d, idx) => {
                    const dData = d.data();
                    const updates = {};
                    if (!dData.title_lowercase) {
                        needsSongsUpdate = true;
                        updates.title_lowercase = (dData.title || '').toLowerCase();
                    }
                    if (dData.order === undefined) {
                        needsSongsUpdate = true;
                        updates.order = idx;
                    }
                    if (Object.keys(updates).length > 0) {
                        songsBatch.update(d.ref, updates);
                    }
                });
                if (needsSongsUpdate) {
                    await songsBatch.commit();
                    console.log("Migration: Fixed order/title_lowercase in songs subcollection.");
                }
            } else {
                // 2. Create new session with subcollections
                const knownStudio = STUDIOS.find(s => s.id === sessionId);
                const initialSongs = knownStudio ? knownStudio.defaultPreset : [];
                
                const hydratedSongs = initialSongs.map((s, idx) => ({
                    ...s, 
                    id: Date.now().toString() + '-' + idx + '-' + Math.random().toString(36).substr(2, 4),
                    category: s.category || 'Slow Acoustic'
                }));

                const allPresetSongs = getAllPresetSongs();
                const mergedInitialSongs = [];
                const seenInitialTitles = new Set();

                hydratedSongs.forEach(s => {
                    const titleKey = s.title.toLowerCase().trim();
                    if (s.title && !seenInitialTitles.has(titleKey)) {
                        seenInitialTitles.add(titleKey);
                        mergedInitialSongs.push(s);
                    }
                });

                allPresetSongs.forEach(s => {
                    const titleKey = s.title.toLowerCase().trim();
                    if (s.title && !seenInitialTitles.has(titleKey)) {
                        seenInitialTitles.add(titleKey);
                        mergedInitialSongs.push(s);
                    }
                });

                const hydratedLibrary = mergedInitialSongs.map((s, idx) => ({
                    id: 'lib-' + Date.now().toString() + '-' + idx,
                    title: s.title,
                    key: s.key || '',
                    tempo: s.tempo || '',
                    timeSig: s.timeSig || '',
                    notes: s.notes || '',
                    category: s.category || 'Slow Acoustic',
                    cues: s.cues || []
                }));

                await setDoc(docRef, {
                    masterNotes: knownStudio ? `Welcome to ${knownStudio.name}! session.` : "",
                    name: knownStudio ? knownStudio.name : (sessionName || 'Untitled Setlist'),
                    type: knownStudio ? 'studio' : 'setlist',
                    createdAt: new Date()
                });

                // Write subcollection documents using a batch
                const batch = writeBatch(db);
                hydratedSongs.forEach((song, idx) => {
                    const songRef = doc(db, 'sessions', sessionId, 'songs', song.id);
                    batch.set(songRef, {
                        ...song,
                        id: song.id,
                        order: idx,
                        title_lowercase: (song.title || '').toLowerCase()
                    });
                });

                hydratedLibrary.forEach((libSong) => {
                    const libRef = doc(db, 'sessions', sessionId, 'library', libSong.id);
                    batch.set(libRef, {
                        ...libSong,
                        title_lowercase: (libSong.title || '').toLowerCase()
                    });
                });

                await batch.commit();
            }

            // 3. Subscribe to Session Metadata
            unsubSession = onSnapshot(docRef, (docSnapshot) => {
                setError(null);
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data();
                    setBroadcastMessage(data.broadcastMessage || null);
                    setIsConnected(true);

                    if (!docSnapshot.metadata.hasPendingWrites) {
                        setMasterNotes(data.notes || data.masterNotes || "");
                    }
                } else {
                    setIsConnected(false);
                }
            }, (error) => {
                console.error("Session snapshot error:", error);
                setIsConnected(false);
                setError("Connection Failed: " + error.code);
            });

            // 4. Subscribe to Setlist Songs
            const songsQuery = query(collection(db, 'sessions', sessionId, 'songs'), orderBy('order', 'asc'));
            unsubSongs = onSnapshot(songsQuery, (snapshot) => {
                const songsData = [];
                snapshot.forEach((doc) => {
                    songsData.push({ id: doc.id, ...doc.data() });
                });
                setSongs(songsData);
            }, (error) => {
                console.error("Songs snapshot error:", error);
            });

        } catch (error) {
            console.error("Error in session init and subscription:", error);
            setError(error.message);
        }
    };

    initAndSubscribe();

    return () => {
        unsubSession();
        unsubSongs();
    };
  }, [sessionId, sessionName, role]);

  // Subscribe to Personal Notes (Cloud Sync)
  useEffect(() => {
      if (!sessionId || !role) return;
      
      const unsubPersonal = onSnapshot(doc(db, 'sessions', sessionId, 'roles', role), (doc) => {
          if (doc.exists()) {
              if (doc.metadata.hasPendingWrites) return;
              const data = doc.data();
              setPersonalNotes(data.notes || "");
              setSongPersonalNotes(data.songNotes || {});
          }
      });
      
      return () => unsubPersonal();
  }, [sessionId, role]);

  // Lazy loading & searching from library subcollection
  const fetchLibrary = useCallback(async (searchQuery = '', isLoadMore = false) => {
      if (!isLoadMore) {
          lastVisibleRef.current = null;
          hasMoreLibraryRef.current = true;
          setHasMoreLibrary(true);
      } else if (!hasMoreLibraryRef.current || !lastVisibleRef.current) {
          return;
      }
      
      if (libraryLoadingRef.current) return;
      libraryLoadingRef.current = true;
      setLibraryLoading(true);

      try {
          const searchLower = searchQuery.toLowerCase().trim();
          let q;

          if (searchLower) {
              q = query(
                  collection(db, 'sessions', sessionId, 'library'),
                  orderBy('title_lowercase'),
                  startAt(searchLower),
                  endAt(searchLower + '\uf8ff'),
                  limit(20)
              );
          } else {
              q = query(
                  collection(db, 'sessions', sessionId, 'library'),
                  orderBy('title_lowercase'),
                  limit(20)
              );
          }

          if (isLoadMore && lastVisibleRef.current) {
              q = query(q, startAfter(lastVisibleRef.current));
          }

          const querySnap = await getDocs(q);
          const newSongs = [];
          querySnap.forEach((doc) => {
              newSongs.push({ id: doc.id, ...doc.data() });
          });

          const lastDoc = querySnap.docs[querySnap.docs.length - 1] || null;
          lastVisibleRef.current = lastDoc;
          
          const hasMore = querySnap.docs.length === 20;
          hasMoreLibraryRef.current = hasMore;
          setHasMoreLibrary(hasMore);

          if (isLoadMore) {
              setLibrary(prev => {
                  const merged = [...prev];
                  newSongs.forEach(song => {
                      if (!merged.some(s => s.id === song.id)) {
                          merged.push(song);
                      }
                  });
                  return merged;
              });
          } else {
              setLibrary(newSongs);
          }
      } catch (err) {
          console.error("Error fetching library:", err);
          setError("Library Fetch Failed");
      } finally {
          libraryLoadingRef.current = false;
          setLibraryLoading(false);
      }
  }, [sessionId]);

  const updateMasterNotes = async (text) => {
    setMasterNotes(text);
    setIsSaving(true);
    try {
        await updateDoc(doc(db, 'sessions', sessionId), { masterNotes: text }, { merge: true });
    } catch (error) {
        console.error("Error updating notes:", error);
        setError("Save Failed: " + error.code);
    } finally {
        setTimeout(() => setIsSaving(false), 500);
    }
  };

  const addSong = async () => {
    const newSongId = Date.now().toString();
    const newSong = { 
        title: 'New Song', 
        title_lowercase: 'new song',
        key: '', 
        tempo: '', 
        timeSig: '', 
        notes: '', 
        cues: [],
        category: 'Slow Acoustic',
        isActive: false,
        order: songs.length
    };
    
    const oldSongs = [...songs];
    setSongs(prev => [...prev, { id: newSongId, ...newSong }]); // Optimistic UI
    
    try {
        await setDoc(doc(db, 'sessions', sessionId, 'songs', newSongId), newSong);
    } catch (e) {
        console.error(e);
        setSongs(oldSongs); // Rollback
        setError("Add Song Failed");
    }
  };

  const updateSong = async (id, field, value) => {
      // Optimistic
      setSongs(prev => prev.map(s => s.id === id ? { ...s, [field]: value, ...(field === 'title' ? { title_lowercase: value.toLowerCase() } : {}) } : s));
      setIsSaving(true);
      try {
        const updateData = { [field]: value };
        if (field === 'title') {
            updateData.title_lowercase = value.toLowerCase();
        }
        await updateDoc(doc(db, 'sessions', sessionId, 'songs', id), updateData);
      } catch (e) { 
        console.error(e); 
      } finally { 
        setTimeout(() => setIsSaving(false), 500); 
      }
  };

  const deleteSong = async (id) => {
      const oldSongs = [...songs];
      setSongs(prev => prev.filter(s => s.id !== id)); // Optimistic
      try {
        await deleteDoc(doc(db, 'sessions', sessionId, 'songs', id));
      } catch (e) { 
        console.error(e); 
        setSongs(oldSongs); // Rollback
      }
  };

  const toggleSongActive = async (id) => {
      const activeSong = songs.find(s => s.id === id);
      const newActiveState = activeSong ? !activeSong.isActive : false;

      // Optimistic UI
      setSongs(prev => prev.map(s => {
          if (s.id === id) {
              return { ...s, isActive: newActiveState };
          }
          return { ...s, isActive: false };
      }));

      try {
          const batch = writeBatch(db);
          songs.forEach(s => {
              const songRef = doc(db, 'sessions', sessionId, 'songs', s.id);
              if (s.id === id) {
                  batch.update(songRef, { isActive: newActiveState });
              } else if (s.isActive) {
                  batch.update(songRef, { isActive: false });
              }
          });
          await batch.commit();
      } catch (e) { 
          console.error(e); 
      }
  };

  const updatePersonalNotes = async (text) => {
    setPersonalNotes(text);
    setIsSaving(true);
    
    try {
        await setDoc(doc(db, 'sessions', sessionId, 'roles', role), { notes: text }, { merge: true });
    } catch (error) {
        console.error("Error syncing personal notes:", error);
    } finally {
        setTimeout(() => setIsSaving(false), 500);
    }
  };

  const updateSongPersonalNote = async (songId, text) => {
      const newSongNotes = { ...songPersonalNotes, [songId]: text };
      setSongPersonalNotes(newSongNotes);
      setIsSaving(true);

      try {
          await setDoc(doc(db, 'sessions', sessionId, 'roles', role), { songNotes: newSongNotes }, { merge: true });
      } catch (error) {
          console.error("Error syncing song notes:", error);
      } finally {
          setTimeout(() => setIsSaving(false), 500);
      }
  };

  const reorderSongs = async (newSongs) => {
      const oldSongs = [...songs];
      setSongs(newSongs); // Optimistic UI
      try {
          const batch = writeBatch(db);
          newSongs.forEach((song, idx) => {
              const songRef = doc(db, 'sessions', sessionId, 'songs', song.id);
              batch.update(songRef, { order: idx });
          });
          await batch.commit();
      } catch (e) {
          console.error("Reorder failed:", e);
          setSongs(oldSongs); // Rollback
          setError("Reorder Failed");
      }
  };

  const sendBroadcast = async (message) => {
      try {
          await updateDoc(doc(db, 'sessions', sessionId), {
              broadcastMessage: { ...message, sentAt: new Date().toISOString() }
          });
      } catch (e) {
          console.error('Broadcast failed:', e);
          setError('Broadcast Failed');
      }
  };

  const dismissBroadcast = async () => {
      setBroadcastMessage(null);
      try {
          await updateDoc(doc(db, 'sessions', sessionId), { broadcastMessage: null });
      } catch (e) {
          console.error('Dismiss broadcast failed:', e);
      }
  };

  const importSongs = async (newSongsToImport) => {
      const oldSongs = [...songs];
      
      const newSongs = newSongsToImport.map((s, idx) => {
          const id = s.id || (Date.now().toString() + Math.random().toString(36).substr(2, 9));
          return {
              ...s,
              id,
              category: s.category || 'Slow Acoustic',
              order: songs.length + idx,
              title_lowercase: (s.title || '').toLowerCase()
          };
      });
      
      // Optimistic
      setSongs(prev => [...prev, ...newSongs]);

      try {
          const batch = writeBatch(db);
          newSongs.forEach(song => {
              const songRef = doc(db, 'sessions', sessionId, 'songs', song.id);
              batch.set(songRef, song);
          });
          await batch.commit();
          
          // Check and add missing songs to library
          const libraryTitles = new Set(library.map(s => s.title.toLowerCase().trim()));
          const missingLibrarySongs = newSongs.filter(s => s.title && s.title.trim() && !libraryTitles.has(s.title.toLowerCase().trim()));
          
          if (missingLibrarySongs.length > 0) {
              const libBatch = writeBatch(db);
              const libSongsToLocal = [];
              missingLibrarySongs.forEach((s, idx) => {
                  const libId = 'lib-' + Date.now().toString() + '-' + idx;
                  const libSong = {
                      title: s.title,
                      title_lowercase: s.title.toLowerCase(),
                      key: s.key || '',
                      tempo: s.tempo || '',
                      timeSig: s.timeSig || '',
                      notes: s.notes || '',
                      category: s.category || 'Slow Acoustic',
                      cues: s.cues || []
                  };
                  libSongsToLocal.push({ id: libId, ...libSong });
                  const libRef = doc(db, 'sessions', sessionId, 'library', libId);
                  libBatch.set(libRef, libSong);
              });
              await libBatch.commit();
              setLibrary(prev => [...prev, ...libSongsToLocal]);
          }
      } catch (e) {
          console.error("Import failed:", e);
          setSongs(oldSongs); // Rollback
          setError("Import Failed");
      }
  };

  const addLibrarySong = async () => {
    const songId = 'lib-' + Date.now();
    const newLibSong = {
        title: 'New Library Song',
        title_lowercase: 'new library song',
        key: '',
        tempo: '',
        timeSig: '',
        notes: '',
        category: 'Slow Acoustic',
        cues: []
    };
    
    try {
        await setDoc(doc(db, 'sessions', sessionId, 'library', songId), newLibSong);
        setLibrary(prev => [{ id: songId, ...newLibSong }, ...prev]); // Optimistic
        return songId;
    } catch (e) {
        console.error(e);
        setError("Add Library Song Failed");
        return null;
    }
  };

  const updateLibrarySong = async (id, field, value) => {
      // Optimistic
      setLibrary(prev => prev.map(s => s.id === id ? { ...s, [field]: value, ...(field === 'title' ? { title_lowercase: value.toLowerCase() } : {}) } : s));
      setIsSaving(true);
      try {
        const updateData = { [field]: value };
        if (field === 'title') {
            updateData.title_lowercase = value.toLowerCase();
        }
        await updateDoc(doc(db, 'sessions', sessionId, 'library', id), updateData);
      } catch (e) { 
          console.error(e); 
      } finally { 
          setTimeout(() => setIsSaving(false), 500); 
      }
  };

  const deleteLibrarySong = async (id) => {
      const oldLibrary = [...library];
      setLibrary(prev => prev.filter(s => s.id !== id)); // Optimistic
      try {
        await deleteDoc(doc(db, 'sessions', sessionId, 'library', id));
      } catch (e) { 
          console.error(e); 
          setLibrary(oldLibrary); // Rollback
      }
  };

  const addSongToSetlist = async (libSong) => {
      const newSongId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const newSong = {
          title: libSong.title || '',
          title_lowercase: (libSong.title || '').toLowerCase(),
          key: libSong.key || '',
          tempo: libSong.tempo || '',
          timeSig: libSong.timeSig || '',
          notes: libSong.notes || '',
          category: libSong.category || 'Slow Acoustic',
          cues: libSong.cues || [],
          isActive: false,
          order: songs.length
      };
      
      const oldSongs = [...songs];
      setSongs(prev => [...prev, { id: newSongId, ...newSong }]); // Optimistic
      
      try {
          await setDoc(doc(db, 'sessions', sessionId, 'songs', newSongId), newSong);
      } catch (e) {
          console.error(e);
          setSongs(oldSongs); // Rollback
          setError("Add to Setlist Failed");
      }
  };

  return {
    masterNotes,
    songs,
    library,
    libraryLoading,
    hasMoreLibrary,
    fetchLibrary,
    personalNotes,
    broadcastMessage,
    sendBroadcast,
    dismissBroadcast,
    addSong,
    updateSong,
    deleteSong,
    reorderSongs,
    toggleSongActive,
    updateMasterNotes,
    updatePersonalNotes,
    songPersonalNotes,
    updateSongPersonalNote,
    importSongs,
    addLibrarySong,
    updateLibrarySong,
    deleteLibrarySong,
    addSongToSetlist,
    isConnected,
    error,
    isSaving
  };
};
