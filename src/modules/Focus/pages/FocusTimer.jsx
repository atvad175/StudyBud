import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFocus } from '../../../context/useFocus';
import { Play, Clock, Timer, ChevronDown, Zap, RotateCcw } from 'lucide-react';
import styles from './FocusMenu.module.css';

const CATEGORIES = [
    'Deep Work',
    'School Homework',
    'School Research',
    'School Exam',
    'Test',
    'Project',
    'Personal',
];
const DURATION_PRESETS = [25, 45, 60, 90];

const GizmoRing = ({ active }) => (
    <div
        aria-hidden="true"
        style={{
            position: 'absolute',
            width: '120%',
            height: '120%',
            border: '1px dashed rgba(221, 168, 93, 0.3)',
            borderRadius: '50%',
            animation: active ? 'spin 10s linear infinite' : 'none',
            pointerEvents: 'none',
        }}
    />
);

const FocusTimer = () => {
    const navigate = useNavigate();
    const {
        isActive,
        isPaused,
        mode,
        setMode,
        duration,
        updateDuration,
        category,
        setCategory,
        startSession,
        formatTime,
        pendingSession,
        isSavingSession,
        retryPendingSessionSave,
        discardPendingSession,
    } = useFocus();

    const [isHovering, setIsHovering] = useState(false);
    const [startNotice, setStartNotice] = useState('');
    const currentMinutes = Math.floor(duration / 60);
    const controlsLocked = isActive || Boolean(pendingSession) || isSavingSession;

    const handleStart = () => {
        setStartNotice('');
        if (isActive) {
            navigate('/focus/active');
            return;
        }
        if (pendingSession) {
            setStartNotice('Save or discard your previous session before starting another one.');
            return;
        }
        const started = startSession();
        if (started) navigate('/focus/active');
        else setStartNotice('StudyBud could not start a new session. Check the message above and try again.');
    };

    const handleDiscard = () => {
        const confirmed = window.confirm(
            'Discard this unsaved focus session? It will be removed from this tab and cannot be added to your saved history.'
        );
        if (confirmed) {
            discardPendingSession();
            setStartNotice('');
        }
    };

    return (
        <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', paddingTop: '1.5rem', paddingBottom: '2rem' }}>
            {isActive && (
                <div role="status" className={styles.sessionNotice}>
                    <div>
                        <strong>Your focus session is already running.</strong>
                        <p>{category} · {isPaused ? 'Paused' : 'Timer active'} · {formatTime(timeLeft)}</p>
                    </div>
                    <button type="button" className={styles.noticePrimary} onClick={() => navigate('/focus/active')}>
                        Continue session <Play size={16} aria-hidden="true" />
                    </button>
                </div>
            )}

            {pendingSession && (
                <div role="alert" className={styles.sessionNotice}>
                    <div>
                        <strong>A previous session still needs saving.</strong>
                        <p>{pendingSession.category} · {formatTime(pendingSession.duration_seconds)} recorded. Save it before starting another session.</p>
                    </div>
                    <div className={styles.noticeActions}>
                        <button
                            type="button"
                            className={styles.noticePrimary}
                            onClick={async () => { await retryPendingSessionSave(); }}
                            disabled={isSavingSession}
                        >
                            {isSavingSession ? 'Saving…' : 'Retry save'} <RotateCcw size={15} aria-hidden="true" />
                        </button>
                        <button type="button" className={styles.noticeSecondary} onClick={handleDiscard} disabled={isSavingSession}>
                            Discard
                        </button>
                    </div>
                </div>
            )}

            <div
                className={styles.mainCard}
                style={{ position: 'relative', overflow: 'visible', maxWidth: '600px', width: '100%', boxSizing: 'border-box' }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
            >
                <GizmoRing active={isHovering && !controlsLocked} />

                <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                    <span className={styles.timerEyebrow}>FOCUS WORKSPACE</span>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.7rem, 4vw, 2.2rem)', marginBottom: '0.5rem' }}>Focus Engine</h2>
                    <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                        Pick a session length that fits the task in front of you.
                    </p>
                </div>

                <div className={styles.modeToggle} role="group" aria-label="Focus session type">
                    <button
                        type="button"
                        className={`${styles.modeBtn} ${mode === 'TIMER' ? styles.activeMode : ''}`}
                        onClick={() => setMode('TIMER')}
                        aria-pressed={mode === 'TIMER'}
                        disabled={controlsLocked}
                    >
                        <Timer size={16} aria-hidden="true" /> Timer
                    </button>
                    <button
                        type="button"
                        className={`${styles.modeBtn} ${mode === 'STOPWATCH' ? styles.activeMode : ''}`}
                        onClick={() => setMode('STOPWATCH')}
                        aria-pressed={mode === 'STOPWATCH'}
                        disabled={controlsLocked}
                    >
                        <Clock size={16} aria-hidden="true" /> Stopwatch
                    </button>
                </div>

                <div className={styles.timerDisplay} aria-live="polite">
                    <span className={styles.timeValue}>
                        {mode === 'TIMER' ? formatTime(duration) : '00:00'}
                    </span>
                    <p className={styles.durationSummary}>
                        {mode === 'TIMER' ? `${currentMinutes} minutes planned` : 'Count up while you work'}
                    </p>
                </div>

                {mode === 'TIMER' && (
                    <div className={styles.durationControl}>
                        <span className={styles.controlLabel}>Quick choices</span>
                        <div className={styles.durationPresets} role="group" aria-label="Quick timer durations">
                            {DURATION_PRESETS.map((minutes) => (
                                <button
                                    type="button"
                                    key={minutes}
                                    className={`${styles.presetButton} ${currentMinutes === minutes ? styles.activePreset : ''}`}
                                    onClick={() => updateDuration(minutes)}
                                    aria-pressed={currentMinutes === minutes}
                                    disabled={controlsLocked}
                                >
                                    {minutes} min
                                </button>
                            ))}
                        </div>

                        <label htmlFor="focus-duration" className={styles.controlLabel}>Custom duration</label>
                        <input
                            id="focus-duration"
                            type="range"
                            min="25"
                            max="180"
                            step="5"
                            value={currentMinutes}
                            onChange={(event) => updateDuration(Number(event.target.value))}
                            className={styles.slider}
                            aria-valuetext={`${currentMinutes} minutes`}
                            disabled={controlsLocked}
                        />
                        <div className={styles.rangeLabels}>
                            <span>25 min</span>
                            <span>180 min</span>
                        </div>
                    </div>
                )}

                <div className={styles.categorySection} style={{ marginTop: 0 }}>
                    <label htmlFor="focus-category">What are you working on?</label>
                    <div className={styles.selectWrapper}>
                        <select
                            id="focus-category"
                            value={category}
                            onChange={(event) => setCategory(event.target.value)}
                            className={styles.categorySelect}
                            disabled={controlsLocked}
                        >
                            {CATEGORIES.map((item) => (
                                <option key={item} value={item}>{item}</option>
                            ))}
                        </select>
                        <ChevronDown className={styles.selectIcon} size={20} aria-hidden="true" />
                    </div>
                </div>

                <button
                    type="button"
                    className={styles.startBtn}
                    onClick={handleStart}
                    disabled={isSavingSession || Boolean(pendingSession)}
                    aria-label={isActive ? 'Continue focus session' : mode === 'TIMER' ? `Start ${currentMinutes} minute focus session` : 'Start stopwatch session'}
                    title={isActive ? 'Continue active session' : 'Start focus session'}
                    style={{ transform: isHovering && !controlsLocked ? 'scale(1.04)' : 'scale(1)' }}
                >
                    {isActive ? <Play fill="currentColor" size={23} aria-hidden="true" /> : <Zap fill="currentColor" size={25} aria-hidden="true" />}
                    <span>{isActive ? 'Continue' : 'Start session'}</span>
                </button>

                {startNotice && <p className={styles.startNotice} role="status">{startNotice}</p>}
            </div>

            <p className={styles.timerFootnote}>
                Your timer keeps its place if you reload this tab. Focus sessions are saved to your account when you finish.
            </p>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default FocusTimer;
