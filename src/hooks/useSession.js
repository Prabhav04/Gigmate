import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc, getDoc, updateDoc } from 'firebase/firestore';

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
  const [library, setLibrary] = useState([]); // Array of all songs known
  const [broadcastMessage, setBroadcastMessage] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize Session
  useEffect(() => {
    if (!sessionId) return;
    
    // Check if session exists, if not create it
    const initSession = async () => {
        try {
            const docRef = doc(db, 'sessions', sessionId);
            const docSnap = await getDoc(docRef);
            
            if (!docSnap.exists()) {
                // Check if this is a known studio with a default preset
                const knownStudio = STUDIOS.find(s => s.id === sessionId);
                const initialSongs = knownStudio ? knownStudio.defaultPreset : [];
                
                // Copy preset to ensure new IDs if needed, although presets usually have placeholder IDs.
                // For a fresh session, we can keep preset IDs or regenerate them. 
                // Let's regenerate to be safe against future conflicts if multiple imports happen, 
                // but for init it doesn't matter much. Let's keep it simple.
                // Actually, let's regenerate for consistency with import logic.
                const hydratedSongs = initialSongs.map(s => ({
                    ...s, 
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    category: s.category || 'Slow Acoustic'
                }));

                // Collect all preset songs from all studios/presets to form the initial full library
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
                    songs: hydratedSongs,
                    library: hydratedLibrary,
                    createdAt: new Date()
                });
            }
        } catch (error) {
            console.error("Error initializing session:", error);
            setError(error.message);
        }
    };
    
    initSession();

    // Subscribe to Master Notes & Songs
    const unsubSession = onSnapshot(doc(db, 'sessions', sessionId), (docSnapshot) => {
       setError(null); 
       if (docSnapshot.exists()) {
         const data = docSnapshot.data();
         
         // Always sync broadcast for responsiveness
         setBroadcastMessage(data.broadcastMessage || null);
         setIsConnected(true);

         // We only update master notes if there's no pending local write to avoid cursor jumping
         if (!docSnapshot.metadata.hasPendingWrites) {
             setMasterNotes(data.masterNotes || "");
         }

         const rawSongs = data.songs || [];
         const migratedSongs = rawSongs.map(s => ({
             ...s,
             category: s.category || 'Slow Acoustic'
         }));
         setSongs(migratedSongs);

         const rawLibrary = data.library;
         let migratedLibrary = [];
         if (rawLibrary) {
             migratedLibrary = rawLibrary.map(s => ({
                 ...s,
                 category: s.category || 'Slow Acoustic'
             }));
         } else {
             // Fallback to active setlist songs + all preset songs if library is completely missing/undefined in database (e.g. older sessions)
             const fallbackSongs = [];
             const seenTitles = new Set();
             
             // Add current session's active songs first
             migratedSongs.forEach(song => {
                 const titleKey = song.title.toLowerCase().trim();
                 if (song.title && !seenTitles.has(titleKey)) {
                     seenTitles.add(titleKey);
                     fallbackSongs.push({
                         id: 'lib-' + song.id,
                         title: song.title,
                         key: song.key || '',
                         tempo: song.tempo || '',
                         timeSig: song.timeSig || '',
                         notes: song.notes || '',
                         category: song.category || 'Slow Acoustic',
                         cues: song.cues || []
                     });
                 }
             });

             // Add all other preset songs
             const allPresetSongs = getAllPresetSongs();
             allPresetSongs.forEach(song => {
                 const titleKey = song.title.toLowerCase().trim();
                 if (song.title && !seenTitles.has(titleKey)) {
                     seenTitles.add(titleKey);
                     fallbackSongs.push({
                         id: 'lib-preset-' + Math.random().toString(36).substr(2, 9),
                         title: song.title,
                         key: song.key || '',
                         tempo: song.tempo || '',
                         timeSig: song.timeSig || '',
                         notes: song.notes || '',
                         category: song.category || 'Slow Acoustic',
                         cues: song.cues || []
                     });
                 }
             });
             migratedLibrary = fallbackSongs;
         }
         setLibrary(migratedLibrary);

         // Auto-add setlist songs & preset songs to library for Keyboardist (Leader)
         if (role === 'keyboard' && !docSnapshot.metadata.hasPendingWrites) {
             if (data.library === undefined) {
                 // Write initial library to database
                 updateDoc(doc(db, 'sessions', sessionId), { library: migratedLibrary }).catch(console.error);
             } else {
                 const libraryTitles = new Set(migratedLibrary.map(s => s.title.toLowerCase().trim()));
                 
                 // Get all preset songs plus current session songs
                 const allRequiredSongs = [...migratedSongs, ...getAllPresetSongs()];
                 const missingSongs = allRequiredSongs.filter(s => s.title && s.title.trim() && !libraryTitles.has(s.title.toLowerCase().trim()));
                 
                 if (missingSongs.length > 0) {
                     const newLibSongs = missingSongs.map((s, idx) => ({
                         id: 'lib-' + Date.now().toString() + '-' + idx,
                         title: s.title,
                         key: s.key || '',
                         tempo: s.tempo || '',
                         timeSig: s.timeSig || '',
                         notes: s.notes || '',
                         category: s.category || 'Slow Acoustic',
                         cues: s.cues || []
                     }));
                     const updatedLibrary = [...migratedLibrary, ...newLibSongs];
                     updateDoc(doc(db, 'sessions', sessionId), { library: updatedLibrary }).catch(console.error);
                 }
             }
         }
       } else {
           setIsConnected(false);
       }
    }, (error) => {
        console.error("Snapshot error:", error);
        setIsConnected(false);
        setError("Connection Failed: " + error.code);
    });

    return () => unsubSession();
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
  

  const updateMasterNotes = async (text) => {
    setMasterNotes(text);
    setIsSaving(true);
    try {
        await setDoc(doc(db, 'sessions', sessionId), { masterNotes: text }, { merge: true });
    } catch (error) {
        console.error("Error updating notes:", error);
        setError("Save Failed: " + error.code);
    } finally {
        setTimeout(() => setIsSaving(false), 500);
    }
  };

  const addSong = async () => {
    const newSong = { 
        id: Date.now().toString(), 
        title: 'New Song', 
        key: '', 
        tempo: '', 
        timeSig: '', 
        notes: '', 
        cues: [],
        category: 'Slow Acoustic',
        isActive: false 
    };
    const newSongs = [...songs, newSong];
    setSongs(newSongs); // Optimistic
    try {
        await updateDoc(doc(db, 'sessions', sessionId), { songs: newSongs });
    } catch (e) {
        console.error(e);
        setError("Add Song Failed");
    }
  };

  const updateSong = async (id, field, value) => {
      const newSongs = songs.map(s => s.id === id ? { ...s, [field]: value } : s);
      setSongs(newSongs);
      setIsSaving(true);
      try {
        await updateDoc(doc(db, 'sessions', sessionId), { songs: newSongs });
      } catch (e) { console.error(e); } 
      finally { setTimeout(() => setIsSaving(false), 500); }
  };

  const deleteSong = async (id) => {
      const newSongs = songs.filter(s => s.id !== id);
      setSongs(newSongs);
      try {
        await updateDoc(doc(db, 'sessions', sessionId), { songs: newSongs });
      } catch (e) { console.error(e); }
  };

  const toggleSongActive = async (id) => {
      const newSongs = songs.map(s => {
          if (s.id === id) {
              return { ...s, isActive: !s.isActive };
          }
          return { ...s, isActive: false };
      });
      setSongs(newSongs);
      try {
        await updateDoc(doc(db, 'sessions', sessionId), { songs: newSongs });
      } catch (e) { console.error(e); }
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
      setSongs(newSongs);
      try {
        await updateDoc(doc(db, 'sessions', sessionId), { songs: newSongs });
      } catch (e) {
        console.error("Reorder failed:", e);
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
      // Append or Replace? Let's Append for safety, or we could offer a choice.
      // For this specific "Preset" use case, the user likely wants to populate an empty session or add to it.
      // Let's go with Append, but filter out duplicates by ID if any (though IDs should be unique).
      
      const processedImports = newSongsToImport.map(s => ({
          ...s,
          category: s.category || 'Slow Acoustic'
      }));
      const updatedSongs = [...songs, ...processedImports];
      setSongs(updatedSongs);

      const libraryTitles = new Set(library.map(s => s.title.toLowerCase().trim()));
      const missingLibrarySongs = processedImports.filter(s => s.title && s.title.trim() && !libraryTitles.has(s.title.toLowerCase().trim()));
      
      let updatedLibrary = [...library];
      if (missingLibrarySongs.length > 0) {
          const newLibSongs = missingLibrarySongs.map((s, idx) => ({
              id: 'lib-' + Date.now().toString() + '-' + idx,
              title: s.title,
              key: s.key || '',
              tempo: s.tempo || '',
              timeSig: s.timeSig || '',
              notes: s.notes || '',
              category: s.category || 'Slow Acoustic',
              cues: s.cues || []
          }));
          updatedLibrary = [...library, ...newLibSongs];
          setLibrary(updatedLibrary);
      }

      try {
          await updateDoc(doc(db, 'sessions', sessionId), { 
              songs: updatedSongs,
              library: updatedLibrary
          });
      } catch (e) {
          console.error("Import failed:", e);
          setError("Import Failed");
      }
  };

  const addLibrarySong = async () => {
    const newLibSong = {
        id: 'lib-' + Date.now().toString(),
        title: 'New Library Song',
        key: '',
        tempo: '',
        timeSig: '',
        notes: '',
        category: 'Slow Acoustic',
        cues: []
    };
    const newLibrary = [...library, newLibSong];
    setLibrary(newLibrary);
    try {
        await updateDoc(doc(db, 'sessions', sessionId), { library: newLibrary });
    } catch (e) {
        console.error(e);
        setError("Add Library Song Failed");
    }
  };

  const updateLibrarySong = async (id, field, value) => {
      const newLibrary = library.map(s => s.id === id ? { ...s, [field]: value } : s);
      setLibrary(newLibrary);
      setIsSaving(true);
      try {
        await updateDoc(doc(db, 'sessions', sessionId), { library: newLibrary });
      } catch (e) { console.error(e); } 
      finally { setTimeout(() => setIsSaving(false), 500); }
  };

  const deleteLibrarySong = async (id) => {
      const newLibrary = library.filter(s => s.id !== id);
      setLibrary(newLibrary);
      try {
        await updateDoc(doc(db, 'sessions', sessionId), { library: newLibrary });
      } catch (e) { console.error(e); }
  };

  const addSongToSetlist = async (libSong) => {
      const newSong = {
          ...libSong,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          isActive: false
      };
      const newSongs = [...songs, newSong];
      setSongs(newSongs);
      try {
          await updateDoc(doc(db, 'sessions', sessionId), { songs: newSongs });
      } catch (e) {
          console.error(e);
          setError("Add to Setlist Failed");
      }
  };

  return {
    masterNotes,
    songs,
    library,
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
