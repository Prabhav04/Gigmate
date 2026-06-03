import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Activity } from 'lucide-react';

const Metronome = ({ suggestedBPM = 120, suggestedTimeSig = '4/4', compact = false, hasActiveSong = false }) => {
    const [bpm, setBpm] = useState(suggestedBPM);
    const [timeSig, setTimeSig] = useState(suggestedTimeSig);
    const [isPlaying, setIsPlaying] = useState(false);
    const [beat, setBeat] = useState(0);
    const [tapTimes, setTapTimes] = useState([]);

    // Revert to 120 BPM and 4/4 if no active song is chosen
    useEffect(() => {
        if (!hasActiveSong) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setBpm(120);
            setTimeSig('4/4');
            setBeat(0);
        }
    }, [hasActiveSong]);

    const audioContextRef = useRef(null);
    const timerIDRef = useRef(null);
    const nextNoteTimeRef = useRef(0.0); // when the next note is due
    const beatRef = useRef(0);
    const activeTimersRef = useRef([]);

    // Keep ref copy of bpm/beatsPerMeasure up-to-date to read inside loop without rebuilding the scheduler
    const bpmRef = useRef(bpm);
    useEffect(() => {
        bpmRef.current = bpm;
    }, [bpm]);

    const parseTimeSig = (sig) => {
        if (!sig || typeof sig !== 'string') return 4;
        const parts = sig.split('/');
        const beatsPerMeasure = parseInt(parts[0]);
        return isNaN(beatsPerMeasure) || beatsPerMeasure < 1 ? 4 : beatsPerMeasure;
    };

    const beatsPerMeasure = parseTimeSig(timeSig);
    const beatsPerMeasureRef = useRef(beatsPerMeasure);
    useEffect(() => {
        beatsPerMeasureRef.current = beatsPerMeasure;
    }, [beatsPerMeasure]);

    const lookahead = 25.0; // How frequently to call scheduling function (in ms)
    const scheduleAheadTime = 0.1; // How far ahead to schedule audio (in seconds)

    // Closes AudioContext when metronome component is unmounted
    useEffect(() => {
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    // Schedules sound play and visual state updates
    const scheduleNote = useCallback((beatNumber, time) => {
        const ctx = audioContextRef.current;
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        const isAccent = beatNumber === 0;
        osc.frequency.setValueAtTime(isAccent ? 1000 : 800, time);
        gainNode.gain.setValueAtTime(isAccent ? 0.3 : 0.15, time);
        // Exponential decay for clicky response
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

        osc.start(time);
        osc.stop(time + 0.06);

        // Schedule visual beat updates on UI thread
        const diffMs = (time - ctx.currentTime) * 1000;
        const timer = setTimeout(() => {
            setBeat(beatNumber);
        }, Math.max(0, diffMs));

        activeTimersRef.current.push(timer);
    }, []);

    // Scheduler loop - checks context time vs target note times
    const scheduler = useCallback(() => {
        const ctx = audioContextRef.current;
        if (!ctx) return;

        while (nextNoteTimeRef.current < ctx.currentTime + scheduleAheadTime) {
            const currentBpm = bpmRef.current;
            const currentBeatsPerMeasure = beatsPerMeasureRef.current;
            const scheduledBeat = beatRef.current;

            scheduleNote(scheduledBeat, nextNoteTimeRef.current);

            // Advance target note time
            const secondsPerBeat = 60.0 / currentBpm;
            nextNoteTimeRef.current += secondsPerBeat;

            // Increment beat index
            beatRef.current = (beatRef.current + 1) % currentBeatsPerMeasure;
        }
    }, [scheduleNote]);

    // Handles metronome scheduler loop starting and stopping
    useEffect(() => {
        if (isPlaying) {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }

            const ctx = audioContextRef.current;

            const startMetronome = async () => {
                if (ctx.state === 'suspended') {
                    await ctx.resume();
                }

                nextNoteTimeRef.current = ctx.currentTime + 0.05;
                beatRef.current = 0;
                setBeat(0);

                timerIDRef.current = setInterval(() => {
                    scheduler();
                }, lookahead);
            };

            startMetronome();

            return () => {
                if (timerIDRef.current) {
                    clearInterval(timerIDRef.current);
                    timerIDRef.current = null;
                }
                activeTimersRef.current.forEach(t => clearTimeout(t));
                activeTimersRef.current = [];
            };
        } else {
            if (timerIDRef.current) {
                clearInterval(timerIDRef.current);
                timerIDRef.current = null;
            }
            activeTimersRef.current.forEach(t => clearTimeout(t));
            activeTimersRef.current = [];
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setBeat(0);
        }
    }, [isPlaying, scheduler]);

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
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setBpm(suggestedBPM);
        }
    }, [suggestedBPM, bpm]);

    useEffect(() => {
        if (suggestedTimeSig && suggestedTimeSig !== timeSig) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTimeSig(suggestedTimeSig);
            setBeat(0);
        }
    }, [suggestedTimeSig, timeSig]);

    if (compact) {
        return (
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-1.5 px-2 md:px-3 flex items-center justify-between gap-2 h-10 w-full">
                {/* BPM & Time Sig controls side-by-side */}
                <div className="flex items-center gap-2">
                    {/* BPM */}
                    <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500 uppercase font-bold hidden xs:inline">BPM</span>
                        <input
                            type="number"
                            value={bpm}
                            onChange={(e) => setBpm(Math.max(40, Math.min(240, parseInt(e.target.value) || 120)))}
                            className="w-12 bg-black border border-slate-800 rounded px-1.5 py-0.5 text-center text-sm font-bold text-white focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            min="40"
                            max="240"
                            disabled={!hasActiveSong}
                        />
                    </div>

                    {/* Time Sig */}
                    <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500 uppercase font-bold hidden xs:inline">Sig</span>
                        <input
                            type="text"
                            value={timeSig}
                            onChange={(e) => setTimeSig(e.target.value)}
                            placeholder="4/4"
                            className="w-12 bg-black border border-slate-800 rounded px-1.5 py-0.5 text-center text-xs font-bold text-white focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!hasActiveSong}
                        />
                    </div>

                    {/* Beat Indicator */}
                    <div className="flex gap-1 items-center ml-1">
                        {Array.from({ length: Math.min(beatsPerMeasure, 8) }).map((_, i) => (
                            <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${isPlaying && beat === i
                                        ? i === 0
                                            ? 'bg-primary scale-125 shadow-lg shadow-primary/50'
                                            : 'bg-secondary scale-125 shadow-lg shadow-secondary/50'
                                        : 'bg-slate-700'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                    <button
                        onClick={togglePlay}
                        className={`p-1.5 rounded font-bold transition-all ${isPlaying
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-primary hover:bg-primary/80 text-black'
                            }`}
                        title={isPlaying ? 'Stop' : 'Play'}
                    >
                        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                    </button>

                    <button
                        onClick={handleTap}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-white transition-all hover:scale-105 disabled:hover:scale-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                        title="Tap to set tempo"
                        disabled={!hasActiveSong}
                    >
                        <Activity size={14} />
                    </button>
                    
                    {tapTimes.length > 0 && (
                        <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                            ({tapTimes.length} tap{tapTimes.length > 1 ? 's' : ''})
                        </span>
                    )}
                </div>
            </div>
        );
    }

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
                        className="w-16 md:w-20 bg-black border border-slate-700 rounded px-2 py-1 text-center text-xl md:text-2xl font-bold text-white focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        min="40"
                        max="240"
                        disabled={!hasActiveSong}
                    />
                </div>

                <div className="flex flex-col items-center">
                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">Time</div>
                    <input
                        type="text"
                        value={timeSig}
                        onChange={(e) => setTimeSig(e.target.value)}
                        placeholder="4/4"
                        className="w-12 md:w-16 bg-black border border-slate-700 rounded px-2 py-1 text-center text-lg md:text-xl font-bold text-white focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!hasActiveSong}
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
                    className="px-3 md:px-4 py-2 md:py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-white font-bold text-sm md:text-base transition-all hover:scale-105 disabled:hover:scale-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                    title="Tap to set tempo"
                    disabled={!hasActiveSong}
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
