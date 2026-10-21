import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FocusContext } from './FocusContextCore.js';
import { supabase } from '../supabaseClient';
import {
    ACTIVE_FOCUS_SESSION_KEY,
    PENDING_FOCUS_SESSION_KEY,
    hydrateActiveFocusSession,
    readPendingFocusSession,
    readStoredJson,
    remainingSeconds,
    removeStoredValue,
    stopwatchElapsedSeconds,
    writeStoredJson,
} from '../modules/Focus/focusTimerUtils.js';

const DEFAULT_DURATION = 25 * 60;
const MIN_SAVED_DURATION = 10;

const loadActiveRuntime = () =>
    hydrateActiveFocusSession(readStoredJson(ACTIVE_FOCUS_SESSION_KEY), Date.now());

export const FocusProvider = ({ children }) => {
    const [restoredRuntime] = useState(loadActiveRuntime);
    const [initialPendingSession] = useState(readPendingFocusSession);
    const [isActive, setIsActive] = useState(() => Boolean(restoredRuntime?.isActive));
    const [isPaused, setIsPaused] = useState(() => restoredRuntime?.isPaused ?? true);
    const [mode, setModeState] = useState(() =>
        restoredRuntime?.mode ?? initialPendingSession?.mode ?? 'TIMER'
    );
    const [duration, setDuration] = useState(() => {
        if (restoredRuntime?.duration > 0) return restoredRuntime.duration;
        if (initialPendingSession?.configured_duration > 0) return initialPendingSession.configured_duration;
        return DEFAULT_DURATION;
    });
    const [timeLeft, setTimeLeft] = useState(() => {
        if (!initialPendingSession) return restoredRuntime?.timeLeft ?? DEFAULT_DURATION;
        return initialPendingSession.reason === 'completed' ? 0 : initialPendingSession.duration_seconds;
    });
    const [category, setCategoryState] = useState(() =>
        restoredRuntime?.category ?? initialPendingSession?.category ?? 'Deep Work'
    );
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [pendingSession, setPendingSession] = useState(initialPendingSession);
    const [isSavingSession, setIsSavingSession] = useState(false);
    const [saveError, setSaveError] = useState(() =>
        initialPendingSession ? 'A focus session still needs saving. Retry the save before starting another session.' : ''
    );
    const [completed, setCompleted] = useState(() => initialPendingSession?.reason === 'completed');
    const [currentUserId, setCurrentUserId] = useState(null);

    const timerRef = useRef(null);
    const deadlineRef = useRef(restoredRuntime?.deadlineAt ?? null);
    const stopwatchStartedAtRef = useRef(restoredRuntime?.stopwatchStartedAt ?? null);
    const stopwatchElapsedBaseRef = useRef(
        restoredRuntime?.stopwatchElapsedBase ?? (
            restoredRuntime?.mode === 'STOPWATCH' ? restoredRuntime?.timeLeft ?? 0 : 0
        )
    );
    const completionStartedRef = useRef(false);
    const savingRef = useRef(false);

    useEffect(() => {
        let active = true;

        const fetchSessions = async () => {
            setLoadError('');
            try {
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                if (authError) throw authError;
                if (!user) {
                    if (active) {
                        setCurrentUserId(null);
                        setSessions([]);
                    }
                    return;
                }

                const { data, error } = await supabase
                    .from('focus_sessions')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(50);
                if (error) throw error;
                if (active) {
                    setCurrentUserId(user.id);
                    setSessions(data || []);
                }
            } catch (error) {
                console.error('Unable to load focus history:', error);
                if (active) {
                    setSessions([]);
                    setLoadError('Your saved focus history could not be loaded. You can still use the timer; reload this page when your connection is stable.');
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchSessions();
        return () => { active = false; };
    }, []);

    const persistSessionDraft = useCallback(async (draft) => {
        if (savingRef.current) return false;

        savingRef.current = true;
        setIsSavingSession(true);
        let retryDraft = draft;
        setPendingSession(draft);
        writeStoredJson(PENDING_FOCUS_SESSION_KEY, draft);

        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError) throw authError;
            if (!user) throw new Error('SIGN_IN_REQUIRED');
            if (draft.owner_user_id && draft.owner_user_id !== user.id) {
                throw new Error('WRONG_ACCOUNT');
            }

            // Adopt the authenticated owner before sending the insert. The draft is
            // stored locally first, so transient network failures do not erase it.
            const ownedDraft = {
                ...draft,
                owner_user_id: user.id,
            };
            retryDraft = ownedDraft;
            setPendingSession(ownedDraft);
            writeStoredJson(PENDING_FOCUS_SESSION_KEY, ownedDraft);

            // If the database accepted an earlier insert but its response was lost,
            // the stable timestamp and session fields let a retry find that record.
            const { data: existing, error: lookupError } = await supabase
                .from('focus_sessions')
                .select('*')
                .eq('user_id', user.id)
                .eq('created_at', ownedDraft.created_at)
                .eq('category', ownedDraft.category)
                .eq('duration_seconds', ownedDraft.duration_seconds)
                .eq('mode', ownedDraft.mode)
                .maybeSingle();

            if (lookupError) throw lookupError;

            let savedSession = existing;
            if (!savedSession) {
                const { version, reason, configured_duration, owner_user_id, ...record } = ownedDraft;
                const { data, error } = await supabase
                    .from('focus_sessions')
                    .insert([{ ...record, user_id: user.id }])
                    .select()
                    .single();
                if (error) throw error;
                if (!data) throw new Error('The database did not confirm that the session was saved.');
                savedSession = data;
            }

            setSessions(previous => [
                savedSession,
                ...previous.filter(session => session.id !== savedSession.id),
            ].slice(0, 50));
            setCurrentUserId(user.id);
            setPendingSession(null);
            removeStoredValue(PENDING_FOCUS_SESSION_KEY);
            setSaveError('');
            setCompleted(ownedDraft.reason === 'completed');
            return true;
        } catch (error) {
            console.error('Unable to save focus session:', error);
            setPendingSession(retryDraft);
            writeStoredJson(PENDING_FOCUS_SESSION_KEY, retryDraft);

            if (error?.message === 'SIGN_IN_REQUIRED') {
                setSaveError('Your focus session is kept in this tab, but saving requires you to sign in. Sign in to retry, or explicitly discard this session.');
            } else if (error?.message === 'WRONG_ACCOUNT') {
                setSaveError('This session belongs to a different account. Sign in to the account that started it, or explicitly discard the session.');
            } else {
                setSaveError('StudyBud could not confirm that this session was saved. Your session is kept in this tab. Check your connection and retry; duplicate records are checked before retrying.');
            }
            return false;
        } finally {
            savingRef.current = false;
            setIsSavingSession(false);
        }
    }, []);

    const retryPendingSessionSave = useCallback(async () => {
        if (!pendingSession) return true;
        return persistSessionDraft(pendingSession);
    }, [pendingSession, persistSessionDraft]);

    const discardPendingSession = useCallback(() => {
        if (savingRef.current) return false;
        setPendingSession(null);
        removeStoredValue(PENDING_FOCUS_SESSION_KEY);
        setSaveError('');
        setCompleted(false);
        setTimeLeft(mode === 'TIMER' ? duration : 0);
        return true;
    }, [duration, mode]);

    const createDraft = useCallback((actualDuration, reason, actualMode = mode) => ({
        version: 1,
        category,
        duration_seconds: Math.max(0, Math.floor(actualDuration)),
        configured_duration: actualMode === 'TIMER' ? duration : 0,
        mode: actualMode,
        reason,
        created_at: new Date().toISOString(),
        owner_user_id: currentUserId,
    }), [category, currentUserId, duration, mode]);

    const finishTimerSession = useCallback(async () => {
        if (completionStartedRef.current) return;
        completionStartedRef.current = true;

        window.clearInterval(timerRef.current);
        timerRef.current = null;
        deadlineRef.current = null;
        stopwatchStartedAtRef.current = null;
        removeStoredValue(ACTIVE_FOCUS_SESSION_KEY);

        setIsActive(false);
        setIsPaused(true);
        setTimeLeft(0);
        setCompleted(true);

        const draft = createDraft(duration, 'completed', 'TIMER');
        return persistSessionDraft(draft);
    }, [createDraft, duration, persistSessionDraft]);

    // The deadline is the source of truth for timers, so tab throttling and sleep
    // do not make a 25-minute session silently run longer than 25 minutes.
    useEffect(() => {
        if (!isActive || isPaused) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
            return undefined;
        }

        if (mode === 'TIMER' && !deadlineRef.current) {
            deadlineRef.current = Date.now() + (timeLeft * 1000);
        }
        if (mode === 'STOPWATCH' && !stopwatchStartedAtRef.current) {
            stopwatchStartedAtRef.current = Date.now();
        }

        const tick = () => {
            if (mode === 'TIMER') {
                const remaining = remainingSeconds(deadlineRef.current, Date.now());
                setTimeLeft(previous => previous === remaining ? previous : remaining);
                if (remaining === 0) {
                    void finishTimerSession();
                }
                return;
            }

            const elapsed = stopwatchElapsedSeconds(
                stopwatchStartedAtRef.current,
                stopwatchElapsedBaseRef.current,
                Date.now()
            );
            setTimeLeft(previous => previous === elapsed ? previous : elapsed);
        };

        tick();
        timerRef.current = window.setInterval(tick, 250);

        return () => {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
        };
    }, [finishTimerSession, isActive, isPaused, mode, timeLeft]);

    // Keep a recoverable copy of an in-progress session across reloads in this tab.
    useEffect(() => {
        if (!isActive) {
            removeStoredValue(ACTIVE_FOCUS_SESSION_KEY);
            return;
        }

        writeStoredJson(ACTIVE_FOCUS_SESSION_KEY, {
            version: 1,
            isActive,
            isPaused,
            mode,
            duration,
            timeLeft,
            category,
            deadlineAt: deadlineRef.current,
            stopwatchStartedAt: stopwatchStartedAtRef.current,
            stopwatchElapsedBase: stopwatchElapsedBaseRef.current,
        });
    }, [category, duration, isActive, isPaused, mode, timeLeft]);

    const startSession = useCallback(() => {
        if (isActive) return false;
        if (pendingSession || savingRef.current) {
            setSaveError('Save or explicitly discard the previous session before starting another one.');
            return false;
        }

        const startingTime = Date.now();
        completionStartedRef.current = false;
        setSaveError('');
        setCompleted(false);
        setTimeLeft(mode === 'TIMER' ? duration : 0);

        if (mode === 'TIMER') {
            deadlineRef.current = startingTime + (duration * 1000);
            stopwatchStartedAtRef.current = null;
            stopwatchElapsedBaseRef.current = 0;
        } else {
            deadlineRef.current = null;
            stopwatchElapsedBaseRef.current = 0;
            stopwatchStartedAtRef.current = startingTime;
        }

        setIsActive(true);
        setIsPaused(false);
        writeStoredJson(ACTIVE_FOCUS_SESSION_KEY, {
            version: 1,
            isActive: true,
            isPaused: false,
            mode,
            duration,
            timeLeft: mode === 'TIMER' ? duration : 0,
            category,
            deadlineAt: deadlineRef.current,
            stopwatchStartedAt: stopwatchStartedAtRef.current,
            stopwatchElapsedBase: 0,
        });
        return true;
    }, [category, duration, isActive, mode, pendingSession]);

    const pauseSession = useCallback(() => {
        if (!isActive || isPaused) return;

        if (mode === 'TIMER') {
            const remaining = remainingSeconds(deadlineRef.current, Date.now());
            if (remaining === 0) {
                setTimeLeft(0);
                void finishTimerSession();
                return;
            }
            deadlineRef.current = null;
            setTimeLeft(remaining);
        } else {
            const elapsed = stopwatchElapsedSeconds(
                stopwatchStartedAtRef.current,
                stopwatchElapsedBaseRef.current,
                Date.now()
            );
            stopwatchElapsedBaseRef.current = elapsed;
            stopwatchStartedAtRef.current = null;
            setTimeLeft(elapsed);
        }
        setIsPaused(true);
    }, [finishTimerSession, isActive, isPaused, mode]);

    const resumeSession = useCallback(() => {
        if (!isActive || !isPaused) return;

        if (mode === 'TIMER') {
            deadlineRef.current = Date.now() + (timeLeft * 1000);
        } else {
            stopwatchStartedAtRef.current = Date.now();
            stopwatchElapsedBaseRef.current = timeLeft;
        }
        setIsPaused(false);
    }, [isActive, isPaused, mode, timeLeft]);

    const stopSession = useCallback(async () => {
        if (pendingSession || savingRef.current) return false;

        if (!isActive) {
            if (!completed) setTimeLeft(mode === 'TIMER' ? duration : 0);
            return true;
        }

        let actualDuration = 0;
        if (mode === 'TIMER') {
            const remaining = isPaused
                ? timeLeft
                : remainingSeconds(deadlineRef.current, Date.now());
            if (remaining === 0) return finishTimerSession();
            actualDuration = Math.max(0, duration - remaining);
        } else {
            actualDuration = stopwatchElapsedSeconds(
                stopwatchStartedAtRef.current,
                stopwatchElapsedBaseRef.current,
                Date.now()
            );
        }

        window.clearInterval(timerRef.current);
        timerRef.current = null;
        deadlineRef.current = null;
        stopwatchStartedAtRef.current = null;
        removeStoredValue(ACTIVE_FOCUS_SESSION_KEY);
        setIsActive(false);
        setIsPaused(true);
        setCompleted(false);
        setTimeLeft(mode === 'TIMER' ? duration : 0);

        if (actualDuration < MIN_SAVED_DURATION) return true;

        const draft = createDraft(actualDuration, 'stopped');
        const saved = await persistSessionDraft(draft);
        if (!saved) setTimeLeft(actualDuration);
        return saved;
    }, [completed, createDraft, duration, finishTimerSession, isActive, isPaused, mode, pendingSession, persistSessionDraft, timeLeft]);

    const updateDuration = useCallback((minutes) => {
        if (isActive || pendingSession || savingRef.current) return;
        const safeMinutes = Math.round(Math.min(180, Math.max(25, Number(minutes) || 25)) / 5) * 5;
        const seconds = safeMinutes * 60;
        setDuration(seconds);
        setTimeLeft(seconds);
        setCompleted(false);
        setSaveError('');
    }, [isActive, pendingSession]);

    const setMode = useCallback((nextMode) => {
        if (isActive || pendingSession || savingRef.current) return;
        if (!['TIMER', 'STOPWATCH'].includes(nextMode)) return;
        setModeState(nextMode);
        setTimeLeft(nextMode === 'TIMER' ? duration : 0);
        setCompleted(false);
        setSaveError('');
    }, [duration, isActive, pendingSession]);

    const setCategory = useCallback((nextCategory) => {
        if (isActive || pendingSession || savingRef.current || typeof nextCategory !== 'string') return;
        setCategoryState(nextCategory.slice(0, 100));
    }, [isActive, pendingSession]);

    const formatTime = useCallback((seconds) => {
        const normalized = Math.max(0, Math.floor(Number(seconds) || 0));
        const minutes = Math.floor(normalized / 60);
        const remainder = normalized % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
    }, []);

    return (
        <FocusContext.Provider
            value={{
                isActive,
                isPaused,
                mode,
                setMode,
                duration,
                updateDuration,
                timeLeft,
                category,
                setCategory,
                startSession,
                pauseSession,
                resumeSession,
                stopSession,
                formatTime,
                sessions,
                loading,
                loadError,
                saveError,
                clearSaveError: () => setSaveError(''),
                completed,
                pendingSession,
                isSavingSession,
                retryPendingSessionSave,
                discardPendingSession,
            }}
        >
            {children}
        </FocusContext.Provider>
    );
};
