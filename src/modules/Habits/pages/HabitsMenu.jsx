import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { Plus, Target, BookOpen, Trophy, Flame, CheckCircle, TrendingUp } from 'lucide-react';
import { useHabits } from '../../../context/HabitsContext';
import styles from './HabitsMenu.module.css';

const HabitsMenu = () => {
    const { atoms, getTodayLog, getTotalWins } = useHabits();

    const stats = useMemo(() => {
        const totalAtoms = atoms.length;
        const todayLog = getTodayLog();
        const completedToday = Object.values(todayLog).filter(l => l.status === 'completed' || l.completed).length;

        // Mocking streak for dashboard
        const streak = completedToday > 0 ? 1 : 0;
        const totalWins = getTotalWins();

        return { totalAtoms, completedToday, streak, totalWins };
    }, [atoms, getTodayLog, getTotalWins]);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <span className={styles.breadcrumb}>Habits / Dashboard</span>
                    <h1>Atom System</h1>
                    <p>Build the behaviors that build you.</p>
                </div>
                <NavLink to="add" className={styles.ctaBtn}>
                    <Plus size={20} />
                    <span>New Atom</span>
                </NavLink>
            </header>

            {/* Stats Row */}
            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <div className={`${styles.iconBox} ${styles.blue}`}>
                        <Target size={24} />
                    </div>
                    <div>
                        <h3>{stats.totalAtoms}</h3>
                        <p>Total Atoms</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.iconBox} ${styles.green}`}>
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <h3>{stats.completedToday}</h3>
                        <p>Completed Today</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.iconBox} ${styles.orange}`}>
                        <Flame size={24} />
                    </div>
                    <div>
                        <h3>{stats.streak} <span className={styles.unit}>days</span></h3>
                        <p>Current Streak</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.iconBox} ${styles.purple}`}>
                        <Trophy size={24} />
                    </div>
                    <div>
                        <h3>{stats.totalWins}</h3>
                        <p>Total Wins</p>
                    </div>
                </div>
            </div>

            <h2 className={styles.sectionTitle}>Manage</h2>
            <div className={styles.grid}>
                <NavLink to="add" className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardIconBox}><Plus size={32} /></div>
                        <div className={styles.arrowIcon}>→</div>
                    </div>
                    <h2>Add Atom</h2>
                    <p>Define a new habit to build.</p>
                </NavLink>

                <NavLink to="track" className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardIconBox}><Target size={32} /></div>
                        <div className={styles.arrowIcon}>→</div>
                    </div>
                    <h2>Track Atoms</h2>
                    <p>Review and log your daily progress.</p>
                </NavLink>

                <NavLink to="fission" className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardIconBox}><BookOpen size={32} /></div>
                        <div className={styles.arrowIcon}>→</div>
                    </div>
                    <h2>Fission</h2>
                    <p>Learn the principles of consistency.</p>
                </NavLink>
            </div>
        </div>
    );
};

export default HabitsMenu;
