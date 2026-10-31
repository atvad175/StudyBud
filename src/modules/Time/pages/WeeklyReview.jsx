import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, CalendarDays, CheckCircle2, Clock3, Save, Sparkles, Target, TrendingUp } from 'lucide-react';
import { useTime } from '../../../context/useTime';
import { useMind } from '../../../context/useMind';
import { useFocus } from '../../../context/useFocus';
import { useStudy } from '../../../context/useStudy';
import { useToast } from '../../../context/useToast';
import { getStudyAnalytics } from '../../Study/studyPlannerUtils';
import styles from './WeeklyReview.module.css';

const isCompletedTask = task => ['executed', 'reflected', 'completed'].includes(String(task?.status || '').toLowerCase());

const getLocalDayKey = date => [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
].join('-');

const isDateInRange = (value, start, end) => {
    const date = value ? new Date(value) : null;
    return Boolean(date && Number.isFinite(date.getTime()) && date >= start && date < end);
};

const WeeklyReview = () => {
    const { tasks = [], loading: tasksLoading = false } = useTime();
    const { addLog, logs = [] } = useMind();
    const { sessions = [], loading: focusLoading = false } = useFocus();
    const { practiceLogs = [], loading: studyLoading = false } = useStudy();
    const { toast } = useToast();
    const navigate = useNavigate();

    const [wentWell, setWentWell] = useState('');
    const [drainedEnergy, setDrainedEnergy] = useState('');
    const [doDifferently, setDoDifferently] = useState('');
    const [nextIntention, setNextIntention] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const now = useMemo(() => new Date(), []);
    const weekStart = useMemo(() => {
        const start = new Date(now);
        const day = start.getDay();
        start.setDate(start.getDate() - (day === 0 ? 6 : day - 1));
        start.setHours(0, 0, 0, 0);
        return start;
    }, [now]);
    const weekEnd = useMemo(() => {
        const end = new Date(weekStart);
        end.setDate(end.getDate() + 7);
        return end;
    }, [weekStart]);

    const weeklyTasks = useMemo(() => tasks.filter(task => isDateInRange(task.created_at, weekStart, weekEnd)), [tasks, weekStart, weekEnd]);
    const weeklyFocusSessions = useMemo(() => sessions.filter(session => isDateInRange(session.created_at, weekStart, weekEnd)), [sessions, weekStart, weekEnd]);
    const weeklyPracticeLogs = useMemo(() => practiceLogs.filter(log => isDateInRange(log.created_at, weekStart, weekEnd)), [practiceLogs, weekStart, weekEnd]);

    const taskMetrics = useMemo(() => {
        const completed = weeklyTasks.filter(isCompletedTask).length;
        const planned = weeklyTasks.length;
        const open = Math.max(0, planned - completed);
        return {
            total: planned,
            completed,
            open,
            completionRate: planned > 0 ? Math.round((completed / planned) * 100) : null,
            overdue: weeklyTasks.filter(task => {
                if (isCompletedTask(task)) return false;
                const deadline = task?.due_date || task?.due_at || task?.deadline;
                const date = deadline ? new Date(deadline) : null;
                return date && Number.isFinite(date.getTime()) && date < now;
            }).length,
        };
    }, [weeklyTasks, now]);

    const focusMetrics = useMemo(() => {
        const seconds = weeklyFocusSessions.reduce((total, session) => {
            const duration = Number(session?.duration_seconds);
            return total + (Number.isFinite(duration) && duration > 0 ? duration : 0);
        }, 0);
        return {
            sessions: weeklyFocusSessions.length,
            minutes: Math.round(seconds / 60),
            hours: Math.floor(seconds / 3600),
        };
    }, [weeklyFocusSessions]);

    const studyAnalytics = useMemo(() => getStudyAnalytics(weeklyPracticeLogs, now), [weeklyPracticeLogs, now]);
    const isLoading = tasksLoading || focusLoading || studyLoading;

    const dayRows = useMemo(() => Array.from({ length: 7 }, (_, index) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + index);
        const key = getLocalDayKey(date);
        const dayTasks = weeklyTasks.filter(task => task.created_at && getLocalDayKey(new Date(task.created_at)) === key);
        const daySessions = weeklyFocusSessions.filter(session => session.created_at && getLocalDayKey(new Date(session.created_at)) === key);
        const minutes = Math.round(daySessions.reduce((sum, session) => {
            const value = Number(session.duration_seconds);
            return sum + (Number.isFinite(value) && value > 0 ? value : 0);
        }, 0) / 60);
        return {
            key,
            label: date.toLocaleDateString(undefined, { weekday: 'short' }),
            dateLabel: date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
            taskCount: dayTasks.length,
            completed: dayTasks.filter(isCompletedTask).length,
            focusMinutes: minutes,
        };
    }), [weekStart, weeklyTasks, weeklyFocusSessions]);

    const maxFocusMinutes = Math.max(30, ...dayRows.map(day => day.focusMinutes));
    const previousReviews = logs
        .filter(log => log?.type === 'weekly' && log.content && typeof log.content === 'object')
        .slice(0, 4);

    const weekLabel = weekStart.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) +
        ' – ' + new Date(weekEnd.getTime() - 1).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

    const handleSave = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            await addLog({
                type: 'weekly',
                content: {
                    weekStart: weekStart.toISOString(),
                    weekEnd: weekEnd.toISOString(),
                    metrics: {
                        tasksCreated: taskMetrics.total,
                        tasksCompleted: taskMetrics.completed,
                        tasksOpen: taskMetrics.open,
                        tasksOverdue: taskMetrics.overdue,
                        taskCompletionRate: taskMetrics.completionRate,
                        focusSessions: focusMetrics.sessions,
                        focusMinutes: focusMetrics.minutes,
                        practiceRecords: weeklyPracticeLogs.length,
                        scoredAssessments: studyAnalytics.assessmentCount,
                        averageAssessmentScore: studyAnalytics.averageScore,
                    },
                    wentWell: wentWell.trim(),
                    drainedEnergy: drainedEnergy.trim(),
                    doDifferently: doDifferently.trim(),
                    nextIntention: nextIntention.trim(),
                },
                tags: ['weekly_review', 'planning'],
            });

            toast.success('Weekly review saved to your account.');
            setWentWell('');
            setDrainedEnergy('');
            setDoDifferently('');
            setNextIntention('');
        } catch (error) {
            console.error('Unable to save weekly review:', error?.code || 'unknown');
            toast.error(error?.message || 'Your weekly review could not be saved. Your answers are still here; please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const readyToSave = wentWell.trim() && doDifferently.trim() && nextIntention.trim();

    return (
        <main className={styles.page}>
            <header className={styles.hero}>
                <div>
                    <span className={styles.eyebrow}><Sparkles size={14} /> WEEKLY RESET</span>
                    <h1>Review the week. Shape the next one.</h1>
                    <p>StudyBud brings your task activity, focus sessions and study results together. Use the numbers as context, then decide what you want to change.</p>
                    <span className={styles.weekLabel}><CalendarDays size={15} /> {weekLabel}</span>
                </div>
                <div className={styles.heroAside}>
                    <span>WEEKLY REVIEW</span>
                    <strong>{now.toLocaleDateString(undefined, { weekday: 'long' })}</strong>
                    <small>Monday-based week · your account data</small>
                </div>
            </header>

            {isLoading && <div className={styles.loadingNotice} role="status">Updating your weekly snapshot…</div>}

            <section className={styles.metricsGrid} aria-label="Weekly activity snapshot">
                <article className={styles.metric}>
                    <span className={styles.metricIcon}><CheckCircle2 size={18} /></span>
                    <small>Tasks completed</small>
                    <strong>{taskMetrics.completed}<em> / {taskMetrics.total}</em></strong>
                    <span>{taskMetrics.completionRate === null ? 'No tasks created this week' : taskMetrics.completionRate + '% completion rate'}</span>
                </article>
                <article className={styles.metric}>
                    <span className={styles.metricIcon}><Clock3 size={18} /></span>
                    <small>Focus time</small>
                    <strong>{focusMetrics.minutes}<em> min</em></strong>
                    <span>{focusMetrics.sessions} saved focus sessions</span>
                </article>
                <article className={styles.metric}>
                    <span className={styles.metricIcon}><Target size={18} /></span>
                    <small>Scored assessments</small>
                    <strong>{studyAnalytics.assessmentCount}</strong>
                    <span>{studyAnalytics.averageScore === null ? 'No scored practice this week' : studyAnalytics.averageScore + '% average score'}</span>
                </article>
                <article className={styles.metric}>
                    <span className={styles.metricIcon}><Activity size={18} /></span>
                    <small>Open task load</small>
                    <strong>{taskMetrics.open}</strong>
                    <span>{taskMetrics.overdue} overdue from this week’s tasks</span>
                </article>
            </section>

            <section className={styles.activityPanel}>
                <div className={styles.sectionHeading}>
                    <div>
                        <span className={styles.eyebrow}>WEEK IN MOTION</span>
                        <h2>Where time went</h2>
                        <p>Focus minutes and task completions by day. Empty days are shown as zero rather than estimated.</p>
                    </div>
                </div>
                <div className={styles.dayChart}>
                    {dayRows.map(day => (
                        <article className={styles.dayColumn} key={day.key}>
                            <div className={styles.barArea} title={day.dateLabel + ': ' + day.focusMinutes + ' focus minutes'}>
                                <div className={styles.barFill} style={{ height: (day.focusMinutes / maxFocusMinutes) * 100 + '%' }} />
                            </div>
                            <strong>{day.focusMinutes}</strong>
                            <span>{day.label}</span>
                            <small>{day.completed}/{day.taskCount} tasks</small>
                        </article>
                    ))}
                </div>
                <div className={styles.chartLegend}>
                    <span><i /> Focus minutes</span>
                    <span>Task completions appear below each day</span>
                </div>
            </section>

            <section className={styles.reviewGrid}>
                <div className={styles.reflectionForm}>
                    <div className={styles.sectionHeading}>
                        <div>
                            <span className={styles.eyebrow}>YOUR REFLECTION</span>
                            <h2>Make the data useful.</h2>
                            <p>Be specific. One practical adjustment is more useful than a list of vague promises.</p>
                        </div>
                    </div>

                    <label>
                        <span>What went well?</span>
                        <textarea value={wentWell} onChange={event => setWentWell(event.target.value)} placeholder="Which actions, routines or study sessions actually worked?" rows={3} />
                    </label>
                    <label>
                        <span>What drained your time or energy?</span>
                        <textarea value={drainedEnergy} onChange={event => setDrainedEnergy(event.target.value)} placeholder="Where did you lose momentum? What made work harder than necessary?" rows={3} />
                    </label>
                    <label>
                        <span>What will you change next week?</span>
                        <textarea value={doDifferently} onChange={event => setDoDifferently(event.target.value)} placeholder="Choose a specific behaviour or workflow to adjust." rows={3} />
                    </label>
                    <label>
                        <span>One intention for next week</span>
                        <textarea value={nextIntention} onChange={event => setNextIntention(event.target.value)} placeholder="What is the most important outcome you want to protect time for?" rows={2} />
                    </label>

                    <button type="button" className={styles.saveButton} onClick={() => void handleSave()} disabled={isSaving || !readyToSave || isLoading}>
                        <Save size={17} /> {isSaving ? 'Saving review…' : 'Save weekly review'}
                    </button>
                </div>

                <aside className={styles.sideColumn}>
                    <article className={styles.summaryCard}>
                        <span className={styles.eyebrow}>YOUR WEEK, AT A GLANCE</span>
                        <h3>Evidence before judgement.</h3>
                        <p>There is no invented productivity score here. These are the records StudyBud actually has for this week.</p>
                        <div className={styles.summaryLine}>
                            <span>Task completion</span>
                            <strong>{taskMetrics.completionRate === null ? '—' : taskMetrics.completionRate + '%'}</strong>
                        </div>
                        <div className={styles.progressTrack}>
                            <span style={{ width: (taskMetrics.completionRate || 0) + '%' }} />
                        </div>
                        <div className={styles.summaryLine}>
                            <span>Study records</span>
                            <strong>{weeklyPracticeLogs.length}</strong>
                        </div>
                        <div className={styles.summaryLine}>
                            <span>Focus sessions</span>
                            <strong>{focusMetrics.sessions}</strong>
                        </div>
                        <div className={styles.summaryLine}>
                            <span>Study average</span>
                            <strong>{studyAnalytics.averageScore === null ? '—' : studyAnalytics.averageScore + '%'}</strong>
                        </div>
                    </article>

                    <article className={styles.historyCard}>
                        <button type="button" className={styles.historyToggle} onClick={() => setShowHistory(value => !value)} aria-expanded={showHistory}>
                            <span><TrendingUp size={17} /> Previous reflections</span>
                            <span>{previousReviews.length} saved</span>
                        </button>
                        {showHistory && (
                            <div className={styles.historyList}>
                                {previousReviews.length > 0 ? previousReviews.map(review => {
                                    const content = review.content || {};
                                    const metrics = content.metrics || {};
                                    return (
                                        <article key={review.id}>
                                            <strong>{content.weekStart ? new Date(content.weekStart).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : new Date(review.created_at).toLocaleDateString()}</strong>
                                            <span>{metrics.tasksCompleted ?? content.tasksCompleted ?? 0} tasks completed · {metrics.focusMinutes ?? 0} focus min</span>
                                            <p>{content.nextIntention || 'No intention saved.'}</p>
                                        </article>
                                    );
                                }) : <p className={styles.historyEmpty}>Your saved weekly reflections will appear here.</p>}
                            </div>
                        )}
                    </article>

                    <article className={styles.nextStepCard}>
                        <div><Target size={18} /></div>
                        <h3>Convert the review into action</h3>
                        <p>Take your next intention and give it a place in your study plan.</p>
                        <button type="button" onClick={() => navigate('/study/plan')}>Open Study Planner <ArrowRight size={14} /></button>
                    </article>
                </aside>
            </section>
        </main>
    );
};

export default WeeklyReview;
