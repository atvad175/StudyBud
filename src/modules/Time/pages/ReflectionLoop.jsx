import React, { useState } from 'react';
import { useTime } from '../../../context/TimeContext';
import styles from '../TimeShared.module.css';
import { Check, ArrowRight, TrendingUp, AlertCircle } from 'lucide-react';

const ReflectionLoop = () => {
    const { tasks, updateTask } = useTime();

    const readyTasks = tasks.filter(t => t.status === 'Planned' && t.energy_block);
    const executedTasks = tasks.filter(t => t.status === 'Executed');
    const reflectedTasks = tasks.filter(t => t.status === 'Reflected');

    const [reflectData, setReflectData] = useState({});

    const markExecuted = (id) => updateTask(id, { status: 'Executed' });

    const submitReflection = (task) => {
        const data = reflectData[task.id] || { actual_time: task.time_estimate, mood: 'Mid', execution_quality: 'Mid' };
        updateTask(task.id, {
            status: 'Reflected',
            actual_time: parseInt(data.actual_time),
            mood: data.mood,
            execution_quality: data.execution_quality,
            notes: data.notes
        });
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
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
                                        <span style={pill}>{task.energy_block} Energy</span>
                                    </div>
                                </div>
                                <button onClick={() => markExecuted(task.id)} style={checkBtn}>
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
                    <p style={{ color: '#666', marginBottom: '1.5rem' }}>See how your actual time compared to your plan. This helps you plan better tomorrow!</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {executedTasks.map(task => {
                            const currentData = reflectData[task.id] || {};
                            const est = task.time_estimate;
                            const act = currentData.actual_time || est;

                            // Visual bar diff
                            const percentage = Math.min((act / est) * 100, 200); // Cap at 200% width
                            const isOver = act > est;

                            return (
                                <div key={task.id} style={reflectCard}>
                                    <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>{task.title}</h3>

                                    {/* Visual Comparison Bar */}
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.8rem', fontWeight: '600', color: '#888' }}>
                                            <span>Target: {est}m</span>
                                            <span style={{ color: isOver ? '#d63031' : '#2ecc71' }}>Actual: {act}m {isOver ? '(+' + (act - est) + ')' : ''}</span>
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
                                            <label style={labelStyle}>Time Taken</label>
                                            <input
                                                type="number"
                                                defaultValue={est}
                                                onChange={(e) => handleReflectChange(task.id, 'actual_time', e.target.value)}
                                                style={inputStyle}
                                            />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>How was your flow?</label>
                                            <select
                                                onChange={(e) => handleReflectChange(task.id, 'mood', e.target.value)}
                                                style={inputStyle}
                                                defaultValue="Mid"
                                            >
                                                <option value="Happy">Great (Flow)</option>
                                                <option value="Mid">Okay (Neutral)</option>
                                                <option value="Low">Tired (Low)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '1rem' }}>
                                        <label style={labelStyle}>My Insight (What did I learn?)</label>
                                        <textarea
                                            placeholder="E.g. I got distracted by my phone, or I really nailed the research phase..."
                                            onChange={(e) => handleReflectChange(task.id, 'notes', e.target.value)}
                                            style={{ ...inputStyle, minHeight: '80px', fontFamily: 'var(--font-sans)', resize: 'vertical' }}
                                        />
                                    </div>

                                    <button onClick={() => submitReflection(task)} style={finishBtn}>
                                        Save Reflection <ArrowRight size={16} />
                                    </button>
                                </div>
                            );
                        })}
                        {executedTasks.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', background: '#f5f5f5', borderRadius: '16px', color: '#999' }}>No tasks pending reflection.</div>}
                    </div>
                </div>
            </div>
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
