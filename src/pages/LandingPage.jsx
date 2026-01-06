import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Users, ArrowRight } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    const createSession = () => {
        // Generate a random session ID (temp logic)
        const sessionId = Math.random().toString(36).substring(2, 9);
        navigate(`/session/${sessionId}`);
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-12">
            <div className="space-y-4 animate-fade-in-up">
                <h1 className="text-6xl md:text-8xl font-display font-bold bg-gradient-to-r from-primary via-purple-400 to-secondary bg-clip-text text-transparent drop-shadow-lg">
                    GIGmate
                </h1>
                <p className="text-xl md:text-2xl text-slate-300 font-light max-w-2xl mx-auto">
                    The ultimate real-time collaboration workspace for bands.
                    Sync your setlists, lyrics, and notes instantly.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
                {/* Create Session Card */}
                <div
                    onClick={createSession}
                    className="group relative p-8 rounded-2xl bg-surface/50 border border-glass-border hover:border-primary/50 cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] hover:-translate-y-1"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex flex-col items-center space-y-4">
                        <div className="p-4 rounded-full bg-primary/20 text-primary group-hover:scale-110 transition-transform">
                            <Music size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Start a Jam</h2>
                        <p className="text-slate-400">Create a new session and invite your bandmates.</p>
                        <div className="flex items-center text-primary font-medium">
                            Create Session <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>

                {/* Join Session Card */}
                <div
                    onClick={() => navigate('/join')}
                    className="group relative p-8 rounded-2xl bg-surface/50 border border-glass-border hover:border-secondary/50 cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] hover:-translate-y-1"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex flex-col items-center space-y-4">
                        <div className="p-4 rounded-full bg-secondary/20 text-secondary group-hover:scale-110 transition-transform">
                            <Users size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Join the Band</h2>
                        <p className="text-slate-400">Enter a code to jump into an existing session.</p>
                        <div className="flex items-center text-secondary font-medium">
                            Join Session <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
