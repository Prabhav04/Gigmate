import { Reorder, useDragControls } from 'framer-motion';

// Separate component for sortable item to use drag controls hook
const SortableSongItem = ({ song, index, onUpdateSong, onToggleActive, onDeleteSong }) => {
    const dragControls = useDragControls();

    return (
        <Reorder.Item
            value={song}
            dragListener={false}
            dragControls={dragControls}
            className={`p-4 rounded-lg border transition-all ${song.isActive ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(167,139,250,0.1)]' : 'bg-black border-slate-800'}`}
        >
            <div className="flex items-start gap-4">
                <div
                    className="pt-3 text-slate-600 cursor-grab active:cursor-grabbing hover:text-slate-400 touch-none"
                    onPointerDown={(e) => dragControls.start(e)}
                    title="Drag to reorder"
                >
                    <GripVertical size={20} />
                </div>
                <div className="pt-2 text-slate-500 font-mono text-lg font-bold">#{index + 1}</div>

                <div className="flex-1 space-y-3">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={song.title}
                            onChange={(e) => onUpdateSong(song.id, 'title', e.target.value)}
                            placeholder="Song Title"
                            className="flex-1 bg-transparent border-b border-slate-700 focus:border-primary focus:outline-none text-2xl font-bold text-white pb-1 placeholder:text-slate-700 w-full min-w-0" // w-full for mobile
                        />
                    </div>

                    <div className="flex gap-2 text-sm">
                        <input
                            type="text"
                            value={song.key || ''}
                            onChange={(e) => onUpdateSong(song.id, 'key', e.target.value)}
                            placeholder="Key"
                            className="w-16 sm:w-20 bg-slate-900/50 border border-slate-700 rounded px-2 py-1 text-slate-300 focus:border-primary focus:outline-none"
                        />
                        <input
                            type="text"
                            value={song.tempo || ''}
                            onChange={(e) => onUpdateSong(song.id, 'tempo', e.target.value)}
                            placeholder="BPM"
                            className="w-16 sm:w-20 bg-slate-900/50 border border-slate-700 rounded px-2 py-1 text-slate-300 focus:border-primary focus:outline-none"
                        />
                        <input
                            type="text"
                            value={song.timeSig || ''}
                            onChange={(e) => onUpdateSong(song.id, 'timeSig', e.target.value)}
                            placeholder="Sig"
                            className="w-16 sm:w-20 bg-slate-900/50 border border-slate-700 rounded px-2 py-1 text-slate-300 focus:border-primary focus:outline-none"
                        />
                    </div>

                    {/* Performance Cues Selection */}
                    <div className="flex flex-wrap gap-2 py-1">
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
                                className={`px-2 py-1 rounded text-xs font-bold border transition-all ${(song.cues || []).includes(cue)
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
                        className="w-full bg-slate-900/50 rounded p-2 text-slate-300 min-h-[80px] focus:outline-none focus:ring-1 focus:ring-primary text-lg resize-y custom-scrollbar"
                    />
                </div>

                <div className="flex flex-col gap-2 pt-1">
                    <button
                        onClick={() => onToggleActive(song.id)}
                        className={`p-3 rounded-full transition-colors ${song.isActive ? 'bg-primary text-black shadow-[0_0_10px_rgba(167,139,250,0.4)]' : 'text-slate-500 hover:text-primary bg-slate-900 border border-slate-700'}`}
                    >
                        {song.isActive ? <Play size={24} fill="currentColor" /> : <Circle size={24} />}
                    </button>
                    <button
                        onClick={() => onDeleteSong(song.id)}
                        className="p-3 text-slate-600 hover:text-red-500 transition-colors"
                    >
                        <Trash2 size={24} />
                    </button>
                </div>
            </div>
        </Reorder.Item>
    );
};

const MasterBoard = ({ notes, onUpdate, songs, onAddSong, onUpdateSong, onDeleteSong, onReorderSongs, onToggleActive, isSaving }) => {
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
            <div className="flex-1 bg-surface border border-glass-border rounded-xl p-4 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-primary">Setlist</h2>
                    <button
                        onClick={onAddSong}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-background font-bold px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                        <Plus size={18} /> Add Song
                    </button>
                </div>

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
