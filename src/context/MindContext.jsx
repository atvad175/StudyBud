import React, { useState, useEffect } from 'react';
import { MindContext } from './MindContextCore.js';
import { supabase } from '../supabaseClient';

export const MindProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    // State
    const [logs, setLogs] = useState([]); // Chat history, sessions
    const [offloadItems, setOffloadItems] = useState([]);
    const [wins, setWins] = useState([]);

    // --- Actions ---

    const addLog = async (logData) => {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error('Sign in to save this reflection.');

        const tempId = Date.now();
        const payload = { ...logData, user_id: user.id };
        setLogs(prev => [{ ...payload, id: tempId, created_at: new Date() }, ...prev]);

        try {
            const { data, error } = await supabase
                .from('mind_logs')
                .insert([payload])
                .select()
                .single();
            if (error) throw error;
            setLogs(prev => prev.map(item => item.id === tempId ? data : item));
        } catch (error) {
            setLogs(prev => prev.filter(item => item.id !== tempId));
            console.error('Error saving reflection:', error);
            throw error;
        }
    };

    const addOffloadItem = async (item) => {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error('Sign in to save this item.');

        const tempId = Date.now();
        const payload = { ...item, user_id: user.id };
        setOffloadItems(prev => [{ ...payload, id: tempId, created_at: new Date(), is_archived: false }, ...prev]);

        try {
            const { data, error } = await supabase
                .from('mind_offload_items')
                .insert([payload])
                .select()
                .single();
            if (error) throw error;
            setOffloadItems(prev => prev.map(entry => entry.id === tempId ? data : entry));
        } catch (error) {
            setOffloadItems(prev => prev.filter(entry => entry.id !== tempId));
            console.error('Error saving offload item:', error);
            throw error;
        }
    };

    const deleteOffloadItem = async (itemId) => {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error('Sign in to delete this item.');

        const previous = offloadItems.find(item => String(item.id) === String(itemId));
        if (!previous) throw new Error('This item is no longer available. Refresh and try again.');
        setOffloadItems(current => current.filter(item => String(item.id) !== String(itemId)));

        try {
            const { data, error } = await supabase
                .from('mind_offload_items')
                .delete()
                .eq('id', itemId)
                .eq('user_id', user.id)
                .select('id')
                .maybeSingle();
            if (error) throw error;
            if (!data) throw new Error('The item was not deleted. Refresh and try again.');
        } catch (error) {
            setOffloadItems(current => current.some(item => String(item.id) === String(previous.id))
                ? current : [previous, ...current]);
            console.error('Error deleting offload item:', error?.code || 'unknown');
            throw error;
        }
    };

    const addWin = async (win) => {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error('Sign in to save this win.');

        const tempId = Date.now();
        // The database uses created_at, not a separate client-supplied date column.
        const payload = {
            content: win.content,
            type: win.type || 'micro_win',
            impact_score: win.impact_score ?? 1,
            user_id: user.id,
        };
        setWins(prev => [{ ...payload, date: win.date, id: tempId }, ...prev]);
        try {
            const { data, error } = await supabase
                .from('mind_wins')
                .insert([payload])
                .select()
                .single();
            if (error) throw error;
            setWins(prev => prev.map(item => item.id === tempId
                ? { ...data, date: data.created_at }
                : item));
        } catch (error) {
            setWins(prev => prev.filter(item => item.id !== tempId));
            console.error('Error saving win:', error);
            throw error;
        }
    };

    // Load Data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setLoadError('');
            try {
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                if (authError) throw authError;
                if (!user) {
                    setLogs([]);
                    setOffloadItems([]);
                    setWins([]);
                    return;
                }

                const results = await Promise.all([
                    supabase.from('mind_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
                    supabase.from('mind_offload_items').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(100),
                    supabase.from('mind_wins').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(100)
                ]);

                const failed = results.find(result => result.error);
                if (failed?.error) throw failed.error;
                setLogs(results[0].data || []);
                setOffloadItems(results[1].data || []);
                setWins(results[2].data || []);
            } catch (error) {
                console.error('Error fetching Mind data:', error?.code || 'unknown');
                setLoadError('Saved Mind data could not be loaded. Your entries have not been deleted; refresh to try again.');
                setLogs([]);
                setOffloadItems([]);
                setWins([]);
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
            deleteOffloadItem,
            addWin,
            loading,
            loadError
        }}>
            {children}
        </MindContext.Provider>
    );
};
