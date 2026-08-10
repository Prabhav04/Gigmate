import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Music, Minimize2, Maximize2, Mic, Eye, BookOpen, Lightbulb } from 'lucide-react';
import Metronome from './Metronome';
import LyricsView from './LyricsView';
import { DebouncedTextarea } from './DebouncedInputs';

const PlayerBoard = ({ role, songs, personalNotes, onUpdatePersonal, isSaving, songPersonalNotes, onUpdateSongPersonal, onToggleLibrary, onToggleSandbox }) => {
    const [notesCollapsed, setNotesCollapsed] = useState(false);
    const [showLyrics, setShowLyrics] = useState(false);
    const [filterCategory, setFilterCategory] = useState('All');
    const [sortBy, setSortBy] = useState('original');
    const listRef = useRef(null);
    const [newlyAddedSongId, setNewlyAddedSongId] = useState(null);
    const prevSongsLength = useRef(songs?.length || 0);
    const isFirstLoad = useRef(true);

    const scrollToBottom = () => {
        setTimeout(() => {
            if (listRef.current) {
                listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
            }
        }, 150);
    };

    useEffect(() => {
        const currentLength = songs?.length || 0;
        if (isFirstLoad.current) {
            if (currentLength > 0) {
                isFirstLoad.current = false;
                prevSongsLength.current = currentLength;
            }
            return;
        }

        if (currentLength > prevSongsLength.current) {
            const sorted = [...songs].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            const newSong = sorted[sorted.length - 1];
            if (newSong) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setNewlyAddedSongId(newSong.id);
                const isVisible = filterCategory === 'All' || newSong.category === filterCategory;
                if (isVisible) {
                    scrollToBottom();
                }
                const timer = setTimeout(() => {
                    setNewlyAddedSongId(null);
                }, 3000);
                return () => clearTimeout(timer);
            }
        }
        prevSongsLength.current = currentLength;
    }, [songs, filterCategory]);
 
    const activeSong = songs?.find(s => s.isActive);
 
    // First, map songs to include their original index so their # display label is correct
    const songsWithOriginalIndex = (songs || []).map((song, index) => ({
        ...song,
        originalIndex: index
    }));
 
    // Apply category filter
    let processedSongs = songsWithOriginalIndex;
    if (filterCategory !== 'All') {
        processedSongs = processedSongs.filter(s => s.category === filterCategory);
    }
 
    // Apply sorting
    if (sortBy === 'category') {
        const categoryOrder = {
            'Slow Acoustic': 1,
            'Mid Level': 2,
            'Fast Pace': 3
        };
        processedSongs = [...processedSongs].sort((a, b) => {
            const catA = a.category || 'Slow Acoustic';
            const catB = b.category || 'Slow Acoustic';
            if (categoryOrder[catA] !== categoryOrder[catB]) {
                return categoryOrder[catA] - categoryOrder[catB];
            }
            return a.originalIndex - b.originalIndex; // Stable sort
        });
    } else if (sortBy === 'alphabetical') {
        processedSongs = [...processedSongs].sort((a, b) => a.title.localeCompare(b.title));
    }

    return (
        <>
            <div className={`flex flex-col h-full gap-4 transition-all duration-300`}>
                {/* Top Section: Setlist View - Takes remaining space */}
                <div className="bg-surface border border-glass-border rounded-xl flex flex-col overflow-hidden relative flex-1">
                    <div className="p-3 border-b border-slate-800 bg-surface flex flex-col md:flex-row gap-3 justify-between items-start md:items-center z-10 shrink-0">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-primary">Setlist</h2>
                        </div>
                        <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
                            {/* Filter tabs */}
                            <div className="flex rounded-lg bg-slate-900/80 p-0.5 border border-slate-800 text-[11px] sm:text-xs">
                                {['All', 'Slow Acoustic', 'Mid Level', 'Fast Pace'].map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setFilterCategory(cat)}
                                        className={`px-2 py-1 rounded transition-all font-semibold ${
                                            filterCategory === cat
                                                ? 'bg-primary text-black'
                                                : 'text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
 
                            {/* Sort Selector */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[11px] sm:text-xs font-semibold text-slate-300 focus:border-primary focus:outline-none cursor-pointer"
                            >
                                <option value="original">Original Order</option>
                                <option value="category">Group by Category</option>
                                <option value="alphabetical">A-Z</option>
                            </select>
                        </div>
                    </div>

                    {/* General Info Overlay/Panel */}
                    {/* {showGeneral && (
                        <div className="hidden absolute inset-0 top-10 bg-black/95 z-20 p-4 overflow-y-auto animate-fade-in backdrop-blur-sm">
                            <h3 className="text-slate-500 mb-2 text-xs uppercase">General Info</h3>
                            <div className="text-xl md:text-2xl text-white whitespace-pre-wrap leading-relaxed">{masterNotes}</div>
                        </div>
                    )} */}

                    <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-2 bg-black/50 custom-scrollbar">
                        {processedSongs.map((song) => {
                            const isActive = song.isActive;
                            return (
                                <AccordionSongItem
                                    key={song.id}
                                    song={song}
                                    index={song.originalIndex}
                                    isActive={isActive}
                                    myNote={songPersonalNotes?.[song.id] || ''}
                                    onUpdateMyNote={(text) => onUpdateSongPersonal && onUpdateSongPersonal(song.id, text)}
                                    role={role}
                                    isNewlyAdded={newlyAddedSongId === song.id}
                                />
                            );
                        })}
                        {processedSongs.length === 0 && <div className="p-8 text-center text-slate-600">No songs match criteria.</div>}
                    </div>
                </div>

                {/* Metronome & Library Bar */}
                <div className="flex items-center gap-3 shrink-0">
                    <div className="flex-1">
                        <Metronome
                            compact={true}
                            suggestedBPM={activeSong?.tempo ? parseInt(activeSong.tempo) : 120}
                            suggestedTimeSig={activeSong?.timeSig || '4/4'}
                            hasActiveSong={!!activeSong}
                        />
                    </div>
                    <button
                        onClick={onToggleLibrary}
                        className="bg-slate-900/50 hover:bg-slate-800 border border-slate-700 rounded-lg h-10 px-3 md:px-4 flex items-center justify-center gap-2 text-white font-bold text-sm transition-all hover:border-slate-500 cursor-pointer shadow-md shrink-0"
                        title="Open Song Library"
                    >
                        <BookOpen className="w-4 h-4 text-primary" />
                        <span className="hidden sm:inline">Song Library</span>
                        <span className="sm:hidden">Library</span>
                    </button>
                    <button
                        onClick={onToggleSandbox}
                        className="bg-slate-900/50 hover:bg-slate-800 border border-slate-700 rounded-lg h-10 px-3 md:px-4 flex items-center justify-center gap-2 text-white font-bold text-sm transition-all hover:border-slate-500 cursor-pointer shadow-md shrink-0"
                        title="Open Sandbox"
                    >
                        <Lightbulb className="w-4 h-4 text-amber-400" />
                        <span className="hidden sm:inline">Sandbox</span>
                        <span className="sm:hidden">Idea</span>
                    </button>
                </div>

                {/* Bottom Section: Personal Notes - Fixed height or Collapsed */}
                <div className={`bg-surface border border-glass-border rounded-xl flex flex-col shrink-0 transition-all duration-300 ${notesCollapsed ? 'h-[50px]' : 'h-32 sm:h-40'}`}>
                    <div className="flex justify-between items-center p-3 border-b border-slate-800/50">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xs font-bold text-secondary uppercase tracking-widest">{role} Scratchpad</h2>
                            <div className={`text-[10px] text-slate-500 font-mono transition-opacity ${isSaving ? 'opacity-100' : 'opacity-0'}`}>
                                SAVING...
                            </div>
                        </div>
                        <button
                            onClick={() => setNotesCollapsed(!notesCollapsed)}
                            className="text-slate-500 hover:text-white transition-colors"
                        >
                            {notesCollapsed ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                        </button>
                    </div>

                    {!notesCollapsed && (
                        <DebouncedTextarea
                            value={personalNotes}
                            onChange={(value) => onUpdatePersonal(value)}
                            placeholder={`Start typing to add global notes visible only to you...`}
                            className="flex-1 w-full bg-black border-none p-4 text-lg text-white focus:outline-none focus:ring-1 focus:ring-secondary/50 transition-colors resize-none font-sans font-medium leading-relaxed tracking-wide placeholder:text-slate-800"
                        />
                    )}
                </div>
            </div>

            {/* Full-screen Lyrics View for Singers */}
            {
                showLyrics && activeSong && (
                    <LyricsView
                        song={activeSong}
                        onClose={() => setShowLyrics(false)}
                    />
                )
            }
        </>
    );
};

const renderWithTags = (text) => {
    if (!text) return <span className="opacity-30 italic">No notes added by leader.</span>;

    // Split by the tag pattern |TAG NAME| OR chord pattern [Am]
    const parts = text.split(/(\|[^|]+\||\[[^\]]+\])/g);

    return parts.map((part, i) => {
        // Tag Logic: |DROP|
        if (part.startsWith('|') && part.endsWith('|')) {
            const content = part.slice(1, -1);
            return (
                <span
                    key={i}
                    className="mx-1 inline-block px-1.5 py-0.5 rounded-md bg-secondary text-black font-extrabold text-xs tracking-wider transform -translate-y-0.5 shadow-[0_0_10px_rgba(34,211,238,0.4)] border border-white/20 select-none animate-pulse-slow"
                >
                    {content.toUpperCase()}
                </span>
            );
        }

        // Chord Logic: [Am]
        if (part.startsWith('[') && part.endsWith(']')) {
            const chord = part.slice(1, -1);
            return (
                <span
                    key={i}
                    className="inline-block text-secondary font-bold font-mono text-xl mx-1 transform -translate-y-1 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]"
                >
                    {chord}
                </span>
            );
        }

        return <span key={i}>{part}</span>;
    });
};

const parseSingerNote = (rawNote) => {
    if (!rawNote) return { lyrics: '', intro: '' };
    if (typeof rawNote === 'string' && rawNote.trim().startsWith('{') && rawNote.trim().endsWith('}')) {
        try {
            const parsed = JSON.parse(rawNote);
            if (parsed && (parsed.lyrics !== undefined || parsed.intro !== undefined)) {
                return {
                    lyrics: parsed.lyrics || '',
                    intro: parsed.intro || ''
                };
            }
        } catch {
            // ignore and treat as plain string
        }
    }
    return { lyrics: rawNote, intro: '' };
};

// Extracted for cleaner state management per item
const AccordionSongItem = ({ song, index, isActive, myNote, onUpdateMyNote, role, isNewlyAdded = false }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLyricsExpanded, setIsLyricsExpanded] = useState(false);

    // Auto-expand if active (Leader control), otherwise rely on user click
    const showDetails = isActive || isExpanded;
    const singerNote = role === 'singer' ? parseSingerNote(myNote) : null;

    return (
        <div
            className={`rounded-xl border transition-all ${
                isNewlyAdded
                    ? 'animate-new-item-flash border-primary'
                    : isActive
                    ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(167,139,250,0.15)] my-4 scale-[1.01]'
                    : 'bg-surface/30 border-slate-800 hover:bg-surface/50 hover:border-slate-700'
            }`}
        >
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-4 flex justify-between items-center group cursor-pointer"
            >
                <div className="flex items-center gap-4 overflow-hidden">
                    <span className={`font-mono text-xl font-bold shrink-0 ${isActive ? 'text-primary' : 'text-slate-600'}`}>
                        #{index + 1}
                    </span>
                    <div className={`text-xl sm:text-3xl font-bold truncate tracking-tight ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                        {song.title}
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    {/* Metadata Badges - Always visible but styled better */}
                    <div className="flex items-center gap-2">
                        {song.category && (
                            <div className={`rounded md:rounded-lg border px-2 py-1 text-xs font-bold whitespace-nowrap ${
                                song.category === 'Slow Acoustic'
                                    ? 'border-blue-500/30 text-blue-400 bg-blue-500/10'
                                    : song.category === 'Mid Level'
                                    ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10'
                                    : 'border-red-500/30 text-red-400 bg-red-500/10'
                            }`}>
                                {song.category}
                            </div>
                        )}
                        {song.key && (
                            <div className={`rounded md:rounded-lg border px-2 py-1 text-sm sm:text-lg font-bold font-mono ${isActive ? 'border-primary/50 text-white bg-primary/20' : 'border-slate-700 text-slate-400 bg-black/40'}`}>
                                {song.key}
                            </div>
                        )}
                        {song.tempo && (
                            <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-black/40 px-2 py-1 text-sm sm:text-base text-slate-400 font-mono">
                                {isActive && (
                                    <div
                                        className="w-2 h-2 rounded-full bg-secondary"
                                        style={{ animation: `ping ${60 / parseInt(song.tempo)}s cubic-bezier(0, 0, 0.2, 1) infinite` }}
                                    />
                                )}
                                {song.tempo}
                            </div>
                        )}
                    </div>

                    {/* Performance Cues Display */}
                    {/* 
                    )} */}

                    {isActive && (
                        <div className="flex items-center gap-2">
                            <div className="hidden sm:flex text-xs bg-red-500 text-white px-2 py-0.5 rounded font-bold animate-pulse shadow-lg shadow-red-500/20">
                                LIVE
                            </div>
                            <div className="sm:hidden w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                        </div>
                    )}

                    {showDetails ? <ChevronUp size={20} className="text-slate-600" /> : <ChevronDown size={20} className="text-slate-600" />}
                </div>
            </div>

            {/* Expandable Content */}
            {showDetails && (
                <div className={`px-4 pb-4 pt-2 font-mono text-base sm:text-lg border-t ${isActive ? 'border-primary/10' : 'border-slate-800/50'}`}>

                    <div className="flex gap-4 mb-2 opacity-50 text-sm text-slate-400">
                        {song.tempo && <span className="sm:hidden">BPM: {song.tempo}</span>}
                        {song.timeSig && <span>{song.timeSig}</span>}
                    </div>

                    {/* Grid Layout for Master Notes + My Personal Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        {/* Master Notes (Read Only) */}
                        <div className="space-y-1">
                            <h4 className="text-[10px] uppercase tracking-widest text-slate-600 font-bold">Master Notes</h4>
                            <div className={`whitespace-pre-wrap leading-relaxed ${isActive ? 'text-slate-200' : 'text-slate-400'}`}>
                                {renderWithTags(song.notes)}
                            </div>
                        </div>

                        {/* My Personal Song Note */}
                        <div className="space-y-1 flex flex-col">
                            {role === 'singer' ? (
                                <>
                                    {/* Spoken Intro Area */}
                                    <div className="space-y-1 mb-2">
                                        <h4 className="text-[10px] uppercase tracking-widest text-primary font-bold">
                                            Spoken Intro (Optional)
                                        </h4>
                                        <DebouncedTextarea
                                            value={singerNote.intro}
                                            onChange={(value) => {
                                                const updated = JSON.stringify({
                                                    ...singerNote,
                                                    intro: value
                                                });
                                                onUpdateMyNote(updated);
                                            }}
                                            placeholder="Write an intro to speak before the song starts..."
                                            className="w-full bg-black/50 border border-slate-800 rounded p-2 text-primary/90 focus:border-primary focus:outline-none text-sm resize-none custom-scrollbar h-[60px]"
                                        />
                                    </div>

                                    {/* Lyrics Area */}
                                    <div className="space-y-1 flex flex-col flex-grow">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-[10px] uppercase tracking-widest text-secondary font-bold">
                                                Lyrics
                                            </h4>
                                            <button
                                                onClick={() => setIsLyricsExpanded(!isLyricsExpanded)}
                                                className="text-slate-500 hover:text-white transition-colors p-0.5"
                                                title={isLyricsExpanded ? "Collapse View" : "Expand View"}
                                            >
                                                {isLyricsExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                                            </button>
                                        </div>
                                        <DebouncedTextarea
                                            value={singerNote.lyrics}
                                            onChange={(value) => {
                                                const updated = JSON.stringify({
                                                    ...singerNote,
                                                    lyrics: value
                                                });
                                                onUpdateMyNote(updated);
                                            }}
                                            placeholder="Add lyrics for this song..."
                                            className={`w-full bg-black/50 border border-slate-800 rounded p-2 text-secondary/90 focus:border-secondary focus:outline-none text-base resize-none custom-scrollbar transition-all duration-300 ${
                                                isLyricsExpanded ? 'h-[200px]' : 'h-[80px]'
                                            }`}
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-[10px] uppercase tracking-widest text-secondary font-bold">
                                            My Notes
                                        </h4>
                                        <button
                                            onClick={() => setIsLyricsExpanded(!isLyricsExpanded)}
                                            className="text-slate-500 hover:text-white transition-colors p-0.5"
                                            title={isLyricsExpanded ? "Collapse View" : "Expand View"}
                                        >
                                            {isLyricsExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                                        </button>
                                    </div>
                                    <DebouncedTextarea
                                        value={myNote}
                                        onChange={(value) => onUpdateMyNote(value)}
                                        placeholder="Add private notes for this song..."
                                        className={`w-full bg-black/50 border border-slate-800 rounded p-2 text-secondary/90 focus:border-secondary focus:outline-none text-base resize-none custom-scrollbar transition-all duration-300 ${
                                            isLyricsExpanded ? 'h-[300px]' : 'h-[80px]'
                                        }`}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlayerBoard;
