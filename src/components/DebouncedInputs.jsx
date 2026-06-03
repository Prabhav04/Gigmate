import React, { useState, useEffect } from 'react';

export const DebouncedInput = ({ value, onChange, onBlur, className, placeholder, ...props }) => {
    const [localVal, setLocalVal] = useState(value || '');

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocalVal(value || '');
    }, [value]);

    useEffect(() => {
        if (localVal === value) return;
        const handler = setTimeout(() => {
            onChange(localVal);
        }, 800);
        return () => clearTimeout(handler);
    }, [localVal, value, onChange]);

    const handleBlur = (e) => {
        if (localVal !== value) {
            onChange(localVal);
        }
        if (onBlur) onBlur(e);
    };

    return (
        <input
            {...props}
            value={localVal}
            onChange={(e) => setLocalVal(e.target.value)}
            onBlur={handleBlur}
            className={className}
            placeholder={placeholder}
        />
    );
};

export const DebouncedTextarea = ({ value, onChange, onBlur, className, placeholder, ...props }) => {
    const [localVal, setLocalVal] = useState(value || '');

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocalVal(value || '');
    }, [value]);

    useEffect(() => {
        if (localVal === value) return;
        const handler = setTimeout(() => {
            onChange(localVal);
        }, 800);
        return () => clearTimeout(handler);
    }, [localVal, value, onChange]);

    const handleBlur = (e) => {
        if (localVal !== value) {
            onChange(localVal);
        }
        if (onBlur) onBlur(e);
    };

    return (
        <textarea
            {...props}
            value={localVal}
            onChange={(e) => setLocalVal(e.target.value)}
            onBlur={handleBlur}
            className={className}
            placeholder={placeholder}
        />
    );
};
