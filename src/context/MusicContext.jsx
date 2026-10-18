import React, { useState } from 'react';
import { MusicContext } from './MusicContextCore';

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
