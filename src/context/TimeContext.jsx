import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TimeContext } from './TimeContextCore.js';
import { supabase } from '../supabaseClient';
import { requireExpectedAccountUser } from '../utils/accountSession.js';

const DEFAULT_TIME_SETTINGS = { chronotype: 'Bear', peakStart: 10, peakEnd: 14 };
const VALID_CHRONOTYPES = ['Bear', 'Wolf', 'Lion', 'Dolphin'];

const getTimeSettingsKey = userId =>
    userId ? 'studybud_time_settings_' + userId : null;

const readInitialTimeSettings = (userId) => {
    try {
        const key = getTimeSettingsKey(userId);
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

export const TimeProvider = ({ children, userId = null }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);
    const taskMutationLocksRef = useRef(new Set());
    const refreshTasks = () => setRefreshKey(value => value + 1);

    useEffect(() => {
        let active = true;
        void fetchTasks(() => active);
        return () => { active = false; };
    }, [fetchTasks, refreshKey, userId]);

    const fetchTasks = useCallback(async (isActive = () => true) => {
        if (isActive()) {
            setLoading(true);
            setLoadError('');
        }
        try {
            if (!userId) {
                if (isActive()) {
                    setTasks([]);
                    setLoadError('');
                }
                return;
            }
            const user = await requireExpectedAccountUser(supabase.auth, userId, 'load tasks');

            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(200);

            if (error) throw error;
            if (isActive()) setTasks(data || []);
        } catch (error) {
            console.error('Error fetching tasks:', error?.code || 'unknown');
            if (isActive()) {
                setLoadError('Saved Time tasks could not be loaded. Your existing tasks have not been deleted; retry when your connection is stable.');
            }
        } finally {
            if (isActive()) setLoading(false);
        }
    }, [userId]);

    const createTask = async (taskData) => {
        const user = await requireExpectedAccountUser(supabase.auth, userId, 'save tasks');

        const tempId = 'optimistic-' + Date.now() + '-' + Math.random().toString(36).slice(2);
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
        const user = await requireExpectedAccountUser(supabase.auth, userId, 'update tasks');

        const lockKey = String(id);
        if (taskMutationLocksRef.current.has(lockKey)) {
            throw new Error('This task is already being saved. Wait for that update to finish, then try again.');
        }
        const previous = tasks.find(task => String(task.id) === lockKey);
        if (!previous || String(previous.user_id) !== String(user.id)) {
            throw new Error('That task is not available in this account. Refresh and try again.');
        }

        taskMutationLocksRef.current.add(lockKey);
        try {
            const safeUpdates = { ...updates };
            delete safeUpdates.id;
            delete safeUpdates.user_id;
            setTasks(prev => prev.map(task => String(task.id) === lockKey ? { ...task, ...safeUpdates } : task));

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
                setTasks(prev => prev.map(task => String(task.id) === lockKey ? previous : task));
                console.error('Error updating task:', error?.code || 'unknown');
                throw error;
            }
        } finally {
            taskMutationLocksRef.current.delete(lockKey);
        }
    };

    const deleteTask = async (id) => {
        const user = await requireExpectedAccountUser(supabase.auth, userId, 'delete tasks');

        const lockKey = String(id);
        if (taskMutationLocksRef.current.has(lockKey)) {
            throw new Error('This task is already being saved. Wait for that update to finish, then try again.');
        }
        const previous = tasks.find(task => String(task.id) === lockKey);
        if (!previous || String(previous.user_id) !== String(user.id)) {
            throw new Error('That task is not available in this account. Refresh and try again.');
        }

        taskMutationLocksRef.current.add(lockKey);
        setTasks(prev => prev.filter(task => String(task.id) !== lockKey));
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
            setTasks(prev => prev.some(task => String(task.id) === lockKey) ? prev : [previous, ...prev]);
            console.error('Error deleting task:', error?.code || 'unknown');
            throw error;
        } finally {
            taskMutationLocksRef.current.delete(lockKey);
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
    const [settings, setSettings] = useState(() => readInitialTimeSettings(userId));

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
            const key = getTimeSettingsKey(userId);
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
            loadError,
            refreshTasks,
            settings,      // New
            updateSettings,// New
            batchTasks     // New
        }}>
            {children}
        </TimeContext.Provider>
    );
};
