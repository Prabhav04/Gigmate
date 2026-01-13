import React, { useState } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { GripVertical, Play, Circle, Plus, Trash2, FileText } from 'lucide-react';

// Separate component for sortable item to use drag controls hook
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
                <div
                    className="pt-2 md:pt-3 text-slate-600 cursor-grab active:cursor-grabbing hover:text-slate-400 touch-none shrink-0"
                    onPointerDown={(e) => dragControls.start(e)}
                    title="Drag to reorder"
                >
                    <GripVertical size={16} className="md:w-5 md:h-5" />
                </div>
                <div className="pt-1.5 md:pt-2 text-slate-500 font-mono text-base md:text-lg font-bold shrink-0">#{index + 1}</div>

                <div className="flex-1 space-y-2 md:space-y-3 min-w-0">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={song.title}
                            onChange={(e) => onUpdateSong(song.id, 'title', e.target.value)}
                            placeholder="Song Title"
                            className="flex-1 bg-transparent border-b border-slate-700 focus:border-primary focus:outline-none text-xl md:text-2xl font-bold text-white pb-1 placeholder:text-slate-700 w-full min-w-0"
                        />
                    </div>

                    <div className="flex gap-1.5 md:gap-2 text-[10px] md:text-sm">
                        <input
                            type="text"
                            value={song.key || ''}
                            onChange={(e) => onUpdateSong(song.id, 'key', e.target.value)}
                            placeholder="Key"
                            className="w-10 sm:w-16 md:w-20 bg-slate-900/50 border border-slate-700 rounded px-1.5 py-1 md:px-2 md:py-1 text-slate-300 focus:border-primary focus:outline-none"
                        />
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

                    {/* Performance Cues Selection */}
                    <div className="flex flex-wrap gap-1.5 md:gap-2 py-1">
                        {['Acoustic Switch', 'Drop', 'Solo', 'Jam', 'Speech'].map(cue => (
                            <button
                                key={cue}
                                onClick={() => {
                                    const currentCues = song.cues || [];
                                    const newCues = currentCues.includes(cue)
                                        ? currentCues.filter(c => c !== cue)
                                        : [...currentCues, cue];
                                    onUpdateSong(song.id, 'cues', newCues);
                                }}
                                className={`px-1.5 py-0.5 md:px-2 md:py-1 rounded text-[10px] md:text-xs font-bold border transition-all ${(song.cues || []).includes(cue)
                                    ? 'bg-secondary text-black border-secondary'
                                    : 'bg-transparent text-slate-500 border-slate-700 hover:border-slate-500'
                                    }`}
                            >
                                {cue}
                            </button>
                        ))}
                    </div>

                    <textarea
                        value={song.notes}
                        onChange={(e) => onUpdateSong(song.id, 'notes', e.target.value)}
                        placeholder="Specific notes..."
                        className="w-full bg-slate-900/50 rounded p-1.5 md:p-2 text-slate-300 min-h-[60px] md:min-h-[80px] focus:outline-none focus:ring-1 focus:ring-primary text-sm md:text-lg resize-y custom-scrollbar"
                    />
                </div>

                <div className="flex flex-col gap-1.5 md:gap-2 pt-1 shrink-0">
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

const MasterBoard = ({ notes, onUpdate, songs, onAddSong, onUpdateSong, onDeleteSong, onReorderSongs, onToggleActive, isSaving, onImportSongs }) => {
    const [showImport, setShowImport] = useState(false);
    const [importText, setImportText] = useState('');

    const handleImport = () => {
        if (!importText.trim()) return;

        // Simple parser: Assume each line is a song "Title" or "1. Title Key"
        const lines = importText.split('\n').filter(l => l.trim());
        const newSongs = lines.map((line) => {
            // Remove leading numbering like "1. "
            const cleanLine = line.replace(/^\d+\.\s*/, '').trim();
            // Try to extract Key if present at end? For now simple title.
            // Actually, let's keep it simple: Title is the line.
            return {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                title: cleanLine,
                key: '',
                tempo: '',
                timeSig: '',
                notes: '',
                cues: [],
                isActive: false
            };
        });

        if (onImportSongs) onImportSongs(newSongs);
        setShowImport(false);
        setImportText('');
    };

    const loadPreset = (presetSongs) => {
        // Generate new IDs to avoid conflicts if imported multiple times
        const newSongs = presetSongs.map(s => ({ ...s, id: Date.now().toString() + Math.random().toString(36).substr(2, 9) }));
        if (onImportSongs) onImportSongs(newSongs);
    };

    return (
        <div className="flex flex-col h-full gap-4">
            {/* General Info Section */}
            <div className="bg-surface border border-glass-border rounded-xl p-4 flex flex-col h-1/4 min-h-[150px]">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-bold text-slate-400">General Info / Announcements</h2>
                    <div className={`flex items-center gap-2 text-green-400 text-xs font-mono transition-opacity duration-300 ${isSaving ? 'opacity-100' : 'opacity-50'}`}>
                        {isSaving ? "SAVING..." : "SAVED"}
                    </div>
                </div>
                <textarea
                    value={notes}
                    onChange={(e) => onUpdate(e.target.value)}
                    placeholder="General announcements..."
                    className="flex-1 w-full bg-black border border-slate-800 rounded-lg p-3 text-lg text-slate-300 focus:outline-none focus:border-primary transition-colors resize-none font-sans"
                />
            </div>

            {/* Setlist Builder Section */}
            <div className="flex-1 bg-surface border border-glass-border rounded-xl p-4 flex flex-col overflow-hidden relative">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-primary">Setlist</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowImport(!showImport)}
                            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-lg transition-colors text-sm"
                        >
                            <FileText size={18} /> Import
                        </button>
                        <button
                            onClick={onAddSong}
                            className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-background font-bold px-4 py-2 rounded-lg transition-colors text-sm"
                        >
                            <Plus size={18} /> Add Song
                        </button>
                    </div>
                </div>

                {/* Import Overlay */}
                {showImport && (
                    <div className="absolute inset-0 z-20 bg-surface/95 backdrop-blur-md p-6 flex flex-col animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">Import Songs</h3>
                            <button onClick={() => setShowImport(false)} className="text-slate-400 hover:text-white">Close</button>
                        </div>

                        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                            <button
                                onClick={() => {
                                    import('../constants/presets').then(({ ROCK_SETLIST_PRESET }) => {
                                        loadPreset(ROCK_SETLIST_PRESET);
                                        setShowImport(false);
                                    });
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-bold text-sm whitespace-nowrap hover:scale-105 transition-transform"
                            >
                                Load "Rock Setlist" Preset
                            </button>
                            <button
                                onClick={() => {
                                    import('../constants/presets').then(({ ATTAM_SETLIST_PRESET }) => {
                                        loadPreset(ATTAM_SETLIST_PRESET);
                                        setShowImport(false);
                                    });
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg text-white font-bold text-sm whitespace-nowrap hover:scale-105 transition-transform"
                            >
                                Load "Attam Setlist" Preset
                            </button>
                            {/* Add more presets here if needed */}
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

                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    {songs && songs.length > 0 ? (
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
                    ) : (
                        <div className="text-center text-slate-600 py-10 border-2 border-dashed border-slate-800 rounded-lg">
                            No songs yet. Click "Add Song" to start.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MasterBoard;
