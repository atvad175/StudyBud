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

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch Atoms
                const { data: atomsData, error: atomsError } = await supabase
                    .from('atoms')
                    .select('*')
                    .order('created_at', { ascending: true });

                if (atomsError) throw atomsError;
                setAtoms(atomsData || []);

                // Fetch Logs
                // Ideally filtering by recent dates, but fetching all for now for simplicity
                const { data: logsData, error: logsError } = await supabase
                    .from('logs')
                    .select('*');

                if (logsError) throw logsError;

                // Process logs into dictionary structure: { [date]: { [atomId]: { status: ... } } }
                const logsDict = {};
                if (logsData) {
                    logsData.forEach(log => {
                        const date = log.date_logged; // Assuming YYYY-MM-DD
                        if (!logsDict[date]) logsDict[date] = {};
                        logsDict[date][log.atom_id] = { status: log.status, id: log.id };
                    });
                }
                setLogs(logsDict);

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const addAtom = async (atom) => {
        try {
            // Optimistic Update
            const tempId = Date.now();
            const newAtom = { ...atom, id: tempId, user_id: (await supabase.auth.getUser()).data.user?.id };
            // Note: user_id might be null if not logged in. 
            // Real implementation needs Auth. For now, letting Supabase handle error if RLS fails.

            setAtoms((prev) => [...prev, newAtom]);

            const { data, error } = await supabase
                .from('atoms')
                .insert([{
                    title: atom.title,
                    frequency: atom.frequency || 'daily',
                    category: atom.category || 'study',
                    fission_entry: atom.fission_entry || '',
                    notes: atom.notes || '',
                    time: atom.time || '' // User-defined timing
                }])
                .select();

            if (error) throw error;

            // Replace temp ID with real ID
            if (data) {
                setAtoms(prev => prev.map(a => a.id === tempId ? data[0] : a));
            }
        } catch (error) {
            console.error('Error adding atom:', error);
            // Revert optimistic update here if needed (omitted for brevity)
        }
    };

    const getTodayLog = () => {
        const today = new Date().toISOString().split('T')[0];
        return logs[today] || {};
    };

    const updateLog = async (atomId, data) => {
        const today = new Date().toISOString().split('T')[0];

        // Optimistic UI
        setLogs((prev) => ({
            ...prev,
            [today]: {
                ...(prev[today] || {}),
                [atomId]: { ...(prev[today]?.[atomId] || {}), ...data }
            }
        }));

        try {
            // Upsert log
            const { error } = await supabase
                .from('logs')
                .upsert({
                    atom_id: atomId,
                    date_logged: today,
                    status: data.status || (data.completed ? 'completed' : 'pending'),
                    mood: data.mood,
                    duration: data.duration,
                    time: data.time
                }, { onConflict: 'atom_id, date_logged' });

            if (error) throw error;
        } catch (error) {
            console.error('Error updating log:', error);
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
        // Optimistic UI updates
        setAtoms(prev => prev.filter(a => a.id !== atomId));
        
        try {
            const { error } = await supabase
                .from('atoms')
                .delete()
                .eq('id', atomId);
                
            if (error) throw error;
        } catch (error) {
            console.error('Error deleting atom:', error);
        }
    };

    return (
        <HabitsContext.Provider value={{ atoms, logs, addAtom, removeAtom, getTodayLog, updateLog, getTotalWins, loading }}>
            {children}
        </HabitsContext.Provider>
    );
};
