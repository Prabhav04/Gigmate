import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Activity } from 'lucide-react';

const Metronome = ({ suggestedBPM = 120, suggestedTimeSig = '4/4' }) => {
    const [bpm, setBpm] = useState(suggestedBPM);
    const [timeSig, setTimeSig] = useState(suggestedTimeSig);
    const [isPlaying, setIsPlaying] = useState(false);
    const [beat, setBeat] = useState(0);
    const [tapTimes, setTapTimes] = useState([]);

    const audioContextRef = useRef(null);
    const intervalRef = useRef(null);

    // Parse time signature (e.g., "4/4", "3/4", "6/8", "5/4")
    const parseTimeSig = (sig) => {
        if (!sig || typeof sig !== 'string') return 4;
        const parts = sig.split('/');
        const beatsPerMeasure = parseInt(parts[0]);
        return isNaN(beatsPerMeasure) || beatsPerMeasure < 1 ? 4 : beatsPerMeasure;
    };

    const beatsPerMeasure = parseTimeSig(timeSig);

    // Initialize Web Audio API
    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    // Play click sound
    const playClick = (isAccent = false) => {
        const ctx = audioContextRef.current;
        if (!ctx) return;

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = isAccent ? 1000 : 800;
        gainNode.gain.value = isAccent ? 0.3 : 0.2;

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.05);
    };

    // Metronome logic
    useEffect(() => {
        if (isPlaying) {
            const interval = (60 / bpm) * 1000;
            let currentBeat = 0;

            intervalRef.current = setInterval(() => {
                playClick(currentBeat === 0);
                setBeat(currentBeat);
                currentBeat = (currentBeat + 1) % beatsPerMeasure;
            }, interval);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            setBeat(0);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isPlaying, bpm, beatsPerMeasure]);

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const handleTap = () => {
        const now = Date.now();
        const newTapTimes = [...tapTimes, now].slice(-4); // Keep last 4 taps
        setTapTimes(newTapTimes);

        if (newTapTimes.length >= 2) {
            const intervals = [];
            for (let i = 1; i < newTapTimes.length; i++) {
                intervals.push(newTapTimes[i] - newTapTimes[i - 1]);
            }
            const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            const calculatedBPM = Math.round(60000 / avgInterval);

            if (calculatedBPM >= 40 && calculatedBPM <= 240) {
                setBpm(calculatedBPM);
            }
        }

        // Reset tap times after 2 seconds of inactivity
        setTimeout(() => {
            setTapTimes(prev => prev.filter(t => Date.now() - t < 2000));
        }, 2000);
    };

    // Auto-sync with active song's tempo and time signature
    useEffect(() => {
        if (suggestedBPM && suggestedBPM !== bpm) {
            setBpm(suggestedBPM);
        }
    }, [suggestedBPM]);

    useEffect(() => {
        if (suggestedTimeSig && suggestedTimeSig !== timeSig) {
            setTimeSig(suggestedTimeSig);
            // Reset beat when time signature changes
            setBeat(0);
        }
    }, [suggestedTimeSig]);

    return (
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 md:p-4 flex flex-col md:flex-row items-center gap-3 md:gap-4">
            {/* BPM Display */}
            <div className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">BPM</div>
                    <input
                        type="number"
                        value={bpm}
                        onChange={(e) => setBpm(Math.max(40, Math.min(240, parseInt(e.target.value) || 120)))}
                        className="w-16 md:w-20 bg-black border border-slate-700 rounded px-2 py-1 text-center text-xl md:text-2xl font-bold text-white focus:outline-none focus:border-primary"
                        min="40"
                        max="240"
                    />
                </div>

                <div className="flex flex-col items-center">
                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">Time</div>
                    <input
                        type="text"
                        value={timeSig}
                        onChange={(e) => setTimeSig(e.target.value)}
                        placeholder="4/4"
                        className="w-12 md:w-16 bg-black border border-slate-700 rounded px-2 py-1 text-center text-lg md:text-xl font-bold text-white focus:outline-none focus:border-primary"
                    />
                </div>

                {/* Beat Indicator */}
                <div className="flex gap-1.5">
                    {Array.from({ length: Math.min(beatsPerMeasure, 8) }).map((_, i) => (
                        <div
                            key={i}
                            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${isPlaying && beat === i
                                    ? i === 0
                                        ? 'bg-primary scale-150 shadow-lg shadow-primary/50'
                                        : 'bg-secondary scale-150 shadow-lg shadow-secondary/50'
                                    : 'bg-slate-700'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
                <button
                    onClick={togglePlay}
                    className={`p-2 md:p-3 rounded-lg font-bold transition-all ${isPlaying
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-primary hover:bg-primary/80 text-black'
                        }`}
                    title={isPlaying ? 'Stop' : 'Play'}
                >
                    {isPlaying ? <Pause size={18} className="md:w-5 md:h-5" /> : <Play size={18} className="md:w-5 md:h-5" />}
                </button>

                <button
                    onClick={handleTap}
                    className="px-3 md:px-4 py-2 md:py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-white font-bold text-sm md:text-base transition-all hover:scale-105 flex items-center gap-2"
                    title="Tap to set tempo"
                >
                    <Activity size={16} className="md:w-5 md:h-5" />
                    <span className="hidden md:inline">Tap Tempo</span>
                    <span className="md:hidden">Tap</span>
                </button>
            </div>

            {tapTimes.length > 0 && (
                <div className="text-xs text-slate-500 font-mono">
                    {tapTimes.length} tap{tapTimes.length > 1 ? 's' : ''}
                </div>
            )}
        </div>
    );
};

export default Metronome;
