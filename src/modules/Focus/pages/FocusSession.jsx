import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useFocus } from '../../../context/useFocus';
import { Minimize2, X, Clock, Timer } from 'lucide-react';
import styles from './FocusSession.module.css';

const FocusSession = () => {
    const navigate = useNavigate();
    const {
        isActive,
        isPaused,
        mode,
        duration,
        timeLeft,
        category,
        stopSession,
        pauseSession,
        resumeSession,
        formatTime,
        saveError,
        clearSaveError,
    } = useFocus();

    const [pipWindow, setPipWindow] = useState(null);
    const [pipError, setPipError] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());
    const pipWindowRef = useRef(null);

    useEffect(() => {
        const interval = window.setInterval(() => setCurrentTime(new Date()), 1000);
        return () => window.clearInterval(interval);
    }, []);

    // Close the auxiliary window when the user leaves the active session route.
    useEffect(() => () => {
        const activeWindow = pipWindowRef.current;
        if (activeWindow && !activeWindow.closed) activeWindow.close();
        pipWindowRef.current = null;
    }, []);

    const togglePiP = async () => {
        setPipError('');

        const activeWindow = pipWindowRef.current;
        if (activeWindow && !activeWindow.closed) {
            activeWindow.close();
            pipWindowRef.current = null;
            setPipWindow(null);
            return;
        }

        const pictureInPicture = window.documentPictureInPicture;
        if (!pictureInPicture || typeof pictureInPicture.requestWindow !== 'function') {
            setPipError('Mini Player is not supported in this browser. Keep this tab open to continue your focus session.');
            return;
        }

        try {
            const nextWindow = await pictureInPicture.requestWindow({
                width: 320,
                height: 210,
            });
            pipWindowRef.current = nextWindow;

            nextWindow.addEventListener('pagehide', () => {
                if (pipWindowRef.current === nextWindow) {
                    pipWindowRef.current = null;
                    setPipWindow(null);
                }
            }, { once: true });

            setPipWindow(nextWindow);
        } catch (error) {
            console.error('Unable to open the Focus Mini Player:', error);
            setPipWindow(null);
            pipWindowRef.current = null;
            setPipError('The Mini Player could not be opened. Your focus timer is still running in this tab.');
        }
    };

    const handleExit = async () => {
        const saved = await stopSession();
        if (saved) navigate('/focus');
    };

    return (
        <div className={styles.standbyContainer}>
            <div className={styles.topBar}>
                <div className={styles.categoryBadge}>{category}</div>
                <div className={styles.controls}>
                    <button
                        type="button"
                        onClick={togglePiP}
                        className={styles.iconBtn}
                        title={pipWindow ? 'Close Mini Player' : 'Open Mini Player'}
                        aria-label={pipWindow ? 'Close Mini Player' : 'Open Mini Player'}
                    >
                        <Minimize2 size={24} aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        onClick={handleExit}
                        className={styles.iconBtn}
                        title="Exit focus session"
                        aria-label="Exit focus session"
                    >
                        <X size={24} aria-hidden="true" />
                    </button>
                </div>
            </div>

            {pipError && (
                <p className={styles.pipSupportMessage} role="status" aria-live="polite">
                    {pipError}
                </p>
            )}

            {saveError && (
                <div role="alert" aria-live="polite" style={{ margin: '1rem auto 0', maxWidth: '680px', padding: '1rem 1.25rem', borderRadius: '14px', background: '#fff4e5', color: '#7a4200', textAlign: 'center' }}>
                    <p>{saveError}</p>
                    <button
                        type="button"
                        onClick={() => {
                            clearSaveError();
                            navigate('/focus');
                        }}
                        style={{ marginTop: '0.75rem', padding: '0.65rem 1rem', borderRadius: '10px', border: '1px solid currentColor', background: 'transparent', cursor: 'pointer' }}
                    >
                        Exit without saving this session
                    </button>
                </div>
            )}

            <div className={styles.centerStage}>
                <div className={styles.mainTimer} role="timer" aria-live="off">
                    {formatTime(timeLeft)}
                </div>
                <div className={styles.statusText}>
                    {isPaused ? 'Paused' : 'Focusing...'}
                </div>
                <button
                    type="button"
                    className={styles.toggleBtn}
                    onClick={isPaused ? resumeSession : pauseSession}
                    aria-pressed={!isPaused}
                >
                    {isPaused ? 'Resume' : 'Pause'}
                </button>
            </div>

            <div className={styles.widgetsRow}>
                <div className={styles.widget}>
                    <Clock size={16} aria-hidden="true" />
                    <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className={styles.widget}>
                    <Timer size={16} aria-hidden="true" />
                    <span>{mode === 'TIMER' ? `${Math.round(duration / 60)}-minute timer` : 'Stopwatch session'}</span>
                </div>
            </div>

            {pipWindow && !pipWindow.closed && createPortal(
                <div style={{
                    boxSizing: 'border-box',
                    minHeight: '100vh',
                    width: '100%',
                    padding: '18px 20px',
                    background: 'linear-gradient(145deg, #302a25, #1f1b18)',
                    color: '#faf6ee',
                    fontFamily: 'system-ui, sans-serif',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: '8px',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        color: '#dda85d',
                        fontSize: '12px',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                    }}>
                        <span>{category}</span>
                        <span>{isPaused ? 'Paused' : 'Focusing'}</span>
                    </div>
                    <strong style={{
                        display: 'block',
                        fontSize: 'clamp(44px, 18vw, 64px)',
                        lineHeight: 1.05,
                        fontWeight: 500,
                        letterSpacing: '-0.04em',
                        fontVariantNumeric: 'tabular-nums',
                        textAlign: 'center',
                    }}>
                        {formatTime(timeLeft)}
                    </strong>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '8px' }}>
                        <button
                            type="button"
                            onClick={isPaused ? resumeSession : pauseSession}
                            style={{
                                border: '1px solid rgba(255,255,255,0.25)',
                                borderRadius: '999px',
                                padding: '8px 18px',
                                background: 'rgba(255,255,255,0.08)',
                                color: '#fff',
                                cursor: 'pointer',
                            }}
                        >
                            {isPaused ? 'Resume' : 'Pause'}
                        </button>
                        <button
                            type="button"
                            onClick={() => pipWindowRef.current?.close()}
                            style={{
                                border: '1px solid rgba(221,168,93,0.5)',
                                borderRadius: '999px',
                                padding: '8px 14px',
                                background: 'rgba(221,168,93,0.12)',
                                color: '#f5d6a1',
                                cursor: 'pointer',
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>,
                pipWindow.document.body
            )}
        </div>
    );
};

export default FocusSession;
