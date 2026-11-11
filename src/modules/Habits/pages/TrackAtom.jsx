import React, { useState } from 'react';
import { useToast } from '../../../context/useToast';
import { getLocalDateKey } from '../../../utils/localDateKey';
import { useHabits } from '../../../context/useHabits';
import styles from './TrackAtom.module.css';
import { Check, Trash2 } from 'lucide-react';

const MOOD_OPTIONS = [
    { value: 'Amazing', emoji: '🔥', label: 'Amazing' },
    { value: 'Good', emoji: '😊', label: 'Good' },
    { value: 'Neutral', emoji: '😐', label: 'Neutral' },
    { value: 'Tired', emoji: '😴', label: 'Tired' },
    { value: 'Tough', emoji: '😔', label: 'Tough' },
];

const MOTIVATIONS = [
    "Consistency is quiet strength.",
    "Every atom counts.",
    "Focus on the process.",
    "Progress over perfection."
];

// Simple SVG Line Graph for Efficiency
const EfficiencyGraph = ({ data }) => {
    const points = Array.isArray(data) && data.length
        ? data.map(item => Math.max(0, Number(item.value) || 0))
        : [0, 0, 0, 0, 0, 0, 0];
    const height = 150;
    const width = 1000;
    const spacing = points.length > 1 ? width / (points.length - 1) : width;
    const maximum = Math.max(1, ...points);
    const getY = value => height - ((value / maximum) * height);
    const pathD = points.map((value, index) => {
        const command = index === 0 ? 'M' : 'L';
        return `${command} ${index * spacing} ${getY(value)}`;
    }).join(' ');

    return (
        <div className={styles.graphContainer}>
            <svg viewBox={`0 0 ${width} ${height + 50}`} className={styles.svgGraph} role="img" aria-label={`Completed habits per day over the last seven days. Peak: ${maximum}.`}>
                <defs>
                    <linearGradient id="habitActivityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#526DFF" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#526DFF" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={`${pathD} L ${width} ${height + 50} L 0 ${height + 50} Z`} fill="url(#habitActivityGradient)" />
                <path d={pathD} fill="none" stroke="#526DFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#E2E7EF" strokeDasharray="5,5" />
                <text x="10" y="18" fill="#657184" fontSize="20">{maximum}</text>
                <g className={styles.graphLabels}>
                    {Array.isArray(data) && data.map((item, index) => (
                        <text key={item.label} x={index * spacing} y={height + 30} textAnchor="middle" fill="#657184" fontSize="24">
                            {item.label}
                        </text>
                    ))}
                </g>
            </svg>
        </div>
    );
};

const TrackAtom = () => {
    const { atoms = [], updateLog, removeAtom, logs: contextLogs = {}, loading = false, loadError = '', refreshHabits } = useHabits();
    const { toast } = useToast();
    const todayKey = getLocalDateKey();
    const logs = contextLogs[todayKey] || {};
    const [quote] = useState(() => MOTIVATIONS[new Date().getDate() % MOTIVATIONS.length]);
    const [editingAtomId, setEditingAtomId] = useState(null);
    const [editForm, setEditForm] = useState({ time: '', duration: '', mood: '' });
    const [savingAtomId, setSavingAtomId] = useState(null);

    // Compute weekly data dynamically
    const weeklyData = React.useMemo(() => {
        const last7 = [];
        const today = new Date();
        for(let i=6; i>=0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = getLocalDateKey(d);
            const logsForDay = contextLogs[dateStr] || {};
            const completedCount = Object.values(logsForDay).filter(l => l.status === 'completed' || l.completed).length;
            last7.push({
                label: d.toLocaleDateString(undefined, { weekday: 'short' }),
                value: completedCount
            });
        }
        return last7;
    }, [contextLogs]);

    const averageCompleted = (weeklyData.reduce((sum, day) => sum + day.value, 0) / 7).toFixed(1);
    const peakCompleted = Math.max(0, ...weeklyData.map(day => day.value));

    const handleToggle = async (atomId) => {
        if (savingAtomId !== null) return;
        const log = logs[atomId] || {};
        const isComplete = log.status === 'completed' || log.completed;
        const newStatus = isComplete ? 'pending' : 'completed';
        setSavingAtomId(atomId);
        try {
            await updateLog(atomId, { status: newStatus, completed: !isComplete });
            toast.success(newStatus === 'completed' ? 'Habit marked complete.' : 'Habit marked pending.');
        } catch (error) {
            toast.error(error?.message || 'Habit progress could not be saved. Please try again.');
        } finally {
            setSavingAtomId(null);
        }
    };

    const handleMoodChange = async (atomId, mood) => {
        if (savingAtomId !== null) return;
        setSavingAtomId(atomId);
        try {
            await updateLog(atomId, { mood });
        } catch (error) {
            toast.error(error?.message || 'Your mood could not be saved. Please try again.');
        } finally {
            setSavingAtomId(null);
        }
    };

    const handleRemove = async (atomId) => {
        if (savingAtomId !== null) return;
        if (!window.confirm('Remove this habit and its saved tracking history?')) return;
        setSavingAtomId(atomId);
        try {
            await removeAtom(atomId);
            toast.success('Habit removed.');
        } catch (error) {
            toast.error(error?.message || 'The habit could not be removed. Please try again.');
        } finally {
            setSavingAtomId(null);
        }
    };

    const startEditing = (atom, log) => {
        setEditingAtomId(atom.id);
        let timeStr = atom.time || 'Anytime';
        let storedDuration = atom.duration || '';
        
        if (!storedDuration && timeStr.includes(' · ')) {
            const parts = timeStr.split(' · ');
            timeStr = parts[0];
            storedDuration = parts[1];
        }

        setEditForm({
            time: timeStr.replace(/\d+\s*min/i, '').replace(/·\s*$/, '').trim(),
            duration: log.duration || storedDuration.replace(' min', '') || '0',
            mood: log.mood || 'Neutral'
        });
    };

    const saveEdit = async (atomId) => {
        if (savingAtomId !== null) return;
        setSavingAtomId(atomId);
        try {
            await updateLog(atomId, {
                time: editForm.time,
                duration: editForm.duration,
                mood: editForm.mood
            });
            setEditingAtomId(null);
            toast.success('Habit details saved.');
        } catch (error) {
            toast.error(error?.message || 'Habit details could not be saved. Please try again.');
        } finally {
            setSavingAtomId(null);
        }
    };

    const completedCount = logs ? Object.values(logs).filter(l => l.status === 'completed' || l.completed).length : 0;
    const progressPercent = atoms && atoms.length > 0 ? Math.round((completedCount / atoms.length) * 100) : 0;

    if (loading) return <div role="status" style={{ padding: '2rem', textAlign: 'center' }}>Loading your habits…</div>;
    if (!atoms.length && loadError) return (
        <div className="page-container" style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>Your habits could not be loaded</h1>
            <p>{loadError}</p>
            <button type="button" onClick={refreshHabits}>Retry</button>
        </div>
    );
    if (!atoms.length) return <div className="page-container" style={{ padding: '2rem', textAlign: 'center' }}><h1>No habits yet</h1><p>Create your first habit to start tracking progress.</p><a href="/habits/add">Create a habit</a></div>;


    return (
        <div className="page-container">
            <div className={styles.header}>
                <span className={styles.breadcrumb}>Habits / Track</span>
                <h1>Track Your Atoms</h1>
                <p>Observe your patterns. Celebrate consistency. Every completion is a vote for who you're becoming.</p>
            </div>

            {/* Motivational Quote Banner */}
            {loadError && (
                <div role="alert" style={{ marginBottom: '1rem', padding: '0.9rem 1rem', borderRadius: '12px', background: '#fff4ec', color: '#754a35' }}>
                    {loadError}
                    <button type="button" onClick={refreshHabits} style={{ marginLeft: '0.75rem', textDecoration: 'underline' }}>Retry</button>
                </div>
            )}
            <div className={styles.motivationBanner}>
                <p>“{quote}”</p>
            </div>

            <div className={styles.dashboardGrid}>
                {/* LEFT: Orbit Visualization */}
                <section className={styles.orbitCard}>
                    <div className={styles.orbitWrapper}>
                        <svg className={styles.progressRing} width="260" height="260">
                            <circle stroke="#F7F3E8" strokeWidth="8" fill="transparent" r="120" cx="130" cy="130" />
                            <circle
                                stroke="#DDA85D"
                                strokeWidth="8"
                                strokeLinecap="round"
                                fill="transparent"
                                r="120"
                                cx="130"
                                cy="130"
                                style={{
                                    strokeDasharray: `${2 * Math.PI * 120}`,
                                    strokeDashoffset: `${2 * Math.PI * 120 * (1 - progressPercent / 100)}`,
                                    transition: 'stroke-dashoffset 1s ease-out'
                                }}
                            />
                        </svg>
                        <div className={styles.orbitCenter}>
                            <span className={styles.bigNumber}>{atoms.length}</span>
                            <span className={styles.label}>Atoms</span>
                        </div>

                        {/* Revolving Atoms */}
                        <div className={styles.revolvingRing}>
                            {atoms.map((atom, index) => {
                                const angle = (index / atoms.length) * 360;
                                return (
                                    <div
                                        key={atom.id}
                                        className={styles.orbitDot}
                                        style={{ transform: `rotate(${angle}deg) translate(120px) rotate(-${angle}deg)` }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                    <div className={styles.orbitStats}>
                        <p className={styles.highlight}>{completedCount} of {atoms.length} atoms</p>
                        <p className={styles.subtext}>{progressPercent}% complete</p>
                    </div>
                </section>

                {/* RIGHT: Today's Progress Cards */}
                <section className={styles.progressCard}>
                    <h3>Today's Progress</h3>
                    <div className={styles.squircleGrid}>
                        {atoms.map(atom => {
                            const isComplete = logs[atom.id]?.status === 'completed' || logs[atom.id]?.completed;
                            return (
                                <div key={atom.id} style={{ position: 'relative' }}>
                                    <button
                                        type="button"
                                        onClick={() => { void handleToggle(atom.id); }}
                                        disabled={savingAtomId !== null}
                                        aria-pressed={Boolean(isComplete)}
                                        aria-label={`${atom.title}: ${isComplete ? 'completed' : 'pending'}. Toggle completion.`}
                                        className={`${styles.squircleBtn} ${isComplete ? styles.squircleComplete : ''}`}
                                    >
                                        <span className={styles.squircleTitle}>{(atom.title || '').substring(0, 4)}</span>
                                        {isComplete && <div className={styles.checkBadge}><Check size={12} color="white" /></div>}
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); void handleRemove(atom.id); }}
                                        disabled={savingAtomId !== null}
                                        aria-label={`Remove ${atom.title}`}
                                        style={{ position: 'absolute', top: -8, right: -8, background: '#f44336', color: 'white', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                    <p className={styles.instruction}>Tap an Atom to mark it complete. Each one matters.</p>
                </section>
            </div>

            {/* BOTTOM: Details Table */}
            <section className={styles.detailsSection}>
                <h3>Today's Details</h3>
                <div className={styles.table}>
                    <div className={styles.tableHead}>
                        <div>Atom</div>
                        <div>Status</div>
                        <div>Feeling</div>
                        <div>Duration</div>
                        <div style={{ textAlign: 'right' }}>Time</div>
                        <div></div>{/* Edit actions */}
                    </div>
                    {atoms.map(atom => {
                        const log = logs[atom.id] || {};
                        const isComplete = log.status === 'completed' || log.completed;
                        const isEditing = editingAtomId === atom.id;
                        
                        // Parse legacy or AddAtom combined time
                        let timeStr = atom.time || 'Anytime';
                        let storedDuration = atom.duration || '';
                        
                        if (!storedDuration && timeStr.includes(' · ')) {
                            const parts = timeStr.split(' · ');
                            timeStr = parts[0];
                            storedDuration = parts[1];
                        }

                        const displayDuration = log.duration ? `${log.duration} min` : (storedDuration ? `${storedDuration}` : '0 min');
                        const displayTime = timeStr.replace(/\d+\s*min/i, '').replace(/·\s*$/, '').trim() || 'Anytime';

                        return (
                            <div key={atom.id} className={`${styles.tableRow} ${isEditing ? styles.editingRow : ''}`}>
                                <div className={styles.atomName}>{atom.title}</div>
                                <div>
                                    <span className={`${styles.statusPill} ${isComplete ? styles.pillComplete : styles.pillPending}`}>
                                        {isComplete ? "Complete" : "Pending"}
                                    </span>
                                </div>
                                
                                {isEditing ? (
                                    <>
                                        <div>
                                            <select 
                                                value={editForm.mood} 
                                                onChange={e => setEditForm({...editForm, mood: e.target.value})}
                                                className={styles.inlineSelect}
                                            >
                                                {MOOD_OPTIONS.map(m => <option key={m.value} value={m.value}>{m.emoji} {m.label}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <input 
                                                type="number" 
                                                value={editForm.duration} 
                                                onChange={e => setEditForm({...editForm, duration: e.target.value})}
                                                className={styles.inlineInput}
                                                placeholder="Mins"
                                            />
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <input 
                                                type="text" 
                                                value={editForm.time} 
                                                onChange={e => setEditForm({...editForm, time: e.target.value})}
                                                className={styles.inlineInput}
                                                placeholder="Time"
                                            />
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <button onClick={() => { void saveEdit(atom.id); }} disabled={savingAtomId !== null} className={styles.saveBtn}>Save</button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                            {MOOD_OPTIONS.map(m => {
                                                const isSelected = log.mood === m.value;
                                                return (
                                                    <button
                                                        key={m.value}
                                                        type="button"
                                                        onClick={() => { void handleMoodChange(atom.id, m.value); }}
                                                        disabled={savingAtomId !== null}
                                                        title={m.label}
                                                        aria-label={m.label}
                                                        aria-pressed={isSelected}
                                                        style={{
                                                            padding: '3px 6px',
                                                            borderRadius: '8px',
                                                            border: isSelected ? '2px solid #DDA85D' : '1px solid rgba(0,0,0,0.08)',
                                                            background: isSelected ? 'rgba(221,168,93,0.15)' : 'transparent',
                                                            cursor: 'pointer',
                                                            fontSize: '1rem',
                                                            transition: 'all 0.15s',
                                                            transform: isSelected ? 'scale(1.15)' : 'scale(1)'
                                                        }}
                                                    >
                                                        {m.emoji}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <div className={styles.durationText}>{displayDuration}</div>
                                        <div className={styles.timeText} style={{ textAlign: 'right' }}>{displayTime}</div>
                                        <div style={{ textAlign: 'right' }}>
                                            <button onClick={() => startEditing(atom, log)} className={styles.editBtn}>Edit</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* BOTTOM: Efficiency Graph */}
            <section className={styles.efficiencySection}>
                <div className={styles.sectionHeader}>
                    <h3>Weekly habit completions</h3>
                    <span className={styles.dateRange}>Last 7 days</span>
                </div>
                <EfficiencyGraph data={weeklyData} />
                <div className={styles.graphFooter}>
                    <span>Average {averageCompleted} completed habits per day · busiest day: {peakCompleted}</span>
                    <span className={styles.positiveGrowth}>Last 7 days</span>
                </div>
            </section>

        </div>
    );
};

export default TrackAtom;
