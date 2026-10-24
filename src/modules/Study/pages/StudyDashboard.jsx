import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
    ArrowRight, BookOpen, Brain, CalendarClock, CheckCircle2, Clock3,
    FileText, Layers3, Lightbulb, Sparkles, Target, TrendingUp
} from 'lucide-react';
import { useStudy } from '../../../context/useStudy';
import styles from './StudyDashboard.module.css';

const isComplete = (value) => ['complete', 'completed', 'done', 'executed', 'reflected']
    .includes(String(value || '').trim().toLowerCase());

const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);
};

const StudyDashboard = () => {
    const {
        assignments = [], practiceLogs = [], reviews = [],
        loading = false, loadError = ''
    } = useStudy();

    const now = new Date();
    const openAssignments = useMemo(
        () => assignments.filter(item => !isComplete(item?.status)),
        [assignments]
    );
    const completedSteps = useMemo(
        () => assignments.reduce((total, item) => total + (Array.isArray(item?.steps)
            ? item.steps.filter(step => step?.done || step?.completed).length : 0), 0),
        [assignments]
    );
    const dueReviews = reviews.filter(review => {
        if (!review?.next_review_date) return false;
        const date = new Date(review.next_review_date);
        return !Number.isNaN(date.getTime()) && date <= now;
    });
    const latestPractice = useMemo(() => [...practiceLogs]
        .sort((a, b) => new Date(b?.created_at || 0).getTime() - new Date(a?.created_at || 0).getTime())
        .slice(0, 3), [practiceLogs]);

    const nextStep = dueReviews.length
        ? {
            eyebrow: 'READY FOR REVIEW',
            title: `Revisit ${dueReviews.length} topic${dueReviews.length === 1 ? '' : 's'}`,
            detail: 'A short retrieval session can help you check what you still remember.',
            action: 'Open flashcards',
            to: '/study/flashcards',
            icon: Layers3,
        }
        : openAssignments.length
            ? {
                eyebrow: 'KEEP YOUR WORK MOVING',
                title: 'Make progress on an assignment',
                detail: 'Choose one small step instead of trying to finish everything at once.',
                action: 'View assignments',
                to: '/study/assignments',
                icon: FileText,
            }
            : {
                eyebrow: 'START WITH ONE SMALL WIN',
                title: 'Practise one topic',
                detail: 'Choose a subject, test what you know, then review any mistakes.',
                action: 'Explore subjects',
                to: '/study/subjects',
                icon: BookOpen,
            };

    const shortcuts = [
        { title: 'Subjects', description: 'Find a subject and get a focused starting point.', to: '/study/subjects', icon: BookOpen, label: 'Explore' },
        { title: 'Exam practice', description: 'Attempt practice questions and review your answers.', to: '/study/exams', icon: Target, label: 'Practise' },
        { title: 'Assignments', description: 'Break schoolwork into steps you can complete.', to: '/study/assignments', icon: FileText, label: 'Organise' },
        { title: 'Study methods', description: 'Choose a technique for the task in front of you.', to: '/study/methods', icon: Lightbulb, label: 'Learn' },
    ];

    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <div>
                    <span className={styles.eyebrow}>STUDY HUB</span>
                    <h1>Your learning, <span>in motion.</span></h1>
                    <p>Plan your next study step, practise actively, and use what you learn to decide what to revisit.</p>
                </div>
                <div className={styles.headerMark} aria-hidden="true"><Brain size={27} /><span>STUDY</span></div>
            </header>

            {loadError && (
                <div className={styles.notice} role="status">
                    <span>{loadError}</span>
                    <button type="button" onClick={() => window.location.reload()}>Refresh data</button>
                </div>
            )}

            <section className={styles.nextStep} aria-labelledby="next-step-title">
                <div className={styles.nextCopy}>
                    <span className={styles.eyebrow}>{nextStep.eyebrow}</span>
                    <h2 id="next-step-title">{loading ? 'Getting your study space ready…' : nextStep.title}</h2>
                    <p>{loading ? 'Your saved study data will appear here once it has loaded.' : nextStep.detail}</p>
                    <NavLink className={styles.primaryLink} to={nextStep.to}>
                        {nextStep.action}<ArrowRight size={17} />
                    </NavLink>
                </div>
                <div className={styles.nextIllustration} aria-hidden="true">
                    <div className={styles.orbit orbitOne}></div>
                    <div className={styles.orbit orbitTwo}></div>
                    <div className={styles.orbitCore}><Sparkles size={29} /></div>
                </div>
            </section>

            <section className={styles.metrics} aria-label="Study overview">
                <article className={styles.metricCard}>
                    <span className={styles.metricIcon}><FileText size={18} /></span>
                    <span className={styles.metricLabel}>Open assignments</span>
                    <strong>{loading ? '—' : openAssignments.length}</strong>
                    <span className={styles.metricHint}>Still in progress</span>
                </article>
                <article className={styles.metricCard}>
                    <span className={styles.metricIcon}><CalendarClock size={18} /></span>
                    <span className={styles.metricLabel}>Topics to review</span>
                    <strong>{loading ? '—' : dueReviews.length}</strong>
                    <span className={styles.metricHint}>Based on saved review dates</span>
                </article>
                <article className={styles.metricCard}>
                    <span className={styles.metricIcon}><TrendingUp size={18} /></span>
                    <span className={styles.metricLabel}>Practice sessions</span>
                    <strong>{loading ? '—' : practiceLogs.length}</strong>
                    <span className={styles.metricHint}>Recent saved history</span>
                </article>
                <article className={styles.metricCard}>
                    <span className={styles.metricIcon}><CheckCircle2 size={18} /></span>
                    <span className={styles.metricLabel}>Steps completed</span>
                    <strong>{loading ? '—' : completedSteps}</strong>
                    <span className={styles.metricHint}>Across your assignments</span>
                </article>
            </section>

            <div className={styles.sectionHeading}>
                <div>
                    <span className={styles.eyebrow}>YOUR TOOLKIT</span>
                    <h2>What do you want to work on?</h2>
                </div>
                <span className={styles.toolCount}>{shortcuts.length} ways to begin</span>
            </div>

            <section className={styles.shortcutGrid} aria-label="Study tools">
                {shortcuts.map(({ title, description, to, icon: Icon, label }) => (
                    <NavLink key={title} to={to} className={styles.shortcutCard}>
                        <span className={styles.shortcutIcon}><Icon size={21} /></span>
                        <span className={styles.shortcutTitle}>{title}</span>
                        <span className={styles.shortcutDescription}>{description}</span>
                        <span className={styles.shortcutAction}>{label}<ArrowRight size={15} /></span>
                    </NavLink>
                ))}
            </section>

            <section className={styles.bottomGrid}>
                <div className={styles.panel}>
                    <div className={styles.panelHeading}>
                        <div><span className={styles.eyebrow}>PRACTICE HISTORY</span><h2>Recent work</h2></div>
                        <Clock3 size={19} />
                    </div>
                    {loading ? (
                        <p className={styles.emptyState}>Loading your saved practice…</p>
                    ) : latestPractice.length ? (
                        <ul className={styles.activityList}>
                            {latestPractice.map((item, index) => (
                                <li key={item.id ?? `${item.created_at ?? 'practice'}-${index}`}>
                                    <span className={styles.activityDot}></span>
                                    <div>
                                        <strong>{item.subject || item.title || item.topic || item.activity_type || 'Study practice'}</strong>
                                        <span>{formatDate(item.created_at) || 'Saved session'}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className={styles.emptyState}>
                            <span className={styles.emptyIcon}><BookOpen size={20} /></span>
                            <strong>Your first session starts here.</strong>
                            <p>Complete a practice activity and your saved history will show up here.</p>
                            <NavLink to="/study/exams">Start practice <ArrowRight size={14} /></NavLink>
                        </div>
                    )}
                </div>

                <div className={styles.panel}>
                    <div className={styles.panelHeading}>
                        <div><span className={styles.eyebrow}>SMALL, REPEATABLE WINS</span><h2>Make practice count</h2></div>
                        <Sparkles size={19} />
                    </div>
                    <div className={styles.tipList}>
                        <div><span>01</span><p><strong>Try before you check.</strong> Retrieve the answer from memory before opening notes.</p></div>
                        <div><span>02</span><p><strong>Keep the mistake.</strong> Write down what confused you, not just the right answer.</p></div>
                        <div><span>03</span><p><strong>Return to it.</strong> Revisit difficult topics after a gap to check retention.</p></div>
                    </div>
                    <NavLink className={styles.textLink} to="/study/flashcards">Open flashcards <ArrowRight size={15} /></NavLink>
                </div>
            </section>

            <p className={styles.transparencyNote}>
                <Clock3 size={14} /> Counts reflect the saved Study records currently available to this account; they are not a grade or a measure of ability.
            </p>
        </main>
    );
};

export default StudyDashboard;
