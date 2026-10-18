import React from 'react';
import { NavLink } from 'react-router-dom';
import { Brain, Zap, BarChart2, TrendingUp, Clock, CheckCircle, Battery } from 'lucide-react';
import styles from '../TimeShared.module.css';
import { useTime } from '../../../context/TimeContext';

const TimeDashboard = () => {
    const { tasks } = useTime();

    // Stats
    const planned = tasks.filter(t => t.status === 'Planned');
    const executed = tasks.filter(t => t.status === 'Executed');
    const reflected = tasks.filter(t => t.status === 'Reflected');

    const totalTasks = tasks.length;
    const completedTasks = executed.length + reflected.length;
    const efficiency = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // --- Feature 4: Fatigue Meter ---
    // Calculate accumulated friction 
    const frictionMap = { 'Low': 1, 'Medium': 3, 'High': 5 };
    const currentFrictionLoad = planned.reduce((acc, t) => acc + (frictionMap[t.emotional_friction] || 1), 0);
    const referenceLoad = 25; // A rough UI reference, not a measured fatigue threshold.
    const frictionPercent = Math.min((currentFrictionLoad / referenceLoad) * 100, 100);
    const isHighPlannedFriction = frictionPercent > 80;

    // --- Feature 5: Morning Briefing ---
    // Recommend top 3 tasks based on "High Energy" match if available, or just top priority
    const higherDemandTasks = planned.filter(task =>
        task.energy_block === 'High' || task.difficulty === 'Hard'
    );
    const topTasks = (higherDemandTasks.length ? higherDemandTasks : planned).slice(0, 3);

    return (
        <div className={`${styles.container} ${styles.aliveBackground}`}>

            <header className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    {/* Feature: Orbital Animation Icon */}
                    <div className={styles.orbitSystem}>
                        <div className={styles.sun}></div>
                        <div className={`${styles.orbitRing} ${styles.ring1}`}>
                            <div className={styles.planet}></div>
                        </div>
                        <div className={`${styles.orbitRing} ${styles.ring2}`}>
                            <div className={styles.planet} style={{ width: '6px', height: '6px', background: '#999' }}></div>
                        </div>
                    </div>

                    <div>
                        <span className={styles.breadcrumb}>Time / Dashboard</span>
                        <h1>Daily Schedule</h1>
                    </div>
                </div>
            </header>

            {/* Feature 4: Fatigue Meter Gizmo */}
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', marginBottom: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span className={styles.metricLabel}><Battery size={14} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} /> Planned task friction (estimate)</span>
                    <span style={{ fontWeight: 'bold', color: isHighPlannedFriction ? '#9a5b13' : '#2d7a50' }}>{Math.round(frictionPercent)}% {isHighPlannedFriction && '(consider a lighter task)'}</span>
                </div>
                <div className={styles.fatigueGauge}>
                    <div className={styles.fatigueFill} style={{ width: `${frictionPercent}%`, background: isHighPlannedFriction ? 'linear-gradient(90deg, #e6b75c, #c47b34)' : 'linear-gradient(90deg, #65b98b, #3a9b74)' }}></div>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginTop: '0.7rem' }}>
                    A rough estimate based on friction labels on your planned tasks—not a measurement of your energy or health.
                </p>
            </div>

            {/* Metrics Row */}
            <div className={styles.statGrid}>
                <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>Daily Progress</span>
                    <span className={styles.metricValue}>{efficiency}%</span>
                    <div className={styles.progressContainer}>
                        <div className={styles.barFill} style={{ width: `${efficiency}%` }}></div>
                    </div>
                </div>

                <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>Pending Tasks</span>
                    <span className={styles.metricValue}>{planned.length}</span>
                    <span className={styles.metricTrend}><Clock size={16} /> Awaiting Energy</span>
                </div>

                <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>Done</span>
                    <span className={styles.metricValue}>{reflected.length}</span>
                    <span className={styles.metricTrend} style={{ color: 'var(--color-gold)' }}><CheckCircle size={16} /> Reflected</span>
                </div>
            </div>

            {/* Suggested tasks — restored the previously computed but hidden recommendation list. */}
            <section className={styles.briefingCard} aria-labelledby="suggested-tasks-title">
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <span style={{ display: 'block', marginBottom: '0.5rem', color: '#c9c1ff', fontSize: '0.75rem', fontWeight: 750, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                        YOUR NEXT STEP
                    </span>
                    <h2 id="suggested-tasks-title" style={{ margin: '0 0 0.5rem', fontSize: '1.65rem', fontFamily: 'var(--font-serif)' }}>
                        {topTasks.length ? 'A few tasks to consider' : 'Add your first task'}
                    </h2>
                    <p style={{ margin: '0 0 1.25rem', maxWidth: 620, color: 'rgba(255,255,255,0.72)', lineHeight: 1.55, fontSize: '0.9rem' }}>
                        {higherDemandTasks.length
                            ? 'These planned tasks are marked high-energy or hard. Choose the one that fits how you feel right now.'
                            : topTasks.length
                                ? 'These are your next planned tasks. Choose one manageable step and adjust the plan as needed.'
                                : 'Break down an assignment or task so you have a clear next action.'}
                    </p>
                    {topTasks.length > 0 ? (
                        <div style={{ display: 'grid', gap: '0.65rem', maxWidth: 760 }}>
                            {topTasks.map((task, index) => (
                                <div key={task.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', padding: '0.8rem 0.95rem', borderRadius: '12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                                        <span style={{ display: 'inline-flex', width: 28, height: 28, flex: '0 0 28px', alignItems: 'center', justifyContent: 'center', borderRadius: '9px', background: 'rgba(255,255,255,0.12)', fontSize: '0.8rem', fontWeight: 750 }}>{index + 1}</span>
                                        <span style={{ color: '#fff', fontWeight: 650, overflowWrap: 'anywhere' }}>{task.title}</span>
                                    </div>
                                    <span style={{ color: '#d8d4f5', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{task.time_estimate ? `${task.time_estimate} min` : 'Time not set'}</span>
                                </div>
                            ))}
                        </div>
                    ) : null}
                    <NavLink to="tasks" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', marginTop: '1.2rem', padding: '0.7rem 0.95rem', borderRadius: '10px', background: '#f0edff', color: '#403783', textDecoration: 'none', fontWeight: 750, fontSize: '0.85rem' }}>
                        {topTasks.length ? 'Review task plan' : 'Create a task'} <TrendingUp size={15} />
                    </NavLink>
                    <p style={{ margin: '0.9rem 0 0', fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)' }}>
                        Suggestions use your task labels, not a measurement of your attention or energy.
                    </p>
                </div>
            </section>

            {/* Pillars */}
            <h3 style={{ margin: '2rem 0 1.5rem', fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#444' }}>Plan Your Day</h3>
            <div className={styles.grid}>
                <NavLink to="tasks" className={`${styles.card} ${styles.floatingCard} ${styles.holographic}`} style={{ animationDelay: '0s' }}>
                    <div className={styles.iconBox}><Brain size={32} /></div>
                    <span className={styles.statusTag}>Step 1</span>
                    <h2>Task Breakdown</h2>
                    <p>Sort your tasks by how much brain power they need.</p>
                </NavLink>

                <NavLink to="energy" className={`${styles.card} ${styles.floatingCard} ${styles.holographic}`} style={{ animationDelay: '0.2s' }}>
                    <div className={styles.iconBox} style={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #fff 100%)', color: '#2980b9' }}><Zap size={32} /></div>
                    <span className={styles.statusTag}>Step 2</span>
                    <h2>Energy Match</h2>
                    <p>Match tasks to your energy levels throughout the day.</p>
                </NavLink>

                <NavLink to="reflection" className={`${styles.card} ${styles.floatingCard} ${styles.holographic}`} style={{ animationDelay: '0.4s' }}>
                    <div className={styles.iconBox} style={{ background: 'linear-gradient(135deg, #f3e5f5 0%, #fff 100%)', color: '#8e44ad' }}><BarChart2 size={32} /></div>
                    <span className={styles.statusTag}>Step 3</span>
                    <h2>Reflection</h2>
                    <p>See how you actually used your time compared to your plan.</p>
                </NavLink>
            </div>
        </div>
    );
};

export default TimeDashboard;
