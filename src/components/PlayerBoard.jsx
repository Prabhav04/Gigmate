import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Music } from 'lucide-react';

const PlayerBoard = ({ role, masterNotes, songs, personalNotes, onUpdatePersonal, isSaving }) => {
    const [showGeneral, setShowGeneral] = useState(false);

    return (
        <div className="grid grid-rows-[40%_60%] h-full gap-4">
            {/* Top Section: Setlist View */}
            <div className="bg-surface border border-glass-border rounded-xl flex flex-col overflow-hidden relative">
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
                    <div className="absolute inset-0 top-10 bg-black/95 z-20 p-4 overflow-y-auto animate-fade-in">
                        <h3 className="text-slate-500 mb-2 text-xs uppercase">General Info</h3>
                        <div className="text-lg text-white whitespace-pre-wrap">{masterNotes}</div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-black">
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

            {/* Bottom Section: Personal Notes */}
            <div className="bg-surface border border-glass-border rounded-xl p-4 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-sm font-bold text-secondary uppercase tracking-widest">{role} Notes</h2>
                    <div className={`text-xs text-slate-500 font-mono transition-opacity ${isSaving ? 'opacity-100' : 'opacity-0'}`}>
                        SAVING...
                    </div>
                </div>
                <textarea
                    value={personalNotes}
                    onChange={(e) => onUpdatePersonal(e.target.value)}
                    placeholder={`Your personal ${role} notes...`}
                    className="flex-1 w-full bg-black border border-slate-800 rounded-lg p-4 text-xl sm:text-2xl text-white focus:outline-none focus:border-secondary transition-colors resize-none font-sans font-medium leading-relaxed tracking-wide placeholder:text-slate-700"
                />
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
            className={`rounded-lg border transition-all cursor-pointer ${isActive ? 'bg-primary/20 border-primary shadow-lg my-2' : 'bg-surface/50 border-slate-800 hover:bg-surface hover:border-slate-700'}`}
        >
            <div className="p-3 flex justify-between items-center group">
                <div className="flex items-center gap-3 overflow-hidden">
                    <span className={`font-mono text-sm shrink-0 ${isActive ? 'text-primary' : 'text-slate-500'}`}>#{index + 1}</span>
                    <div className={`text-lg font-bold truncate ${isActive ? 'text-white' : 'text-slate-400'}`}>
                        {song.title}
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    {/* Metadata Badges */}
                    <div className="hidden sm:flex items-center gap-2">
                        {song.key && (
                            <div className="rounded border border-slate-700 bg-black/40 px-2 py-0.5 text-xs text-slate-300 font-mono">
                                {song.key}
                            </div>
                        )}
                        {song.tempo && (
                            <div className="rounded border border-slate-700 bg-black/40 px-2 py-0.5 text-xs text-slate-300 font-mono">
                                {song.tempo} BPM
                            </div>
                        )}
                        {song.timeSig && (
                            <div className="rounded border border-slate-700 bg-black/40 px-2 py-0.5 text-xs text-slate-300 font-mono">
                                {song.timeSig}
                            </div>
                        )}
                    </div>

                    {/* Mobile Badges (Simplified) */}
                    {(song.key || song.tempo) && (
                        <div className="sm:hidden flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                            {song.key && <span>{song.key}</span>}
                            {song.key && song.tempo && <span>•</span>}
                            {song.tempo && <span>{song.tempo}</span>}
                        </div>
                    )}

                    {isActive && <div className="text-[10px] bg-primary text-black px-2 py-0.5 rounded font-bold animate-pulse">LIVE</div>}
                    {showDetails ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                </div>
            </div>

            {/* Expandable Content */}
            {showDetails && (
                <div className={`px-4 pb-4 pt-0 font-mono text-base whitespace-pre-wrap border-t ${isActive ? 'border-primary/20 text-white' : 'border-slate-800 text-slate-400'}`}>
                    {/* Metadata details for mobile expanded view if needed, but header info is usually sufficient */}
                    <div className="mt-3">{song.notes || <span className="text-slate-600 italic">No notes added.</span>}</div>
                </div>
            )}
        </div>
    );
};

export default PlayerBoard;
