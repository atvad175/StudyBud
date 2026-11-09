import React, { useState, useEffect, useRef } from 'react';
import { HabitsContext } from './HabitsContextCore.js';
import { supabase } from '../supabaseClient';
import { getLocalDateKey } from '../utils/localDateKey';
import { buildHabitLogMap, buildHabitLogPayload } from '../modules/Habits/habitLogUtils.js';

export const HabitsProvider = ({ children }) => {
    const [atoms, setAtoms] = useState([]);
    const [logs, setLogs] = useState({});
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);
    const habitMutationLocksRef = useRef(new Set());

    const refreshHabits = () => setRefreshKey(value => value + 1);

    // Refresh provider state when onboarding creates its optional starter habit.
    useEffect(() => {
        let active = true;

        const handleStarterHabitCreated = async (event) => {
            const userId = event.detail?.userId;
            const habit = event.detail?.habit;
            if (!userId || !habit) return;

            try {
                const { data: { user }, error } = await supabase.auth.getUser();
                if (error) throw error;
                if (!active || !user || user.id !== userId) return;

                setAtoms(current => {
                    const byId = new Map(current.map(item => [String(item.id), item]));
                    byId.set(String(habit.id), habit);
                    return [...byId.values()];
                });
            } catch (error) {
                console.error('Unable to refresh the new starter habit:', error?.code || 'unknown');
            }
        };

        window.addEventListener('studybud-starter-habit-created', handleStarterHabitCreated);

        const fetchData = async () => {
            try {
                setLoading(true);
                setLoadError('');
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                if (authError) throw authError;
                if (!user) {
                    if (active) {
                        setAtoms([]);
                        setLogs({});
                        setLoadError('');
                    }
                    return;
                }

                const { data: atomsData, error: atomsError } = await supabase
                    .from('atoms')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: true })
                    .limit(300);

                if (atomsError) throw atomsError;
                if (!active) return;

                // Merge rather than replace so a habit created while initial loading
                // is in flight is not erased by a stale query response.
                setAtoms(current => {
                    const byId = new Map(current.map(item => [String(item.id), item]));
                    (atomsData || []).forEach(item => byId.set(String(item.id), item));
                    return [...byId.values()].sort((a, b) =>
                        new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
                    );
                });

                const { data: logsData, error: logsError } = await supabase
                    .from('logs')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('date_logged', { ascending: false })
                    .limit(1200);

                if (logsError) throw logsError;
                if (!active) return;

                setLogs(buildHabitLogMap(logsData || []));
            } catch (error) {
                if (active) {
                    console.error('Error fetching habits data:', error?.code || 'unknown');
                    setLoadError('Some saved habits or daily logs could not be loaded. Your existing records have not been deleted.');
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        void fetchData();
        return () => {
            active = false;
            window.removeEventListener('studybud-starter-habit-created', handleStarterHabitCreated);
        };
    }, [refreshKey]);

    const addAtom = async (atom) => {
        const tempId = 'optimistic-' + Date.now() + '-' + Math.random().toString(36).slice(2);
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) throw new Error('Sign in to save habits.');

            const payload = {
                title: atom.title,
                frequency: atom.frequency || 'daily',
                category: atom.category || 'study',
                fission_entry: atom.fission_entry || '',
                notes: atom.notes || '',
                time: atom.time || '',
                user_id: user.id,
            };
            setAtoms(prev => [...prev, { ...payload, id: tempId }]);

            const { data, error } = await supabase
                .from('atoms')
                .insert([payload])
                .select()
                .single();
            if (error) throw error;

            setAtoms(prev => prev.map(item => item.id === tempId ? data : item));
        } catch (error) {
            setAtoms(prev => prev.filter(item => item.id !== tempId));
            console.error('Error adding atom:', error);
            throw error;
        }
    };

    const getTodayLog = () => {
        const today = getLocalDateKey();
        return logs[today] || {};
    };

    const updateLog = async (atomId, data) => {
        const today = getLocalDateKey();
        const lockKey = 'atom:' + String(atomId);
        if (habitMutationLocksRef.current.has(lockKey)) {
            throw new Error('This habit is already being saved. Wait for that update to finish, then try again.');
        }
        habitMutationLocksRef.current.add(lockKey);
        const previousLog = logs[today]?.[atomId];

        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) throw new Error('Sign in to track habits.');

            setLogs(prev => ({
                ...prev,
                [today]: {
                    ...(prev[today] || {}),
                    [atomId]: { ...(prev[today]?.[atomId] || {}), ...data }
                }
            }));

            const payload = buildHabitLogPayload({
                atomId,
                date: today,
                userId: user.id,
                previousLog,
                changes: data,
            });
            const { data: savedLog, error } = await supabase
                .from('logs')
                .upsert(payload, { onConflict: 'atom_id, date_logged' })
                .select('id, status, mood, duration, time')
                .maybeSingle();

            if (error) throw error;
            if (!savedLog) throw new Error('The habit update was not confirmed. Refresh and try again.');
            setLogs(prev => ({
                ...prev,
                [today]: {
                    ...(prev[today] || {}),
                    [atomId]: {
                        ...(prev[today]?.[atomId] || {}),
                        ...data,
                        status: savedLog.status,
                        mood: savedLog.mood,
                        duration: savedLog.duration,
                        time: savedLog.time,
                        completed: savedLog.status === 'completed',
                        id: savedLog.id,
                    }
                }
            }));
            return true;
        } catch (error) {
            setLogs(prev => {
                const dateLogs = { ...(prev[today] || {}) };
                if (previousLog) dateLogs[atomId] = previousLog;
                else delete dateLogs[atomId];
                return { ...prev, [today]: dateLogs };
            });
            console.error('Error updating habit log:', error);
            throw error;
        } finally {
            habitMutationLocksRef.current.delete(lockKey);
        }
    };

    const getTotalWins = () => {
        let wins = 0;
        Object.values(logs).forEach(dateLogs => {
            Object.values(dateLogs).forEach(log => {
                if (log.status === 'completed' || log.completed) wins++;
            });
        });
        return wins;
    };

    const removeAtom = async (atomId) => {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error('Sign in to remove habits.');

        const lockKey = 'atom:' + String(atomId);
        if (habitMutationLocksRef.current.has(lockKey)) {
            throw new Error('This habit is already being saved. Wait for that update to finish, then try again.');
        }
        const previous = atoms.find(atom => String(atom.id) === String(atomId));
        if (!previous || (previous.user_id && previous.user_id !== user.id)) {
            throw new Error('That habit is not available in this account. Refresh and try again.');
        }
        habitMutationLocksRef.current.add(lockKey);
        setAtoms(prev => prev.filter(atom => String(atom.id) !== String(atomId)));

        try {
            const { data: deletedAtom, error } = await supabase
                .from('atoms')
                .delete()
                .eq('id', atomId)
                .eq('user_id', user.id)
                .select('id')
                .maybeSingle();
            if (error) throw error;
            if (!deletedAtom) throw new Error('The habit was not deleted. Refresh and try again.');
        } catch (error) {
            if (previous) setAtoms(prev => [...prev.filter(atom => String(atom.id) !== String(atomId)), previous]);
            console.error('Error deleting atom:', error);
            throw error;
        } finally {
            habitMutationLocksRef.current.delete(lockKey);
        }
    };

    return (
        <HabitsContext.Provider value={{ atoms, logs, addAtom, removeAtom, getTodayLog, updateLog, getTotalWins, loading, loadError, refreshHabits }}>
            {children}
        </HabitsContext.Provider>
    );
};
