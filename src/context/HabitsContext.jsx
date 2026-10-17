import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const HabitsContext = createContext();

export const useHabits = () => {
    const context = useContext(HabitsContext);
    if (!context) {
        throw new Error('useHabits must be used within a HabitsProvider');
    }
    return context;
};

export const HabitsProvider = ({ children }) => {
    const [atoms, setAtoms] = useState([]);
    const [logs, setLogs] = useState({});
    const [loading, setLoading] = useState(true);

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
                const { data: atomsData, error: atomsError } = await supabase
                    .from('atoms')
                    .select('*')
                    .order('created_at', { ascending: true });

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
                    .order('date_logged', { ascending: false })
                    .limit(400);

                if (logsError) throw logsError;
                if (!active) return;

                const logsDict = {};
                (logsData || []).forEach(log => {
                    const date = log.date_logged;
                    if (!logsDict[date]) logsDict[date] = {};
                    logsDict[date][log.atom_id] = { status: log.status, id: log.id };
                });
                setLogs(logsDict);
            } catch (error) {
                if (active) console.error('Error fetching habits data:', error?.code || 'unknown');
            } finally {
                if (active) setLoading(false);
            }
        };

        void fetchData();
        return () => {
            active = false;
            window.removeEventListener('studybud-starter-habit-created', handleStarterHabitCreated);
        };
    }, []);

    const addAtom = async (atom) => {
        const tempId = Date.now();
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
        }
    };

    const getTodayLog = () => {
        const today = new Date().toISOString().split('T')[0];
        return logs[today] || {};
    };

    const updateLog = async (atomId, data) => {
        const today = new Date().toISOString().split('T')[0];
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

            const { error } = await supabase
                .from('logs')
                .upsert({
                    atom_id: atomId,
                    date_logged: today,
                    status: data.status || (data.completed ? 'completed' : 'pending'),
                    mood: data.mood ?? previousLog?.mood ?? null,
                    duration: data.duration ?? previousLog?.duration ?? null,
                    time: data.time ?? previousLog?.time ?? null,
                    user_id: user.id,
                }, { onConflict: 'atom_id, date_logged' });

            if (error) throw error;
        } catch (error) {
            setLogs(prev => {
                const dateLogs = { ...(prev[today] || {}) };
                if (previousLog) dateLogs[atomId] = previousLog;
                else delete dateLogs[atomId];
                return { ...prev, [today]: dateLogs };
            });
            console.error('Error updating habit log:', error);
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
        const previous = atoms.find(atom => atom.id === atomId);
        setAtoms(prev => prev.filter(atom => atom.id !== atomId));

        try {
            const { error } = await supabase
                .from('atoms')
                .delete()
                .eq('id', atomId);
            if (error) throw error;
        } catch (error) {
            if (previous) setAtoms(prev => [...prev, previous]);
            console.error('Error deleting atom:', error);
        }
    };

    return (
        <HabitsContext.Provider value={{ atoms, logs, addAtom, removeAtom, getTodayLog, updateLog, getTotalWins, loading }}>
            {children}
        </HabitsContext.Provider>
    );
};
