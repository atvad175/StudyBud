import React, { useState } from 'react';
import { Play, Pause, X, Music, Timer, Minimize2, Headphones } from 'lucide-react';
import { useFocus } from '../../context/useFocus';
import { useMusic } from '../../context/useMusic';
import styles from './FocusOverlay.module.css';

const FocusOverlay = () => {
    const {
        isActive,
        timeLeft,
        formatTime,
        isPaused,
        resumeSession,
        pauseSession,
        stopSession,
        category,
    } = useFocus();
    const { activePlaylist, stopMusic } = useMusic();
    const [isMinimized, setIsMinimized] = useState(false);
    const isVisible = isActive || Boolean(activePlaylist);
    const playlistId = String(activePlaylist?.spotifyId || '');
    const canEmbedPlaylist = /^[A-Za-z0-9]{10,40}$/.test(playlistId);

    if (!isVisible) return null;

    const handleEnd = () => {
        if (isActive) void stopSession();
        stopMusic();
    };

    if (isMinimized) {
        return (
            <div className={styles.minimizedDock}>
                <button
                    type="button"
                    className={styles.restoreButton}
                    onClick={() => setIsMinimized(false)}
                    aria-label="Expand Focus Hub"
                    aria-expanded="false"
                >
                    {isActive ? <Timer size={23} /> : <Headphones size={23} />}
                    <span className={styles.statusDot + (isActive && !isPaused ? ' ' + styles.statusActive : '')} />
                </button>
            </div>
        );
    }

    return (
        <aside className={styles.panel} aria-label="Focus Hub">
            <header className={styles.header}>
                <div className={styles.heading}>
                    <span className={styles.headingIcon}>
                        {isActive ? <Timer size={18} /> : <Headphones size={18} />}
                    </span>
                    <span className={styles.headingCopy}>
                        <strong>Focus Hub</strong>
                        <small>{isActive ? 'Focus session' : 'Music player'}</small>
                    </span>
                </div>
                <div className={styles.headerActions}>
                    <button
                        type="button"
                        className={styles.iconButton}
                        onClick={() => setIsMinimized(true)}
                        aria-label="Minimize Focus Hub"
                    >
                        <Minimize2 size={16} />
                    </button>
                    <button
                        type="button"
                        className={styles.iconButton + ' ' + styles.closeButton}
                        onClick={handleEnd}
                        aria-label="End focus session and stop music"
                    >
                        <X size={17} />
                    </button>
                </div>
            </header>

            {isActive && (
                <section className={styles.timerSection} aria-label="Focus timer">
                    <div className={styles.timerCopy}>
                        <span>{category || 'Focusing'}</span>
                        <strong aria-live="off">{formatTime(timeLeft)}</strong>
                        <small>{isPaused ? 'Paused' : 'In progress'}</small>
                    </div>
                    <button
                        type="button"
                        className={styles.primaryControl}
                        onClick={isPaused ? resumeSession : pauseSession}
                        aria-label={isPaused ? 'Resume focus session' : 'Pause focus session'}
                    >
                        {isPaused ? <Play size={21} fill="currentColor" /> : <Pause size={21} fill="currentColor" />}
                    </button>
                </section>
            )}

            {activePlaylist && (
                <section className={styles.musicSection} aria-label="Music player">
                    <div className={styles.trackHeading}>
                        <span
                            className={styles.trackArtwork}
                            style={{ background: activePlaylist.gradient || 'var(--color-gold-light)' }}
                        >
                            {activePlaylist.icon || <Music size={20} />}
                        </span>
                        <span className={styles.trackCopy}>
                            <strong>{activePlaylist.title || 'Focus playlist'}</strong>
                            <small>Spotify player</small>
                        </span>
                    </div>
                    {canEmbedPlaylist ? (
                        <iframe
                            className={styles.spotifyFrame}
                            src={'https://open.spotify.com/embed/playlist/' + playlistId + '?utm_source=generator&theme=0'}
                            title={'Spotify playlist: ' + (activePlaylist.title || 'Focus playlist')}
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                        />
                    ) : (
                        <p className={styles.playerNotice}>This playlist does not have a valid Spotify playlist ID.</p>
                    )}
                </section>
            )}
        </aside>
    );
};

export default FocusOverlay;
