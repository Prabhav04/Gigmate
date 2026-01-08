import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Hash } from 'lucide-react';

const JoinSession = () => {
    const [sessionId, setSessionId] = useState('');
    const [recentSessions, setRecentSessions] = useState([]);
    const navigate = useNavigate();

    React.useEffect(() => {
        const stored = localStorage.getItem('gigmate_sessions');
        if (stored) {
            try {
                const raw = JSON.parse(stored);
                // Normalize: Ensure we have objects
                const sessions = raw.map(item => {
                    if (typeof item === 'string') return { id: item, name: 'Joined Session', date: new Date().toISOString() };
                    return item;
                });
                setRecentSessions(sessions);
            } catch (e) { console.error("Error parsing recent sessions", e); }
        }
    }, []);

    const saveToRecent = (id) => {
        const newSession = { id, name: 'Joined Session', date: new Date().toISOString() };
        // Remove existing by ID to avoid duplicates
        const currentRecents = recentSessions.filter(s => s.id !== id);
        const newRecents = [newSession, ...currentRecents].slice(0, 5);
        setRecentSessions(newRecents);
        localStorage.setItem('gigmate_sessions', JSON.stringify(newRecents));
    };

    const handleJoin = (e) => {
        e.preventDefault();
        if (sessionId.trim()) {
            saveToRecent(sessionId.trim());
            navigate(`/session/${sessionId.trim()}`);
        }
    };

    const joinRecent = (session) => {
        // Update timestamp/position on rejoin
        saveToRecent(session.id);
        navigate(`/session/${session.id}`);
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center">
            <div className="w-full max-w-md p-8 rounded-2xl bg-surface/50 border border-glass-border backdrop-blur-xl shadow-2xl">
                <h2 className="text-3xl font-bold mb-2 font-display bg-gradient-to-r from-secondary to-blue-400 bg-clip-text text-transparent">
                    Join Session
                </h2>
                <p className="text-slate-400 mb-8">Enter the session ID shared by your band leader.</p>

                <form onSubmit={handleJoin} className="space-y-6">
                    <div className="relative group">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-secondary transition-colors" size={20} />
                        <input
                            type="text"
                            value={sessionId}
                            onChange={(e) => setSessionId(e.target.value)}
                            placeholder="e.g. jams-123"
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!sessionId.trim()}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-secondary to-blue-500 text-white font-bold text-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                    >
                        Enter Studio <ArrowRight className="ml-2" size={20} />
                    </button>
                </form>

                {recentSessions.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-slate-700/50">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Recent Sessions</h3>
                        <div className="space-y-2">
                            {recentSessions.map(session => (
                                <button
                                    key={session.id}
                                    onClick={() => joinRecent(session)}
                                    className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-900/30 hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700 group text-left"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-300 group-hover:text-primary transition-colors text-sm">{session.name}</span>
                                        <span className="font-mono text-xs text-slate-500">{session.id}</span>
                                    </div>
                                    <ArrowRight size={16} className="text-slate-600 group-hover:text-primary transition-colors" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JoinSession;
