import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc, getDoc, updateDoc } from 'firebase/firestore';

export const useSession = (sessionId, role) => {
  const [masterNotes, setMasterNotes] = useState("");
  const [personalNotes, setPersonalNotes] = useState("");
  const [songPersonalNotes, setSongPersonalNotes] = useState({}); // Map of songId -> note
  const [songs, setSongs] = useState([]);
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
                await setDoc(docRef, {
                    masterNotes: "Welcome! Use the General Info for announcements.",
                    songs: [],
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
    const unsubSession = onSnapshot(doc(db, 'sessions', sessionId), (doc) => {
       setError(null); 
       if (doc.exists()) {
         const data = doc.data();
         if (!doc.metadata.hasPendingWrites) {
             setMasterNotes(data.masterNotes || "");
             setSongs(data.songs || []);
         }
         setIsConnected(true);
       } else {
           setIsConnected(false);
       }
    }, (error) => {
        console.error("Snapshot error:", error);
        setIsConnected(false);
        setError("Connection Failed: " + error.code);
    });

    return () => unsubSession();
  }, [sessionId]);

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
      const newSongs = songs.map(s => ({ ...s, isActive: s.id === id }));
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

  return {
    masterNotes,
    songs,
    personalNotes,
    addSong,
    updateSong,
    deleteSong,
    toggleSongActive,
    updateMasterNotes,
    updatePersonalNotes,
    songPersonalNotes,
    updateSongPersonalNote,
    isConnected,
    error,
    isSaving
  };
};
