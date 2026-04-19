import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

const FocusContext = createContext();

export const useFocus = () => {
    const context = useContext(FocusContext);
    if (!context) {
        throw new Error('useFocus must be used within a FocusProvider');
    }
    return context;
};

export const FocusProvider = ({ children }) => {
    const [isActive, setIsActive] = useState(false);
    const [isPaused, setIsPaused] = useState(true);
    const [mode, setMode] = useState('TIMER');
    const [duration, setDuration] = useState(25 * 60);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [category, setCategory] = useState('Deep Work');
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    const timerRef = useRef(null);

    // Fetch session history
    useEffect(() => {
        const fetchSessions = async () => {
            const { data } = await supabase
                .from('focus_sessions')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);
            if (data) setSessions(data);
            setLoading(false);
        };
        fetchSessions();
    }, []);

    // Timer Logic
    useEffect(() => {
        if (isActive && !isPaused) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (mode === 'TIMER') {
                        if (prev <= 1) {
                            handleSessionComplete();
                            return 0;
                        }
                        return prev - 1;
                    } else {
                        return prev + 1;
                    }
                });
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }

        return () => clearInterval(timerRef.current);
    }, [isActive, isPaused, mode]);

    const handleSessionComplete = async () => {
        clearInterval(timerRef.current);
        setIsActive(false);
        setIsPaused(true);

        const finalDuration = mode === 'TIMER' ? duration : timeLeft;
        await saveSession(finalDuration);

        if (mode === 'TIMER') setTimeLeft(duration);
        else setTimeLeft(0);
    };

    const saveSession = async (actualDuration) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const sessionData = {
                user_id: user.id,
                category,
                duration_seconds: actualDuration,
                mode
            };

            const { data, error } = await supabase
                .from('focus_sessions')
                .insert([sessionData])
                .select();

            if (data) setSessions(prev => [data[0], ...prev]);
        }
    };

    const startSession = () => {
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
        if (isActive) {
            const actualDuration = mode === 'TIMER' ? (duration - timeLeft) : timeLeft;
            if (actualDuration > 10) { // Only save if more than 10 seconds
                await saveSession(actualDuration);
            }
        }
        setIsActive(false);
        setIsPaused(true);
        if (mode === 'TIMER') setTimeLeft(duration);
        else setTimeLeft(0);
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
                loading
            }}
        >
            {children}
        </FocusContext.Provider>
    );
};

