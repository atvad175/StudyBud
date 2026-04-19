import React, { useState } from 'react';
import { useTime } from '../../../context/TimeContext';
import styles from '../TimeShared.module.css';
import { Plus, Trash2, Layers, AlertCircle, Box, Archive } from 'lucide-react';

const COGNITIVE_TYPES = ['Memorize', 'Understand', 'Create', 'Solve', 'Review', 'Write', 'Practice'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const FRICTIONS = ['Low', 'Medium', 'High'];

const TaskIntelligence = () => {
    const { tasks, createTask, deleteTask } = useTime();
    const [form, setForm] = useState({
        title: '',
        cognitive_type: 'Understand',
        difficulty: 'Medium',
        time_estimate: 30,
        emotional_friction: 'Medium'
    });

    const plannedTasks = tasks.filter(t => t.status === 'Planned');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        createTask(form);
        setForm({ ...form, title: '' });
    };

    return (
        <div className={`${styles.container} ${styles.aliveBackground}`}>
            <header className={styles.header}>
                <div>
                    <span className={styles.breadcrumb}>Pillar 1: Task Breakdown</span>
                    <h1>Task List</h1>
                    <p style={{ marginTop: '0.5rem', color: '#666', lineHeight: '1.4', maxWidth: '800px' }}>
                        Task Intelligence is your personal task filter. It helps you categorize what needs to be done based on the brain power required, so you can match your hardest work with your best energy.
                    </p>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '3rem', alignItems: 'start' }}>

                {/* Creation Panel */}
                <div style={{ background: 'white', padding: '2.5rem', borderRadius: '32px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
                        <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '12px' }}><Layers size={24} color="#555" /></div>
                        <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-serif)', margin: 0 }}>New Task</h2>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={labelStyle}>Task Title</label>
                            <input
                                required
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                style={{ ...inputStyle, fontSize: '1.1rem', fontWeight: '500' }}
                                placeholder="What needs to be done?"
                            />
                        </div>

                        <div style={sectionBox}>
                            <label style={labelStyle}>Task Type</label>
                            <div style={chipGrid}>
                                {COGNITIVE_TYPES.map(t => (
                                    <button
                                        type="button"
                                        key={t}
                                        onClick={() => setForm({ ...form, cognitive_type: t })}
                                        style={form.cognitive_type === t ? activeChip : chip}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={rowStyle}>
                            <div style={{ flex: 1 }}>
                                <label style={labelStyle}>Difficulty</label>
                                <select
                                    value={form.difficulty}
                                    onChange={e => setForm({ ...form, difficulty: e.target.value })}
                                    style={inputStyle}
                                >
                                    {DIFFICULTIES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={labelStyle}>Mental Load</label>
                                <select
                                    value={form.emotional_friction}
                                    onChange={e => setForm({ ...form, emotional_friction: e.target.value })}
                                    style={inputStyle}
                                >
                                    {FRICTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Time Estimate (Minutes)</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <input
                                    type="range"
                                    min="5" max="180" step="5"
                                    value={form.time_estimate}
                                    onChange={e => setForm({ ...form, time_estimate: parseInt(e.target.value) })}
                                    style={{ flex: 1 }}
                                />
                                <span style={{ fontWeight: 'bold', minWidth: '40px' }}>{form.time_estimate}m</span>
                            </div>
                        </div>

                        <button type="submit" style={btnStyle}>
                            <Plus size={20} /> Add to Queue
                        </button>
                    </form>
                </div>

                {/* Queue Display */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem' }}>Queue</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {plannedTasks.map(task => (
                            <div
                                key={task.id}
                                style={{
                                    ...taskCardPremium,
                                    border: '1px solid rgba(0,0,0,0.03)',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', lineHeight: '1.4' }}>{task.title}</h3>
                                    <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} /></button>
                                </div>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    <span style={tagStyle}>{task.cognitive_type}</span>
                                    <span style={{ ...tagStyle, background: 'rgba(0,0,0,0.03)', fontWeight: '600' }}>{task.time_estimate}m</span>
                                </div>

                                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#999' }}>
                                    <span>{task.difficulty}</span>
                                    <span style={{ color: task.emotional_friction === 'High' ? '#d63031' : '#999' }}>{task.emotional_friction} Load</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Styles ---
const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999', fontWeight: '700' };
const inputStyle = { width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #eee', fontSize: '1rem', fontFamily: 'inherit', background: '#fcfcfc', color: '#333' };
const rowStyle = { display: 'flex', gap: '1.5rem' };
const btnStyle = { padding: '16px', borderRadius: '16px', background: 'var(--color-gold)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '600', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '1rem', marginTop: '1rem', boxShadow: '0 8px 16px rgba(221, 168, 93, 0.3)', transition: 'transform 0.2s' };
const secondaryBtn = { padding: '8px 16px', borderRadius: '100px', border: '1px solid #ddd', background: 'white', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' };
const sectionBox = { background: '#fcfcfc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #f0f0f0' };

const chipGrid = { display: 'flex', flexWrap: 'wrap', gap: '8px' };
const chip = { padding: '8px 16px', borderRadius: '100px', border: '1px solid #eee', background: 'white', cursor: 'pointer', fontSize: '0.9rem', color: '#666', transition: 'all 0.2s' };
const activeChip = { ...chip, background: '#333', color: 'white', borderColor: '#333' };

const taskCardPremium = { background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', transition: 'all 0.2s' };
const tagStyle = { padding: '4px 12px', borderRadius: '8px', background: '#eef2f5', fontSize: '0.75rem', color: '#555', fontWeight: '500' };

export default TaskIntelligence;
