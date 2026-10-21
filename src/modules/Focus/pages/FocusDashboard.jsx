import React, { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Play, Clock, Headphones, Users, Download, CalendarDays, BarChart3 } from 'lucide-react';
import { useFocus } from '../../../context/useFocus';
import { summarizeFocusSessions, summarizeFocusWindow } from '../focusStats';
import styles from './FocusDashboard.module.css';

const FocusDashboard = () => {
    const {
        sessions,
        loading,
        loadError,
        pendingSession,
        isSavingSession,
        retryPendingSessionSave,
        discardPendingSession,
    } = useFocus();
    const [historyWindow, setHistoryWindow] = useState(7);
    const stats = summarizeFocusSessions(sessions);
    const analytics = useMemo(() => summarizeFocusWindow(sessions, historyWindow), [sessions, historyWindow]);

    const exportHistory = () => {
        if (!sessions.length) return;
        const csvCell = (value) => {
            let text = String(value ?? '');
            if (/^\s*[=+\-@]/.test(text)) text = `'${text}`;
            return `"${text.replace(/"/g, '""')}"`;
        };
        const rows = [['Date', 'Category', 'Mode', 'Duration minutes', 'Status']];
        [...sessions]
            .filter(session => session?.created_at && !Number.isNaN(new Date(session.created_at).getTime()))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .forEach(session => rows.push([
                new Date(session.created_at).toLocaleString(),
                session.category || 'Uncategorised',
                session.mode || 'TIMER',
                Math.round((Number(session.duration_seconds) || 0) / 60),
                session.reason || 'Saved',
            ]));
        const csv = '\uFEFF' + rows.map(row => row.map(csvCell).join(',')).join('\r\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `studybud-focus-history-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    const handleDiscardPendingSession = () => {
        const confirmed = window.confirm(
            'Discard this unsaved focus session? It cannot be added to your saved history later.'
        );
        if (confirmed) discardPendingSession();
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
                    <Play size={20} fill="currentColor" aria-hidden="true" />
                    <span>Start Session</span>
                </NavLink>
            </header>

            {pendingSession && (
                <section className={styles.pendingSessionBanner} role="alert" aria-live="polite">
                    <div>
                        <strong>One focus session still needs saving.</strong>
                        <p>
                            {pendingSession.category} · {Math.round(pendingSession.duration_seconds / 60)} min recorded.
                            Your draft is kept in this tab. Save it before starting another session.
                        </p>
                        {loadError && <p>{loadError}</p>}
                    </div>
                    <div className={styles.pendingSessionActions}>
                        <button
                            type="button"
                            onClick={() => { void retryPendingSessionSave(); }}
                            disabled={isSavingSession}
                        >
                            {isSavingSession ? 'Saving…' : 'Retry save'}
                        </button>
                        <button
                            type="button"
                            onClick={handleDiscardPendingSession}
                            disabled={isSavingSession}
                        >
                            Discard
                        </button>
                    </div>
                </section>
            )}

            <section aria-labelledby="focus-history-heading" className={styles.historySection}>
                <h2 id="focus-history-heading" className={styles.sectionTitle}>Your focus history</h2>

                {loading ? (
                    <p className={styles.statusMessage} role="status" aria-live="polite">
                        Loading your saved focus sessions…
                    </p>
                ) : loadError ? (
                    <p className={styles.errorMessage} role="alert">
                        {loadError}
                    </p>
                ) : (
                    <>
                        <div className={styles.statsGrid}>
                            <div className={styles.statCard}>
                                <div className={styles.statLabel}>Sessions today</div>
                                <div className={styles.statValue}>{stats.sessionsToday}</div>
                                <div className={styles.statFooter}>Saved sessions completed or stopped today</div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statLabel}>Focus minutes today</div>
                                <div className={styles.statValue}>
                                    {stats.minutesToday}<span className={styles.unit}>min</span>
                                </div>
                                <div className={styles.statFooter}>Based on saved session duration</div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statLabel}>Sessions · last 7 days</div>
                                <div className={styles.statValue}>{stats.sessionsLastSevenDays}</div>
                                <div className={styles.statFooter}>
                                    {stats.minutesLastSevenDays} focus minutes in the same period
                                </div>
                            </div>
                        </div>
                        <p className={styles.statsNote}>
                            These summaries use up to your 50 most recent saved sessions, not a lifetime total.
                        </p>

                        <section className={styles.analyticsPanel} aria-labelledby="focus-analytics-title">
                            <div className={styles.analyticsHeader}>
                                <div>
                                    <span className={styles.analyticsEyebrow}><BarChart3 size={15} aria-hidden="true" /> YOUR RECENT PATTERN</span>
                                    <h3 id="focus-analytics-title">Focus analytics</h3>
                                    <p>Track saved sessions over the last week or month.</p>
                                </div>
                                <div className={styles.analyticsControls}>
                                    <div className={styles.rangeToggle} role="group" aria-label="Analytics date range">
                                        <button type="button" aria-pressed={historyWindow === 7} className={historyWindow === 7 ? styles.rangeActive : ''} onClick={() => setHistoryWindow(7)}>7 days</button>
                                        <button type="button" aria-pressed={historyWindow === 30} className={historyWindow === 30 ? styles.rangeActive : ''} onClick={() => setHistoryWindow(30)}>30 days</button>
                                    </div>
                                    <button type="button" className={styles.exportButton} onClick={exportHistory} disabled={!sessions.length}>
                                        <Download size={15} aria-hidden="true" /> Export CSV
                                    </button>
                                </div>
                            </div>

                            <div className={styles.analyticsTotals}>
                                <div><span>Focus minutes</span><strong>{analytics.totalMinutes}</strong></div>
                                <div><span>Saved sessions</span><strong>{analytics.totalSessions}</strong></div>
                                <div><span>Days with focus</span><strong>{analytics.activeDays}<small> / {historyWindow}</small></strong></div>
                            </div>

                            <div className={styles.trendSection}>
                                <div className={styles.subsectionHeading}>
                                    <strong><CalendarDays size={15} aria-hidden="true" /> Daily activity</strong>
                                    <span>{analytics.startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – today</span>
                                </div>
                                {analytics.totalSessions === 0 ? (
                                    <p className={styles.analyticsEmpty}>No saved sessions in this period yet. Start a session and your trend will appear here.</p>
                                ) : (
                                    <div className={styles.trendScroller} role="list" aria-label={`Focus sessions over the last ${historyWindow} days`}>
                                        {analytics.dailyBuckets.map(day => {
                                            const maximum = Math.max(1, ...analytics.dailyBuckets.map(item => item.minutes));
                                            return (
                                                <div className={styles.trendDay} role="listitem" key={day.key} title={`${day.dateLabel}: ${day.sessions} sessions, ${day.minutes} minutes`}>
                                                    <strong>{day.sessions || ''}</strong>
                                                    <div className={styles.trendTrack}>
                                                        <span style={{ height: `${day.minutes ? Math.max(6, (day.minutes / maximum) * 100) : 0}%` }} />
                                                    </div>
                                                    <small>{day.label}</small>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                <p className={styles.chartCaption}>Bar height represents saved focus minutes; the number above each bar is the session count.</p>
                            </div>

                            <div className={styles.analyticsLowerGrid}>
                                <div className={styles.breakdownBlock}>
                                    <div className={styles.subsectionHeading}><strong>Focus by category</strong><span>{analytics.categories.length} categories</span></div>
                                    {analytics.categories.length ? analytics.categories.map(item => (
                                        <div className={styles.categoryRow} key={item.category}>
                                            <div className={styles.categoryMeta}><span>{item.category}</span><small>{item.sessions} {item.sessions === 1 ? 'session' : 'sessions'} · {item.minutes} min</small></div>
                                            <div className={styles.categoryTrack}><span style={{ width: `${Math.min(100, Math.round((item.seconds / Math.max(1, analytics.totalSeconds)) * 100))}%` }} /></div>
                                        </div>
                                    )) : <p className={styles.analyticsEmpty}>Your category breakdown will appear after your first saved session.</p>}
                                </div>

                                <div className={styles.recentBlock}>
                                    <div className={styles.subsectionHeading}><strong>Recent sessions</strong><span>Latest first</span></div>
                                    {analytics.recentSessions.length ? (
                                        <ul className={styles.recentList}>
                                            {analytics.recentSessions.slice(0, 5).map(session => (
                                                <li key={session.id || `${session.created_at}-${session.category}-${session.duration_seconds}`}>
                                                    <span className={styles.recentSessionIcon}><Clock size={15} aria-hidden="true" /></span>
                                                    <span className={styles.recentSessionCopy}>
                                                        <strong>{session.safeCategory}</strong>
                                                        <small>{session.createdAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {session.mode === 'STOPWATCH' ? 'Stopwatch' : 'Timer'}</small>
                                                    </span>
                                                    <b>{Math.round(session.safeSeconds / 60)}m</b>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : <p className={styles.analyticsEmpty}>No sessions to show yet.</p>}
                                </div>
                            </div>
                        </section>
                        {sessions.length === 0 && (
                            <p className={styles.emptyHistory} role="status">
                                No saved focus sessions yet. Start a session to begin building your history.
                            </p>
                        )}
                    </>
                )}
            </section>

            <h2 className={styles.sectionTitle}>Tools &amp; zones</h2>
            <div className={styles.navGrid}>
                <NavLink to="timer" className={styles.navCard}>
                    <div className={styles.cardContent}>
                        <div className={styles.iconCircle}>
                            <Clock size={32} aria-hidden="true" />
                        </div>
                        <h3>Timer &amp; Stopwatch</h3>
                        <p>Classic Pomodoro or open-ended focus.</p>
                    </div>
                </NavLink>

                <NavLink to="rooms" className={styles.navCard}>
                    <div className={styles.cardContent}>
                        <div className={styles.iconCircle}>
                            <Users size={32} aria-hidden="true" />
                        </div>
                        <h3>Study rooms</h3>
                        <p>Study quietly alongside others online — like a shared library.</p>
                    </div>
                </NavLink>

                <NavLink to="beats" className={styles.navCard}>
                    <div className={styles.cardContent}>
                        <div className={styles.iconCircle}>
                            <Headphones size={32} aria-hidden="true" />
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
