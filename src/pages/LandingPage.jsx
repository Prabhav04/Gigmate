import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Users, ArrowRight, Save, Clock, Trash2, Plus, Copy, Check } from 'lucide-react';

const generateSessionId = (customName) => {
    return customName
        ? customName.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 6)
        : Math.random().toString(36).substring(2, 9);
};

import { STUDIOS } from '../constants/studios';

// ... (keep generateSessionId helper if you want, but it's less used now)

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
                        return { id: item, name: 'Joined Session', date: new Date().toISOString() };
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

    const enterStudio = (studio) => {
        saveSessionToHistory(studio.id, studio.name);
        navigate(`/session/${studio.id}`);
    };

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

    return (
        <div className="min-h-[90vh] flex flex-col items-center justify-start pt-10 md:pt-20 space-y-12 pb-10">
            <div className="flex flex-col space-y-4 animate-fade-in-up text-center items-center">
                <svg width="354" height="75" viewBox="0 0 354 75" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M81.7918 73.9199H17.0878C5.75979 73.9199 -0.000214815 68.8319 -0.000214815 58.7519V18.9119C-0.000214815 8.83192 5.75979 3.74392 17.0878 3.74392H81.3118V15.7439H23.4238C18.5278 15.7439 16.0318 18.0479 16.0318 22.5599V55.1039C16.0318 59.7119 18.5278 61.9199 23.4238 61.9199H66.9118V43.7759C66.9118 40.7039 65.1838 39.1679 61.7278 39.1679H29.3758V28.9919H69.2158C77.6638 28.9919 81.7918 32.4479 81.7918 39.4559V73.9199ZM112.045 3.74392V73.9199H96.0133V3.74392H112.045ZM207.886 73.9199H143.182C131.854 73.9199 126.094 68.8319 126.094 58.7519V18.9119C126.094 8.83192 131.854 3.74392 143.182 3.74392H207.406V15.7439H149.518C144.622 15.7439 142.126 18.0479 142.126 22.5599V55.1039C142.126 59.7119 144.622 61.9199 149.518 61.9199H193.006V43.7759C193.006 40.7039 191.278 39.1679 187.822 39.1679H155.47V28.9919H195.31C203.758 28.9919 207.886 32.4479 207.886 39.4559V73.9199ZM219.899 73.9199V16.3199H226.235V21.4079H227.483C228.443 19.4879 229.531 18.0479 230.747 17.0879C232.027 16.1279 233.787 15.6479 236.027 15.6479C238.331 15.6479 240.155 16.1279 241.499 17.0879C242.907 18.0479 243.899 19.6159 244.475 21.7919H245.723C246.683 19.8079 247.867 18.3039 249.275 17.2799C250.683 16.1919 252.507 15.6479 254.747 15.6479C257.755 15.6479 259.995 16.5439 261.467 18.3359C262.939 20.0639 263.707 22.9759 263.771 27.0719L263.867 73.9199H257.531L257.435 26.5919C257.371 24.4799 256.955 22.9759 256.187 22.0799C255.483 21.1199 254.267 20.6399 252.539 20.6399C248.955 20.6399 246.491 22.6239 245.147 26.5919V73.9199H238.811L238.715 26.5919C238.715 24.4799 238.331 22.9759 237.563 22.0799C236.795 21.1199 235.547 20.6399 233.819 20.6399C229.979 20.6399 227.451 22.5919 226.235 26.4959V73.9199H219.899ZM281.014 74.4959C277.942 74.4959 275.67 73.5999 274.198 71.8079C272.726 70.0159 271.862 67.3279 271.606 63.7439C271.542 62.9119 271.478 62.0799 271.414 61.2479C271.414 60.4159 271.446 59.5839 271.51 58.7519C271.702 55.4239 272.47 52.5439 273.814 50.1119C275.222 47.6799 277.686 45.4399 281.206 43.3919C282.55 42.6239 283.958 41.8879 285.43 41.1839C286.902 40.4159 288.374 39.6799 289.846 38.9759V26.8799C289.846 24.7679 289.43 23.2319 288.598 22.2719C287.83 21.2479 286.39 20.7359 284.278 20.7359C282.486 20.7359 281.142 21.1519 280.246 21.9839C279.35 22.8159 278.87 24.3839 278.806 26.6879C278.742 27.7759 278.71 29.2479 278.71 31.1039C278.71 32.9599 278.742 34.5919 278.806 35.9999H272.566C272.502 34.7839 272.438 33.3439 272.374 31.6799C272.374 30.0159 272.406 28.5439 272.47 27.2639C272.662 23.1679 273.654 20.2239 275.446 18.4319C277.302 16.5759 280.342 15.6479 284.566 15.6479C288.982 15.6479 291.99 16.6399 293.59 18.6239C295.254 20.5439 296.15 23.6799 296.278 28.0319L296.182 73.9199H289.846V68.7359H288.79C288.086 70.5919 287.126 72.0319 285.91 73.0559C284.758 74.0159 283.126 74.4959 281.014 74.4959ZM283.222 69.5999C286.358 69.5999 288.566 67.7759 289.846 64.1279V44.2559C288.758 44.7679 287.638 45.3439 286.486 45.9839C285.334 46.5599 284.022 47.3919 282.55 48.4799C280.694 49.8239 279.446 51.3279 278.806 52.9919C278.23 54.6559 277.91 56.5759 277.846 58.7519C277.782 59.3919 277.75 60.1279 277.75 60.9599C277.814 61.7279 277.846 62.5279 277.846 63.3599C278.038 65.3439 278.582 66.8799 279.478 67.9679C280.438 69.0559 281.686 69.5999 283.222 69.5999ZM319.627 74.5919C315.147 74.5919 312.075 73.6959 310.411 71.9039C308.747 70.0479 307.883 67.0399 307.819 62.8799V21.4079H303.883V16.3199H307.915V-8.2016e-05H314.443L314.347 16.3199H322.891V21.4079H314.251V63.4559C314.251 65.8239 314.571 67.4239 315.211 68.2559C315.851 69.0879 317.355 69.5039 319.723 69.5039C320.619 69.5039 321.355 69.5039 321.931 69.5039C322.507 69.4399 323.147 69.3439 323.851 69.2159V74.1119C322.635 74.4319 321.227 74.5919 319.627 74.5919ZM347.173 54.1439H353.317C353.381 55.6159 353.413 57.1519 353.413 58.7519C353.477 60.2879 353.477 61.6959 353.413 62.9759C353.221 67.0719 352.229 70.0479 350.437 71.9039C348.709 73.6959 345.733 74.5919 341.509 74.5919C337.157 74.5919 334.021 73.6959 332.101 71.9039C330.181 70.0479 329.157 67.0719 329.029 62.9759C328.901 59.5199 328.805 55.7119 328.741 51.5519C328.741 47.3279 328.741 43.1359 328.741 38.9759C328.805 34.8159 328.901 30.9759 329.029 27.4559C329.221 23.2319 330.277 20.2239 332.197 18.4319C334.117 16.5759 337.189 15.6479 341.413 15.6479C345.509 15.6479 348.485 16.5439 350.341 18.3359C352.197 20.1279 353.221 23.1039 353.413 27.2639C353.477 28.7359 353.509 31.2319 353.509 34.7519C353.573 38.2079 353.509 42.1119 353.317 46.4639H335.269C335.269 49.1519 335.269 51.8719 335.269 54.6239C335.333 57.3119 335.397 60.2559 335.461 63.4559C335.461 65.7599 335.909 67.3599 336.805 68.2559C337.765 69.0879 339.269 69.5039 341.317 69.5039C343.365 69.5039 344.805 69.0879 345.637 68.2559C346.533 67.3599 347.045 65.7599 347.173 63.4559C347.237 61.0879 347.237 57.9839 347.173 54.1439ZM341.413 20.7359C339.301 20.7359 337.765 21.2159 336.805 22.1759C335.909 23.0719 335.461 24.5759 335.461 26.6879C335.397 29.5039 335.333 32.0959 335.269 34.4639C335.269 36.8319 335.269 39.1679 335.269 41.4719H347.269C347.269 38.0799 347.269 35.1039 347.269 32.5439C347.269 29.9199 347.237 27.9679 347.173 26.6879C347.045 24.5759 346.533 23.0719 345.637 22.1759C344.741 21.2159 343.333 20.7359 341.413 20.7359Z" fill="white"/>
                </svg>

                <p className="text-xl md:text-2xl text-slate-300 font-light max-w-2xl mx-auto">
                    The ultimate real-time collaboration workspace for bands.
                </p>
            </div>

            {/* Persistent Studios */}
            <div className="w-full max-w-5xl px-4 animate-fade-in text-left">
                <h3 className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-4">Enter Studio</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {STUDIOS.map((studio) => (
                        <button
                            key={studio.id}
                            onClick={() => enterStudio(studio)}
                            className={`group relative overflow-hidden rounded-xl p-8 border border-slate-800 hover:border-slate-600 transition-all hover:scale-[1.02] text-left shadow-2xl`}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${studio.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                            <div className="relative z-10 flex flex-col h-full">
                                {/* <div className="text-4xl mb-4 bg-surface/50 w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">{studio.icon}</div> */}
                                <div className="font-bold text-2xl leading-tight text-white mb-2">{studio.name}</div>
                                <div className="text-sm text-slate-400">{studio.description}</div>
                                <div className="mt-auto pt-6 flex items-center text-primary font-bold text-sm tracking-wide uppercase group-hover:translate-x-2 transition-transform">
                                    Open Studio <ArrowRight size={16} className="ml-2" />
                                </div>
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
