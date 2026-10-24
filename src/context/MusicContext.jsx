import React, { useState } from 'react';
import { MusicContext } from './MusicContextCore.js';

export const MusicProvider = ({ children }) => {
    const [activePlaylist, setActivePlaylist] = useState(null);

    // This state represents the selected playlist, not playback reported by
    // Spotify. The embedded player owns its playback controls across origins.
    const togglePlay = (playlist) => {
        if (activePlaylist?.id === playlist.id) {
            setActivePlaylist(null);
            return;
        }
        setActivePlaylist(playlist);
    };

    const stopMusic = () => setActivePlaylist(null);

    return (
        <MusicContext.Provider value={{
            activePlaylist,
            togglePlay,
            stopMusic,
        }}>
            {children}
        </MusicContext.Provider>
    );
};
