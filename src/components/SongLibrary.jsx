import React, { useState } from 'react';
import { X, Search, Plus, Trash2, Music, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { DebouncedInput, DebouncedTextarea } from './DebouncedInputs';

const SongLibrary = ({ 
    isOpen, 
    onClose, 
    role, 
    library = [], 
    libraryLoading = false,
    hasMoreLibrary = true,
    onFetchLibrary,
    songs = [],
    onAddLibrarySong, 
    onUpdateLibrarySong, 
    onDeleteLibrarySong, 
    onAddSongToSetlist
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedSongId, setExpandedSongId] = useState(null);
    const [addedSongsMap, setAddedSongsMap] = useState({}); // Tracking visual "Added" state momentarily
    const [newlyAddedLibSongId, setNewlyAddedLibSongId] = useState(null);
    const isFirstFieldRender = React.useRef(true);
    const listContainerRef = React.useRef(null);

    // Fetch initial list when drawer is opened
    React.useEffect(() => {
        if (isOpen) {
            setSearchQuery('');
            if (onFetchLibrary) {
                onFetchLibrary('', false);
            }
            isFirstFieldRender.current = true;
        }
    }, [isOpen, onFetchLibrary]);

    // Fetch on search query change (debounced at 400ms)
    React.useEffect(() => {
        if (!isOpen || !onFetchLibrary) return;
        
        if (isFirstFieldRender.current && searchQuery === '') {
            isFirstFieldRender.current = false;
            return;
        }
        
        const handler = setTimeout(() => {
            onFetchLibrary(searchQuery, false);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchQuery, isOpen, onFetchLibrary]);

    if (!isOpen) return null;

    const isKeyboard = role === 'keyboard';

    const handleAddClick = async () => {
        if (onAddLibrarySong) {
            const newId = await onAddLibrarySong();
            if (newId) {
                setNewlyAddedLibSongId(newId);
                setExpandedSongId(newId); // Auto-expand the newly added song for immediate editing
                setTimeout(() => {
                    if (listContainerRef.current) {
                        listContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                }, 100);
                setTimeout(() => {
                    setNewlyAddedLibSongId(null);
                }, 3000);
            }
        }
    };

    const handleAddToSetlistClick = (song) => {
        if (onAddSongToSetlist) {
            onAddSongToSetlist(song);
            
            // Set temporarily visual "Added" checkmark
            setAddedSongsMap(prev => ({ ...prev, [song.id]: true }));
            setTimeout(() => {
                setAddedSongsMap(prev => ({ ...prev, [song.id]: false }));
            }, 1500);
        }
    };

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop - clientHeight < 50) {
            if (hasMoreLibrary && !libraryLoading && onFetchLibrary) {
                onFetchLibrary(searchQuery, true);
            }
        }
    };

    const toggleAccordion = (songId) => {
        setExpandedSongId(expandedSongId === songId ? null : songId);
    };

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] animate-fade-in"
                onClick={onClose}
            />

            {/* Slide-out Drawer */}
            <div className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-slate-950/95 border-l border-slate-800 backdrop-blur-md shadow-2xl z-[100] flex flex-col animate-slide-in overflow-hidden">
                
                {/* Header */}
                <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/30">
                    <div className="flex items-center gap-2">
                        <Music className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-bold text-white">Song Library</h2>
                        <span className="text-xs font-mono text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
                            {library.length} songs
                        </span>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1 text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-lg transition-all"
                        title="Close Library"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Search & Actions */}
                <div className="p-4 border-b border-slate-900 flex flex-col gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search library songs by title, key, notes..."
                            className="w-full bg-slate-900/50 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-white"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {isKeyboard && (
                        <button
                            onClick={handleAddClick}
                            className="w-full py-2 bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary font-bold rounded-lg text-sm transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <Plus size={16} />
                            Add Song to Library
                        </button>
                    )}
                </div>

                {/* Library List */}
                <div 
                    ref={listContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-950/40"
                >
                    {library.map((song) => {
                        const isExpanded = expandedSongId === song.id;
                        const hasBeenAdded = addedSongsMap[song.id];
                        const isInSetlist = songs.some(s => s.title && s.title.toLowerCase().trim() === song.title.toLowerCase().trim());

                        return (
                            <div 
                                key={song.id}
                                className={`rounded-xl border transition-all ${
                                    song.id === newlyAddedLibSongId
                                        ? 'animate-new-item-flash border-primary'
                                        : isInSetlist
                                        ? isExpanded
                                            ? 'bg-secondary/10 border-secondary/50 shadow-lg shadow-secondary/5'
                                            : 'bg-secondary/5 border-secondary/20 hover:bg-secondary/10 hover:border-secondary/30'
                                        : isExpanded 
                                        ? 'bg-slate-900/50 border-slate-700 shadow-lg' 
                                        : 'bg-slate-900/20 border-slate-900/60 hover:bg-slate-900/30 hover:border-slate-800'
                                }`}
                            >
                                {/* Song Row Header */}
                                <div 
                                    onClick={() => toggleAccordion(song.id)}
                                    className="p-3.5 flex justify-between items-center cursor-pointer select-none group"
                                >
                                    <div className="flex items-center gap-3 overflow-hidden pr-2">
                                        <span className={`font-mono text-sm font-semibold shrink-0 ${isInSetlist ? 'text-secondary animate-pulse-slow' : 'text-slate-600'}`}>
                                            {isInSetlist ? '✓' : '✦'}
                                        </span>
                                        <span className={`text-base font-bold truncate transition-colors ${
                                            isInSetlist 
                                                ? 'text-secondary/90 group-hover:text-secondary' 
                                                : 'text-white group-hover:text-primary'
                                        }`}>
                                            {song.title}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        {song.category && (
                                            <span className={`text-[10px] rounded px-1.5 py-0.5 font-bold ${
                                                song.category === 'Slow Acoustic'
                                                    ? 'border border-blue-500/30 text-blue-400 bg-blue-500/10'
                                                    : song.category === 'Mid Level'
                                                    ? 'border border-yellow-500/30 text-yellow-400 bg-yellow-500/10'
                                                    : 'border border-red-500/30 text-red-400 bg-red-500/10'
                                            }`}>
                                                {song.category === 'Slow Acoustic' ? 'Slow' : song.category === 'Mid Level' ? 'Mid' : 'Fast'}
                                            </span>
                                        )}
                                        {song.key && (
                                            <span className="text-[11px] font-mono text-slate-400 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5">
                                                {song.key}
                                            </span>
                                        )}
                                        {isExpanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                                    </div>
                                </div>

                                {/* Accordion Body */}
                                {isExpanded && (
                                    <div className="p-3.5 border-t border-slate-800/50 bg-black/20 space-y-4 rounded-b-xl">
                                        {isKeyboard ? (
                                            // Keyboard Edit View
                                            <div className="space-y-3">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Song Title</label>
                                                    <DebouncedInput 
                                                        value={song.title}
                                                        onChange={(value) => onUpdateLibrarySong(song.id, 'title', value)}
                                                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white focus:outline-none focus:border-primary"
                                                        placeholder="Title"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Key</label>
                                                        <DebouncedInput 
                                                            value={song.key || ''}
                                                            onChange={(value) => onUpdateLibrarySong(song.id, 'key', value)}
                                                            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white focus:outline-none focus:border-primary"
                                                            placeholder="Key"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Tempo (BPM)</label>
                                                        <DebouncedInput 
                                                            value={song.tempo || ''}
                                                            onChange={(value) => onUpdateLibrarySong(song.id, 'tempo', value)}
                                                            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white focus:outline-none focus:border-primary"
                                                            placeholder="BPM"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Time Signature</label>
                                                        <DebouncedInput 
                                                            value={song.timeSig || ''}
                                                            onChange={(value) => onUpdateLibrarySong(song.id, 'timeSig', value)}
                                                            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white focus:outline-none focus:border-primary"
                                                            placeholder="4/4"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Category</label>
                                                        <select
                                                            value={song.category || 'Slow Acoustic'}
                                                            onChange={(e) => onUpdateLibrarySong(song.id, 'category', e.target.value)}
                                                            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-slate-300 focus:outline-none focus:border-primary cursor-pointer font-semibold"
                                                        >
                                                            <option value="Slow Acoustic">Slow Acoustic</option>
                                                            <option value="Mid Level">Mid Level</option>
                                                            <option value="Fast Pace">Fast Pace</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Flow Notes</label>
                                                    <DebouncedTextarea 
                                                        value={song.notes || ''}
                                                        onChange={(value) => onUpdateLibrarySong(song.id, 'notes', value)}
                                                        className="w-full h-20 bg-slate-950 border border-slate-800 rounded p-2 text-sm text-slate-300 focus:outline-none focus:border-primary resize-none custom-scrollbar"
                                                        placeholder="Flow notes..."
                                                    />
                                                </div>

                                                <div className="flex gap-2 pt-2">
                                                    <button
                                                        onClick={() => handleAddToSetlistClick(song)}
                                                        disabled={hasBeenAdded}
                                                        className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                                                            hasBeenAdded 
                                                                ? 'bg-green-600 text-white border border-green-500' 
                                                                : 'bg-primary hover:bg-primary/95 text-black hover:scale-[1.02]'
                                                        }`}
                                                    >
                                                        {hasBeenAdded ? (
                                                            <>
                                                                <Check size={16} /> Added!
                                                            </>
                                                        ) : (
                                                            'Add to Setlist'
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => onDeleteLibrarySong(song.id)}
                                                        className="p-2 border border-red-500/30 hover:border-red-500 hover:bg-red-500/10 text-red-400 rounded-lg transition-all"
                                                        title="Delete from Library"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            // Read-only View for Other Roles
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-2 gap-4 text-sm font-mono text-slate-400">
                                                    <div>
                                                        <div className="text-[10px] text-slate-600 uppercase font-bold mb-0.5">Key</div>
                                                        <div className="text-white text-base">{song.key || <span className="text-slate-700 italic">None</span>}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] text-slate-600 uppercase font-bold mb-0.5">Tempo</div>
                                                        <div className="text-white text-base">{song.tempo ? `${song.tempo} BPM` : <span className="text-slate-700 italic">None</span>}</div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-sm font-mono text-slate-400">
                                                    <div>
                                                        <div className="text-[10px] text-slate-600 uppercase font-bold mb-0.5">Time Signature</div>
                                                        <div className="text-white text-base">{song.timeSig || <span className="text-slate-700 italic">None</span>}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] text-slate-600 uppercase font-bold mb-0.5">Category</div>
                                                        <div>
                                                            {song.category ? (
                                                                <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded border ${
                                                                    song.category === 'Slow Acoustic'
                                                                        ? 'border-blue-500/30 text-blue-400 bg-blue-500/10'
                                                                        : song.category === 'Mid Level'
                                                                        ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10'
                                                                        : 'border-red-500/30 text-red-400 bg-red-500/10'
                                                                }`}>
                                                                    {song.category}
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-700 italic">None</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {song.notes && (
                                                    <div className="pt-2 border-t border-slate-900">
                                                        <div className="text-[10px] text-slate-600 uppercase font-bold mb-1">Flow Notes</div>
                                                        <div className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed font-sans">
                                                            {song.notes}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {library.length === 0 && !libraryLoading && (
                        <div className="py-16 text-center text-slate-600 flex flex-col items-center justify-center gap-3 border border-dashed border-slate-900 rounded-2xl">
                            <Music className="w-8 h-8 opacity-40" />
                            <p className="text-sm">
                                {searchQuery ? 'No matching songs found' : 'The Library is empty'}
                            </p>
                        </div>
                    )}

                    {libraryLoading && (
                        <div className="py-4 text-center text-primary/80 font-bold flex items-center justify-center gap-2 animate-pulse text-sm">
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <span>Loading songs...</span>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default SongLibrary;
