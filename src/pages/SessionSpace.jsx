import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import RoleSelection from '../components/RoleSelection';
import MasterBoard from '../components/MasterBoard';
import PlayerBoard from '../components/PlayerBoard';
import { useSession } from '../hooks/useSession';
import { Share2, ArrowLeft, Maximize } from 'lucide-react';
import PerformanceMode from '../components/PerformanceMode';
import { useStageMode } from '../hooks/useStageMode.jsx';

const SessionSpace = () => {
    const { sessionId } = useParams();

    const [role, setRole] = useState(null);
    const [isPerformanceMode, setIsPerformanceMode] = useState(false);
    const { stageMode, toggleStageMode } = useStageMode();

    const {
        masterNotes,
        songs,
        personalNotes,
        updateMasterNotes,
        addSong,
        updateSong,
        deleteSong,
        reorderSongs,
        toggleSongActive,
        updatePersonalNotes,
        songPersonalNotes,
        updateSongPersonalNote,
        isConnected,
        error,
        isSaving,
        importSongs
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
            <header className="px-3 py-2 md:px-6 md:py-3 border-b border-glass-border flex justify-between items-center bg-surface/30 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                    <button onClick={() => setRole(null)} className="shrink-0 p-1.5 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white" title="Back">
                        <ArrowLeft size={18} />
                    </button>

                    <div className="hidden md:flex items-center gap-2 font-display font-bold text-xl">
                        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">GIGmate</span>
                        <span className="text-slate-600">/</span>
                    </div>

                    <span className="text-slate-200 font-mono text-sm truncate min-w-0 flex-1 md:flex-none" title={sessionId}>
                        {sessionId}
                    </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <div className={`flex items-center justify-center w-6 h-6 md:w-auto md:h-auto md:gap-2 md:px-3 md:py-1.5 rounded-full md:border ${isConnected ? 'md:bg-green-500/10 md:text-green-400 md:border-green-500/20' : 'md:bg-red-500/10 md:text-red-400 md:border-red-500/20'}`} title={isConnected ? 'Live' : 'Offline'}>
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                        <span className="hidden md:inline text-xs font-medium">{isConnected ? 'LIVE' : 'OFFLINE'}</span>
                    </div>

                    <div className="text-[10px] md:text-sm font-bold px-2 py-1 md:px-4 md:py-1.5 rounded-lg bg-surface border border-glass-border shadow-sm text-white max-w-[150px] truncate">
                        {role.toUpperCase()}
                    </div>

                    <button
                        onClick={copyInvite}
                        className="p-1.5 md:p-2 bg-primary hover:bg-primary-hover rounded-lg text-white transition-all hover:scale-105 shadow-lg shadow-primary/25"
                        title="Copy Invite Link"
                    >
                        <Share2 size={16} className="md:w-5 md:h-5" />
                    </button>

                    <button
                        onClick={toggleStageMode}
                        className={`p-1.5 md:p-2 rounded-lg transition-all hover:scale-105 font-bold text-xs font-mono ${stageMode
                            ? 'bg-white/10 text-white border border-white/20'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                            }`}
                        title={stageMode ? 'Exit Stage Mode' : 'Stage Mode (OLED)'}
                    >
                        {stageMode ? '🌙' : '☀️'}
                    </button>

                    <button
                        onClick={() => setIsPerformanceMode(true)}
                        className="p-1.5 md:p-2 bg-secondary hover:bg-secondary/80 rounded-lg text-black transition-all hover:scale-105 shadow-lg shadow-secondary/25"
                        title="Performance Mode"
                    >
                        <Maximize size={16} className={`md:w-5 md:h-5 ${stageMode ? 'text-white' : 'text-black'}`} />
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
                        onReorderSongs={reorderSongs}
                        onToggleActive={toggleSongActive}
                        isSaving={isSaving}
                        onImportSongs={importSongs}
                    />
                ) : (
                    <PlayerBoard
                        role={role}
                        masterNotes={masterNotes}
                        songs={songs}
                        personalNotes={personalNotes}
                        onUpdatePersonal={updatePersonalNotes}
                        isSaving={isSaving}
                        songPersonalNotes={songPersonalNotes}
                        onUpdateSongPersonal={updateSongPersonalNote}
                    />
                )}
            </main>

            {/* Performance Mode Overlay */}
            {isPerformanceMode && (
                <PerformanceMode
                    songs={songs}
                    songPersonalNotes={songPersonalNotes}
                    masterNotes={masterNotes}
                    role={role}
                    onExit={() => setIsPerformanceMode(false)}
                />
            )}
        </div>
    );
};

export default SessionSpace;
