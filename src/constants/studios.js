import { ATTAM_SETLIST_PRESET, ROCK_SETLIST_PRESET, MARRIAGE_SETLIST_PRESET } from './presets';

export const STUDIOS = [
    {
        id: 'gigmate-attam',
        name: 'College Show',
        description: 'Setlist for College performances',
        icon: '💃',
        color: 'from-pink-500 to-rose-500',
        defaultPreset: ATTAM_SETLIST_PRESET
    },
    {
        id: 'gigmate-rock',
        name: 'GECT Setlist',
        description: 'Rock and High Energy',
        icon: '🎸',
        color: 'from-purple-500 to-indigo-500',
        defaultPreset: ROCK_SETLIST_PRESET
    },
    {
        id: 'gigmate-practice',
        name: 'General Practice',
        description: 'Jamming and experimentation',
        icon: '🎹',
        color: 'from-blue-500 to-cyan-500',
        defaultPreset: []
    },
    {
        id: 'gigmate-marriage',
        name: 'Marriage',
        description: 'Setlist for Marriage',
        icon: '💒',
        color: 'from-pink-500 to-rose-500',
        defaultPreset: MARRIAGE_SETLIST_PRESET
    },
    
];
