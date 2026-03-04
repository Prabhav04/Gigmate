import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Music, Minimize2, Maximize2, Mic, Eye } from 'lucide-react';
import Metronome from './Metronome';
import LyricsView from './LyricsView';

const PlayerBoard = ({ role, masterNotes, songs, personalNotes, onUpdatePersonal, isSaving, songPersonalNotes, onUpdateSongPersonal }) => {
    const [showGeneral, setShowGeneral] = useState(false);
    const [notesCollapsed, setNotesCollapsed] = useState(false);
    const [showLyrics, setShowLyrics] = useState(false);

    const activeSong = songs?.find(s => s.isActive);

    return (
        <>
            <div className={`flex flex-col h-full gap-4 transition-all duration-300`}>
                {/* Top Section: Setlist View - Takes remaining space */}
                <div className={`bg-surface border border-glass-border rounded-xl flex flex-col overflow-hidden relative transition-all duration-300 ${notesCollapsed ? 'flex-1' : 'h-[75%] sm:h-[70%]'}`}>
                    <div className="p-3 border-b border-slate-800 bg-surface flex justify-between items-center z-10">
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Music size={16} /> Setlist
                        </h2>
                        <div className="flex items-center gap-2">
                            {role === 'singer' && activeSong && (
                                <button
                                    onClick={() => setShowLyrics(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg text-xs font-bold transition-colors"
                                >
                                    <Mic size={14} /> Lyrics
                                </button>
                            )}
                            <button onClick={() => setShowGeneral(!showGeneral)} className="text-xs text-primary hover:underline">
                                {showGeneral ? "Hide Info" : "Show General Info"}
                            </button>
                        </div>
                    </div>

                    {/* General Info Overlay/Panel */}
                    {/* {showGeneral && (
                        <div className="hidden absolute inset-0 top-10 bg-black/95 z-20 p-4 overflow-y-auto animate-fade-in backdrop-blur-sm">
                            <h3 className="text-slate-500 mb-2 text-xs uppercase">General Info</h3>
                            <div className="text-xl md:text-2xl text-white whitespace-pre-wrap leading-relaxed">{masterNotes}</div>
                        </div>
                    )} */}

                    <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-black/50 custom-scrollbar">
                        {songs && songs.map((song, index) => {
                            const isActive = song.isActive;
                            return (
                                <AccordionSongItem
                                    key={song.id}
                                    song={song}
                                    index={index}
                                    isActive={isActive}
                                    myNote={songPersonalNotes?.[song.id] || ''}
                                    onUpdateMyNote={(text) => onUpdateSongPersonal && onUpdateSongPersonal(song.id, text)}
                                    role={role}
                                />
                            );
                        })}
                        {(!songs || songs.length === 0) && <div className="p-8 text-center text-slate-600">No songs yet.</div>}
                    </div>
                </div>

                {/* Metronome */}
                <Metronome
                    suggestedBPM={songs.find(s => s.isActive)?.tempo ? parseInt(songs.find(s => s.isActive).tempo) : 120}
                    suggestedTimeSig={songs.find(s => s.isActive)?.timeSig || '4/4'}
                />

                {/* Bottom Section: Personal Notes - Fixed height or Collapsed */}
                <div className={`bg-surface border border-glass-border rounded-xl flex flex-col transition-all duration-300 ${notesCollapsed ? 'h-[50px]' : 'h-[25%] sm:h-[30%] min-h-[150px]'}`}>
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
                        <textarea
                            value={personalNotes}
                            onChange={(e) => onUpdatePersonal(e.target.value)}
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

// Extracted for cleaner state management per item
const AccordionSongItem = ({ song, index, isActive, myNote, onUpdateMyNote, role }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Auto-expand if active (Leader control), otherwise rely on user click
    const showDetails = isActive || isExpanded;

    return (
        <div
            className={`rounded-xl border transition-all ${isActive
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
                    {/* {song.cues && song.cues.length > 0 && (
                        <div className="flex flex-wrap gap-1 mx-2">
                            {song.cues.map(cue => (
                                <span key={cue} className={`px-1.5 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded border ${isActive
                                    ? 'bg-secondary text-black border-secondary'
                                    : 'bg-slate-800 text-secondary border-slate-700'
                                    }`}>
                                    {cue}
                                </span>
                            ))}
                        </div>
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
                        <div className="space-y-1">
                            <h4 className="text-[10px] uppercase tracking-widest text-secondary font-bold">
                                {role === 'singer' ? 'Lyrics' : 'My Notes'}
                            </h4>
                            <textarea
                                value={myNote}
                                onChange={(e) => onUpdateMyNote(e.target.value)}
                                placeholder={role === 'singer' ? 'Add lyrics for this song...' : 'Add private notes for this song...'}
                                className="w-full bg-black/50 border border-slate-800 rounded p-2 text-secondary/90 focus:border-secondary focus:outline-none text-base resize-none h-[80px]"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlayerBoard;
