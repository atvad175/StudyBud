import React, { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import styles from '../MindShared.module.css';
import { Archive, Feather, Smile, Wind, ArrowRight } from 'lucide-react';
import { useMind } from '../../../context/useMind';

const BACKGROUND_PARTICLES = [
    { id: 'a', top: '8%', left: '9%', width: 140, height: 160, duration: 17 },
    { id: 'b', top: '22%', left: '74%', width: 190, height: 175, duration: 23 },
    { id: 'c', top: '66%', left: '82%', width: 120, height: 130, duration: 19 },
    { id: 'd', top: '73%', left: '16%', width: 175, height: 150, duration: 25 },
    { id: 'e', top: '44%', left: '46%', width: 135, height: 145, duration: 21 },
];

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
};

const MindDashboard = () => {
    const { logs = [], loadError = '' } = useMind();
    const [greeting] = useState(getGreeting);

    const activityByDay = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return Array.from({ length: 7 }, (_, index) => {
            const date = new Date(today);
            date.setDate(today.getDate() - (6 - index));
            const nextDay = new Date(date);
            nextDay.setDate(date.getDate() + 1);

            const count = (Array.isArray(logs) ? logs : []).filter(log => {
                if (!log?.created_at) return false;
                const created = new Date(log.created_at);
                return !Number.isNaN(created.getTime()) && created >= date && created < nextDay;
            }).length;

            return {
                key: date.toISOString().slice(0, 10),
                label: date.toLocaleDateString(undefined, { weekday: 'short' }),
                dateLabel: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                count,
            };
        });
    }, [logs]);

    const maxActivity = Math.max(1, ...activityByDay.map(day => day.count));
    const firstName = localStorage.getItem('studybud_username')?.split(' ')[0] || 'Student';
    const weeklyTotal = activityByDay.reduce((sum, day) => sum + day.count, 0);

    return (
        <div className={styles.container}>
            <div className={styles.aliveBackground} aria-hidden="true" />
            {BACKGROUND_PARTICLES.map(particle => (
                <div
                    key={particle.id}
                    className={styles.particle}
                    aria-hidden="true"
                    style={{
                        top: particle.top,
                        left: particle.left,
                        width: `${particle.width}px`,
                        height: `${particle.height}px`,
                        animationDuration: `${particle.duration}s`,
                    }}
                />
            ))}

            <header className={styles.header}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <span className={styles.breadcrumb}>{greeting}, {firstName}.</span>
                        <h1>Mind Space</h1>
                        <p style={{ maxWidth: 620, color: 'var(--color-text-secondary)', lineHeight: 1.65 }}>
                            A private space to reflect, reset and notice your patterns over time.
                        </p>
                    </div>
                </div>
            </header>

            {loadError && (
                <div role="alert" style={{ margin: '0 0 1.5rem', padding: '1rem 1.1rem', border: '1px solid #e2b9a1', borderRadius: '14px', background: '#fff4ec', color: '#754a35' }}>
                    <strong>Saved Mind entries could not be loaded.</strong>
                    <p style={{ margin: '0.35rem 0 0.8rem', lineHeight: 1.5, fontSize: '0.88rem' }}>{loadError}</p>
                    <button type="button" onClick={() => window.location.reload()} style={{ border: '1px solid #c99a7f', borderRadius: '8px', padding: '0.55rem 0.75rem', background: '#fff', color: '#754a35', cursor: 'pointer' }}>Retry</button>
                </div>
            )}

            <section
                className={styles.chartContainer}
                aria-labelledby="mind-activity-title"
                style={{ marginBottom: '3rem', minHeight: 220, padding: '1.5rem', position: 'relative' }}
            >
                <div className={styles.activityChartHeader}>
                    <div>
                        <h2 id="mind-activity-title">Mind activity</h2>
                        <p>Saved Mind entries over the last 7 days</p>
                    </div>
                    <div className={styles.activityChartTotal}>
                        <strong>{weeklyTotal}</strong>
                        <span>{weeklyTotal === 1 ? 'entry' : 'entries'}</span>
                    </div>
                </div>

                <div className={styles.activityBars} role="list" aria-label="Daily saved Mind entry counts">
                    {activityByDay.map(day => (
                        <div className={styles.activityDay} role="listitem" key={day.key}>
                            <div className={styles.activityBarTrack}>
                                <div
                                    className={styles.activityBar}
                                    style={{ height: `${Math.max(6, (day.count / maxActivity) * 100)}%` }}
                                    title={`${day.dateLabel}: ${day.count} saved ${day.count === 1 ? 'entry' : 'entries'}`}
                                    aria-label={`${day.dateLabel}: ${day.count} saved ${day.count === 1 ? 'entry' : 'entries'}`}
                                />
                            </div>
                            <strong>{day.count}</strong>
                            <span>{day.label}</span>
                        </div>
                    ))}
                </div>
                {weeklyTotal === 0 && (
                    <p className={styles.activityEmpty}>
                        Your saved reflections, breathing sessions, wins and other Mind entries will appear here.
                    </p>
                )}
                <p className={styles.activityDisclaimer}>
                    This shows saved activity, not a measure of mood or mental health.
                </p>
            </section>

            <div className={styles.grid}>
                <NavLink to="meditation" className={styles.card}>
                    <div className={styles.iconBox} style={{ background: '#e0fcf5', color: '#00b894' }}>
                        <Wind size={32} />
                    </div>
                    <h2>Relax</h2>
                    <p>Breathing exercises and guided pauses.</p>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: 'auto', color: '#00a28c', fontWeight: 650 }}>
                        Explore <ArrowRight size={15} />
                    </span>
                </NavLink>

                <NavLink to="reflection" className={styles.card}>
                    <div className={styles.iconBox} style={{ background: '#f0f3ff', color: '#6c5ce7' }}>
                        <Feather size={32} />
                    </div>
                    <h2>Reflect</h2>
                    <p>Capture thoughts and look back on what matters.</p>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: 'auto', color: '#6c5ce7', fontWeight: 650 }}>
                        Start reflecting <ArrowRight size={15} />
                    </span>
                </NavLink>

                <NavLink to="offload" className={styles.card}>
                    <div className={styles.iconBox} style={{ background: '#fff5eb', color: '#e17055' }}>
                        <Archive size={32} />
                    </div>
                    <h2>Brain dump</h2>
                    <p>Write down what is on your mind, then choose one next step.</p>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: 'auto', color: '#d65c40', fontWeight: 650 }}>
                        Clear some space <ArrowRight size={15} />
                    </span>
                </NavLink>

                <NavLink to="growth" className={styles.card}>
                    <div className={styles.iconBox} style={{ background: '#fff9e6', color: '#c38c00' }}>
                        <Smile size={32} />
                    </div>
                    <h2>Wins</h2>
                    <p>Keep track of positive moments and progress.</p>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: 'auto', color: '#a87800', fontWeight: 650 }}>
                        Record a win <ArrowRight size={15} />
                    </span>
                </NavLink>
            </div>
        </div>
    );
};

export default MindDashboard;
