import React, { createContext, useContext, useState, useEffect } from 'react';

const StageModeContext = createContext({ stageMode: false, toggleStageMode: () => { } });

export const StageModeProvider = ({ children }) => {
    const [stageMode, setStageMode] = useState(() => {
        // Persist preference across page refreshes
        return localStorage.getItem('gigmate-stage-mode') === 'true';
    });

    useEffect(() => {
        // Apply/remove the data attribute on <html> so CSS vars can be overridden globally
        document.documentElement.setAttribute('data-stage-mode', stageMode ? 'true' : 'false');
        localStorage.setItem('gigmate-stage-mode', stageMode);
    }, [stageMode]);

    const toggleStageMode = () => setStageMode(prev => !prev);

    return (
        <StageModeContext.Provider value={{ stageMode, toggleStageMode }}>
            {children}
        </StageModeContext.Provider>
    );
};

export const useStageMode = () => useContext(StageModeContext);
