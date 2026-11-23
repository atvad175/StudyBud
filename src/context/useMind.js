import { useContext } from 'react';
import { MindContext } from './MindContextCore';

export const useMind = () => {
    const context = useContext(MindContext);
    if (!context) throw new Error('useMind must be used within a MindProvider');
    return context;
};
