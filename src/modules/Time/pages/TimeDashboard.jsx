import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Brain, Zap, BarChart2, TrendingUp, Clock, CheckCircle, Battery, Sun, Moon } from 'lucide-react';
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
    const maxSafeLoad = 25; // Arbitrary threshold
    const fatiguePercent = Math.min((currentFrictionLoad / maxSafeLoad) * 100, 100);
    const isOverloaded = fatiguePercent > 80;

    // --- Feature 5: Morning Briefing ---
    // Recommend top 3 tasks based on "High Energy" match if available, or just top priority
    const topTasks = planned
        .filter(t => t.energy_block === 'High' || t.difficulty === 'Hard')
        .slice(0, 3);

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
                    <span className={styles.metricLabel}><Battery size={14} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} /> Mental Energy / Fatigue Risk</span>
                    <span style={{ fontWeight: 'bold', color: isOverloaded ? '#e74c3c' : '#2ecc71' }}>{Math.round(fatiguePercent)}% {isOverloaded && '(REST NEEDED)'}</span>
                </div>
                <div className={styles.fatigueGauge}>
                    <div className={styles.fatigueFill} style={{ width: `${fatiguePercent}%` }}></div>
                </div>
                {isOverloaded && <p style={{ fontSize: '0.8rem', color: '#e74c3c', marginTop: '8px', fontWeight: '600' }}>⚠ Warning: High mental load. Consider taking a break or doing easier tasks.</p>}
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
