import React from 'react';
import { Mic, Music, Drum, Guitar, Music2, Keyboard } from 'lucide-react';

const roles = [
    { id: 'keyboard', label: 'Keyboardist (Leader)', icon: Keyboard, color: 'text-yellow-400', desc: 'Controls the Master Notes' },
    { id: 'singer', label: 'Singer', icon: Mic, color: 'text-rose-400', desc: 'Lyrics & Vocals' },
    { id: 'drummer', label: 'Drummer', icon: Drum, color: 'text-blue-400', desc: 'Beats & Rhythms' }, // Drum might not exist, will fallback if error
    { id: 'guitarist', label: 'Guitarist', icon: Guitar, color: 'text-orange-400', desc: 'Chords & Solos' },
    { id: 'violinist', label: 'Violinist', icon: Music2, color: 'text-violet-400', desc: 'Melody & Strings' },
];

const RoleSelection = ({ onSelect }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] animate-fade-in">
            <h2 className="text-4xl font-bold mb-2 font-display">Choose Your Role</h2>
            <p className="text-slate-400 mb-10">Select your instrument to enter the session.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl px-4">
                {roles.map((role) => (
                    <button
                        key={role.id}
                        onClick={() => onSelect(role.id)}
                        className="group relative p-6 rounded-2xl bg-surface/40 border border-glass-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-left flex flex-col items-center md:items-start"
                    >
                        <div className={`p-4 rounded-xl bg-slate-900/50 mb-4 ${role.color} group-hover:scale-110 transition-transform`}>
                            <role.icon size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{role.label}</h3>
                        <p className="text-sm text-slate-400">{role.desc}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default RoleSelection;
