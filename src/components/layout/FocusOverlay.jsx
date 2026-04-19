import React, { useState, useEffect } from 'react';
import { Play, Pause, X, Music, Timer, ChevronUp, ChevronDown, Minimize2, Maximize2, Headphones } from 'lucide-react';
import { useFocus } from '../../context/FocusContext';
import { useMusic } from '../../context/MusicContext';

const FocusOverlay = () => {
    const { isActive, timeLeft, formatTime, isPaused, resumeSession, pauseSession, stopSession, category } = useFocus();
    const { activePlaylist, isPlaying, togglePlay, stopMusic } = useMusic();
    const [isMinimized, setIsMinimized] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Show overlay when something is active
    useEffect(() => {
        if (isActive || activePlaylist) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [isActive, activePlaylist]);

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            zIndex: 9999,
            width: isMinimized ? '60px' : '320px',
            height: isMinimized ? '60px' : 'auto',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderRadius: isMinimized ? '30px' : '28px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            padding: isMinimized ? '0' : '1.25rem',
            transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            cursor: isMinimized ? 'pointer' : 'default',
        }}
        onClick={() => isMinimized && setIsMinimized(false)}
        >
            {/* Minimized State Icon */}
            {isMinimized && (
                <div style={{ 
                    width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative'
                }}>
                    {isActive ? (
                        <div style={{ color: '#C9883A', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Timer size={24} />
                        </div>
                    ) : (
                        <div style={{ color: '#C9883A' }}>
                            <Music size={24} style={{ animation: isPlaying ? 'rotate 4s linear infinite' : 'none' }} />
                        </div>
                    )}
                    {/* Activity dot */}
                    <div style={{
                        position: 'absolute', top: '15px', right: '15px', width: '8px', height: '8px',
                        borderRadius: '50%', background: isPlaying || (isActive && !isPaused) ? '#4CAF50' : '#FF9800',
                        border: '2px solid white'
                    }} />
                </div>
            )}

            {!isMinimized && (
                <>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ 
                                width: '36px', height: '36px', borderRadius: '12px', 
                                background: 'linear-gradient(135deg, #C9883A 0%, #A66D2D 100%)', 
                                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(201, 136, 58, 0.2)'
                            }}>
                                {isActive ? <Timer size={18} /> : <Headphones size={18} />}
                            </div>
                            <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1a1a1a', letterSpacing: '-0.01em' }}>
                                    Focus Hub
                                </div>
                                <div style={{ fontSize: '0.65rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
                                    {isActive ? 'Session Active' : 'Music Playing'}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }}
                                style={{ background: 'rgba(0,0,0,0.05)', border: 'none', width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#666' }}
                            >
                                <Minimize2 size={16} />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); stopSession(); stopMusic(); }}
                                style={{ background: 'rgba(231, 76, 60, 0.1)', border: 'none', width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#e74c3c' }}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Timer Section */}
                    {isActive && (
                        <div style={{ 
                            background: 'rgba(201, 136, 58, 0.05)', 
                            padding: '1rem', 
                            borderRadius: '20px',
                            border: '1px solid rgba(201, 136, 58, 0.1)',
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center'
                        }}>
                            <div>
                                <div style={{ fontSize: '0.65rem', color: '#A66D2D', textTransform: 'uppercase', fontWeight: '700', marginBottom: '2px' }}>
                                    {category || 'Focusing'}
                                </div>
                                <div style={{ fontSize: '1.8rem', fontWeight: '800', fontFamily: 'monospace', color: '#1a1a1a', letterSpacing: '-0.02em' }}>
                                    {formatTime(timeLeft)}
                                </div>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); isPaused ? resumeSession() : pauseSession(); }}
                                style={{ 
                                    width: '48px', height: '48px', borderRadius: '16px', 
                                    background: '#C9883A', color: '#fff',
                                    border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                    cursor: 'pointer', boxShadow: '0 4px 15px rgba(201, 136, 58, 0.3)',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                {isPaused ? <Play size={22} fill="currentColor" /> : <Pause size={22} fill="currentColor" />}
                            </button>
                        </div>
                    )}

                    {/* Music Section */}
                    {activePlaylist && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '12px',
                                background: 'rgba(0,0,0,0.03)',
                                padding: '0.75rem',
                                borderRadius: '18px'
                            }}>
                                <div style={{ 
                                    width: '42px', height: '42px', borderRadius: '12px', 
                                    background: activePlaylist.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.3rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}>
                                    {activePlaylist.icon}
                                </div>
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {activePlaylist.title}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isPlaying ? '#1DB954' : '#ccc' }} />
                                        Spotify Stream
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); togglePlay(activePlaylist); }}
                                    style={{ background: 'white', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#C9883A', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                                >
                                    {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                                </button>
                            </div>
                            
                            {/* Hidden/Collapsed Spotify Player */}
                            <div style={{ 
                                height: '80px', 
                                borderRadius: '16px', 
                                overflow: 'hidden', 
                                border: '1px solid rgba(0,0,0,0.05)',
                                background: '#000'
                            }}>
                                <iframe
                                    src={`https://open.spotify.com/embed/playlist/${activePlaylist.spotifyId}?utm_source=generator&theme=0`}
                                    width="100%"
                                    height="80"
                                    frameBorder="0"
                                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    )}
                </>
            )}

            <style>{`
                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default FocusOverlay;