import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    CalendarClock,
    CheckCircle2,
    Clock,
    ListTodo,
    RefreshCw,
    Sparkles,
    Target,
    Timer,
    Zap,
} from 'lucide-react';
import { useStudy } from '../../../context/useStudy';
import { useTime } from '../../../context/useTime';
import { useToast } from '../../../context/useToast';
import { buildDailyStudyPlan } from '../studyPlannerUtils';
import styles from './StudyPlanner.module.css';

const KIND_META = {
    review: { label: 'Spaced review', icon: RefreshCw },
    assignment: { label: 'Assignment', icon: ListTodo },
    practice: { label: 'Targeted practice', icon: Target },
};

const getPlanTaskTag = (dateKey, itemId) => `StudyBud Planner ${dateKey}: ${itemId}`;

const getTaskKind = kind => {
    if (kind === 'review') return 'Review';
    if (kind === 'assignment') return 'Write';
    return 'Practice';
};

const StudyPlanner = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const {
        assignments = [],
        reviews = [],
        practiceLogs = [],
        loading: studyLoading = false,
        completeReview,
        updateAssignment,
    } = useStudy();
    const { tasks = [], createTask, loading: timeLoading = false } = useTime();
    const [budgetMinutes, setBudgetMinutes] = useState(90);
    const [busyId, setBusyId] = useState('');
    const [isSavingPlan, setIsSavingPlan] = useState(false);
    const [now] = useState(() => new Date());

    const plan = useMemo(() => buildDailyStudyPlan({
        assignments,
        reviews,
        practiceLogs,
        now,
        budgetMinutes,
    }), [assignments, reviews, practiceLogs, budgetMinutes, now]);

    const dueReviews = reviews.filter(review => {
        const timestamp = review?.next_review_date ? new Date(review.next_review_date).getTime() : NaN;
        return Number.isFinite(timestamp) && timestamp <= now.getTime();
    }).length;
    const openAssignments = assignments.filter(item => String(item.status || '').toLowerCase() !== 'completed').length;

    const savedItems = useMemo(() => new Set(
        tasks.map(task => String(task.notes || '')).filter(Boolean)
    ), [tasks]);
    const savedCount = plan.items.filter(item => savedItems.has(getPlanTaskTag(plan.dateKey, item.id))).length;
    const allSaved = plan.items.length > 0 && savedCount === plan.items.length;
    const todayLabel = now.toLocaleDateString(undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });

    const openPractice = subject => {
        if (subject) localStorage.setItem('studybud_selected_subject', subject);
        navigate('/study/exams');
    };

    const handleItemAction = async item => {
        if (item.kind === 'assignment') {
            navigate('/study/assignments');
            return;
        }
        if (item.kind === 'practice') {
            openPractice(item.subject);
            return;
        }

        setBusyId(item.id);
        try {
            await completeReview(item.sourceId, 'good');
            toast.success('Review saved. The next review date has been updated.');
        } catch (error) {
            toast.error(error?.message || 'The review could not be saved. Try again.');
        } finally {
            setBusyId('');
        }
    };

    const handleSavePlan = async () => {
        if (isSavingPlan) return;
        setIsSavingPlan(true);
        let created = 0;
        const seenTags = new Set(savedItems);

        try {
            for (const item of plan.items) {
                const tag = getPlanTaskTag(plan.dateKey, item.id);
                if (seenTags.has(tag)) continue;

                await createTask({
                    title: `Study: ${item.title}`.slice(0, 180),
                    description: item.description,
                    cognitive_type: getTaskKind(item.kind),
                    difficulty: item.minutes >= 35 ? 'Hard' : 'Medium',
                    time_estimate: item.minutes,
                    emotional_friction: item.priority >= 90 ? 'High' : 'Medium',
                    status: 'Planned',
                    notes: tag,
                });
                seenTags.add(tag);
                created += 1;
            }

            if (created === 0) {
                toast.info('This plan is already in your Time task list.');
            } else {
                toast.success(`${created} study block${created === 1 ? '' : 's'} saved to Time Management.`);
            }
        } catch (error) {
            toast.error(`${created} of ${plan.items.length} blocks saved. ${error?.message || 'Retry to save the remaining blocks.'}`);
        } finally {
            setIsSavingPlan(false);
        }
    };

    const handleCompleteAssignment = async item => {
        const assignment = assignments.find(value => String(value.id) === String(item.sourceId));
        if (!assignment) {
            toast.info('Open Assignments to refresh this item.');
            return;
        }
        setBusyId(item.id);
        try {
            const steps = Array.isArray(assignment.steps)
                ? assignment.steps.map(step => ({ ...step, done: true }))
                : [];
            await updateAssignment(assignment.id, { status: 'completed', steps });
            toast.success('Assignment marked complete.');
        } catch (error) {
            toast.error(error?.message || 'The assignment could not be updated.');
        } finally {
            setBusyId('');
        }
    };

    return (
        <main className={styles.page}>
            <header className={styles.hero}>
                <div className={styles.heroCopy}>
                    <span className={styles.eyebrow}><Sparkles size={14} /> PERSONAL STUDY SYSTEM</span>
                    <h1>Today, made doable.</h1>
                    <p>StudyBud brings your deadlines, scheduled reviews and practice gaps into one realistic plan. Save the blocks to Time Management so they become part of your day.</p>
                    <span className={styles.today}><CalendarClock size={16} /> {todayLabel}</span>
                </div>
                <div className={styles.heroDial} aria-hidden="true">
                    <span className={styles.dialLabel}>TODAY'S PLAN</span>
                    <strong>{plan.plannedMinutes}</strong>
                    <span>minutes</span>
                    <div className={styles.dialTrack}><span style={{ width: `${Math.min(100, (plan.plannedMinutes / budgetMinutes) * 100)}%` }} /></div>
                    <small>of {budgetMinutes} minute goal</small>
                </div>
            </header>

            <section className={styles.metricGrid} aria-label="Study priorities">
                <article className={styles.metricCard}>
                    <span className={styles.metricIcon}><Clock size={18} /></span>
                    <strong>{studyLoading || timeLoading ? '—' : plan.items.length}</strong>
                    <span>planned blocks</span>
                </article>
                <article className={styles.metricCard}>
                    <span className={styles.metricIcon}><RefreshCw size={18} /></span>
                    <strong>{studyLoading ? '—' : dueReviews}</strong>
                    <span>reviews due</span>
                </article>
                <article className={styles.metricCard}>
                    <span className={styles.metricIcon}><ListTodo size={18} /></span>
                    <strong>{studyLoading ? '—' : openAssignments}</strong>
                    <span>open assignments</span>
                </article>
                <article className={styles.metricCard}>
                    <span className={styles.metricIcon}><Zap size={18} /></span>
                    <strong>{studyLoading ? '—' : plan.analytics.activityLastSevenDays}</strong>
                    <span>study records this week</span>
                </article>
            </section>

            <section className={styles.planSection}>
                <div className={styles.sectionHeading}>
                    <div>
                        <span className={styles.eyebrow}>YOUR NEXT MOVES</span>
                        <h2>A plan with a reason</h2>
                        <p>Time goes to the work that is due first, then the concepts that need another retrieval pass.</p>
                    </div>
                    <div className={styles.budgetPicker} aria-label="Daily time budget">
                        {[60, 90, 120].map(minutes => (
                            <button
                                key={minutes}
                                type="button"
                                aria-pressed={budgetMinutes === minutes}
                                className={budgetMinutes === minutes ? styles.budgetActive : ''}
                                onClick={() => setBudgetMinutes(minutes)}
                            >
                                {minutes} min
                            </button>
                        ))}
                    </div>
                </div>

                {studyLoading && <p className={styles.notice} role="status">Loading your saved Study data…</p>}

                {!studyLoading && plan.items.length > 0 && (
                    <div className={styles.planList}>
                        {plan.items.map((item, index) => {
                            const meta = KIND_META[item.kind] || KIND_META.practice;
                            const Icon = meta.icon;
                            const isSaved = savedItems.has(getPlanTaskTag(plan.dateKey, item.id));
                            const isBusy = busyId === item.id;
                            return (
                                <article className={styles.planItem} key={item.id}>
                                    <div className={styles.stepNumber}>{String(index + 1).padStart(2, '0')}</div>
                                    <div className={styles.planItemBody}>
                                        <div className={styles.planItemMeta}>
                                            <span className={styles.kind}><Icon size={13} /> {meta.label}</span>
                                            <span className={styles.priority}>{item.priorityLabel}</span>
                                            {isSaved && <span className={styles.savedPill}><CheckCircle2 size={12} /> In Time</span>}
                                        </div>
                                        <h3>{item.title}</h3>
                                        {item.subject && <span className={styles.subject}>{item.subject}</span>}
                                        <p>{item.description}</p>
                                        <div className={styles.planItemFooter}>
                                            <span><Timer size={14} /> {item.minutes} min</span>
                                            {item.kind === 'review' ? (
                                                <button type="button" onClick={() => void handleItemAction(item)} disabled={isBusy}>
                                                    {isBusy ? 'Saving…' : 'Mark reviewed'} <ArrowRight size={14} />
                                                </button>
                                            ) : item.kind === 'assignment' ? (
                                                <div className={styles.itemActions}>
                                                    <button type="button" className={styles.secondaryAction} onClick={() => void handleCompleteAssignment(item)} disabled={isBusy}>
                                                        {isBusy ? 'Saving…' : 'Mark complete'}
                                                    </button>
                                                    <button type="button" onClick={() => void handleItemAction(item)}>
                                                        Open assignment <ArrowRight size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button type="button" onClick={() => void handleItemAction(item)}>
                                                    Start practice <ArrowRight size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}

                {!studyLoading && plan.items.length === 0 && (
                    <div className={styles.emptyState}>
                        <CheckCircle2 size={30} />
                        <h3>Nothing urgent is queued.</h3>
                        <p>Start a short quiz or create an assignment, and your next plan will use that activity to guide you.</p>
                        <button type="button" onClick={() => openPractice('')}>Start a practice quiz <ArrowRight size={15} /></button>
                    </div>
                )}

                <div className={styles.saveBar}>
                    <div>
                        <strong>{allSaved ? 'Your plan is in Time Management' : 'Make the plan part of your schedule'}</strong>
                        <p>{allSaved ? 'Each block is saved as a task, so you can track it with the rest of your day.' : `Save ${plan.items.length - savedCount} block${plan.items.length - savedCount === 1 ? '' : 's'} as real Time tasks.`}</p>
                    </div>
                    <button type="button" onClick={() => void handleSavePlan()} disabled={isSavingPlan || allSaved || studyLoading || plan.items.length === 0}>
                        {isSavingPlan ? 'Saving plan…' : allSaved ? 'Saved' : 'Save plan to Time'} <ArrowRight size={16} />
                    </button>
                </div>
            </section>

            <section className={styles.bottomGrid}>
                <article className={styles.bottomCard}>
                    <div className={styles.bottomIcon}><Target size={19} /></div>
                    <div>
                        <h3>Turn a weak topic into practice</h3>
                        <p>Generate a timed quiz, review the mistakes and let the next review date come back onto this plan.</p>
                        <button type="button" onClick={() => openPractice(plan.analytics.weakestSubject?.subject || '')}>Open exam practice <ArrowRight size={14} /></button>
                    </div>
                </article>
                <article className={styles.bottomCard}>
                    <div className={styles.bottomIcon}><ListTodo size={19} /></div>
                    <div>
                        <h3>Keep tasks visible</h3>
                        <p>Saved plan blocks are ordinary Time tasks. Mark them executed there and use the weekly review to reflect.</p>
                        <button type="button" onClick={() => navigate('/time')}>Open Time Management <ArrowRight size={14} /></button>
                    </div>
                </article>
            </section>
        </main>
    );
};

export default StudyPlanner;
