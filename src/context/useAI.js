import { useContext } from 'react';
import { AIContext } from './AIContextCore';

export const useAI = () => {
    const context = useContext(AIContext);
    if (!context) throw new Error('useAI must be used within AIProvider');
    return context;
};
