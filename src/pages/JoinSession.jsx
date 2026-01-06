import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Hash } from 'lucide-react';

const JoinSession = () => {
    const [sessionId, setSessionId] = useState('');
    const navigate = useNavigate();

    const handleJoin = (e) => {
        e.preventDefault();
        if (sessionId.trim()) {
            navigate(`/session/${sessionId}`);
        }
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
            </div>
        </div>
    );
};

export default JoinSession;
