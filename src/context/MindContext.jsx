import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const MindContext = createContext();

export const useMind = () => {
    const context = useContext(MindContext);
    if (!context) throw new Error('useMind must be used within a MindProvider');
    return context;
};

export const MindProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);

    // State
    const [logs, setLogs] = useState([]); // Chat history, sessions
    const [offloadItems, setOffloadItems] = useState([]);
    const [wins, setWins] = useState([]);

    // --- Actions ---

    const addLog = async (logData) => {
        // Optimistic
        const newLog = { ...logData, id: Date.now(), created_at: new Date() };
        setLogs(prev => [newLog, ...prev]);

        try {
            const { data, error } = await supabase.from('mind_logs').insert([logData]).select();
            if (error) throw error;
        } catch (e) { console.error("Error adding log:", e); }
    };

    const addOffloadItem = async (item) => {
        // Optimistic
        const newItem = { ...item, id: Date.now(), created_at: new Date(), is_archived: false };
        setOffloadItems(prev => [newItem, ...prev]);

        try {
            const { error } = await supabase.from('mind_offload_items').insert([item]);
            if (error) throw error;
        } catch (e) { console.error("Error adding offload:", e); }
    };

    const addWin = async (win) => {
        setWins(prev => [{ ...win, id: Date.now() }, ...prev]);
        try {
            await supabase.from('mind_wins').insert([win]);
        } catch (e) { console.error(e); }
    };

    // Load Data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const results = await Promise.all([
                    supabase.from('mind_logs').select('*').order('created_at', { ascending: false }).limit(20),
                    supabase.from('mind_offload_items').select('*').order('created_at', { ascending: false }),
                    supabase.from('mind_wins').select('*').order('created_at', { ascending: false })
                ]);

                if (results[0].data) setLogs(results[0].data);
                if (results[1].data) setOffloadItems(results[1].data);
                if (results[2].data) setWins(results[2].data);
            } catch (e) {
                console.error("Error fetching mind data:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);


    return (
        <MindContext.Provider value={{
            logs,
            offloadItems,
            wins,
            addLog,
            addOffloadItem,
            addWin,
            loading
        }}>
            {children}
        </MindContext.Provider>
    );
};
