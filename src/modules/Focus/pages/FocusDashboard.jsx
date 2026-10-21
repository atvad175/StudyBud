import React from 'react';
import { NavLink } from 'react-router-dom';
import { Play, Clock, Headphones, Users } from 'lucide-react';
import { useFocus } from '../../../context/useFocus';
import { summarizeFocusSessions } from '../focusStats';
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
    const stats = summarizeFocusSessions(sessions);

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
