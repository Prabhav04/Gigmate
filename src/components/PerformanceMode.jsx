import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Edit3, Music } from 'lucide-react';

const PerformanceMode = ({ songs, songPersonalNotes, masterNotes, role, onExit }) => {
    const activeSongIndex = songs.findIndex(s => s.isActive);
    const [currentIndex, setCurrentIndex] = useState(activeSongIndex >= 0 ? activeSongIndex : 0);
    const [singerTab, setSingerTab] = useState('lyrics');

    const currentSong = songs[currentIndex];
    const isCurrentSongLive = currentSong?.isActive;

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'Escape') {
                onExit();
            } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                goNext();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                goPrevious();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [currentIndex, songs.length]);

    // Auto-focus on active song when it changes
    useEffect(() => {
        if (activeSongIndex >= 0 && activeSongIndex !== currentIndex) {
            setCurrentIndex(activeSongIndex);
        }
    }, [activeSongIndex]);

    const goNext = () => {
        if (currentIndex < songs.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const goPrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    // Render text with tags |DROP| and chords [Am]
    const renderWithTags = (text) => {
        if (!text) return <span className="opacity-30 italic">No notes available</span>;

        const parts = text.split(/(\\|[^|]+\\||\\[[^\\]]+\\])/g);

        return parts.map((part, i) => {
            // Tag Logic: |DROP|
            if (part.startsWith('|') && part.endsWith('|')) {
                const content = part.slice(1, -1);
                return (
                    <span
                        key={i}
                        className="mx-2 inline-block px-4 py-2 rounded-lg bg-secondary text-black font-extrabold text-2xl md:text-3xl tracking-wider shadow-[0_0_20px_rgba(34,211,238,0.6)] border-2 border-white/30 animate-pulse"
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
                        className="inline-block text-primary font-bold font-mono text-3xl md:text-4xl mx-2 px-3 py-1 bg-primary/20 rounded-lg border border-primary/40 shadow-[0_0_12px_rgba(167,139,250,0.4)]"
                    >
                        {chord}
                    </span>
                );
            }

            return <span key={i}>{part}</span>;
        });
    };

    if (!currentSong) {
        return (
            <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
                <div className="text-center">
                    <Music size={64} className="text-slate-600 mx-auto mb-4" />
                    <p className="text-2xl text-slate-500">No songs in setlist</p>
                    <button
                        onClick={onExit}
                        className="mt-6 px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/80"
                    >
                        Exit Performance View
                    </button>
                </div>
            </div>
        );
    }

    const myPersonalNote = songPersonalNotes?.[currentSong.id] || '';

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col text-white overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-4 md:p-6 border-b border-slate-800 bg-slate-900/30 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <div className="text-sm md:text-base text-slate-400 font-mono">
                        Song {currentIndex + 1} of {songs.length}
                    </div>
                    {isCurrentSongLive && (
                        <div className="flex items-center gap-2 bg-red-500/20 border border-red-500 px-4 py-2 rounded-lg animate-pulse">
                            <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]"></div>
                            <span className="text-red-400 font-bold text-sm md:text-base">NOW PLAYING</span>
                        </div>
                    )}
                </div>
                <button
                    onClick={onExit}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors font-bold"
                    title="Exit to Edit Mode (ESC)"
                >
                    <Edit3 size={18} />
                    <span className="hidden md:inline">Edit Mode</span>
                </button>
            </div>

            {/* Main Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
                <div className="max-w-8xl mx-auto space-y-8 md:space-y-12">
                    {/* Song Title & Metadata */}
                    <div className="text-center">
                        <h1 className={`text-5xl md:text-7xl lg:text-8xl font-bold mb-6 md:mb-8 transition-all ${isCurrentSongLive
                            ? 'bg-secondary bg-clip-text text-transparent scale-105'
                            : 'bg-secondary bg-clip-text text-transparent'
                            }`}>
                            {currentSong.title}
                        </h1>

                        {/* Song Details */}
                        <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
                            {currentSong.key && (
                                <div className={`rounded-xl px-6 md:px-10 py-4 md:py-6 border-2 ${isCurrentSongLive
                                    ? 'bg-primary/20 border-primary shadow-[0_0_30px_rgba(167,139,250,0.4)]'
                                    : 'bg-slate-900 border-slate-700'
                                    }`}>
                                    <div className="text-xs md:text-sm text-slate-400 uppercase font-bold mb-2">Key</div>
                                    <div className="text-3xl md:text-5xl font-bold text-primary font-mono">{currentSong.key}</div>
                                </div>
                            )}
                            {currentSong.tempo && (
                                <div className={`rounded-xl px-6 md:px-10 py-4 md:py-6 border-2 ${isCurrentSongLive
                                    ? 'bg-secondary/20 border-secondary shadow-[0_0_30px_rgba(34,211,238,0.4)]'
                                    : 'bg-slate-900 border-slate-700'
                                    }`}>
                                    <div className="text-xs md:text-sm text-slate-400 uppercase font-bold mb-2">Tempo</div>
                                    <div className="text-3xl md:text-5xl font-bold text-secondary">{currentSong.tempo} BPM</div>
                                </div>
                            )}
                            {currentSong.timeSig && (
                                <div className={`rounded-xl px-6 md:px-10 py-4 md:py-6 border-2 ${isCurrentSongLive
                                    ? 'bg-white/10 border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.2)]'
                                    : 'bg-slate-900 border-slate-700'
                                    }`}>
                                    <div className="text-xs md:text-sm text-slate-400 uppercase font-bold mb-2">Time</div>
                                    <div className="text-3xl md:text-5xl font-bold text-white">{currentSong.timeSig}</div>
                                </div>
                            )}
                        </div>

                        {/* Performance Cues */}
                        {currentSong.cues && currentSong.cues.length > 0 && (
                            <div className="flex flex-wrap gap-3 md:gap-4 justify-center mt-6 md:mt-8">
                                {currentSong.cues.map((cue, idx) => (
                                    <span
                                        key={idx}
                                        className="px-5 md:px-8 py-3 md:py-4 bg-secondary text-black font-extrabold rounded-xl text-lg md:text-2xl uppercase tracking-wider shadow-lg"
                                    >
                                        {cue}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Notes Section - Different Layout Depending on Role */}
                    {role === 'singer' ? (
                        <div className={`rounded-2xl p-6 md:p-10 border-2 ${isCurrentSongLive
                            ? 'bg-slate-900/60 border-primary/40 shadow-[0_0_40px_rgba(167,139,250,0.2)]'
                            : 'bg-slate-900/40 border-slate-700'
                            }`}>

                            {/* Singer Tabs */}
                            <div className="flex gap-4 mb-6 md:mb-8 border-b border-slate-800 pb-4">
                                <button
                                    onClick={() => setSingerTab('lyrics')}
                                    className={`text-lg md:text-xl font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors ${singerTab === 'lyrics' ? 'bg-secondary/20 text-secondary border border-secondary/50' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Lyrics
                                </button>
                                <button
                                    onClick={() => setSingerTab('flow')}
                                    className={`text-lg md:text-xl font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${singerTab === 'flow' ? 'bg-primary/20 text-primary border border-primary/50' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    <Music size={20} /> Flow of Song
                                </button>
                            </div>

                            {/* Content based on tab */}
                            {singerTab === 'lyrics' ? (
                                myPersonalNote ? (
                                    <div className="text-2xl md:text-4xl leading-relaxed whitespace-pre-wrap text-secondary/90">
                                        {myPersonalNote}
                                    </div>
                                ) : (
                                    <div className="text-xl md:text-2xl text-slate-600 italic">
                                        No lyrics for this song. Exit to edit mode to add lyrics.
                                    </div>
                                )
                            ) : (
                                currentSong.notes ? (
                                    <div className="text-2xl md:text-4xl leading-relaxed whitespace-pre-wrap text-white/90">
                                        {renderWithTags(currentSong.notes)}
                                    </div>
                                ) : (
                                    <div className="text-xl md:text-2xl text-slate-600 italic">
                                        No flow notes available.
                                    </div>
                                )
                            )}
                        </div>
                    ) : role === 'keyboard' ? (
                        <div className={`rounded-2xl p-6 md:p-10 border-2 ${isCurrentSongLive
                            ? 'bg-slate-900/60 border-primary/40 shadow-[0_0_40px_rgba(167,139,250,0.2)]'
                            : 'bg-slate-900/40 border-slate-700'
                            }`}>
                            <h3 className="text-sm md:text-base uppercase tracking-widest text-primary font-bold mb-4 md:mb-6 flex items-center gap-2">
                                <Music size={20} />
                                Master Notes
                            </h3>
                            <div className="text-2xl md:text-4xl leading-relaxed whitespace-pre-wrap text-white/90">
                                {renderWithTags(currentSong.notes)}
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Master Notes Section */}
                            {currentSong.notes && (
                                <div className={`rounded-2xl p-6 md:p-10 border-2 ${isCurrentSongLive
                                    ? 'bg-slate-900/60 border-primary/40 shadow-[0_0_40px_rgba(167,139,250,0.2)]'
                                    : 'bg-slate-900/40 border-slate-700'
                                    }`}>
                                    <h3 className="text-sm md:text-base uppercase tracking-widest text-primary font-bold mb-4 md:mb-6 flex items-center gap-2">
                                        <Music size={20} />
                                        Master Notes (Leader)
                                    </h3>
                                    <div className="text-2xl md:text-4xl leading-relaxed whitespace-pre-wrap text-white/90">
                                        {renderWithTags(currentSong.notes)}
                                    </div>
                                </div>
                            )}

                            {/* Personal Notes Section */}
                            <div className={`rounded-2xl p-6 md:p-10 border-2 ${isCurrentSongLive
                                ? 'bg-slate-900/60 border-secondary/40 shadow-[0_0_40px_rgba(34,211,238,0.2)]'
                                : 'bg-slate-900/40 border-slate-700'
                                }`}>
                                <h3 className="text-sm md:text-base uppercase tracking-widest text-secondary font-bold mb-4 md:mb-6">
                                    My Notes ({role})
                                </h3>
                                {myPersonalNote ? (
                                    <div className="text-2xl md:text-4xl leading-relaxed whitespace-pre-wrap text-secondary/90">
                                        {myPersonalNote}
                                    </div>
                                ) : (
                                    <div className="text-xl md:text-2xl text-slate-600 italic">
                                        No personal notes for this song. Exit to edit mode to add notes.
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Up Next Preview */}
                    {songs[currentIndex + 1] && (
                        <div className="text-center pt-6 md:pt-8 border-t border-slate-800">
                            <div className="text-xs md:text-sm text-slate-500 uppercase font-bold mb-3">Up Next</div>
                            <div className="text-2xl md:text-4xl text-slate-300 font-bold">{songs[currentIndex + 1].title}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Footer */}
            <div className="border-t border-slate-800 p-4 md:p-6 flex justify-between items-center bg-slate-900/30 backdrop-blur-sm">
                <button
                    onClick={goPrevious}
                    disabled={currentIndex === 0}
                    className="flex items-center gap-2 px-4 md:px-8 py-3 md:py-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg font-bold transition-colors text-sm md:text-lg"
                >
                    <ChevronLeft size={24} />
                    <span className="hidden md:inline">Previous</span>
                </button>

                <div className="text-xs md:text-sm text-slate-500 font-mono text-center">
                    Use arrow keys to navigate • ESC to exit
                </div>

                <button
                    onClick={goNext}
                    disabled={currentIndex === songs.length - 1}
                    className="flex items-center gap-2 px-4 md:px-8 py-3 md:py-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg font-bold transition-colors text-sm md:text-lg"
                >
                    <span className="hidden md:inline">Next</span>
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>
    );
};

export default PerformanceMode;
