import React, { useState, useEffect } from 'react';
import { useHabits } from '../../../context/HabitsContext';
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
    // Generate graph from dynamic data prop
    const points = data && data.length > 0 ? data.map(d => d.value) : [0,0,0,0,0,0,0]; 
    const height = 150;
    const width = 1000;
    const spacing = width / (points.length - 1);

    // Create path
    let pathD = `M 0 ${height - points[0]}`;
    for (let i = 1; i < points.length; i++) {
        const x = i * spacing;
        const y = height - points[i];
        // Simple bezier smoothing logic could go here, treating as straight lines for now for simplicity or basic curve
        const prevX = (i - 1) * spacing;
        const prevY = height - points[i - 1];
        const cp1x = prevX + spacing / 2;
        const cp1y = prevY;
        const cp2x = x - spacing / 2;
        const cp2y = y;
        pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
    }

    return (
        <div className={styles.graphContainer}>
            <svg viewBox={`0 0 ${width} ${height + 50}`} className={styles.svgGraph}>
                {/* Gradient Defs */}
                <defs>
                    <linearGradient id="gradientGold" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#DDA85D" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#DDA85D" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Fill Area */}
                <path d={`${pathD} L ${width} ${height + 50} L 0 ${height + 50} Z`} fill="url(#gradientGold)" />

                {/* Stroke Line */}
                <path d={pathD} fill="none" stroke="#DDA85D" strokeWidth="3" strokeLinecap="round" />

                {/* Labels */}
                <g className={styles.graphLabels}>
                    {data && data.map((item, i) => (
                        <text key={i} x={i * spacing} y={height + 30} textAnchor="middle" fill="#5C5A53" fontSize="24">{item.label}</text>
                    ))}
                </g>

                {/* Y-Axis Grid Hint */}
                <line x1="0" y1={height - 100} x2={width} y2={height - 100} stroke="#EBE5D5" strokeDasharray="5,5" />
                <text x="10" y={height - 105} fill="#BBB" fontSize="20">100</text>
            </svg>
        </div>
    );
};

const TrackAtom = () => {
    const { atoms, getTodayLog, updateLog, removeAtom, logs: contextLogs } = useHabits();
    const [logs, setLogs] = useState({});
    const [quote, setQuote] = useState("");
    const [editingAtomId, setEditingAtomId] = useState(null);
    const [editForm, setEditForm] = useState({ time: '', duration: '', mood: '' });

    // Compute weekly data dynamically
    const weeklyData = React.useMemo(() => {
        const last7 = [];
        const today = new Date();
        const numAtoms = atoms?.length || 1; 
        for(let i=6; i>=0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const logsForDay = contextLogs[dateStr] || {};
            const completedCount = Object.values(logsForDay).filter(l => l.status === 'completed' || l.completed).length;
            const percent = Math.round((completedCount / numAtoms) * 100);
            last7.push({
                label: d.toLocaleDateString('en-US', { weekday: 'short' }),
                value: Math.min(100, percent)
            });
        }
        return last7;
    }, [contextLogs, atoms]);

    const averageRate = Math.round(weeklyData.reduce((acc, curr) => acc + curr.value, 0) / 7);

    useEffect(() => {
        setLogs(getTodayLog());
        setQuote(MOTIVATIONS[new Date().getDate() % MOTIVATIONS.length]);
    }, [getTodayLog]);

    const handleToggle = (atomId) => {
        const log = logs[atomId] || {};
        const isComplete = log.status === 'completed' || log.completed;
        const newStatus = isComplete ? 'pending' : 'completed';

        updateLog(atomId, { status: newStatus, completed: !isComplete });
        setLogs(prev => ({
            ...prev,
            [atomId]: { ...prev[atomId], status: newStatus, completed: !isComplete }
        }));
    };

    const handleMoodChange = (atomId, mood) => {
        updateLog(atomId, { mood });
        setLogs(prev => ({
            ...prev,
            [atomId]: { ...prev[atomId], mood }
        }));
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

    const saveEdit = (atomId) => {
        updateLog(atomId, { 
            time: editForm.time, 
            duration: editForm.duration,
            mood: editForm.mood
        });
        setLogs(prev => ({
            ...prev,
            [atomId]: { 
                ...prev[atomId], 
                time: editForm.time, 
                duration: editForm.duration,
                mood: editForm.mood
            }
        }));
        setEditingAtomId(null);
    };

    const completedCount = logs ? Object.values(logs).filter(l => l.status === 'completed' || l.completed).length : 0;
    const progressPercent = atoms && atoms.length > 0 ? Math.round((completedCount / atoms.length) * 100) : 0;

    if (!atoms) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Atoms...</div>;


    return (
        <div className="page-container">
            <div className={styles.header}>
                <span className={styles.breadcrumb}>Habits / Track</span>
                <h1>Track Your Atoms</h1>
                <p>Observe your patterns. Celebrate consistency. Every completion is a vote for who you're becoming.</p>
            </div>

            {/* Motivational Quote Banner */}
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
                                        onClick={() => handleToggle(atom.id)}
                                        className={`${styles.squircleBtn} ${isComplete ? styles.squircleComplete : ''}`}
                                    >
                                        <span className={styles.squircleTitle}>{(atom.title || '').substring(0, 4)}</span>
                                        {isComplete && <div className={styles.checkBadge}><Check size={12} color="white" /></div>}
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); removeAtom(atom.id); }}
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
                                            <button onClick={() => saveEdit(atom.id)} className={styles.saveBtn}>Save</button>
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
                                                        onClick={() => handleMoodChange(atom.id, m.value)}
                                                        title={m.label}
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
                    <h3>Weekly Efficiency</h3>
                    <span className={styles.dateRange}>Last 7 days</span>
                </div>
                <EfficiencyGraph data={weeklyData} />
                <div className={styles.graphFooter}>
                    <span>Average: {averageRate}% completion rate ({atoms.length} active atoms)</span>
                    <span className={styles.positiveGrowth}>Active Tracker</span>
                </div>
            </section>

        </div>
    );
};

export default TrackAtom;
