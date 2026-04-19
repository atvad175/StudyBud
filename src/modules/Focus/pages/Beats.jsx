import React, { useState } from 'react';
import { Music2, ChevronRight, Headphones, Waves, Play, Pause } from 'lucide-react';
import { useMusic } from '../../../context/MusicContext';

const SPOTIFY_PLAYLISTS = [
    {
        id: 'lofi',
        title: 'Lo-fi Study Beats',
        subtitle: 'Chill beats · Coffee & focus',
        description: 'Soft, relaxing beats to help you stay calm and focused while you work.',
        icon: '☕',
        mood: 'Calm & Focused',
        moodColor: '#5B8DEE',
        spotifyId: '37i9dQZF1DWWQRwui0ExPn',
        gradient: 'linear-gradient(135deg, #1a2a4a 0%, #0d1b35 100%)',
        accentColor: '#5B8DEE',
    },
    {
        id: 'classical',
        title: 'Classical Focus',
        subtitle: 'Mozart · Bach · Beethoven',
        description: 'Classic piano and violin music that helps your brain think more clearly.',
        icon: '🎹',
        mood: 'Deep Work',
        moodColor: '#9B59B6',
        spotifyId: '37i9dQZF1DWZeKCadgRdKQ',
        gradient: 'linear-gradient(135deg, #2a1a4a 0%, #1b0d35 100%)',
        accentColor: '#9B59B6',
    },
    {
        id: 'ambient',
        title: 'Ambient Space',
        subtitle: 'Zero distraction · Pure focus',
        description: 'Quiet, space-like sounds that fade into the background so you can focus.',
        icon: '🌌',
        mood: 'Flow State',
        moodColor: '#3F51B5',
        spotifyId: '37i9dQZF1DX3Ogo9pFvBkY',
        gradient: 'linear-gradient(135deg, #0a1a3a 0%, #050d1e 100%)',
        accentColor: '#3F51B5',
    },
    {
        id: 'nature',
        title: 'Nature Sounds',
        subtitle: 'Rain · Forest · Streams',
        description: 'Sounds of rain and birds to make you feel relaxed and less stressed.',
        icon: '🌿',
        mood: 'Stress Relief',
        moodColor: '#4CAF50',
        spotifyId: '37i9dQZF1DX4PP3DA4J0N8',
        gradient: 'linear-gradient(135deg, #0a2a1a 0%, #051a0d 100%)',
        accentColor: '#4CAF50',
    },
    {
        id: 'jazz',
        title: 'Study Jazz',
        subtitle: 'Cool jazz · Late nights',
        description: 'Smooth and slow jazz music to keep you feeling creative and awake.',
        icon: '🎷',
        mood: 'Creative',
        moodColor: '#FF9800',
        spotifyId: '37i9dQZF1DX0SM0LYsmbMT',
        gradient: 'linear-gradient(135deg, #2a1a0a 0%, #1a0d05 100%)',
        accentColor: '#FF9800',
    },
];

const Beats = () => {
    const { activePlaylist, isPlaying, togglePlay } = useMusic();
    const [hovered, setHovered] = useState(null);

    return (
        <div className="page-container" style={{ paddingBottom: '3rem' }}>
            {/* Header */}
            <header style={{ marginBottom: '3rem' }}>
                <span style={{
                    fontSize: '0.8rem',
                    color: 'var(--color-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    fontWeight: 600,
                }}>
                    Focus / Beats
                </span>
                <h1 style={{
                    fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                    fontFamily: 'var(--font-serif)',
                    marginTop: '0.5rem',
                    color: 'var(--color-soft-black)',
                    lineHeight: 1.1,
                }}>
                    Sonic Landscapes
                </h1>
                <p style={{
                    fontSize: '1.05rem',
                    color: 'var(--color-text-secondary)',
                    maxWidth: '540px',
                    lineHeight: 1.6,
                    marginTop: '0.5rem',
                }}>
                    Choose your frequency. Curated Spotify playlists to tune your mind into deep flow.
                </p>
            </header>

            {/* Playlist Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                gap: '1.25rem',
                marginBottom: activePlaylist ? '2.5rem' : '0',
            }}>
                {SPOTIFY_PLAYLISTS.map((playlist) => {
                    const isActive = activePlaylist?.id === playlist.id;
                    const isHov = hovered === playlist.id;

                    return (
                        <button
                            key={playlist.id}
                            onClick={() => togglePlay(playlist)}
                            onMouseEnter={() => setHovered(playlist.id)}
                            onMouseLeave={() => setHovered(null)}
                            style={{
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem',
                                padding: '1.75rem',
                                borderRadius: '24px',
                                border: isActive
                                    ? `2px solid ${playlist.accentColor}80`
                                    : '2px solid var(--color-border)',
                                background: isActive ? playlist.gradient : 'white',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                                boxShadow: isActive
                                    ? `0 12px 40px ${playlist.accentColor}30`
                                    : isHov ? '0 8px 24px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
                                transform: isActive ? 'translateY(-3px)' : isHov ? 'translateY(-2px)' : 'none',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Glow orb behind active card */}
                            {isActive && (
                                <div style={{
                                    position: 'absolute',
                                    top: -40,
                                    right: -40,
                                    width: 150,
                                    height: 150,
                                    borderRadius: '50%',
                                    background: `${playlist.accentColor}20`,
                                    pointerEvents: 'none',
                                    filter: 'blur(30px)',
                                }} />
                            )}

                            {/* Icon row */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: '16px',
                                    background: isActive ? `${playlist.accentColor}25` : 'rgba(0,0,0,0.04)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.75rem',
                                    border: isActive ? `1px solid ${playlist.accentColor}30` : '1px solid transparent',
                                }}>
                                    {playlist.icon}
                                </div>

                                {isActive ? (
                                    <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 24 }}>
                                        {[1, 2, 3, 2, 1].map((h, i) => (
                                            <div key={i} style={{
                                                width: 4,
                                                borderRadius: 2,
                                                backgroundColor: playlist.accentColor,
                                                animation: `beatBar ${0.5 + i * 0.15}s ease-in-out infinite alternate`,
                                                height: `${h * 6}px`,
                                            }} />
                                        ))}
                                    </div>
                                ) : (
                                    <ChevronRight size={18} color="var(--color-text-secondary)" style={{ opacity: isHov ? 1 : 0, transition: 'opacity 0.2s' }} />
                                )}
                            </div>

                            {/* Title & Subtitle */}
                            <div>
                                <h4 style={{
                                    margin: 0,
                                    fontSize: '1.1rem',
                                    fontWeight: 700,
                                    color: isActive ? '#fff' : 'var(--color-soft-black)',
                                    fontFamily: 'var(--font-serif)',
                                    letterSpacing: '-0.2px',
                                }}>
                                    {playlist.title}
                                </h4>
                                <p style={{
                                    margin: '3px 0 0',
                                    fontSize: '0.8rem',
                                    color: isActive ? 'rgba(255,255,255,0.65)' : 'var(--color-text-secondary)',
                                    fontWeight: 500,
                                }}>
                                    {playlist.subtitle}
                                </p>
                            </div>

                            {/* Description */}
                            <p style={{
                                margin: 0,
                                fontSize: '0.88rem',
                                color: isActive ? 'rgba(255,255,255,0.8)' : 'var(--color-text-secondary)',
                                lineHeight: 1.5,
                            }}>
                                {playlist.description}
                            </p>

                            {/* Mood tag */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 5,
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    color: isActive ? playlist.accentColor : 'var(--color-text-secondary)',
                                    backgroundColor: isActive ? `${playlist.accentColor}15` : 'rgba(0,0,0,0.04)',
                                    padding: '4px 12px',
                                    borderRadius: 100,
                                }}>
                                    <Waves size={11} />
                                    {playlist.mood}
                                </span>
                                {isActive && (
                                    <span style={{
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        color: '#1DB954',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 4,
                                    }}>
                                        <span style={{ fontSize: '1rem' }}>🎵</span> Playing on Spotify
                                    </span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Spotify Embed Player (Persists in Overlay, but shown here too for immediate control) */}
            {activePlaylist && (
                <div
                    id="spotify-player"
                    style={{
                        borderRadius: '28px',
                        overflow: 'hidden',
                        boxShadow: `0 24px 64px ${activePlaylist.accentColor}25, 0 8px 24px rgba(0,0,0,0.12)`,
                        border: `1px solid ${activePlaylist.accentColor}20`,
                        transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
                        marginTop: '2rem'
                    }}
                >
                    <div style={{
                        background: activePlaylist.gradient,
                        padding: '1.5rem 2rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                    }}>
                        <div style={{
                            width: 44,
                            height: 44,
                            borderRadius: '12px',
                            background: `${activePlaylist.accentColor}25`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.4rem',
                            border: `1px solid ${activePlaylist.accentColor}30`,
                        }}>
                            {activePlaylist.icon}
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>{activePlaylist.title}</div>
                            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                                <Headphones size={11} style={{ display: 'inline', marginRight: 4 }} />
                                Streaming via Spotify
                            </div>
                        </div>
                    </div>

                    <iframe
                        title={`Spotify — ${activePlaylist.title}`}
                        src={`https://open.spotify.com/embed/playlist/${activePlaylist.spotifyId}?utm_source=generator&theme=0`}
                        width="100%"
                        height="380"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        style={{ display: 'block' }}
                    />
                </div>
            )}

            {!activePlaylist && (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem 2rem',
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.95rem',
                    opacity: 0.7,
                }}>
                    <Music2 size={32} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.4 }} />
                    Pick a playlist above to start listening
                </div>
            )}

            <style>{`
                @keyframes beatBar {
                    from { transform: scaleY(0.4); }
                    to { transform: scaleY(1); }
                }
            `}</style>
        </div>
    );
};

export default Beats;