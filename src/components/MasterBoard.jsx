import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Reorder, useDragControls, AnimatePresence, motion } from 'framer-motion';
import { GripVertical, Play, Circle, Plus, Trash2, FileText, ListOrdered, X, BookOpen, Sliders, ChevronDown, ChevronUp } from 'lucide-react';
import Metronome from './Metronome';
import { DebouncedInput, DebouncedTextarea } from './DebouncedInputs';

// ─── Framer-Motion item for the FULL edit view ───────────────────────────────
const SortableSongItem = ({ song, index, onUpdateSong, onToggleActive, onDeleteSong, canReorder = true, isNewlyAdded = false }) => {
    const dragControls = useDragControls();

    const content = (
        <div className="flex items-start gap-2 md:gap-4">
            <div className="flex-1 space-y-2 md:space-y-6 min-w-0">
                <div className="flex gap-2">
                    <div className="pt-1.5 md:pt-2 text-slate-500 font-mono text-base md:text-lg font-bold shrink-0">#{index + 1}</div>
                    <DebouncedInput
                        value={song.title}
                        onChange={(value) => onUpdateSong(song.id, 'title', value)}
                        placeholder="Song Title"
                        className="flex-1 bg-transparent border-b border-slate-700 focus:border-primary focus:outline-none text-xl md:text-2xl font-bold text-white pb-1 placeholder:text-slate-700 w-full min-w-0"
                    />
                </div>

                <div className="flex flex-row flex-wrap justify-between gap-2 text-[13px] md:text-sm">
                    <div className="flex flex-row gap-1.5 items-center">
                        <DebouncedInput
                            value={song.key || ''}
                            onChange={(value) => onUpdateSong(song.id, 'key', value)}
                            placeholder="Key"
                            className="w-10 sm:w-16 md:w-20 bg-slate-900/50 border border-slate-700 rounded px-1.5 py-1 md:px-2 md:py-1 text-slate-300 focus:border-primary focus:outline-none"
                        />
                        <select
                            value={song.category || 'Slow Acoustic'}
                            onChange={(e) => onUpdateSong(song.id, 'category', e.target.value)}
                            className="bg-slate-900/50 border border-slate-700 rounded px-1.5 py-1 md:px-2 md:py-1 text-slate-300 focus:border-primary focus:outline-none cursor-pointer text-xs md:text-sm font-semibold"
                        >
                            <option value="Slow Acoustic" className="bg-slate-950 text-white">Slow Acoustic</option>
                            <option value="Mid Level" className="bg-slate-950 text-white">Mid Level</option>
                            <option value="Fast Pace" className="bg-slate-950 text-white">Fast Pace</option>
                        </select>
                    </div>
                    <div className="flex flex-row gap-1">
                        <DebouncedInput
                            value={song.tempo || ''}
                            onChange={(value) => onUpdateSong(song.id, 'tempo', value)}
                            placeholder="BPM"
                            className="w-10 sm:w-16 md:w-20 bg-slate-900/50 border border-slate-700 rounded px-1.5 py-1 md:px-2 md:py-1 text-slate-300 focus:border-primary focus:outline-none"
                        />
                        <DebouncedInput
                            value={song.timeSig || ''}
                            onChange={(value) => onUpdateSong(song.id, 'timeSig', value)}
                            placeholder="Sig"
                            className="w-10 sm:w-16 md:w-20 bg-slate-900/50 border border-slate-700 rounded px-1.5 py-1 md:px-2 md:py-1 text-slate-300 focus:border-primary focus:outline-none"
                        />
                    </div>
                </div>

                <DebouncedTextarea
                    value={song.notes}
                    onChange={(value) => onUpdateSong(song.id, 'notes', value)}
                    placeholder="Specific notes..."
                    className="w-full h-[200px] bg-slate-900/50 rounded p-1.5 md:p-2 text-slate-300 min-h-[60px] md:min-h-[80px] focus:outline-none focus:ring-1 focus:ring-primary text-sm md:text-lg resize-y custom-scrollbar"
                />
            </div>
        </div>
    );

    const footer = (
        <div className="flex flex-row justify-between items-center gap-2 md:gap-4 rounded-lg w-full">
            {canReorder ? (
                <div
                    className="pt-2 md:pt-3 text-slate-600 cursor-grab active:cursor-grabbing hover:text-slate-400 touch-none shrink-0"
                    onPointerDown={(e) => { e.preventDefault(); dragControls.start(e); }}
                    title="Drag to reorder"
                >
                    <GripVertical size={16} className="md:w-5 md:h-5" />
                </div>
            ) : (
                <div className="shrink-0 w-4 h-4" />
            )}

            <div className="flex flex-row items-center gap-1.5 md:gap-2 pt-1 shrink-0">
                <button
                    onClick={() => onToggleActive(song.id)}
                    className={`p-2 md:p-3 rounded-full transition-colors ${song.isActive ? 'bg-primary text-black shadow-[0_0_10px_rgba(167,139,250,0.4)]' : 'text-slate-500 hover:text-primary bg-slate-900 border border-slate-700'}`}
                >
                    {song.isActive ? <Play size={18} className="md:w-6 md:h-6" fill="currentColor" /> : <Circle size={18} className="md:w-6 md:h-6" />}
                </button>
                <button
                    onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${song.title || 'this song'}"?`)) {
                            onDeleteSong(song.id);
                        }
                    }}
                    className="p-2 md:p-3 text-slate-600 hover:text-red-500 transition-colors"
                >
                    <Trash2 size={18} className="md:w-6 md:h-6" />
                </button>
            </div>
        </div>
    );

    const containerClassName = `p-3 md:p-4 rounded-lg border transition-all ${
        isNewlyAdded
            ? 'animate-new-item-flash border-primary'
            : song.isActive
            ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(167,139,250,0.15)]'
            : 'bg-black border-slate-800'
    }`;

    if (canReorder) {
        return (
            <Reorder.Item
                value={song}
                dragListener={false}
                dragControls={dragControls}
                className={containerClassName}
            >
                {content}
                {footer}
            </Reorder.Item>
        );
    }

    return (
        <div className={containerClassName}>
            {content}
            {footer}
        </div>
    );
};

// ─── Compact Sort View — pure pointer-event drag, no Framer Motion ────────────
const CompactSortView = ({ songs, onReorderSongs }) => {
    const [orderedSongs, setOrderedSongs] = useState(songs);
    const [dragId, setDragId] = useState(null);
    const [ghostY, setGhostY] = useState(0);
    const [ghostHeight, setGhostHeight] = useState(0);
    const containerRef = useRef(null);
    const trackRef = useRef(null);
    const thumbRef = useRef(null);
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
        const item = e.currentTarget.closest('[data-sort-item]');
        if (!item) return;
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

    // Custom Scrollbar Logic
    const updateScrollbar = useCallback(() => {
        const container = containerRef.current;
        const thumb = thumbRef.current;
        const track = trackRef.current;
        if (!container || !thumb || !track) return;

        const clientHeight = container.clientHeight;
        const scrollHeight = container.scrollHeight;
        const scrollTop = container.scrollTop;

        if (scrollHeight <= clientHeight) {
            track.style.display = 'none';
            return;
        }
        track.style.display = 'block';

        const trackHeight = track.clientHeight;
        const calculatedThumbHeight = Math.max(40, (clientHeight / scrollHeight) * trackHeight);
        thumb.style.height = `${calculatedThumbHeight}px`;

        const scrollableHeight = scrollHeight - clientHeight;
        const scrollableTrackHeight = trackHeight - calculatedThumbHeight;
        const thumbTop = (scrollTop / scrollableHeight) * scrollableTrackHeight;

        thumb.style.transform = `translateY(${thumbTop}px)`;
    }, []);

    const handleThumbPointerDown = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();

        const container = containerRef.current;
        const thumb = thumbRef.current;
        const track = trackRef.current;
        if (!container || !thumb || !track) return;

        const startY = e.clientY;
        const startScrollTop = container.scrollTop;

        const clientHeight = container.clientHeight;
        const scrollHeight = container.scrollHeight;
        const trackHeight = track.clientHeight;
        const thumbHeight = thumb.clientHeight;

        const scrollableHeight = scrollHeight - clientHeight;
        const scrollableTrackHeight = trackHeight - thumbHeight;

        if (scrollableTrackHeight <= 0) return;
        const ratio = scrollableTrackHeight / scrollableHeight;

        const handlePointerMove = (moveEvent) => {
            const deltaY = moveEvent.clientY - startY;
            container.scrollTop = startScrollTop + deltaY / ratio;
        };

        const handlePointerUp = () => {
            document.removeEventListener('pointermove', handlePointerMove);
            document.removeEventListener('pointerup', handlePointerUp);
            document.removeEventListener('pointercancel', handlePointerUp);
        };

        document.addEventListener('pointermove', handlePointerMove);
        document.addEventListener('pointerup', handlePointerUp);
        document.addEventListener('pointercancel', handlePointerUp);
    }, []);

    const handleTrackPointerDown = useCallback((e) => {
        if (e.target !== trackRef.current) return;
        e.preventDefault();

        const container = containerRef.current;
        const track = trackRef.current;
        const thumb = thumbRef.current;
        if (!container || !track || !thumb) return;

        const rect = track.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        const thumbHeight = thumb.clientHeight;
        const targetThumbTop = clickY - thumbHeight / 2;

        const trackHeight = track.clientHeight;
        const scrollableTrackHeight = trackHeight - thumbHeight;
        const scrollableHeight = container.scrollHeight - container.clientHeight;

        const ratio = targetThumbTop / scrollableTrackHeight;
        container.scrollTop = Math.max(0, Math.min(scrollableHeight, ratio * scrollableHeight));

        handleThumbPointerDown(e);
    }, [handleThumbPointerDown]);

    React.useEffect(() => {
        updateScrollbar();
        const timer = setTimeout(updateScrollbar, 100);
        window.addEventListener('resize', updateScrollbar);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateScrollbar);
        };
    }, [orderedSongs, updateScrollbar]);

    return (
        <div className="flex-1 relative flex overflow-hidden w-full h-full">
            {/* The scrollable area */}
            <div
                ref={containerRef}
                onScroll={updateScrollbar}
                className="flex-1 overflow-y-auto pr-8 no-scrollbar relative"
                onPointerMove={handleContainerPointerMove}
                onPointerUp={handleContainerPointerUp}
                onPointerCancel={handleContainerPointerUp}
            >
                <div className="space-y-1.5 relative">
                    {orderedSongs.map((song, index) => (
                        <div
                            key={song.id}
                            data-sort-item
                            className={`flex items-center gap-1 px-2 py-2 rounded-lg border transition-colors duration-100 select-none ${dragId === song.id ? 'opacity-30 bg-black border-slate-700' : 'bg-black border-slate-800 hover:border-slate-600'}`}
                        >
                            <span className="text-slate-500 font-mono text-sm font-bold shrink-0 w-6 text-right">
                                #{index + 1}
                            </span>
                            <span className="flex-1 text-white text-base md:text-lg font-bold truncate pointer-events-none">
                                {song.title || <span className="text-slate-600 italic">Untitled</span>}
                            </span>
                            {song.category && (
                                <span className={`text-[10px] rounded px-1.5 py-0.5 shrink-0 pointer-events-none font-bold ${
                                    song.category === 'Slow Acoustic'
                                        ? 'border border-blue-500/30 text-blue-400 bg-blue-500/10'
                                        : song.category === 'Mid Level'
                                        ? 'border border-yellow-500/30 text-yellow-400 bg-yellow-500/10'
                                        : 'border border-red-500/30 text-red-400 bg-red-500/10'
                                }`}>
                                    {song.category}
                                </span>
                            )}
                            {song.key && (
                                <span className="text-xs font-mono text-primary border border-primary/30 rounded px-1.5 py-0.5 shrink-0 pointer-events-none">
                                    {song.key}
                                </span>
                            )}
                            <div
                                onPointerDown={(e) => handlePointerDown(e, song.id)}
                                className="p-3 -mr-2 text-slate-500 hover:text-primary active:text-primary-hover cursor-grab active:cursor-grabbing touch-none shrink-0 flex items-center justify-center"
                                title="Drag to reorder"
                                style={{ touchAction: 'none', width: '44px', height: '44px' }}
                            >
                                <GripVertical size={20} className="shrink-0 pointer-events-none" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Ghost — floats under the cursor while dragging */}
                {dragId !== null && (() => {
                    const dragged = orderedSongs.find(s => s.id === dragId);
                    return (
                        <div
                            className="absolute left-0 right-8 z-50 pointer-events-none"
                            style={{ top: ghostY, height: ghostHeight }}
                        >
                            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border bg-slate-800 border-primary shadow-[0_0_20px_rgba(167,139,250,0.4)] h-full">
                                <span className="text-primary font-mono text-sm font-bold shrink-0 w-6 text-right">✦</span>
                                <span className="flex-1 text-white text-base md:text-lg font-bold truncate">
                                    {dragged?.title || 'Untitled'}
                                </span>
                                {dragged?.category && (
                                    <span className={`text-[10px] rounded px-1.5 py-0.5 shrink-0 font-bold ${
                                        dragged.category === 'Slow Acoustic'
                                            ? 'border border-blue-500/30 text-blue-400 bg-blue-500/10'
                                            : dragged.category === 'Mid Level'
                                            ? 'border border-yellow-500/30 text-yellow-400 bg-yellow-500/10'
                                            : 'border border-red-500/30 text-red-400 bg-red-500/10'
                                    }`}>
                                        {dragged.category}
                                    </span>
                                )}
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

            {/* Custom Touch-Draggable Scrollbar Track */}
            <div
                ref={trackRef}
                onPointerDown={handleTrackPointerDown}
                className="absolute right-0 top-0 bottom-0 w-6 bg-white/5 rounded-full cursor-pointer transition-colors hover:bg-white/10 z-30"
                style={{ touchAction: 'none' }}
            >
                {/* Custom Scrollbar Thumb */}
                <div
                    ref={thumbRef}
                    onPointerDown={handleThumbPointerDown}
                    className="absolute left-0 right-0 bg-primary/50 hover:bg-primary/80 active:bg-primary rounded-full transition-colors cursor-grab active:cursor-grabbing"
                    style={{ minHeight: '40px', width: '100%', touchAction: 'none' }}
                />
            </div>
        </div>
    );
};


// ─── Main MasterBoard ─────────────────────────────────────────────────────────

const MasterBoard = ({ songs, onAddSong, onUpdateSong, onDeleteSong, onReorderSongs, onToggleActive, onImportSongs, onToggleLibrary }) => {
    const [showImport, setShowImport] = useState(false);
    const [showTools, setShowTools] = useState(false);
    const [isSortMode, setIsSortMode] = useState(false);
    const [importText, setImportText] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [sortBy, setSortBy] = useState('original');
    const listRef = useRef(null);
    const [newlyAddedSongId, setNewlyAddedSongId] = useState(null);
    const prevSongsLength = useRef(songs?.length || 0);
    const isFirstLoad = useRef(true);

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
                setNewlyAddedSongId(newSong.id);
                const isVisible = filterCategory === 'All' || newSong.category === filterCategory;
                if (isVisible) {
                    // scrollToBottom() removed here to prevent scroll jumps when someone else adds a song while we're typing.
                    // Local additions already trigger scrollToBottom() in handleAddSongClick etc.
                }
                const timer = setTimeout(() => {
                    setNewlyAddedSongId(null);
                }, 3000);
                return () => clearTimeout(timer);
            }
        }
        prevSongsLength.current = currentLength;
    }, [songs, filterCategory]);

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

    const canReorder = false; // Disabled in normal view to prevent mobile keyboard scroll jump

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
            category: 'Slow Acoustic',
            isActive: false,
        }));
        if (onImportSongs) onImportSongs(newSongs);
        setShowImport(false);
        setImportText('');
        scrollToBottom();
    };

    const loadPreset = (presetSongs) => {
        const newSongs = presetSongs.map(s => ({
            ...s,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            category: s.category || 'Slow Acoustic'
        }));
        if (onImportSongs) onImportSongs(newSongs);
        scrollToBottom();
    };

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Tools Collapsible Section */}
            <div className="flex flex-col gap-2 shrink-0">
                <button
                    onClick={() => setShowTools(!showTools)}
                    className="flex justify-between items-center bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-lg px-4 py-3 transition-all cursor-pointer select-none text-left w-full shadow-md group"
                >
                    <div className="flex items-center gap-2">
                        <Sliders className="w-5 h-5 text-primary group-hover:rotate-12 transition-transform" />
                        <span className="font-bold text-sm md:text-base text-slate-300 group-hover:text-white transition-colors">Tools</span>
                        <span className="text-[11px] bg-slate-950 text-slate-400 border border-slate-800 px-2.5 py-0.5 rounded-full font-medium">
                            Metronome & Library
                        </span>
                    </div>
                    <div className="text-slate-400 group-hover:text-white transition-colors">
                        {showTools ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                </button>

                <AnimatePresence initial={false}>
                    {showTools && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="overflow-hidden"
                        >
                            <div className="flex flex-col lg:flex-row gap-3 pb-1 pt-1">
                                <div className="flex-1">
                                    <Metronome
                                        suggestedBPM={songs.find(s => s.isActive)?.tempo ? parseInt(songs.find(s => s.isActive).tempo) : 120}
                                        suggestedTimeSig={songs.find(s => s.isActive)?.timeSig || '4/4'}
                                        hasActiveSong={songs.some(s => s.isActive)}
                                    />
                                </div>
                                <button
                                    onClick={onToggleLibrary}
                                    className="lg:w-48 bg-slate-900/50 hover:bg-slate-800 border border-slate-700 rounded-lg p-3 md:p-4 flex items-center justify-center gap-2 text-white font-bold transition-all hover:border-slate-500 cursor-pointer shadow-md"
                                    title="Open Song Library"
                                >
                                    <BookOpen className="w-5 h-5 text-primary" />
                                    <span>Song Library</span>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Setlist Section */}
            <div className="flex-1 bg-slate-900 border border-glass-border rounded-xl p-2 flex flex-col overflow-hidden relative">

                {/* Header */}
                <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center mb-4">
                    <div className="flex items-center gap-4 flex-wrap w-full md:w-auto">
                        <h2 className="text-xl font-bold text-primary">Setlist</h2>
                        
                        {!isSortMode && (
                            <div className="flex flex-wrap gap-2 items-center">
                                {/* Filter tabs */}
                                <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-[11px] sm:text-xs">
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
                                    className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] sm:text-xs font-semibold text-slate-300 focus:border-primary focus:outline-none cursor-pointer"
                                >
                                    <option value="original">Original Order</option>
                                    <option value="category">Group by Category</option>
                                    <option value="alphabetical">A-Z</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 flex-wrap justify-end w-full md:w-auto">
                        {filterCategory === 'All' && sortBy === 'original' && (
                            <button
                                onClick={() => setIsSortMode(!isSortMode)}
                                className={`flex items-center gap-2 font-bold px-3 py-2 rounded-lg transition-colors text-sm ${isSortMode ? 'bg-primary text-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                            >
                                {isSortMode ? <X size={16} /> : <ListOrdered size={18} />}
                                <span className="hidden sm:inline">{isSortMode ? 'Done Sorting' : 'Sort View'}</span>
                            </button>
                        )}
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
                            <div className="space-y-4">
                                {processedSongs.map((song) => (
                                    <SortableSongItem
                                        key={song.id}
                                        song={song}
                                        index={song.originalIndex}
                                        onUpdateSong={onUpdateSong}
                                        onDeleteSong={onDeleteSong}
                                        onToggleActive={onToggleActive}
                                        canReorder={false}
                                        isNewlyAdded={newlyAddedSongId === song.id}
                                    />
                                ))}
                            </div>
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
