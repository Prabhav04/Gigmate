import React, { useState, useRef, useCallback } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { GripVertical, Play, Circle, Plus, Trash2, FileText, ListOrdered, X } from 'lucide-react';
import Metronome from './Metronome';

// ─── Framer-Motion item for the FULL edit view ───────────────────────────────
const SortableSongItem = ({ song, index, onUpdateSong, onToggleActive, onDeleteSong }) => {
    const dragControls = useDragControls();

    return (
        <Reorder.Item
            value={song}
            dragListener={false}
            dragControls={dragControls}
            className={`p-3 md:p-4 rounded-lg border transition-all ${song.isActive ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(167,139,250,0.1)]' : 'bg-black border-slate-800'}`}
        >
            <div className="flex items-start gap-2 md:gap-4">
                <div className="flex-1 space-y-2 md:space-y-6 min-w-0">
                    <div className="flex gap-2">
                        <div className="pt-1.5 md:pt-2 text-slate-500 font-mono text-base md:text-lg font-bold shrink-0">#{index + 1}</div>
                        <input
                            type="text"
                            value={song.title}
                            onChange={(e) => onUpdateSong(song.id, 'title', e.target.value)}
                            placeholder="Song Title"
                            className="flex-1 bg-transparent border-b border-slate-700 focus:border-primary focus:outline-none text-xl md:text-2xl font-bold text-white pb-1 placeholder:text-slate-700 w-full min-w-0"
                        />
                    </div>

                    <div className="flex flex-row justify-between gap-1.5 md:gap-2 text-[13px] md:text-sm">
                        <input
                            type="text"
                            value={song.key || ''}
                            onChange={(e) => onUpdateSong(song.id, 'key', e.target.value)}
                            placeholder="Key"
                            className="w-10 sm:w-16 md:w-20 bg-slate-900/50 border border-slate-700 rounded px-1.5 py-1 md:px-2 md:py-1 text-slate-300 focus:border-primary focus:outline-none"
                        />
                        <div className="flex flex-row gap-1">
                            <input
                                type="text"
                                value={song.tempo || ''}
                                onChange={(e) => onUpdateSong(song.id, 'tempo', e.target.value)}
                                placeholder="BPM"
                                className="w-10 sm:w-16 md:w-20 bg-slate-900/50 border border-slate-700 rounded px-1.5 py-1 md:px-2 md:py-1 text-slate-300 focus:border-primary focus:outline-none"
                            />
                            <input
                                type="text"
                                value={song.timeSig || ''}
                                onChange={(e) => onUpdateSong(song.id, 'timeSig', e.target.value)}
                                placeholder="Sig"
                                className="w-10 sm:w-16 md:w-20 bg-slate-900/50 border border-slate-700 rounded px-1.5 py-1 md:px-2 md:py-1 text-slate-300 focus:border-primary focus:outline-none"
                            />
                        </div>
                    </div>

                    <textarea
                        value={song.notes}
                        onChange={(e) => onUpdateSong(song.id, 'notes', e.target.value)}
                        placeholder="Specific notes..."
                        className="w-full h-[200px] bg-slate-900/50 rounded p-1.5 md:p-2 text-slate-300 min-h-[60px] md:min-h-[80px] focus:outline-none focus:ring-1 focus:ring-primary text-sm md:text-lg resize-y custom-scrollbar"
                    />
                </div>
            </div>

            {/* Tool bar */}
            <div className="flex flex-row justify-between items-center gap-2 md:gap-4 rounded-lg w-full">
                <div
                    className="pt-2 md:pt-3 text-slate-600 cursor-grab active:cursor-grabbing hover:text-slate-400 touch-none shrink-0"
                    onPointerDown={(e) => { e.preventDefault(); dragControls.start(e); }}
                    title="Drag to reorder"
                >
                    <GripVertical size={16} className="md:w-5 md:h-5" />
                </div>

                <div className="flex flex-row items-center gap-1.5 md:gap-2 pt-1 shrink-0">
                    <button
                        onClick={() => onToggleActive(song.id)}
                        className={`p-2 md:p-3 rounded-full transition-colors ${song.isActive ? 'bg-primary text-black shadow-[0_0_10px_rgba(167,139,250,0.4)]' : 'text-slate-500 hover:text-primary bg-slate-900 border border-slate-700'}`}
                    >
                        {song.isActive ? <Play size={18} className="md:w-6 md:h-6" fill="currentColor" /> : <Circle size={18} className="md:w-6 md:h-6" />}
                    </button>
                    <button
                        onClick={() => onDeleteSong(song.id)}
                        className="p-2 md:p-3 text-slate-600 hover:text-red-500 transition-colors"
                    >
                        <Trash2 size={18} className="md:w-6 md:h-6" />
                    </button>
                </div>
            </div>
        </Reorder.Item>
    );
};

// ─── Compact Sort View — pure pointer-event drag, no Framer Motion ────────────
const CompactSortView = ({ songs, onReorderSongs }) => {
    const [orderedSongs, setOrderedSongs] = useState(songs);
    const [dragId, setDragId] = useState(null);
    const [ghostY, setGhostY] = useState(0);
    const [ghostHeight, setGhostHeight] = useState(0);
    const containerRef = useRef(null);
    const dragState = useRef(null); // { songId, offsetY }
    const scrollTimer = useRef(null);

    // Keep local list in sync when songs change outside sort mode
    React.useEffect(() => { setOrderedSongs(songs); }, [songs]);

    const stopAutoScroll = useCallback(() => {
        if (scrollTimer.current) { clearInterval(scrollTimer.current); scrollTimer.current = null; }
    }, []);

    // Find which index the cursor is hovering over by checking midpoints of live DOM items
    const getInsertIndex = useCallback((clientY) => {
        if (!containerRef.current) return 0;
        const items = containerRef.current.querySelectorAll('[data-sort-item]');
        let idx = items.length - 1;
        for (let i = 0; i < items.length; i++) {
            const r = items[i].getBoundingClientRect();
            if (clientY < r.top + r.height / 2) { idx = i; break; }
        }
        return idx;
    }, []);

    const handlePointerDown = useCallback((e, songId) => {
        e.preventDefault();
        const item = e.currentTarget;
        const container = containerRef.current;
        const itemRect = item.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        dragState.current = {
            songId,
            offsetY: e.clientY - itemRect.top,
        };

        // Capture on container so pointermove/up always fire here even if cursor leaves
        container.setPointerCapture(e.pointerId);

        setDragId(songId);
        setGhostHeight(itemRect.height);
        setGhostY(itemRect.top - containerRect.top + container.scrollTop);
    }, []);

    const handleContainerPointerMove = useCallback((e) => {
        if (!dragState.current) return;
        e.preventDefault();

        const container = containerRef.current;
        const containerRect = container.getBoundingClientRect();

        // Update ghost position to follow cursor
        setGhostY(e.clientY - containerRect.top - dragState.current.offsetY + container.scrollTop);

        // Auto-scroll when near edges
        const ZONE = 60;
        const relY = e.clientY - containerRect.top;
        if (relY < ZONE) {
            if (!scrollTimer.current) scrollTimer.current = setInterval(() => { container.scrollTop -= 8; }, 16);
        } else if (relY > containerRect.height - ZONE) {
            if (!scrollTimer.current) scrollTimer.current = setInterval(() => { container.scrollTop += 8; }, 16);
        } else {
            stopAutoScroll();
        }

        // Live reorder: find where cursor is hovering and move the dragged item there
        const insertIdx = getInsertIndex(e.clientY);
        const { songId } = dragState.current;

        setOrderedSongs(prev => {
            const fromIdx = prev.findIndex(s => s.id === songId);
            if (fromIdx === -1 || fromIdx === insertIdx) return prev;
            const next = [...prev];
            const [moved] = next.splice(fromIdx, 1);
            next.splice(insertIdx, 0, moved);
            return next;
        });
    }, [getInsertIndex, stopAutoScroll]);

    const handleContainerPointerUp = useCallback(() => {
        if (!dragState.current) return;
        stopAutoScroll();
        // Commit final order to parent
        setOrderedSongs(prev => { onReorderSongs(prev); return prev; });
        setDragId(null);
        dragState.current = null;
    }, [stopAutoScroll, onReorderSongs]);

    return (
        <div
            ref={containerRef}
            className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative select-none"
            onPointerMove={handleContainerPointerMove}
            onPointerUp={handleContainerPointerUp}
            onPointerCancel={handleContainerPointerUp}
        >
            <div className="space-y-1.5 relative">
                {orderedSongs.map((song, index) => (
                    <div
                        key={song.id}
                        data-sort-item
                        onPointerDown={(e) => handlePointerDown(e, song.id)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors duration-100 cursor-grab active:cursor-grabbing ${dragId === song.id ? 'opacity-30 bg-black border-slate-700' : 'bg-black border-slate-800 hover:border-slate-600'}`}
                        style={{ touchAction: 'none' }}
                    >
                        <span className="text-slate-500 font-mono text-sm font-bold shrink-0 w-6 text-right">
                            #{index + 1}
                        </span>
                        <span className="flex-1 text-white text-base md:text-lg font-bold truncate pointer-events-none">
                            {song.title || <span className="text-slate-600 italic">Untitled</span>}
                        </span>
                        {song.key && (
                            <span className="text-xs font-mono text-primary border border-primary/30 rounded px-1.5 py-0.5 shrink-0 pointer-events-none">
                                {song.key}
                            </span>
                        )}
                        <GripVertical size={20} className="text-slate-600 shrink-0 pointer-events-none" />
                    </div>
                ))}
            </div>

            {/* Ghost — floats under the cursor while dragging */}
            {dragId !== null && (() => {
                const dragged = orderedSongs.find(s => s.id === dragId);
                return (
                    <div
                        className="absolute left-0 right-2 z-50 pointer-events-none"
                        style={{ top: ghostY, height: ghostHeight }}
                    >
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border bg-slate-800 border-primary shadow-[0_0_20px_rgba(167,139,250,0.4)] h-full">
                            <span className="text-primary font-mono text-sm font-bold shrink-0 w-6 text-right">✦</span>
                            <span className="flex-1 text-white text-base md:text-lg font-bold truncate">
                                {dragged?.title || 'Untitled'}
                            </span>
                            {dragged?.key && (
                                <span className="text-xs font-mono text-primary border border-primary/30 rounded px-1.5 py-0.5 shrink-0">
                                    {dragged.key}
                                </span>
                            )}
                            <GripVertical size={20} className="text-primary shrink-0" />
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};


// ─── Main MasterBoard ─────────────────────────────────────────────────────────

const MasterBoard = ({ songs, onAddSong, onUpdateSong, onDeleteSong, onReorderSongs, onToggleActive, onImportSongs }) => {
    const [showImport, setShowImport] = useState(false);
    const [isSortMode, setIsSortMode] = useState(false);
    const [importText, setImportText] = useState('');
    const listRef = useRef(null);

    const scrollToBottom = () => {
        setTimeout(() => {
            if (listRef.current) {
                listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
            }
        }, 150);
    };

    const handleAddSongClick = () => {
        onAddSong();
        scrollToBottom();
    };

    const handleImport = () => {
        if (!importText.trim()) return;
        const lines = importText.split('\n').filter(l => l.trim());
        const newSongs = lines.map((line) => ({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            title: line.replace(/^\d+\.\s*/, '').trim(),
            key: '',
            tempo: '',
            timeSig: '',
            notes: '',
            cues: [],
            isActive: false,
        }));
        if (onImportSongs) onImportSongs(newSongs);
        setShowImport(false);
        setImportText('');
        scrollToBottom();
    };

    const loadPreset = (presetSongs) => {
        const newSongs = presetSongs.map(s => ({ ...s, id: Date.now().toString() + Math.random().toString(36).substr(2, 9) }));
        if (onImportSongs) onImportSongs(newSongs);
        scrollToBottom();
    };

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Metronome */}
            <Metronome
                suggestedBPM={songs.find(s => s.isActive)?.tempo ? parseInt(songs.find(s => s.isActive).tempo) : 120}
                suggestedTimeSig={songs.find(s => s.isActive)?.timeSig || '4/4'}
            />

            {/* Setlist Section */}
            <div className="flex-1 bg-slate-900 border border-glass-border rounded-xl p-4 flex flex-col overflow-hidden relative">

                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-primary">Setlist</h2>
                    <div className="flex gap-2 flex-wrap justify-end">
                        <button
                            onClick={() => setIsSortMode(!isSortMode)}
                            className={`flex items-center gap-2 font-bold px-3 py-2 rounded-lg transition-colors text-sm ${isSortMode ? 'bg-primary text-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                        >
                            {isSortMode ? <X size={16} /> : <ListOrdered size={18} />}
                            <span className="hidden sm:inline">{isSortMode ? 'Done Sorting' : 'Sort View'}</span>
                        </button>
                        {!isSortMode && (
                            <>
                                <button
                                    onClick={() => setShowImport(!showImport)}
                                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-lg transition-colors text-sm"
                                >
                                    <FileText size={18} /> Import
                                </button>
                                <button
                                    onClick={handleAddSongClick}
                                    className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-background font-bold px-4 py-2 rounded-lg transition-colors text-sm"
                                >
                                    <Plus size={18} /> Add Song
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Import Overlay */}
                {showImport && !isSortMode && (
                    <div className="absolute inset-0 z-20 bg-surface/95 backdrop-blur-md p-6 flex flex-col animate-fade-in rounded-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">Import Songs</h3>
                            <button onClick={() => setShowImport(false)} className="text-slate-400 hover:text-white">Close</button>
                        </div>
                        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                            <button
                                onClick={() => { import('../constants/presets').then(({ ROCK_SETLIST_PRESET }) => { loadPreset(ROCK_SETLIST_PRESET); setShowImport(false); }); }}
                                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-bold text-sm whitespace-nowrap hover:scale-105 transition-transform"
                            >
                                Load "Rock Setlist" Preset
                            </button>
                            <button
                                onClick={() => { import('../constants/presets').then(({ ATTAM_SETLIST_PRESET }) => { loadPreset(ATTAM_SETLIST_PRESET); setShowImport(false); }); }}
                                className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg text-white font-bold text-sm whitespace-nowrap hover:scale-105 transition-transform"
                            >
                                Load "Attam Setlist" Preset
                            </button>
                            <button
                                onClick={() => { import('../constants/presets').then(({ MARRIAGE_SETLIST_PRESET }) => { loadPreset(MARRIAGE_SETLIST_PRESET); setShowImport(false); }); }}
                                className="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 rounded-lg text-white font-bold text-sm whitespace-nowrap hover:scale-105 transition-transform"
                            >
                                Load "Marriage Setlist" Preset
                            </button>
                        </div>
                        <textarea
                            value={importText}
                            onChange={(e) => setImportText(e.target.value)}
                            placeholder="Paste song titles here (one per line)..."
                            className="flex-1 w-full bg-black border border-slate-800 rounded-lg p-4 text-slate-300 focus:outline-none focus:border-primary resize-none mb-4"
                        />
                        <button
                            onClick={handleImport}
                            className="w-full py-3 bg-primary text-black font-bold rounded-lg hover:bg-primary-hover transition-colors"
                        >
                            Import {importText ? `(${importText.split('\n').filter(l => l.trim()).length} Songs)` : ''}
                        </button>
                    </div>
                )}

                {/* Sort Mode hint */}
                {isSortMode && (
                    <p className="text-xs text-slate-500 mb-3 text-center">
                        Drag songs by the <span className="text-slate-400 font-bold">grip handle</span> to reorder. Click <span className="text-primary font-bold">Done Sorting</span> when finished.
                    </p>
                )}

                {/* List Area */}
                {songs && songs.length > 0 ? (
                    isSortMode ? (
                        <CompactSortView
                            songs={songs}
                            onReorderSongs={onReorderSongs}
                        />
                    ) : (
                        <div ref={listRef} className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                            <Reorder.Group axis="y" values={songs} onReorder={onReorderSongs} className="space-y-4">
                                {songs.map((song, index) => (
                                    <SortableSongItem
                                        key={song.id}
                                        song={song}
                                        index={index}
                                        onUpdateSong={onUpdateSong}
                                        onDeleteSong={onDeleteSong}
                                        onToggleActive={onToggleActive}
                                    />
                                ))}
                            </Reorder.Group>
                        </div>
                    )
                ) : (
                    <div className="flex-1 flex items-center justify-center text-center text-slate-600 py-10 border-2 border-dashed border-slate-800 rounded-lg">
                        No songs yet. Click "Add Song" to start.
                    </div>
                )}
            </div>
        </div>
    );
};

export default MasterBoard;
