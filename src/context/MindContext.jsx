import React, { useState, useEffect } from 'react';
import { MindContext } from './MindContextCore.js';
import { supabase } from '../supabaseClient';

const createOptimisticId = () => 'optimistic-' + Date.now() + '-' + Math.random().toString(36).slice(2);

export const MindProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    // State
    const [logs, setLogs] = useState([]); // Chat history, sessions
    const [offloadItems, setOffloadItems] = useState([]);
    const [wins, setWins] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const refreshMind = () => setRefreshKey(value => value + 1);

    // --- Actions ---

    const addLog = async (logData) => {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error('Sign in to save this reflection.');

        const tempId = createOptimisticId();
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

        const tempId = createOptimisticId();
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
        if (!previous || (previous.user_id && previous.user_id !== user.id)) {
            throw new Error('This item is not available in the current account. Refresh and try again.');
        }
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

        const tempId = createOptimisticId();
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

    // Load each Mind collection independently. A single missing table or
    // transient failure must not hide data from the other working collections.
    useEffect(() => {
        let active = true;
        const fetchData = async () => {
            setLoading(true);
            setLoadError('');
            try {
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                if (authError) throw authError;
                if (!active) return;
                if (!user) {
                    setLogs([]);
                    setOffloadItems([]);
                    setWins([]);
                    return;
                }

                const results = await Promise.all([
                    supabase.from('mind_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(100),
                    supabase.from('mind_offload_items').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(100),
                    supabase.from('mind_wins').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(100),
                ]);
                if (!active) return;

                const labels = ['reflections', 'brain-dump entries', 'wins'];
                const failedCollections = [];
                results.forEach((result, index) => {
                    if (result.error) {
                        failedCollections.push(labels[index]);
                        return;
                    }
                    const rows = result.data || [];
                    if (index === 0) setLogs(rows);
                    if (index === 1) setOffloadItems(rows);
                    if (index === 2) setWins(rows.map(item => ({ ...item, date: item.created_at })));
                });

                if (failedCollections.length) {
                    setLoadError(
                        'Some Mind data could not be loaded (' + failedCollections.join(', ') +
                        '). Other available entries remain visible. Retry to load the missing sections.'
                    );
                }
            } catch (error) {
                console.error('Error fetching Mind data:', error?.code || 'unknown');
                if (active) {
                    setLoadError('Saved Mind data could not be loaded. Your entries have not been deleted; retry when your connection is stable.');
                }
            } finally {
                if (active) setLoading(false);
            }
        };
        void fetchData();
        return () => { active = false; };
    }, [refreshKey]);

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
            loadError,
            refreshMind
        }}>
            {children}
        </MindContext.Provider>
    );
};
