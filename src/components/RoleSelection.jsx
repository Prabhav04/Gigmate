import React from 'react';

const roles = [
    { id: 'keyboard', label: 'Keyboardist (Leader)', imgSrc: '/Icons-png/key.png', theme: 'from-emerald-500/20 to-emerald-900/5', desc: 'Controls the Master Notes' },
    { id: 'singer', label: 'Singer', imgSrc: '/Icons-png/vocal.png', theme: 'from-rose-500/20 to-rose-900/5', desc: 'Lyrics & Vocals' },
    { id: 'drummer', label: 'Drummer', imgSrc: '/Icons-png/drums.png', theme: 'from-blue-500/20 to-blue-900/5', desc: 'Beats & Rhythms' },
    { id: 'guitarist', label: 'Guitarist', imgSrc: '/Icons-png/guitar.png', theme: 'from-amber-500/20 to-amber-900/5', desc: 'Chords & Solos' },
    { id: 'violinist', label: 'Violinist', imgSrc: '/Icons-png/violin.png', theme: 'from-violet-500/20 to-violet-900/5', desc: 'Melody & Strings' },
];

const RoleSelection = ({ onSelect }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] animate-fade-in p-6">
            <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 font-display text-white">
                    Command the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Stage</span>
                </h2>
                <p className="text-slate-400 text-lg font-medium max-w-lg mx-auto">
                    Select your instrument identity to sync with the session.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-5xl">
                {roles.map((role) => (
                    <button
                        key={role.id}
                        onClick={() => onSelect(role.id)}
                        className="group relative overflow-hidden p-6 md:p-8 rounded-2xl bg-surface/30 backdrop-blur-sm border border-white/5 hover:border-white/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl text-left flex flex-col md:items-start focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                        {/* Subtle animated background gradient glow */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${role.theme} opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out`} />

                        {/* Large muted background watermark image */}
                        <img
                            src={role.imgSrc}
                            alt=""
                            className="absolute -right-6 -bottom-6 w-40 h-40 object-contain opacity-5 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-700 ease-out drop-shadow-2xl pointer-events-none filter brightness-0 invert"
                        />

                        <div className="relative z-10 w-full flex-grow flex flex-col justify-between">
                            <div className="mb-6 flex justify-between items-start w-full">
                                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 group-hover:border-white/20 group-hover:bg-white/10 transition-all duration-300 shadow-xl">
                                    <img
                                        src={role.imgSrc}
                                        alt={role.label}
                                        className="w-10 h-10 object-contain filter grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110"
                                    />
                                </div>
                                <div className="w-8 h-px bg-white/10 mt-5 group-hover:w-16 group-hover:bg-white/30 transition-all duration-500 ease-out" />
                            </div>

                            <div className="mt-8">
                                <h3 className="text-xl font-bold tracking-tight text-white/90 mb-1.5 group-hover:text-white transition-colors">
                                    {role.label}
                                </h3>
                                <p className="text-sm text-slate-400 font-medium tracking-wide">
                                    {role.desc}
                                </p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default RoleSelection;
