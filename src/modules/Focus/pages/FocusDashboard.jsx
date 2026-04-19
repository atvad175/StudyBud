import React from 'react';
import { NavLink } from 'react-router-dom';
import { Play, TrendingUp, Clock, Headphones, Users } from 'lucide-react';
import styles from './FocusDashboard.module.css';

const FocusDashboard = () => {
    // Mock Data for now - Supabase aggregation would happen in Context/Backend
    const stats = {
        totalMinutes: 420,
        sessionsToday: 3,
        dailyAvg: 65,
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <span className={styles.breadcrumb}>Focus / Dashboard</span>
                    <h1>Focus</h1>
                    <p>Run a timer, join a study room, or play focus sounds — all in one place.</p>
                </div>
                <NavLink to="timer" className={styles.ctaBtn}>
                    <Play size={20} fill="currentColor" />
                    <span>Start Session</span>
                </NavLink>
            </header>

            {/* Quick Stats */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Total Focus</div>
                    <div className={styles.statValue}>{stats.totalMinutes}<span className={styles.unit}>m</span></div>
                    <div className={styles.statFooter}>
                        <TrendingUp size={14} /> +12% from last week
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Sessions Today</div>
                    <div className={styles.statValue}>{stats.sessionsToday}</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Daily Average</div>
                    <div className={styles.statValue}>{stats.dailyAvg}<span className={styles.unit}>m</span></div>
                </div>
            </div>

            {/* Navigation Cards */}
            <h2 className={styles.sectionTitle}>Tools & Zones</h2>
            <div className={styles.navGrid}>
                <NavLink to="timer" className={styles.navCard}>
                    <div className={styles.cardContent}>
                        <div className={styles.iconCircle}>
                            <Clock size={32} />
                        </div>
                        <h3>Timer & Stopwatch</h3>
                        <p>Classic Pomodoro or open-ended focus.</p>
                    </div>
                </NavLink>

                <NavLink to="rooms" className={styles.navCard}>
                    <div className={styles.cardContent}>
                        <div className={styles.iconCircle}>
                            <Users size={32} />
                        </div>
                        <h3>Study rooms</h3>
                        <p>Study quietly alongside others online — like a shared library.</p>
                    </div>
                </NavLink>

                <NavLink to="beats" className={styles.navCard}>
                    <div className={styles.cardContent}>
                        <div className={styles.iconCircle}>
                            <Headphones size={32} />
                        </div>
                        <h3>Beats &amp; sound</h3>
                        <p>Lo-fi, white noise, and other tracks to help you concentrate.</p>
                    </div>
                </NavLink>
            </div>
        </div>
    );
};

export default FocusDashboard;
