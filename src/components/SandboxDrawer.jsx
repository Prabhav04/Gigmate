import React, { useState } from 'react';
import { X, Search, Plus, Trash2, Lightbulb, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { DebouncedInput, DebouncedTextarea } from './DebouncedInputs';
import ConfirmDeleteModal from './ConfirmDeleteModal';

const SandboxDrawer = ({ 
    isOpen, 
    onClose, 
    role, 
    sandbox = [], 
    sandboxLoading = false,
    hasMoreSandbox = true,
    onFetchSandbox,
    songs = [],
    onAddSandboxSong, 
    onUpdateSandboxSong, 
    onDeleteSandboxSong, 
    onAddSongToSetlist
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedSongId, setExpandedSongId] = useState(null);
    const [addedSongsMap, setAddedSongsMap] = useState({});
    const [newlyAddedSandboxSongId, setNewlyAddedSandboxSongId] = useState(null);
    const [sandboxSongToDelete, setSandboxSongToDelete] = useState(null);
    const isFirstFieldRender = React.useRef(true);
    const listContainerRef = React.useRef(null);

    React.useEffect(() => {
        if (isOpen) {
            setSearchQuery('');
            if (onFetchSandbox) {
                onFetchSandbox('', false);
            }
            isFirstFieldRender.current = true;
        }
    }, [isOpen, onFetchSandbox]);

    React.useEffect(() => {
        if (!isOpen || !onFetchSandbox) return;
        
        if (isFirstFieldRender.current && searchQuery === '') {
            isFirstFieldRender.current = false;
            return;
        }
        
        const handler = setTimeout(() => {
            onFetchSandbox(searchQuery, false);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchQuery, isOpen, onFetchSandbox]);

    if (!isOpen) return null;

    const isKeyboard = role === 'keyboard';

    const handleAddClick = async () => {
        if (onAddSandboxSong) {
            const newId = await onAddSandboxSong();
            if (newId) {
                setNewlyAddedSandboxSongId(newId);
                setExpandedSongId(newId);
                setTimeout(() => {
                    if (listContainerRef.current) {
                        listContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                }, 100);
                setTimeout(() => {
                    setNewlyAddedSandboxSongId(null);
                }, 3000);
            }
        }
    };

    const handleAddToSetlistClick = (song) => {
        if (onAddSongToSetlist) {
            onAddSongToSetlist(song);
            
            setAddedSongsMap(prev => ({ ...prev, [song.id]: true }));
            setTimeout(() => {
                setAddedSongsMap(prev => ({ ...prev, [song.id]: false }));
            }, 1500);
        }
    };

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop - clientHeight < 50) {
            if (hasMoreSandbox && !sandboxLoading && onFetchSandbox) {
                onFetchSandbox(searchQuery, true);
            }
        }
    };

    const toggleAccordion = (songId) => {
        setExpandedSongId(expandedSongId === songId ? null : songId);
    };

    return (
        <>
            <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] animate-fade-in"
                onClick={onClose}
            />

            <div className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-slate-950/95 border-l border-slate-800 backdrop-blur-md shadow-2xl z-[100] flex flex-col animate-slide-in overflow-hidden">
                
                <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/30">
                    <div className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-amber-400" />
                        <h2 className="text-xl font-bold text-white">Sandbox</h2>
                        <span className="text-xs font-mono text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
                            {sandbox.length} ideas
                        </span>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1 text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-lg transition-all"
                        title="Close Sandbox"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 border-b border-slate-900 flex flex-col gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search ideas..."
                            className="w-full bg-slate-900/50 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30"
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
                            className="w-full py-2 bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-400 font-bold rounded-lg text-sm transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <Plus size={16} />
                            Add Idea to Sandbox
                        </button>
                    )}
                </div>

                <div 
                    ref={listContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-950/40"
                >
                    {sandbox.map((song) => {
                        const isExpanded = expandedSongId === song.id;
                        const hasBeenAdded = addedSongsMap[song.id];
                        const isInSetlist = songs.some(s => s.title && (s.title || '').toLowerCase().trim() === (song.title || '').toLowerCase().trim());

                        return (
                            <div 
                                key={song.id}
                                className={`rounded-xl border transition-all ${
                                    song.id === newlyAddedSandboxSongId
                                        ? 'animate-new-item-flash border-amber-400'
                                        : isInSetlist
                                        ? isExpanded
                                            ? 'bg-secondary/10 border-secondary/50 shadow-lg shadow-secondary/5'
                                            : 'bg-secondary/5 border-secondary/20 hover:bg-secondary/10 hover:border-secondary/30'
                                        : isExpanded 
                                        ? 'bg-slate-900/50 border-slate-700 shadow-lg' 
                                        : 'bg-slate-900/20 border-slate-900/60 hover:bg-slate-900/30 hover:border-slate-800'
                                }`}
                            >
                                <div 
                                    onClick={() => toggleAccordion(song.id)}
                                    className="p-3.5 flex justify-between items-center cursor-pointer select-none group"
                                >
                                    <div className="flex items-center gap-3 overflow-hidden pr-2">
                                        <span className={`font-mono text-sm font-semibold shrink-0 ${isInSetlist ? 'text-secondary animate-pulse-slow' : 'text-slate-600'}`}>
                                            {isInSetlist ? '✓' : '💡'}
                                        </span>
                                        <span className={`text-base font-bold truncate transition-colors ${
                                            isInSetlist 
                                                ? 'text-secondary/90 group-hover:text-secondary' 
                                                : 'text-white group-hover:text-amber-400'
                                        }`}>
                                            {song.title}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        {isExpanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="p-3.5 border-t border-slate-800/50 bg-black/20 space-y-4 rounded-b-xl">
                                        {isKeyboard ? (
                                            <div className="space-y-3">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Song Idea / Title</label>
                                                    <DebouncedInput 
                                                        value={song.title}
                                                        onChange={(value) => onUpdateSandboxSong(song.id, 'title', value)}
                                                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white focus:outline-none focus:border-amber-400"
                                                        placeholder="Idea Title"
                                                    />
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Notes</label>
                                                    <DebouncedTextarea 
                                                        value={song.notes || ''}
                                                        onChange={(value) => onUpdateSandboxSong(song.id, 'notes', value)}
                                                        className="w-full h-20 bg-slate-950 border border-slate-800 rounded p-2 text-sm text-slate-300 focus:outline-none focus:border-amber-400 resize-none custom-scrollbar"
                                                        placeholder="Why are we trying this out?..."
                                                    />
                                                </div>

                                                <div className="flex gap-2 pt-2">
                                                    <button
                                                        onClick={() => handleAddToSetlistClick(song)}
                                                        disabled={hasBeenAdded}
                                                        className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                                                            hasBeenAdded 
                                                                ? 'bg-green-600 text-white border border-green-500' 
                                                                : 'bg-amber-400 hover:bg-amber-500 text-black hover:scale-[1.02]'
                                                        }`}
                                                    >
                                                        {hasBeenAdded ? (
                                                            <>
                                                                <Check size={16} /> Added!
                                                            </>
                                                        ) : (
                                                            'Move to Setlist'
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => setSandboxSongToDelete(song)}
                                                        className="p-2 border border-red-500/30 hover:border-red-500 hover:bg-red-500/10 text-red-400 rounded-lg transition-all"
                                                        title="Delete from Sandbox"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {song.notes && (
                                                    <div>
                                                        <div className="text-[10px] text-slate-600 uppercase font-bold mb-1">Notes</div>
                                                        <div className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed font-sans">
                                                            {song.notes}
                                                        </div>
                                                    </div>
                                                )}
                                                {!song.notes && (
                                                    <div className="text-slate-500 italic text-sm">No notes provided.</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {sandbox.length === 0 && !sandboxLoading && (
                        <div className="py-16 text-center text-slate-600 flex flex-col items-center justify-center gap-3 border border-dashed border-slate-900 rounded-2xl">
                            <Lightbulb className="w-8 h-8 opacity-40" />
                            <p className="text-sm">
                                {searchQuery ? 'No ideas found matching search' : 'The Sandbox is empty'}
                            </p>
                        </div>
                    )}

                    {sandboxLoading && (
                        <div className="py-4 text-center text-amber-400/80 font-bold flex items-center justify-center gap-2 animate-pulse text-sm">
                            <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                            <span>Loading ideas...</span>
                        </div>
                    )}
                </div>
            </div>

            {sandboxSongToDelete && (
                <ConfirmDeleteModal
                    title="Delete Sandbox Idea?"
                    itemName={sandboxSongToDelete.title || 'this idea'}
                    onClose={() => setSandboxSongToDelete(null)}
                    onConfirm={() => {
                        onDeleteSandboxSong(sandboxSongToDelete.id);
                        setSandboxSongToDelete(null);
                    }}
                />
            )}
        </>
    );
};

export default SandboxDrawer;
