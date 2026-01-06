import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Music, Minimize2, Maximize2 } from 'lucide-react';

const PlayerBoard = ({ role, masterNotes, songs, personalNotes, onUpdatePersonal, isSaving }) => {
    const [showGeneral, setShowGeneral] = useState(false);
    const [notesCollapsed, setNotesCollapsed] = useState(false);

    return (
        <div className={`flex flex-col h-full gap-4 transition-all duration-300`}>
            {/* Top Section: Setlist View - Takes remaining space */}
            <div className={`bg-surface border border-glass-border rounded-xl flex flex-col overflow-hidden relative transition-all duration-300 ${notesCollapsed ? 'flex-1' : 'h-[75%] sm:h-[70%]'}`}>
                <div className="p-3 border-b border-slate-800 bg-surface flex justify-between items-center z-10">
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Music size={16} /> Setlist
                    </h2>
                    <button onClick={() => setShowGeneral(!showGeneral)} className="text-xs text-primary hover:underline">
                        {showGeneral ? "Hide Info" : "Show General Info"}
                    </button>
                </div>

                {/* General Info Overlay/Panel */}
                {showGeneral && (
                    <div className="absolute inset-0 top-10 bg-black/95 z-20 p-4 overflow-y-auto animate-fade-in backdrop-blur-sm">
                        <h3 className="text-slate-500 mb-2 text-xs uppercase">General Info</h3>
                        <div className="text-xl md:text-2xl text-white whitespace-pre-wrap leading-relaxed">{masterNotes}</div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-black/50 custom-scrollbar">
                    {songs && songs.map((song, index) => {
                        const isActive = song.isActive;
                        return (
                            <AccordionSongItem
                                key={song.id}
                                song={song}
                                index={index}
                                isActive={isActive}
                            />
                        );
                    })}
                    {(!songs || songs.length === 0) && <div className="p-8 text-center text-slate-600">No songs yet.</div>}
                </div>
            </div>

            {/* Bottom Section: Personal Notes - Fixed height or Collapsed */}
            <div className={`bg-surface border border-glass-border rounded-xl flex flex-col transition-all duration-300 ${notesCollapsed ? 'h-[50px]' : 'h-[25%] sm:h-[30%] min-h-[150px]'}`}>
                <div className="flex justify-between items-center p-3 border-b border-slate-800/50">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xs font-bold text-secondary uppercase tracking-widest">{role} Notes</h2>
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
                        placeholder={`Your personal ${role} notes...`}
                        className="flex-1 w-full bg-black border-none p-4 text-lg text-white focus:outline-none focus:ring-1 focus:ring-secondary/50 transition-colors resize-none font-sans font-medium leading-relaxed tracking-wide placeholder:text-slate-800"
                    />
                )}
            </div>
        </div>
    );
};

// Extracted for cleaner state management per item
const AccordionSongItem = ({ song, index, isActive }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Auto-expand if active (Leader control), otherwise rely on user click
    const showDetails = isActive || isExpanded;

    return (
        <div
            onClick={() => setIsExpanded(!isExpanded)}
            className={`rounded-xl border transition-all cursor-pointer ${isActive
                ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(167,139,250,0.15)] my-4 scale-[1.01]'
                : 'bg-surface/30 border-slate-800 hover:bg-surface/50 hover:border-slate-700'
                }`}
        >
            <div className="p-4 flex justify-between items-center group">
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
                            <div className="hidden sm:block rounded-lg border border-slate-700 bg-black/40 px-2 py-1 text-sm sm:text-base text-slate-400 font-mono">
                                {song.tempo}
                            </div>
                        )}
                    </div>

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
                <div className={`px-4 pb-4 pt-2 font-mono text-base sm:text-lg whitespace-pre-wrap border-t ${isActive ? 'border-primary/10 text-slate-200' : 'border-slate-800/50 text-slate-400'}`}>
                    <div className="flex gap-4 mb-2 opacity-50 text-sm">
                        {song.tempo && <span className="sm:hidden">BPM: {song.tempo}</span>}
                        {song.timeSig && <span>{song.timeSig}</span>}
                    </div>
                    <div>{song.notes || <span className="opacity-30 italic">No notes added.</span>}</div>
                </div>
            )}
        </div>
    );
};

export default PlayerBoard;
