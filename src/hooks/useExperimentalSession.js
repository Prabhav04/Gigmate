import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { 
    doc, 
    onSnapshot, 
    setDoc, 
    collection, 
    query, 
    orderBy, 
    writeBatch,
    getDoc
} from 'firebase/firestore';

const initialDummySetlist = [
  {
    id: 'song-1',
    title: "Anthathi",
    number: 1,
    key: "Dm",
    timeSig: "4/4",
    content: [
      { type: 'cue', text: 'Guitar Only + Kick', rightText: '' },
      { type: 'lyric', text: 'Naam intha theeyil Veedu kattum theekuchi' },
      { type: 'cue', text: 'ALL instruments in', rightText: 'DROP' },
      { type: 'lyric', text: 'Naam intha kaatril Oonjal kattum thoosi' }
    ],
    order: 0
  },
  {
    id: 'song-2',
    title: "Kadhale Kadhale",
    number: 2,
    key: "Am",
    timeSig: "4/4",
    content: [
      { type: 'cue', text: 'Violin Intro', rightText: '' },
      { type: 'lyric', text: 'Kadhale kadhale...' },
      { type: 'cue', text: 'Drums enter', rightText: 'BUILD' },
      { type: 'lyric', text: 'Thanimai punnagaiyil...' }
    ],
    order: 1
  }
];

export const useExperimentalSession = (sessionId) => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) return;

    let unsubSongs = () => {};

    const initAndSubscribe = async () => {
      try {
        const sessionRef = doc(db, 'experimental_sessions', sessionId);
        const sessionSnap = await getDoc(sessionRef);

        // If session doesn't exist, initialize it with dummy data
        if (!sessionSnap.exists()) {
          console.log("Initializing new experimental session with dummy data...");
          await setDoc(sessionRef, {
            name: 'Experimental Setlist',
            createdAt: new Date()
          });

          const batch = writeBatch(db);
          initialDummySetlist.forEach((song) => {
            const songRef = doc(db, 'experimental_sessions', sessionId, 'songs', song.id);
            batch.set(songRef, song);
          });
          await batch.commit();
        }

        // Subscribe to songs subcollection
        const songsQuery = query(
          collection(db, 'experimental_sessions', sessionId, 'songs'), 
          orderBy('order', 'asc')
        );

        unsubSongs = onSnapshot(songsQuery, (snapshot) => {
          const songsData = [];
          snapshot.forEach((doc) => {
            songsData.push({ id: doc.id, ...doc.data() });
          });
          setSongs(songsData);
          setLoading(false);
        }, (err) => {
          console.error("Snapshot error:", err);
          setError(err.message);
          setLoading(false);
        });

      } catch (err) {
        console.error("Init error:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    initAndSubscribe();

    return () => {
      unsubSongs();
    };
  }, [sessionId]);

  const updateSong = async (songId, newData) => {
    // Optimistic UI update
    setSongs(prev => prev.map(s => s.id === songId ? { ...s, ...newData } : s));
    
    try {
      const songRef = doc(db, 'experimental_sessions', sessionId, 'songs', songId);
      await setDoc(songRef, newData, { merge: true });
    } catch (e) {
      console.error("Error updating song:", e);
      setError("Failed to save changes");
    }
  };

  const addSong = async (newSongData) => {
    try {
      const newSongRef = doc(collection(db, 'experimental_sessions', sessionId, 'songs'));
      const newSong = {
        id: newSongRef.id,
        ...newSongData
      };
      await setDoc(newSongRef, newSong);
      return newSongRef.id;
    } catch (e) {
      console.error("Error adding song:", e);
      setError("Failed to add song");
      return null;
    }
  };

  return {
    songs,
    loading,
    error,
    updateSong,
    addSong
  };
};
