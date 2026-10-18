import React, { useState, useEffect } from 'react';
import { TimeContext } from './TimeContextCore';
import { supabase } from '../supabaseClient';

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
        const previous = tasks.find(task => task.id === id);
        const safeUpdates = { ...updates };
        delete safeUpdates.id;
        delete safeUpdates.user_id;
        setTasks(prev => prev.map(task => task.id === id ? { ...task, ...safeUpdates } : task));

        try {
            const { error } = await supabase
                .from('tasks')
                .update(safeUpdates)
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            if (previous) setTasks(prev => prev.map(task => task.id === id ? previous : task));
            console.error('Error updating task:', error);
            throw error;
        }
    };

    const deleteTask = async (id) => {
        const previous = tasks.find(task => task.id === id);
        setTasks(prev => prev.filter(task => task.id !== id));
        try {
            const { error } = await supabase.from('tasks').delete().eq('id', id);
            if (error) throw error;
        } catch (error) {
            if (previous) setTasks(prev => [previous, ...prev]);
            console.error('Error deleting task:', error);
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
    const [settings, setSettings] = useState({
        chronotype: 'Bear', // Bear, Wolf, Lion, Dolphin
        peakStart: 10, // 10 AM
        peakEnd: 14,   // 2 PM
    });

    const updateSettings = (newSettings) => setSettings(prev => ({ ...prev, ...newSettings }));

    // --- Feature 2: Task Batching ---
    const batchTasks = (taskIds, batchTitle) => {
        // In a real app, this might create a parent task or link them.
        // For now, we'll create a new "Batch" task and mark others as executed/archived or just delete them.
        // Let's go with: Create new Aggregate Task, Delete old ones.

        const tasksToBatch = tasks.filter(t => taskIds.includes(t.id));
        const totalTime = tasksToBatch.reduce((acc, t) => acc + t.time_estimate, 0);

        const batchTask = {
            title: batchTitle || `Batch: ${tasksToBatch.length} tasks`,
            cognitive_type: 'Organize', // Batching is usually organizational/admin
            difficulty: 'Medium',
            time_estimate: totalTime,
            emotional_friction: 'Low',
            description: tasksToBatch.map(t => `- ${t.title}`).join('\n')
        };

        createTask(batchTask);
        taskIds.forEach(id => deleteTask(id));
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
