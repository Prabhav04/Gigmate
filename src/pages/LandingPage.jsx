import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Users, ArrowRight, Save, Clock, Trash2, Plus, Copy, Check } from 'lucide-react';

const generateSessionId = (customName) => {
    return customName
        ? customName.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 6)
        : Math.random().toString(36).substring(2, 9);
};

const LandingPage = () => {
    const navigate = useNavigate();
    const [savedSessions, setSavedSessions] = useState([]);
    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => {
        const loadSessions = () => {
            try {
                const raw = JSON.parse(localStorage.getItem('gigmate_sessions') || '[]');
                // Normalize data: Handle legacy string array ['id1', 'id2'] by converting to objects
                const sessions = raw.map(item => {
                    if (typeof item === 'string') {
                        return { id: item, name: 'Untitled Session', date: new Date().toISOString() };
                    }
                    // Ensure it has required fields
                    return {
                        id: item.id || 'unknown',
                        name: item.name || 'Untitled',
                        date: item.date || new Date().toISOString()
                    };
                });

                // Filter out any completely invalid items
                const validSessions = sessions.filter(s => s && s.id);

                setSavedSessions(validSessions);
                // Fix storage immediately
                if (JSON.stringify(raw) !== JSON.stringify(validSessions)) {
                    localStorage.setItem('gigmate_sessions', JSON.stringify(validSessions));
                }
            } catch (e) {
                console.error("Failed to load sessions", e);
                // Reset if corrupt
                localStorage.setItem('gigmate_sessions', '[]');
            }
        };
        loadSessions();
    }, []);

    const createSession = (customName) => {
        const baseId = customName
            ? generateSessionId(customName)
            : generateSessionId();

        saveSessionToHistory(baseId, customName || 'Untitled Jam');
        navigate(`/session/${baseId}`);
    };

    const saveSessionToHistory = (id, name) => {
        const newSession = { id, name, date: new Date().toISOString() };
        const existing = JSON.parse(localStorage.getItem('gigmate_sessions') || '[]');
        // Remove duplicates if re-entering
        const filtered = existing.filter(s => s.id !== id);
        const updated = [newSession, ...filtered].slice(0, 10); // Keep last 10
        localStorage.setItem('gigmate_sessions', JSON.stringify(updated));
    };

    const deleteSession = (e, id) => {
        e.stopPropagation();
        const updated = savedSessions.filter(s => s.id !== id);
        setSavedSessions(updated);
        localStorage.setItem('gigmate_sessions', JSON.stringify(updated));
    };

    const copySessionLink = (e, id) => {
        e.stopPropagation();
        const url = `${window.location.origin}/session/${id}`;
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const GIG_TYPES = [
        { name: 'Marriage Concert', color: 'from-pink-500 to-rose-500', icon: '💍' },
        { name: 'Corporate GIG', color: 'from-blue-500 to-cyan-500', icon: '👔' },
        { name: 'College Show (Rock)', color: 'from-purple-500 to-indigo-500', icon: '🎸' },
        { name: 'ADICHPWOLI SET', color: 'from-orange-500 to-red-500', icon: '🔥' },
    ];

    return (
        <div className="min-h-[90vh] flex flex-col items-center justify-start pt-10 md:pt-20 space-y-12 pb-10">
            <div className="space-y-4 animate-fade-in-up text-center">
                <h1 className="text-6xl md:text-8xl font-display font-bold bg-gradient-to-r from-primary via-purple-400 to-secondary bg-clip-text text-transparent drop-shadow-lg">
                    GIGmate
                </h1>
                <p className="text-xl md:text-2xl text-slate-300 font-light max-w-2xl mx-auto">
                    The ultimate real-time collaboration workspace for bands.
                </p>
            </div>

            {/* Quick Start Templates */}
            <div className="w-full max-w-5xl px-4 animate-fade-in text-left">
                <h3 className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-4">Start New Gig</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {GIG_TYPES.map((gig) => (
                        <button
                            key={gig.name}
                            onClick={() => createSession(gig.name)}
                            className={`group relative overflow-hidden rounded-xl p-6 border border-slate-800 hover:border-slate-600 transition-all hover:scale-[1.02] text-left`}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${gig.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                            <div className="relative z-10">
                                <div className="text-2xl mb-2">{gig.icon}</div>
                                <div className="font-bold text-lg leading-tight text-white">{gig.name}</div>
                                <div className="text-xs text-slate-500 mt-2 font-mono group-hover:text-slate-300">Create New &rarr;</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl px-4">
                {/* Previous Sessions List */}
                <div className="md:col-span-2 bg-surface/30 border border-glass-border rounded-2xl p-6 overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Clock size={20} className="text-secondary" /> Recent Gigs
                        </h3>
                    </div>

                    {savedSessions.length > 0 ? (
                        <div className="space-y-3">
                            {savedSessions.map((session) => (
                                <div
                                    key={session.id}
                                    onClick={() => navigate(`/session/${session.id}`)}
                                    className="group flex items-center justify-between p-4 rounded-xl bg-black/40 border border-slate-800 hover:border-primary/50 cursor-pointer transition-all hover:bg-black/60"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                            {session.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white group-hover:text-primary transition-colors">{session.name}</div>
                                            <div className="text-[10px] text-slate-500 font-mono">ID: {session.id} • {new Date(session.date).toLocaleDateString()}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => copySessionLink(e, session.id)}
                                            className="p-2 text-slate-500 hover:text-white transition-colors"
                                            title="Copy Link"
                                        >
                                            {copiedId === session.id ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                                        </button>
                                        <button
                                            onClick={(e) => deleteSession(e, session.id)}
                                            className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                                            title="Remove from history"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-600 border-2 border-dashed border-slate-800 rounded-xl">
                            No recent gigs found. Start one above!
                        </div>
                    )}
                </div>

                {/* Manual Tools */}
                <div className="space-y-4">
                    <div
                        onClick={() => createSession()}
                        className="group relative p-6 rounded-2xl bg-surface/50 border border-glass-border hover:border-primary/50 cursor-pointer transition-all duration-300 hover:-translate-y-1"
                    >
                        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><Music className="text-primary" /> Blank Session</h2>
                        <p className="text-sm text-slate-400">Start from scratch with a random ID.</p>
                    </div>

                    <div
                        onClick={() => navigate('/join')}
                        className="group relative p-6 rounded-2xl bg-surface/50 border border-glass-border hover:border-secondary/50 cursor-pointer transition-all duration-300 hover:-translate-y-1"
                    >
                        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><Users className="text-secondary" /> Join by ID</h2>
                        <p className="text-sm text-slate-400">Enter a code to join an existing band.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default LandingPage;
