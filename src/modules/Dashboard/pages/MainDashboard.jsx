import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Clock, BookOpen, Sparkles, ArrowRight, CalendarClock, ListTodo, Flame } from 'lucide-react';
import { useFocus } from '../../../context/useFocus';
import { useStudy } from '../../../context/useStudy';
import { useTime } from '../../../context/useTime';
import { useHabits } from '../../../context/useHabits';
import { summarizeFocusSessions } from '../../Focus/focusStats';
import styles from './MainDashboard.module.css';

const MainDashboard = () => {
    const [name] = useState(() => {
        const storedName = localStorage.getItem('studybud_username') || 'Student';
        const firstName = storedName.split(' ')[0];
        return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    });
    const [welcomeMsg] = useState(() =>
        localStorage.getItem('studybud_first_visit') === 'true' ? 'Welcome' : 'Welcome back'
    );

    const { sessions: focusSessions = [], isActive, isPaused, timeLeft, formatTime, loading: focusLoading = false } = useFocus();
    const { assignments = [], reviews = [], loading: studyLoading = false } = useStudy();
    const { tasks = [], loading: timeLoading = false } = useTime();
    const { atoms = [], getTodayLog, loading: habitsLoading = false } = useHabits();
    const [currentTime] = useState(() => new Date());

    const focusToday = summarizeFocusSessions(focusSessions);
    const todayLogs = typeof getTodayLog === 'function' ? getTodayLog() : {};
    const completedHabits = Object.values(todayLogs || {}).filter(log => log?.status === 'completed' || log?.completed).length;
    const openAssignments = assignments.filter(item => String(item?.status || '').toLowerCase() !== 'completed');
    const plannedTasks = tasks.filter(task => String(task?.status || '').trim().toLowerCase() === 'planned');
    const dueReviewCount = reviews.filter(review => {
        const reviewDate = review?.next_review_date ? new Date(review.next_review_date) : null;
        return reviewDate && !Number.isNaN(reviewDate.getTime()) && reviewDate.getTime() <= currentTime.getTime();
    }).length;
    const overviewLoading = focusLoading || studyLoading || timeLoading || habitsLoading;

    const nextAction = isActive
        ? { label: 'Continue your active focus session', detail: `${isPaused ? 'Paused' : 'In progress'} · ${formatTime(timeLeft)} remaining`, path: '/focus/active', icon: Clock }
        : dueReviewCount > 0
            ? { label: `Review ${dueReviewCount} due topic${dueReviewCount === 1 ? '' : 's'}`, detail: 'Your Study Plan brings due topics and next steps together.', path: '/study/plan', icon: CalendarClock }
            : plannedTasks.length > 0
                ? { label: 'Choose your next planned task', detail: `${plannedTasks.length} task${plannedTasks.length === 1 ? '' : 's'} in your Time queue.`, path: '/time/tasks', icon: ListTodo }
                : openAssignments.length > 0
                    ? { label: 'Break down your next assignment', detail: 'Turn the next piece of schoolwork into clear steps.', path: '/study/assignments', icon: BookOpen }
                    : { label: 'Start a short revision session', detail: 'Choose a subject and practise retrieval.', path: '/study', icon: BookOpen };

    useEffect(() => {
        if (localStorage.getItem('studybud_first_visit') === 'true') {
            localStorage.removeItem('studybud_first_visit');
        }
    }, []);



    return (
        <div className={`${styles.container} sb-dashboard`}>
            <div className={styles.hero}>
                <div className={styles.badge}>
                    <Sparkles size={14} />
                    <span>{welcomeMsg}, {name}</span>
                </div>
                <h1 className={styles.centerpiece}>
                    What’s your next <span>win?</span>
                </h1>
                <p className={styles.tagline}>A calmer, clearer way to plan your day, build momentum, and keep learning.</p>
            </div>

            <section className={styles.quickStart} aria-labelledby="quick-start-heading">
                <div className={styles.quickStartCopy}>
                    <p className={styles.quickStartEyebrow}>A good place to start</p>
                    <h2 id="quick-start-heading">Start with one small win.</h2>
                    <p>Pick one useful action. You can change course anytime.</p>
                </div>
                <div className={styles.quickStartActions}>
                    <NavLink to="/focus/timer" className={`${styles.quickStartAction} ${styles.primaryAction}`}>
                        <span className={styles.quickStartIcon} aria-hidden="true"><Clock size={22} /></span>
                        <span className={styles.quickStartActionText}>
                            <strong>Start a focus session</strong>
                            <small>Choose one task and get going.</small>
                        </span>
                        <ArrowRight size={18} aria-hidden="true" />
                    </NavLink>
                    <NavLink to="/study" className={`${styles.quickStartAction} ${styles.secondaryAction}`}>
                        <span className={styles.quickStartIcon} aria-hidden="true"><BookOpen size={22} /></span>
                        <span className={styles.quickStartActionText}>
                            <strong>Open Study Hub</strong>
                            <small>Revise, practise, or use flashcards.</small>
                        </span>
                        <ArrowRight size={18} aria-hidden="true" />
                    </NavLink>
                </div>
            </section>

            <section className={styles.dailyPulse} aria-labelledby="daily-pulse-title">
                <div className={styles.dailyPulseHeader}>
                    <div>
                        <span className={styles.dailyPulseEyebrow}>YOUR DAY AT A GLANCE</span>
                        <h2 id="daily-pulse-title">Make today feel manageable.</h2>
                        <p>Your saved progress across Focus, Study, Time and Habits. Nothing here is a grade.</p>
                    </div>
                    <span className={styles.dailyPulseDate}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                </div>

                <div className={styles.dailyPulseGrid}>
                    <div className={styles.pulseMetric}>
                        <span className={styles.pulseMetricIcon}><Clock size={17} aria-hidden="true" /></span>
                        <div><strong>{overviewLoading ? '—' : focusToday.minutesToday}<small>{overviewLoading ? '' : ' min'}</small></strong><span>Focus today</span></div>
                    </div>
                    <div className={styles.pulseMetric}>
                        <span className={styles.pulseMetricIcon}><CalendarClock size={17} aria-hidden="true" /></span>
                        <div><strong>{overviewLoading ? '—' : dueReviewCount}</strong><span>Reviews due</span></div>
                    </div>
                    <div className={styles.pulseMetric}>
                        <span className={styles.pulseMetricIcon}><ListTodo size={17} aria-hidden="true" /></span>
                        <div><strong>{overviewLoading ? '—' : plannedTasks.length}</strong><span>Planned tasks</span></div>
                    </div>
                    <div className={styles.pulseMetric}>
                        <span className={styles.pulseMetricIcon}><Flame size={17} aria-hidden="true" /></span>
                        <div><strong>{overviewLoading ? '—' : `${completedHabits}/${atoms.length}`}</strong><span>Habits completed</span></div>
                    </div>
                    <div className={styles.pulseMetric}>
                        <span className={styles.pulseMetricIcon}><BookOpen size={17} aria-hidden="true" /></span>
                        <div><strong>{overviewLoading ? '—' : openAssignments.length}</strong><span>Open assignments</span></div>
                    </div>
                </div>

                <div className={styles.dailyPulseNext}>
                    <div className={styles.dailyPulseNextIcon}><nextAction.icon size={22} aria-hidden="true" /></div>
                    <div className={styles.dailyPulseNextCopy}>
                        <span>RECOMMENDED NEXT STEP</span>
                        <strong>{nextAction.label}</strong>
                        <p>{overviewLoading ? 'Loading your saved overview…' : nextAction.detail}</p>
                    </div>
                    <NavLink to={nextAction.path} className={styles.dailyPulseNextLink} aria-label={nextAction.label}>
                        Open <ArrowRight size={16} aria-hidden="true" />
                    </NavLink>
                </div>
                <p className={styles.dailyPulseFootnote}>Overview uses saved records from this account. Focus totals reflect the latest 50 sessions available in history.</p>
            </section>



            <footer className={styles.footer}>
                <p>One habit at a time. You’ve got this.</p>
            </footer>
        </div>
    );
};

export default MainDashboard;
