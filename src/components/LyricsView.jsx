import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, ChevronUp, ChevronDown, ZoomIn, ZoomOut, Mic } from 'lucide-react';

const LyricsView = ({ song, onClose }) => {
    const [fontSize, setFontSize] = useState(28);
    const [isAutoScrolling, setIsAutoScrolling] = useState(false);
    const [scrollSpeed, setScrollSpeed] = useState(30); // pixels per second
    const scrollRef = useRef(null);
    const animationRef = useRef(null);

    // Auto-scroll logic
    useEffect(() => {
        if (isAutoScrolling && scrollRef.current) {
            let lastTime = performance.now();

            const scroll = (currentTime) => {
                const deltaTime = (currentTime - lastTime) / 1000;
                lastTime = currentTime;

                if (scrollRef.current) {
                    scrollRef.current.scrollTop += scrollSpeed * deltaTime;

                    // Stop at bottom
                    if (scrollRef.current.scrollTop >= scrollRef.current.scrollHeight - scrollRef.current.clientHeight) {
                        setIsAutoScrolling(false);
                        return;
                    }
                }

                animationRef.current = requestAnimationFrame(scroll);
            };

            animationRef.current = requestAnimationFrame(scroll);
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isAutoScrolling, scrollSpeed]);

    // Parse and render lyrics with chord highlighting
    const renderLyrics = (text) => {
        if (!text) return <span className="opacity-50 italic">No lyrics available</span>;

        // Split by chord pattern [Am], [G], etc.
        const parts = text.split(/(\[[^\]]+\])/g);

        return parts.map((part, i) => {
            // Chord notation: [Am], [G7], etc.
            if (part.startsWith('[') && part.endsWith(']')) {
                const chord = part.slice(1, -1);
                return (
                    <span
                        key={i}
                        className="inline-block text-primary font-bold font-mono mx-1 align-super text-[0.7em] bg-primary/20 px-1.5 py-0.5 rounded border border-primary/30"
                    >
                        {chord}
                    </span>
                );
            }

            // Check for tags like |DROP|, |SOLO|
            const tagParts = part.split(/(\|[^|]+\|)/g);
            return tagParts.map((tagPart, j) => {
                if (tagPart.startsWith('|') && tagPart.endsWith('|')) {
                    const tag = tagPart.slice(1, -1);
                    return (
                        <span
                            key={`${i}-${j}`}
                            className="inline-block mx-2 px-3 py-1 bg-secondary text-black font-extrabold text-[0.6em] uppercase tracking-wider rounded-full animate-pulse"
                        >
                            {tag}
                        </span>
                    );
                }
                return <span key={`${i}-${j}`}>{tagPart}</span>;
            });
        });
    };

    const scrollToTop = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    };

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <Mic className="text-primary" size={24} />
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-white">{song.title}</h1>
                        <div className="flex gap-3 text-sm text-slate-400">
                            {song.key && <span>Key: <span className="text-primary font-bold">{song.key}</span></span>}
                            {song.tempo && <span>BPM: <span className="text-secondary font-bold">{song.tempo}</span></span>}
                            {song.timeSig && <span>Time: <span className="font-bold">{song.timeSig}</span></span>}
                        </div>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white font-bold transition-colors"
                >
                    Close
                </button>
            </div>

            {/* Lyrics Content */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 md:p-12"
                style={{ scrollBehavior: 'auto' }}
            >
                <div
                    className="max-w-4xl mx-auto whitespace-pre-wrap leading-relaxed text-white"
                    style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
                >
                    {renderLyrics(song.notes)}
                </div>
            </div>

            {/* Controls Footer */}
            <div className="border-t border-slate-800 bg-slate-900/80 backdrop-blur-sm p-4">
                <div className="max-w-4xl mx-auto flex flex-wrap justify-between items-center gap-4">
                    {/* Font Size Controls */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 uppercase font-bold">Size</span>
                        <button
                            onClick={() => setFontSize(Math.max(16, fontSize - 4))}
                            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <ZoomOut size={18} />
                        </button>
                        <span className="text-lg font-mono text-white w-10 text-center">{fontSize}</span>
                        <button
                            onClick={() => setFontSize(Math.min(64, fontSize + 4))}
                            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <ZoomIn size={18} />
                        </button>
                    </div>

                    {/* Auto-Scroll Controls */}
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 uppercase font-bold">Auto-Scroll</span>

                        <button
                            onClick={() => setScrollSpeed(Math.max(10, scrollSpeed - 10))}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-sm font-bold"
                        >
                            -
                        </button>
                        <span className="text-sm font-mono text-slate-300 w-8 text-center">{scrollSpeed}</span>
                        <button
                            onClick={() => setScrollSpeed(Math.min(100, scrollSpeed + 10))}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-sm font-bold"
                        >
                            +
                        </button>

                        <button
                            onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                            className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${isAutoScrolling
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-green-500 hover:bg-green-600 text-white'
                                }`}
                        >
                            {isAutoScrolling ? <Pause size={18} /> : <Play size={18} />}
                            {isAutoScrolling ? 'Stop' : 'Start'}
                        </button>
                    </div>

                    {/* Quick Navigation */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={scrollToTop}
                            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                            title="Scroll to Top"
                        >
                            <ChevronUp size={18} />
                        </button>
                        <button
                            onClick={scrollToBottom}
                            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                            title="Scroll to Bottom"
                        >
                            <ChevronDown size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LyricsView;
