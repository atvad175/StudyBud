import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTime } from '../../../context/TimeContext';
import styles from './EnergyMatching.module.css';
import { PlayCircle, User, ArrowRight, Zap, Battery, BatteryMedium, BatteryLow } from 'lucide-react';

const EnergyGraph = ({ chronotype }) => {
    // Determine curve path based on chronotype
    let pathD = "M 0 100 Q 250 100 500 100"; // Default flat

    if (chronotype === 'Bear') pathD = "M 0 120 C 150 120, 200 40, 250 40 C 300 40, 350 120, 500 120"; // Mid-day peak
    if (chronotype === 'Lion') pathD = "M 0 120 C 50 40, 150 40, 200 80 C 350 120, 450 120, 500 120"; // Morning peak
    if (chronotype === 'Wolf') pathD = "M 0 120 C 150 120, 250 120, 300 120 C 350 40, 450 40, 500 60"; // Evening peak
    if (chronotype === 'Dolphin') pathD = "M 0 100 Q 125 60 250 100 Q 375 140 500 100"; // Wavy

    return (
        <div className={styles.energyGraph}>
            <div className={styles.graphMeta}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-soft-black)' }}>Your Rhythm</h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#999' }}>{chronotype} Chronotype Pattern</p>
                </div>
                <Zap size={20} color="var(--color-gold)" />
            </div>

            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '120px', display: 'block' }}>
                <svg viewBox="0 0 500 150" width="100%" height="100%" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style={{ stopColor: '#FF9966', stopOpacity: 0.2 }} />
                            <stop offset="50%" style={{ stopColor: '#FF5E62', stopOpacity: 0.2 }} />
                            <stop offset="100%" style={{ stopColor: '#2F80ED', stopOpacity: 0.2 }} />
                        </linearGradient>
                    </defs>
                    <path d={pathD} fill="none" stroke="url(#grad1)" strokeWidth="4" strokeLinecap="round" />
                    <path d={pathD + " L 500 150 L 0 150 Z"} fill="url(#grad1)" stroke="none" />
                </svg>
            </div>

            {/* Time labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', zIndex: 1, fontSize: '0.7rem', color: '#ccc', marginTop: 'auto' }}>
                <span>6 AM</span>
                <span>12 PM</span>
                <span>6 PM</span>
                <span>12 AM</span>
            </div>
        </div>
    )
}

const EnergyMatching = () => {
    const { tasks, updateTask, settings, updateSettings } = useTime();

    const plannedTasks = tasks.filter(t => t.status === 'Planned');
    const highEnergyTasks = plannedTasks.filter(t => t.energy_block === 'High');
    const mediumEnergyTasks = plannedTasks.filter(t => t.energy_block === 'Medium');
    const lowEnergyTasks = plannedTasks.filter(t => t.energy_block === 'Low');
    const unmatchedTasks = plannedTasks.filter(t => !t.energy_block);

    const moveTask = (id, block) => updateTask(id, { energy_block: block });

    const TaskCard = ({ task, block }) => (
        <div className={styles.taskCard}>
            <div className={styles.cardTop}>
                <span className={styles.cardTitle}>{task.title}</span>
                <span className={styles.cardTime}>{task.time_estimate}m</span>
            </div>
            <div className={styles.cardTags}>
                <span className={styles.tag}>{task.cognitive_type}</span>
                <span className={styles.tag}>{task.difficulty}</span>
            </div>

            <div className={styles.actions}>
                {block !== 'High' && <button className={styles.moveBtn} onClick={() => moveTask(task.id, 'High')} title="Move to High Energy">H</button>}
                {block !== 'Medium' && <button className={styles.moveBtn} onClick={() => moveTask(task.id, 'Medium')} title="Move to Medium Energy">M</button>}
                {block !== 'Low' && <button className={styles.moveBtn} onClick={() => moveTask(task.id, 'Low')} title="Move to Low Energy">L</button>}

                {block === 'High' && (
                    <NavLink to="/focus/timer" style={{ marginLeft: 'auto', color: 'var(--color-gold)' }}>
                        <PlayCircle size={20} />
                    </NavLink>
                )}
            </div>
        </div>
    );

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <span className={styles.breadcrumb}>Time / Alignment</span>
                    <h1>Energy Matching</h1>
                </div>

                <div className={styles.settingsPill}>
                    <User size={16} color="var(--color-text-secondary)" />
                    <select
                        value={settings.chronotype}
                        onChange={(e) => updateSettings({ chronotype: e.target.value })}
                        className={styles.chronotypeSelect}
                    >
                        <option value="Bear">Bear (Day)</option>
                        <option value="Wolf">Wolf (Night)</option>
                        <option value="Lion">Lion (Morning)</option>
                        <option value="Dolphin">Dolphin (Sporadic)</option>
                    </select>
                </div>
            </header>

            <div className={styles.grid}>
                {/* Sidebar: Unmatched & Graph */}
                <div className={styles.mainArea}>
                    <EnergyGraph chronotype={settings.chronotype} />

                    <div className={styles.sidebar}>
                        <h3 className={styles.sidebarTitle}>Unmatched Tasks ({unmatchedTasks.length})</h3>
                        <div className={styles.taskList}>
                            {unmatchedTasks.map(t => <TaskCard key={t.id} task={t} block={null} />)}
                            {unmatchedTasks.length === 0 && (
                                <div style={{ color: '#ccc', textAlign: 'center', marginTop: '2rem' }}>All aligned.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Energy columns */}
                <div className={styles.columns}>
                    {/* High */}
                    <div className={styles.column}>
                        <div className={`${styles.columnHeader} ${styles.highHeader}`}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Zap size={18} fill="white" />
                                <span>High Energy</span>
                            </div>
                        </div>
                        <div className={styles.taskList}>
                            {highEnergyTasks.map(t => <TaskCard key={t.id} task={t} block="High" />)}
                        </div>
                    </div>

                    {/* Medium */}
                    <div className={styles.column}>
                        <div className={`${styles.columnHeader} ${styles.medHeader}`}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <BatteryMedium size={18} />
                                <span>Medium Energy</span>
                            </div>
                        </div>
                        <div className={styles.taskList}>
                            {mediumEnergyTasks.map(t => <TaskCard key={t.id} task={t} block="Medium" />)}
                        </div>
                    </div>

                    {/* Low */}
                    <div className={styles.column}>
                        <div className={`${styles.columnHeader} ${styles.lowHeader}`}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <BatteryLow size={18} />
                                <span>Low Energy</span>
                            </div>
                        </div>
                        <div className={styles.taskList}>
                            {lowEnergyTasks.map(t => <TaskCard key={t.id} task={t} block="Low" />)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnergyMatching;
