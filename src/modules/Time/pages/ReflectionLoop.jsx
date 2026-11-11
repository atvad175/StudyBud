import React, { useState } from 'react';
import { useTime } from '../../../context/useTime';
import { useToast } from '../../../context/useToast';
import styles from '../TimeShared.module.css';
import { Check, ArrowRight, TrendingUp, AlertCircle } from 'lucide-react';

const ReflectionLoop = () => {
    const { tasks = [], updateTask, loading = false, loadError = '', refreshTasks } = useTime();
    const { toast } = useToast();

    const getStatus = task => String(task?.status || 'Planned').trim().toLowerCase();
    const readyTasks = tasks.filter(task => getStatus(task) === 'planned');
    const executedTasks = tasks.filter(task => getStatus(task) === 'executed');
    const reflectedTasks = tasks.filter(task => getStatus(task) === 'reflected');

    const [reflectData, setReflectData] = useState({});
    const [savingTaskId, setSavingTaskId] = useState(null);

    const markExecuted = async (id) => {
        if (savingTaskId !== null) return;
        setSavingTaskId(id);
        try {
            await updateTask(id, { status: 'Executed' });
            toast.success('Task marked as done. You can reflect on it next.');
        } catch (error) {
            toast.error(error?.message || 'Task progress could not be saved. Please try again.');
        } finally {
            setSavingTaskId(null);
        }
    };

    const submitReflection = async (task) => {
        if (savingTaskId) return;
        const data = reflectData[task.id] || {};
        const actualTime = Number.parseInt(data.actual_time ?? task.time_estimate, 10);
        if (!Number.isFinite(actualTime) || actualTime < 1 || actualTime > 1440) {
            toast.error('Enter a time taken between 1 and 1,440 minutes.');
            return;
        }

        setSavingTaskId(task.id);
        try {
            await updateTask(task.id, {
                status: 'Reflected',
                actual_time: actualTime,
                mood: data.mood || 'Mid',
                execution_quality: data.execution_quality || 'Mid',
                notes: data.notes || '',
            });
            toast.success('Reflection saved.');
        } catch (error) {
            toast.error(error?.message || 'Reflection could not be saved. Please try again.');
        } finally {
            setSavingTaskId(null);
        }
    };

    const handleReflectChange = (id, field, value) => {
        setReflectData(prev => ({
            ...prev,
            [id]: { ...(prev[id] || {}), [field]: value }
        }));
    };

    // Accuracy logic removed

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <span className={styles.breadcrumb}>Step 3: Reflection</span>
                    <h1>Daily Reflection</h1>
                </div>
            </header>

            {loadError && (
                <div role="alert" style={{ marginBottom: '1.25rem', padding: '1rem', border: '1px solid #e2b9a1', borderRadius: '12px', background: '#fff4ec', color: '#754a35' }}>
                    {loadError}
                    <button type="button" onClick={refreshTasks} style={{ marginLeft: '0.75rem', textDecoration: 'underline' }}>Retry</button>
                </div>
            )}
            {loading ? (
                <p role="status" style={{ padding: '1.5rem', color: 'var(--color-text-secondary)' }}>Loading your tasks…</p>
            ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* LEFT: Execution */}
                <div>
                    <h2 style={sectionHeader}>Step 1: Finish Tasks</h2>
                    <p style={{ color: '#666', marginBottom: '1.5rem' }}>Mark tasks as done once you finish them.</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {readyTasks.map(task => (
                            <div key={task.id} style={executeCard}>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>{task.title}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                        <span style={pill}>{task.time_estimate}m</span>
                                        <span style={pill}>{task.energy_block ? task.energy_block + ' Energy' : 'Energy not set'}</span>
                                    </div>
                                </div>
                                <button type="button" onClick={() => markExecuted(task.id)} disabled={savingTaskId !== null} aria-label={`Mark ${task.title} as finished`} style={{ ...checkBtn, opacity: savingTaskId !== null ? 0.55 : 1, cursor: savingTaskId !== null ? 'wait' : 'pointer' }}>
                                    <Check size={20} />
                                </button>
                            </div>
                        ))}
                        {readyTasks.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', background: '#f5f5f5', borderRadius: '16px', color: '#999' }}>Queue empty. Plan more tasks!</div>}
                    </div>
                </div>

                {/* RIGHT: Comparison */}
                <div>
                    <h2 style={sectionHeader}>Step 2: Learn & Improve</h2>
                    <p style={{ color: '#666', marginBottom: '0.4rem' }}>See how your actual time compared to your plan. This helps you plan better tomorrow.</p>
                    <p style={{ color: '#888', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
                        Already reflected: {reflectedTasks.length} {reflectedTasks.length === 1 ? 'task' : 'tasks'}.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {executedTasks.map(task => {
                            const currentData = reflectData[task.id] || {};
                            const est = Math.max(1, Number(task.time_estimate) || 1);
                            const act = Math.max(0, Number(currentData.actual_time ?? est) || 0);

                            const percentage = Math.min((act / est) * 100, 200);
                            const isOver = act > est;

                            return (
                                <div key={task.id} style={reflectCard}>
                                    <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>{task.title}</h3>

                                    {/* Visual Comparison Bar */}
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.8rem', fontWeight: '600', color: '#888' }}>
                                            <span>Target: {est}m</span>
                                            <span style={{ color: isOver ? '#d63031' : '#2ecc71' }}>Actual: {act}m ({Math.round(percentage)}% of plan)</span>
                                        </div>
                                        <div style={{ height: '8px', background: '#f0f0f0', borderRadius: '100px', overflow: 'hidden', position: 'relative' }}>
                                            {/* Target Marker */}
                                            <div style={{ position: 'absolute', left: `${Math.min(100, (est / Math.max(act, est)) * 100)}%`, height: '100%', width: '2px', background: '#000', zIndex: 2 }}></div>
                                            {/* Actual Bar */}
                                            <div style={{ width: `${(act / Math.max(act, est)) * 100}%`, height: '100%', background: isOver ? '#d63031' : '#2ecc71', transition: 'width 0.3s' }}></div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label htmlFor={`actual-time-${task.id}`} style={labelStyle}>Time Taken (minutes)</label>
                                            <input
                                                id={`actual-time-${task.id}`}
                                                type="number"
                                                min="1"
                                                max="1440"
                                                step="1"
                                                value={currentData.actual_time ?? est}
                                                onChange={(e) => handleReflectChange(task.id, 'actual_time', e.target.value)}
                                                style={inputStyle}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor={`flow-rating-${task.id}`} style={labelStyle}>How was your flow?</label>
                                            <select
                                                id={`flow-rating-${task.id}`}
                                                onChange={(e) => handleReflectChange(task.id, 'mood', e.target.value)}
                                                style={inputStyle}
                                                value={currentData.mood ?? 'Mid'}
                                            >
                                                <option value="Happy">Great (Flow)</option>
                                                <option value="Mid">Okay (Neutral)</option>
                                                <option value="Low">Tired (Low)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '1rem' }}>
                                        <label htmlFor={`task-insight-${task.id}`} style={labelStyle}>My Insight (What did I learn?)</label>
                                        <textarea
                                            id={`task-insight-${task.id}`}
                                            placeholder="What helped? What would you change next time?"
                                            maxLength={1500}
                                            value={currentData.notes ?? ''}
                                            onChange={(e) => handleReflectChange(task.id, 'notes', e.target.value)}
                                            style={{ ...inputStyle, minHeight: '80px', fontFamily: 'var(--font-sans)', resize: 'vertical' }}
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => submitReflection(task)}
                                        disabled={savingTaskId !== null}
                                        style={{ ...finishBtn, opacity: savingTaskId !== null ? 0.6 : 1, cursor: savingTaskId !== null ? 'wait' : 'pointer' }}
                                    >
                                        {savingTaskId === task.id ? 'Saving…' : <>Save Reflection <ArrowRight size={16} /></>}
                                    </button>
                                </div>
                            );
                        })}
                        {executedTasks.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', background: '#f5f5f5', borderRadius: '16px', color: '#999' }}>No tasks pending reflection.</div>}
                    </div>
                </div>
            </div>
            )}
        </div>
    );
};

const sectionHeader = { fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '0.5rem' };
const pill = { background: '#f0f0f0', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', color: '#666' };

const executeCard = { background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const checkBtn = { width: '48px', height: '48px', borderRadius: '50%', background: '#f8f9fa', border: '2px solid #eee', color: '#ccc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' };

const reflectCard = { background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.02)' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem' };
const labelStyle = { display: 'block', marginBottom: '6px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#999', fontWeight: '700' };
const finishBtn = { marginTop: '1.5rem', width: '100%', padding: '14px', borderRadius: '12px', background: 'var(--color-gold)', color: 'white', border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' };

export default ReflectionLoop;
