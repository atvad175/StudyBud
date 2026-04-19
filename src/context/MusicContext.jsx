import React, { createContext, useContext, useState, useEffect } from 'react';

const MusicContext = createContext();

export const useMusic = () => {
    const context = useContext(MusicContext);
    if (!context) throw new Error('useMusic must be used within a MusicProvider');
    return context;
};

export const MusicProvider = ({ children }) => {
    const [activePlaylist, setActivePlaylist] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlay = (playlist) => {
        if (activePlaylist?.id === playlist.id) {
            setIsPlaying(!isPlaying);
        } else {
            setActivePlaylist(playlist);
            setIsPlaying(true);
        }
    };

    const stopMusic = () => {
        setActivePlaylist(null);
        setIsPlaying(false);
    };

    return (
        <MusicContext.Provider value={{
            activePlaylist,
            isPlaying,
            togglePlay,
            stopMusic,
            setIsPlaying
        }}>
            {children}
        </MusicContext.Provider>
    );
};
