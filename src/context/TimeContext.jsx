import React, { useState, useEffect } from 'react';
import { TimeContext } from './TimeContextCore.js';
import { supabase } from '../supabaseClient';

const DEFAULT_TIME_SETTINGS = { chronotype: 'Bear', peakStart: 10, peakEnd: 14 };
const VALID_CHRONOTYPES = ['Bear', 'Wolf', 'Lion', 'Dolphin'];

const getTimeSettingsKey = () => {
    try {
        const userId = localStorage.getItem('studybud_active_user_id');
        return userId ? 'studybud_time_settings_' + userId : null;
    } catch {
        return null;
    }
};

const readInitialTimeSettings = () => {
    try {
        const key = getTimeSettingsKey();
        const stored = key ? localStorage.getItem(key) : null;
        if (!stored) return { ...DEFAULT_TIME_SETTINGS };
        const parsed = JSON.parse(stored);
        const chronotype = VALID_CHRONOTYPES.includes(parsed?.chronotype)
            ? parsed.chronotype : DEFAULT_TIME_SETTINGS.chronotype;
        const peakStart = Number(parsed?.peakStart);
        const peakEnd = Number(parsed?.peakEnd);
        const validHours = Number.isInteger(peakStart) && peakStart >= 0 && peakStart <= 23
            && Number.isInteger(peakEnd) && peakEnd >= 1 && peakEnd <= 24
            && peakStart < peakEnd;
        return {
            chronotype,
            peakStart: validHours ? peakStart : DEFAULT_TIME_SETTINGS.peakStart,
            peakEnd: validHours ? peakEnd : DEFAULT_TIME_SETTINGS.peakEnd,
        };
    } catch {
        return { ...DEFAULT_TIME_SETTINGS };
    }
};

export const TimeProvider = ({ children }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError) throw authError;
            if (!user) {
                setTasks([]);
                return;
            }

            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(200);

            if (error) throw error;
            setTasks(data || []);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    const createTask = async (taskData) => {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error('Sign in to save tasks.');

        const tempId = Date.now();
        const payload = { ...taskData, user_id: user.id, status: taskData.status || 'Planned' };
        const optimisticTask = { ...payload, id: tempId, created_at: new Date() };
        setTasks(prev => [optimisticTask, ...prev]);

        try {
            const { data, error } = await supabase
                .from('tasks')
                .insert([payload])
                .select()
                .single();

            if (error) throw error;
            setTasks(prev => prev.map(task => task.id === tempId ? data : task));
            return data;
        } catch (error) {
            setTasks(prev => prev.filter(task => task.id !== tempId));
            console.error('Error creating task:', error);
            throw error;
        }
    };

    const updateTask = async (id, updates) => {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error('Sign in to update tasks.');

        const previous = tasks.find(task => String(task.id) === String(id));
        if (!previous || String(previous.user_id) !== String(user.id)) {
            throw new Error('That task is not available in this account. Refresh and try again.');
        }
        const safeUpdates = { ...updates };
        delete safeUpdates.id;
        delete safeUpdates.user_id;
        setTasks(prev => prev.map(task => String(task.id) === String(id) ? { ...task, ...safeUpdates } : task));

        try {
            const { data, error } = await supabase
                .from('tasks')
                .update(safeUpdates)
                .eq('id', id)
                .eq('user_id', user.id)
                .select('id')
                .maybeSingle();

            if (error) throw error;
            if (!data) throw new Error('The task was not updated. Refresh and try again.');
            return true;
        } catch (error) {
            setTasks(prev => prev.map(task => String(task.id) === String(id) ? previous : task));
            console.error('Error updating task:', error?.code || 'unknown');
            throw error;
        }
    };

    const deleteTask = async (id) => {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error('Sign in to delete tasks.');

        const previous = tasks.find(task => String(task.id) === String(id));
        if (!previous || String(previous.user_id) !== String(user.id)) {
            throw new Error('That task is not available in this account. Refresh and try again.');
        }
        setTasks(prev => prev.filter(task => String(task.id) !== String(id)));
        try {
            const { data, error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id)
                .select('id')
                .maybeSingle();
            if (error) throw error;
            if (!data) throw new Error('The task was not deleted. Refresh and try again.');
            return true;
        } catch (error) {
            setTasks(prev => prev.some(task => String(task.id) === String(id)) ? prev : [previous, ...prev]);
            console.error('Error deleting task:', error?.code || 'unknown');
            throw error;
        }
    };

    // --- Intelligence Logic ---
    const checkEnergyMismatch = (task, block) => {
        if (!block) return 'neutral';
        const type = task.cognitive_type;

        // High Energy Rules
        if (block === 'High') {
            if (['Solve', 'Create', 'Practice'].includes(type)) return 'match';
            if (['Memorize', 'Organize'].includes(type)) return 'undermatch'; // Wasting energy
        }

        // Medium Energy Rules
        if (block === 'Medium') {
            if (['Understand', 'Write', 'Review'].includes(type)) return 'match';
        }

        // Low Energy Rules
        if (block === 'Low') {
            if (['Memorize', 'Review'].includes(type)) return 'match';
            if (['Solve', 'Create'].includes(type)) return 'overmatch'; // Too hard for low energy
        }

        return 'neutral';
    };

    // --- Feature 1: Settings (Chronotype) ---
    // Keep the existing preference across reloads, separated by signed-in account.
    const [settings, setSettings] = useState(readInitialTimeSettings);

    const updateSettings = (newSettings = {}) => {
        const next = { ...settings, ...newSettings };
        if (!VALID_CHRONOTYPES.includes(next.chronotype)) next.chronotype = settings.chronotype;

        const peakStart = Number(next.peakStart);
        const peakEnd = Number(next.peakEnd);
        if (Number.isInteger(peakStart) && peakStart >= 0 && peakStart <= 23
            && Number.isInteger(peakEnd) && peakEnd >= 1 && peakEnd <= 24
            && peakStart < peakEnd) {
            next.peakStart = peakStart;
            next.peakEnd = peakEnd;
        } else {
            next.peakStart = settings.peakStart;
            next.peakEnd = settings.peakEnd;
        }

        setSettings(next);
        try {
            const key = getTimeSettingsKey();
            if (key) localStorage.setItem(key, JSON.stringify(next));
        } catch {
            // Task management remains usable in browsers that block local storage.
        }
    };

    // --- Feature 2: Task Batching ---
    const batchTasks = async (taskIds, batchTitle) => {
        const uniqueIds = [...new Set((taskIds || []).map(String))];
        const tasksToBatch = tasks.filter(task => uniqueIds.includes(String(task.id)));
        if (tasksToBatch.length < 2) throw new Error('Select at least two tasks to create a batch.');

        const totalTime = tasksToBatch.reduce((sum, task) => sum + (Number(task.time_estimate) || 0), 0);
        const batchTask = {
            title: (batchTitle || ('Batch: ' + tasksToBatch.length + ' tasks')).slice(0, 180),
            cognitive_type: 'Organize',
            difficulty: 'Medium',
            time_estimate: Math.max(5, totalTime),
            emotional_friction: 'Low',
            description: tasksToBatch.map(task => '- ' + task.title).join('\n'),
        };

        // Save the replacement before touching any of the original tasks.
        const savedBatch = await createTask(batchTask);
        const deletionFailures = [];
        for (const task of tasksToBatch) {
            try {
                await deleteTask(task.id);
            } catch {
                deletionFailures.push(task.title);
            }
        }
        if (deletionFailures.length) {
            throw new Error('The batch was saved, but some original tasks remain: ' + deletionFailures.join(', ') + '. You can remove them from the queue after checking the new batch.');
        }
        return savedBatch;
    };

    return (
        <TimeContext.Provider value={{
            tasks,
            createTask,
            updateTask,
            deleteTask,
            checkEnergyMismatch,
            loading,
            settings,      // New
            updateSettings,// New
            batchTasks     // New
        }}>
            {children}
        </TimeContext.Provider>
    );
};
