import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useFocus } from '../../../context/useFocus';
import { Minimize2, X, Clock, Timer, CheckCircle2, RotateCcw } from 'lucide-react';
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
        completed,
        pendingSession,
        isSavingSession,
        retryPendingSessionSave,
        discardPendingSession,
    } = useFocus();

    const [pipWindow, setPipWindow] = useState(null);
    const [pipError, setPipError] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());
    const pipWindowRef = useRef(null);

    useEffect(() => {
        const interval = window.setInterval(() => setCurrentTime(new Date()), 1000);
        return () => window.clearInterval(interval);
    }, []);

    // A direct reload of this route resumes a recoverable session; otherwise go back
    // to the Focus screen instead of showing a misleading idle timer.
    useEffect(() => {
        if (!isActive && !completed && !pendingSession) {
            navigate('/focus', { replace: true });
        }
    }, [completed, isActive, navigate, pendingSession]);

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
            const nextWindow = await pictureInPicture.requestWindow({ width: 320, height: 220 });
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
        if (isSavingSession || pendingSession) return;
        if (completed || !isActive) {
            navigate('/focus');
            return;
        }
        const saved = await stopSession();
        if (saved) navigate('/focus');
    };

    const handleDiscard = () => {
        const confirmed = window.confirm(
            'Discard this unsaved focus session? It will be removed from this tab and cannot be added to your saved history.'
        );
        if (confirmed && discardPendingSession()) navigate('/focus');
    };

    const statusMessage = pendingSession
        ? (pendingSession.reason === 'completed' ? 'Session complete · Save pending' : 'Session stopped · Save pending')
        : completed
            ? 'Session complete!'
            : isPaused ? 'Paused' : 'Focusing…';

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
                        title={pendingSession ? 'Save or discard this session first' : 'Exit focus session'}
                        aria-label="Exit focus session"
                        disabled={isSavingSession || Boolean(pendingSession)}
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

            {saveError && pendingSession && (
                <div role="alert" aria-live="polite" style={{
                    margin: '1rem auto 0',
                    maxWidth: '680px',
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '1rem 1.25rem',
                    borderRadius: '14px',
                    background: '#fff4e5',
                    color: '#7a4200',
                    textAlign: 'center',
                }}>
                    <p style={{ lineHeight: 1.55, margin: 0 }}>{saveError}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.65rem', marginTop: '0.85rem' }}>
                        <button
                            type="button"
                            onClick={() => { void retryPendingSessionSave(); }}
                            disabled={isSavingSession}
                            style={{ padding: '0.7rem 1rem', borderRadius: '999px', border: '1px solid #7a4200', background: '#7a4200', color: '#fff', cursor: isSavingSession ? 'wait' : 'pointer' }}
                        >
                            <RotateCcw size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} aria-hidden="true" />
                            {isSavingSession ? 'Saving…' : 'Retry saving session'}
                        </button>
                        <button
                            type="button"
                            onClick={handleDiscard}
                            disabled={isSavingSession}
                            style={{ padding: '0.7rem 1rem', borderRadius: '999px', border: '1px solid #7a4200', background: 'transparent', color: '#7a4200', cursor: isSavingSession ? 'wait' : 'pointer' }}
                        >
                            Discard unsaved session
                        </button>
                    </div>
                </div>
            )}

            <div className={styles.centerStage}>
                <div className={styles.mainTimer} role="timer" aria-live="off">
                    {formatTime(timeLeft)}
                </div>
                <div className={styles.statusText} role="status" aria-live="polite">
                    {statusMessage}
                </div>

                {isActive && (
                    <button
                        type="button"
                        className={styles.toggleBtn}
                        onClick={isPaused ? resumeSession : pauseSession}
                        aria-pressed={!isPaused}
                    >
                        {isPaused ? 'Resume' : 'Pause'}
                    </button>
                )}

                {completed && !pendingSession && (
                    <div className={styles.completionPanel} role="status">
                        <CheckCircle2 size={24} aria-hidden="true" />
                        <span>Your focus session has been recorded.</span>
                        <button type="button" className={styles.toggleBtn} onClick={() => navigate('/focus')}>
                            Back to Focus
                        </button>
                    </div>
                )}
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
                        <span>{pendingSession ? 'Save pending' : completed ? 'Complete' : isPaused ? 'Paused' : 'Focusing'}</span>
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
                            disabled={!isActive || Boolean(pendingSession) || completed}
                            style={{
                                border: '1px solid rgba(255,255,255,0.25)',
                                borderRadius: '999px',
                                padding: '8px 18px',
                                background: 'rgba(255,255,255,0.08)',
                                color: '#fff',
                                cursor: isActive ? 'pointer' : 'not-allowed',
                                opacity: isActive ? 1 : 0.55,
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
