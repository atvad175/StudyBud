import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const TimeContext = createContext();

export const useTime = () => {
    const context = useContext(TimeContext);
    if (!context) throw new Error('useTime must be used within a TimeProvider');
    return context;
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
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTasks(data || []);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            // Fallback for demo if DB fails:
            // setTasks([]); 
        } finally {
            setLoading(false);
        }
    };

    const createTask = async (taskData) => {
        // Optimistic
        const tempId = Date.now();
        const newTask = { ...taskData, id: tempId, status: 'Planned', created_at: new Date() };
        setTasks(prev => [newTask, ...prev]);

        try {
            const { data, error } = await supabase
                .from('tasks')
                .insert([taskData])
                .select();

            if (error) throw error;

            // Replace temp
            if (data) {
                setTasks(prev => prev.map(t => t.id === tempId ? data[0] : t));
            }
        } catch (error) {
            console.error("Error creating task:", error);
        }
    };

    const updateTask = async (id, updates) => {
        // Optimistic
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));

        try {
            const { error } = await supabase
                .from('tasks')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    const deleteTask = async (id) => {
        setTasks(prev => prev.filter(t => t.id !== id));
        try {
            await supabase.from('tasks').delete().eq('id', id);
        } catch (e) { console.error(e); }
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
