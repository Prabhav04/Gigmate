import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RoleSelection from '../components/RoleSelection';
import MasterBoard from '../components/MasterBoard';
import PlayerBoard from '../components/PlayerBoard';
import { useSession } from '../hooks/useSession';
import { Share2, ArrowLeft } from 'lucide-react';

const SessionSpace = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [role, setRole] = useState(null);

    const {
        masterNotes,
        songs,
        personalNotes,
        updateMasterNotes,
        addSong,
        updateSong,
        deleteSong,
        toggleSongActive,
        updatePersonalNotes,
        isConnected,
        error,
        isSaving
    } = useSession(sessionId, role);

    const copyInvite = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Invite link copied!');
    };

    if (!role) {
        return <RoleSelection onSelect={setRole} />;
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* Error Banner */}
            {error && (
                <div className="bg-red-500/90 text-white px-4 py-2 text-center text-sm font-bold animate-fade-in z-[100]">
                    ⚠️ Error: {error} (Check Firebase Firestore Rules)
                </div>
            )}

            {/* Navbar */}
            <header className="px-6 py-3 border-b border-glass-border flex justify-between items-center bg-surface/30 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => setRole(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white" title="Change Role">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="font-display font-bold text-xl flex items-center gap-2">
                        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">GIGmate</span>
                        <span className="text-slate-600">/</span>
                        <span className="text-slate-400 font-mono text-sm tracking-wider">{sessionId}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border ${isConnected ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                        {isConnected ? 'LIVE' : 'OFFLINE'}
                    </div>

                    <div className="text-sm font-bold px-4 py-1.5 rounded-lg bg-surface border border-glass-border shadow-sm text-white">
                        {role.toUpperCase()}
                    </div>

                    <button
                        onClick={copyInvite}
                        className="p-2 bg-primary hover:bg-primary-hover rounded-lg text-white transition-all hover:scale-105 shadow-lg shadow-primary/25"
                        title="Copy Invite Link"
                    >
                        <Share2 size={20} />
                    </button>
                </div>
            </header>

            <main className="flex-1 p-4 md:p-6 overflow-hidden">
                {role === 'keyboard' ? (
                    <MasterBoard
                        notes={masterNotes}
                        songs={songs}
                        onUpdate={updateMasterNotes}
                        onAddSong={addSong}
                        onUpdateSong={updateSong}
                        onDeleteSong={deleteSong}
                        onToggleActive={toggleSongActive}
                        isSaving={isSaving}
                    />
                ) : (
                    <PlayerBoard
                        role={role}
                        masterNotes={masterNotes}
                        songs={songs}
                        personalNotes={personalNotes}
                        onUpdatePersonal={updatePersonalNotes}
                        isSaving={isSaving}
                    />
                )}
            </main>
        </div>
    );
};

export default SessionSpace;
