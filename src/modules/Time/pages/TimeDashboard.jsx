import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Brain, Zap, BarChart2, TrendingUp, Clock, CheckCircle, Battery, CalendarClock, CheckCircle2 } from 'lucide-react';
import styles from '../TimeShared.module.css';
import { useTime } from '../../../context/useTime';
import { useToast } from '../../../context/useToast';

const getTaskDueValue = (task) => {
    const raw = task?.due_date || task?.due_at || task?.deadline;
    if (!raw) return null;
    if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        const [year, month, day] = raw.split('-').map(Number);
        return new Date(year, month - 1, day, 23, 59, 59, 999);
    }
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getTaskDeadlineLabel = (task, now = new Date()) => {
    const due = getTaskDueValue(task);
    if (!due) return 'No deadline set';
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const dueDay = new Date(due);
    dueDay.setHours(0, 0, 0, 0);
    const days = Math.round((dueDay.getTime() - today.getTime()) / 86400000);
    if (days < 0) return 'Overdue by ' + Math.abs(days) + ' day' + (Math.abs(days) === 1 ? '' : 's');
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return 'Due in ' + days + ' days';
};

const getTaskPriorityScore = (task, now = new Date()) => {
    const due = getTaskDueValue(task);
    let score = 0;
    if (due) {
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        const dueDay = new Date(due);
        dueDay.setHours(0, 0, 0, 0);
        const days = Math.round((dueDay.getTime() - today.getTime()) / 86400000);
        score += days < 0 ? 100 : days === 0 ? 80 : days === 1 ? 65 : days <= 3 ? 45 : days <= 7 ? 25 : 5;
    }
    const priority = String(task?.priority || task?.importance || '').toLowerCase();
    if (priority === 'urgent') score += 40;
    else if (priority === 'high') score += 25;
    else if (priority === 'medium') score += 10;
    if (task?.difficulty === 'Hard') score += 6;
    if (task?.emotional_friction === 'High') score += 2;
    return score;
};

const TimeDashboard = () => {
    const { tasks, updateTask } = useTime();
    const { toast } = useToast();
    const [savingTaskId, setSavingTaskId] = useState(null);

    const markTaskDone = async (task) => {
        if (savingTaskId !== null) return;
        setSavingTaskId(task.id);
        try {
            await updateTask(task.id, { status: 'Executed' });
            toast.success('Completed: ' + task.title);
        } catch (error) {
            toast.error(error?.message || 'Task could not be updated. Please try again.');
        } finally {
            setSavingTaskId(null);
        }
    };

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

    // Rank with deadlines first, then explicitly stored priority and task difficulty.
    const higherDemandTasks = planned.filter(task =>
        task.energy_block === 'High' || task.difficulty === 'Hard'
    );
    const recommendedPool = higherDemandTasks.length ? higherDemandTasks : planned;
    const topTasks = [...recommendedPool]
        .sort((a, b) => getTaskPriorityScore(b) - getTaskPriorityScore(a)
            || (Number(b.time_estimate) || 0) - (Number(a.time_estimate) || 0))
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
                            {topTasks.map((task, index) => {
                                const deadlineLabel = getTaskDeadlineLabel(task);
                                const isOverdue = deadlineLabel.startsWith('Overdue');
                                return (
                                    <div key={task.id} className={styles.nextTaskRow}>
                                        <div className={styles.nextTaskInfo}>
                                            <span className={styles.nextTaskNumber}>{index + 1}</span>
                                            <div className={styles.nextTaskCopy}>
                                                <strong>{task.title}</strong>
                                                <span>{task.time_estimate ? task.time_estimate + ' min' : 'Time not set'} · {task.difficulty || 'Difficulty not set'}</span>
                                                <small className={isOverdue ? styles.overdueTask : styles.taskDeadline}><CalendarClock size={13} aria-hidden="true" /> {deadlineLabel}</small>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className={styles.markTaskDone}
                                            onClick={() => markTaskDone(task)}
                                            disabled={savingTaskId !== null}
                                            aria-label={'Mark ' + task.title + ' as done'}
                                        >
                                            <CheckCircle2 size={15} aria-hidden="true" />
                                            {savingTaskId === task.id ? 'Saving…' : 'Done'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className={styles.taskQueueEmpty}>No planned tasks in your queue. Add one to get a prioritized next step here.</p>
                    )}
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
