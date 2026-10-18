import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FocusContext } from './FocusContextCore';
import { supabase } from '../supabaseClient';

export const FocusProvider = ({ children }) => {
    const [isActive, setIsActive] = useState(false);
    const [isPaused, setIsPaused] = useState(true);
    const [mode, setMode] = useState('TIMER');
    const [duration, setDuration] = useState(25 * 60);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [category, setCategory] = useState('Deep Work');
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saveError, setSaveError] = useState('');

    const timerRef = useRef(null);

    // Fetch only the signed-in user's focus history. RLS is still enforced in Postgres.
    useEffect(() => {
        let active = true;

        const fetchSessions = async () => {
            try {
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                if (authError) throw authError;
                if (!user) {
                    if (active) setSessions([]);
                    return;
                }

                const { data, error } = await supabase
                    .from('focus_sessions')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(50);
                if (error) throw error;
                if (active) setSessions(data || []);
            } catch (error) {
                console.error('Unable to load focus history:', error);
                if (active) setSessions([]);
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchSessions();
        return () => { active = false; };
    }, []);

    const saveSession = useCallback(async (actualDuration) => {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) throw new Error('Sign in to save focus sessions.');

        const sessionData = {
            user_id: user.id,
            category,
            duration_seconds: actualDuration,
            mode,
        };

        const { data, error } = await supabase
            .from('focus_sessions')
            .insert([sessionData])
            .select()
            .single();

        if (error) throw error;
        setSessions(previous => [data, ...previous]);
        return data;
    }, [category, mode]);

    const handleSessionComplete = useCallback(async () => {
        clearInterval(timerRef.current);
        setIsActive(false);
        setIsPaused(true);

        try {
            await saveSession(duration);
            setSaveError('');
        } catch (error) {
            console.error('Unable to save completed focus session:', error);
            setSaveError('Your focus timer finished, but the session could not be saved. Check your connection and try again.');
        }

        setTimeLeft(duration);
    }, [duration, saveSession]);

    // Keep interval callbacks pure: the zero-time transition is handled separately,
    // outside the React state updater.
    useEffect(() => {
        if (isActive && !isPaused) {
            timerRef.current = window.setInterval(() => {
                setTimeLeft(previous => mode === 'TIMER'
                    ? Math.max(0, previous - 1)
                    : previous + 1
                );
            }, 1000);
        } else {
            window.clearInterval(timerRef.current);
        }

        return () => window.clearInterval(timerRef.current);
    }, [isActive, isPaused, mode]);

    const completionStartedRef = useRef(false);
    useEffect(() => {
        if (!isActive || isPaused || mode !== 'TIMER' || timeLeft > 0) {
            if (!isActive) completionStartedRef.current = false;
            return undefined;
        }
        if (completionStartedRef.current) return undefined;

        completionStartedRef.current = true;
        const timeoutId = window.setTimeout(() => {
            void handleSessionComplete();
        }, 0);
        return () => window.clearTimeout(timeoutId);
    }, [isActive, isPaused, mode, timeLeft, handleSessionComplete]);

    const startSession = () => {
        completionStartedRef.current = false;
        setSaveError('');
        setIsActive(true);
        setIsPaused(false);
        if (mode === 'STOPWATCH') {
            setTimeLeft(0);
        }
    };

    const pauseSession = () => {
        setIsPaused(true);
    };

    const resumeSession = () => {
        setIsPaused(false);
    };

    const stopSession = async () => {
        setSaveError('');
        if (isActive) {
            const actualDuration = mode === 'TIMER' ? (duration - timeLeft) : timeLeft;
            if (actualDuration > 10) {
                try {
                    await saveSession(actualDuration);
                } catch (error) {
                    console.error('Unable to save stopped focus session:', error);
                    setSaveError('This focus session could not be saved. Your progress may be lost if you leave this screen.');
                    setIsActive(false);
                    setIsPaused(true);
                    if (mode === 'TIMER') setTimeLeft(duration);
                    else setTimeLeft(0);
                    return false;
                }
            }
        }
        setIsActive(false);
        setIsPaused(true);
        if (mode === 'TIMER') setTimeLeft(duration);
        else setTimeLeft(0);
        return true;
    };

    const updateDuration = (minutes) => {
        const seconds = minutes * 60;
        setDuration(seconds);
        setTimeLeft(seconds);
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

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
                saveError,
                clearSaveError: () => setSaveError('')
            }}
        >
            {children}
        </FocusContext.Provider>
    );
};

