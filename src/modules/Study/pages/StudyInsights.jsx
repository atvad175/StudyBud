import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Activity,
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    BookOpen,
    CalendarDays,
    Download,
    GraduationCap,
    Target,
    TrendingUp,
    TriangleAlert,
    Zap,
} from 'lucide-react';
import { useStudy } from '../../../context/useStudy';
import { getStudyAnalytics } from '../studyPlannerUtils';
import styles from './StudyInsights.module.css';

const RANGE_OPTIONS = [
    { value: '7', label: '7 days' },
    { value: '30', label: '30 days' },
    { value: '90', label: '90 days' },
    { value: 'all', label: 'All time' },
];

const localDateKey = value => {
    const date = new Date(value);
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
    ].join('-');
};

const escapeCsv = value => {
    const text = String(value ?? '');
    return '"' + text.replace(/"/g, '""') + '"';
};

const StudyInsights = () => {
    const navigate = useNavigate();
    const { practiceLogs = [], loading = false } = useStudy();
    const [range, setRange] = useState('30');
    const [subjectFilter, setSubjectFilter] = useState('all');
    const now = useMemo(() => new Date(), []);

    const allAnalytics = useMemo(() => getStudyAnalytics(practiceLogs, now), [practiceLogs, now]);
    const subjectOptions = useMemo(() => [
        ...new Set(allAnalytics.assessments.map(item => item.subject).filter(Boolean)),
    ].sort((a, b) => a.localeCompare(b)), [allAnalytics.assessments]);

    const filteredLogs = useMemo(() => practiceLogs.filter(log => {
        const assessmentDate = log?.created_at ? new Date(log.created_at) : null;
        if (!assessmentDate || !Number.isFinite(assessmentDate.getTime())) return false;
        if (range !== 'all') {
            const cutoff = now.getTime() - Number(range) * 24 * 60 * 60 * 1000;
            if (assessmentDate.getTime() < cutoff) return false;
        }
        if (subjectFilter !== 'all' && String(log.subject || '').toLocaleLowerCase() !== subjectFilter.toLocaleLowerCase()) {
            return false;
        }
        return true;
    }), [practiceLogs, range, subjectFilter, now]);

    const analytics = useMemo(() => getStudyAnalytics(filteredLogs, now), [filteredLogs, now]);

    const missedQuestions = useMemo(() => {
        const missed = new Map();
        analytics.assessments.forEach(attempt => {
            (Array.isArray(attempt.questions) ? attempt.questions : []).forEach(question => {
                if (question?.isCorrect !== false || !question.question) return;
                const key = String(question.question).trim().toLocaleLowerCase();
                const current = missed.get(key) || {
                    question: question.question,
                    subject: attempt.subject,
                    count: 0,
                    lastSeen: attempt.date,
                    explanation: question.explanation || '',
                    correctAnswer: question.correctAnswer || '',
                };
                current.count += 1;
                if (!current.lastSeen || (attempt.date && new Date(attempt.date) > new Date(current.lastSeen))) {
                    current.lastSeen = attempt.date;
                    current.explanation = question.explanation || current.explanation;
                    current.correctAnswer = question.correctAnswer || current.correctAnswer;
                }
                missed.set(key, current);
            });
        });
        return [...missed.values()].sort((a, b) => b.count - a.count).slice(0, 6);
    }, [analytics.assessments]);

    const trend = analytics.assessments.slice(0, 10).reverse();
    const chartPoints = trend.map((attempt, index) => ({
        ...attempt,
        x: trend.length === 1 ? 320 : 28 + (index / (trend.length - 1)) * 584,
        y: 182 - (attempt.score / 100) * 150,
    }));
    const trendLine = chartPoints.map(point => point.x + ',' + point.y).join(' ');
    const activityDays = Number(range === '7' ? 7 : 14);
    const activity = Array.from({ length: activityDays }, (_, index) => {
        const day = new Date(now);
        day.setHours(0, 0, 0, 0);
        day.setDate(day.getDate() - (activityDays - index - 1));
        const key = localDateKey(day);
        const count = filteredLogs.filter(log => log.created_at && localDateKey(log.created_at) === key).length;
        return { key, label: day.toLocaleDateString(undefined, { weekday: 'short' }), dateLabel: day.toLocaleDateString(), count };
    });
    const maxActivity = Math.max(1, ...activity.map(day => day.count));

    const handleExport = () => {
        if (analytics.assessments.length === 0) return;
        const rows = [
            ['Date', 'Subject', 'Assessment', 'Score percent', 'Correct', 'Total', 'Notes'],
            ...analytics.assessments.map(attempt => [
                attempt.date ? new Date(attempt.date).toLocaleString() : '',
                attempt.subject,
                attempt.kind,
                attempt.score,
                attempt.correct,
                attempt.total,
                attempt.notes,
            ]),
        ];
        const csv = rows.map(row => row.map(escapeCsv).join(',')).join('\r\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'studybud-learning-report-' + localDateKey(now) + '.csv';
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
    };

    const handlePracticeSubject = subject => {
        if (subject) localStorage.setItem('studybud_selected_subject', subject);
        navigate('/study/exams');
    };

    const scoreChange = analytics.scoreChange;
    const trendDescription = scoreChange === null
        ? 'Complete another scored session to establish a trend.'
        : scoreChange > 0
            ? 'Your latest scored session is ' + scoreChange + ' points higher than the previous one.'
            : scoreChange < 0
                ? 'Your latest scored session is ' + Math.abs(scoreChange) + ' points lower than the previous one. Review the missed concepts below.'
                : 'Your latest and previous scored sessions are level.';

    return (
        <main className={styles.page}>
            <header className={styles.hero}>
                <div>
                    <span className={styles.eyebrow}><GraduationCap size={15} /> LEARNING INTELLIGENCE</span>
                    <h1>See what is sticking.</h1>
                    <p>Turn practice results into a clear picture of progress, the subjects that need work and the concepts worth revisiting.</p>
                </div>
                <div className={styles.heroActions}>
                    <button type="button" className={styles.exportButton} onClick={handleExport} disabled={analytics.assessmentCount === 0}>
                        <Download size={16} /> Export report
                    </button>
                    <button type="button" className={styles.primaryButton} onClick={() => navigate('/study/plan')}>
                        Build today's plan <ArrowRight size={16} />
                    </button>
                </div>
            </header>

            <section className={styles.controls} aria-label="Analytics filters">
                <div className={styles.rangeControl}>
                    {RANGE_OPTIONS.map(option => (
                        <button
                            type="button"
                            key={option.value}
                            aria-pressed={range === option.value}
                            className={range === option.value ? styles.rangeActive : ''}
                            onClick={() => setRange(option.value)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
                <label className={styles.subjectControl}>
                    <span>Subject</span>
                    <select value={subjectFilter} onChange={event => setSubjectFilter(event.target.value)}>
                        <option value="all">All subjects</option>
                        {subjectOptions.map(subject => <option key={subject} value={subject}>{subject}</option>)}
                    </select>
                </label>
            </section>

            {loading && <div className={styles.notice} role="status">Loading your saved learning history…</div>}

            <section className={styles.metricGrid} aria-label="Performance summary">
                <article className={styles.metricCard}>
                    <span className={styles.metricIcon}><Target size={18} /></span>
                    <span className={styles.metricLabel}>Average score</span>
                    <strong>{analytics.averageScore === null ? '—' : analytics.averageScore + '%'}</strong>
                    <small>{analytics.assessmentCount ? 'Across ' + analytics.assessmentCount + ' scored sessions' : 'No scored sessions in this range'}</small>
                </article>
                <article className={styles.metricCard}>
                    <span className={styles.metricIcon}><BookOpen size={18} /></span>
                    <span className={styles.metricLabel}>Assessments</span>
                    <strong>{analytics.assessmentCount}</strong>
                    <small>Practice exams and scored Feynman sessions</small>
                </article>
                <article className={styles.metricCard}>
                    <span className={styles.metricIcon}><Activity size={18} /></span>
                    <span className={styles.metricLabel}>Study records</span>
                    <strong>{filteredLogs.length}</strong>
                    <small>Saved activity in the selected range</small>
                </article>
                <article className={styles.metricCard}>
                    <span className={styles.metricIcon}><TriangleAlert size={18} /></span>
                    <span className={styles.metricLabel}>Concepts to revisit</span>
                    <strong>{missedQuestions.length}</strong>
                    <small>Distinct missed questions found in saved exams</small>
                </article>
            </section>

            <section className={styles.mainGrid}>
                <article className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <div>
                            <span className={styles.eyebrow}>SCORE MOVEMENT</span>
                            <h2>Assessment trend</h2>
                            <p>{trendDescription}</p>
                        </div>
                        {scoreChange !== null && (
                            <span className={scoreChange >= 0 ? styles.changeUp : styles.changeDown}>
                                {scoreChange >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                {scoreChange > 0 ? '+' : ''}{scoreChange} pts
                            </span>
                        )}
                    </div>
                    {chartPoints.length > 0 ? (
                        <div className={styles.chartWrap}>
                            <svg viewBox="0 0 640 220" role="img" aria-label="Assessment scores over time from zero to one hundred percent" className={styles.chart}>
                                {[25, 50, 75, 100].map(value => {
                                    const y = 182 - (value / 100) * 150;
                                    return (
                                        <g key={value}>
                                            <line x1="28" x2="612" y1={y} y2={y} className={styles.gridLine} />
                                            <text x="3" y={y + 4} className={styles.axisLabel}>{value}</text>
                                        </g>
                                    );
                                })}
                                {chartPoints.length > 1 && <polyline points={trendLine} className={styles.trendLine} />}
                                {chartPoints.map((point, index) => (
                                    <g key={String(point.id) + index}>
                                        <circle cx={point.x} cy={point.y} r="6" className={styles.trendPoint} />
                                        <text x={point.x} y="207" textAnchor="middle" className={styles.axisLabel}>
                                            {point.date ? new Date(point.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : ''}
                                        </text>
                                    </g>
                                ))}
                            </svg>
                            <div className={styles.chartCaption}>Most recent {chartPoints.length} scored sessions · 0–100%</div>
                        </div>
                    ) : (
                        <div className={styles.emptyChart}>
                            <TrendingUp size={27} />
                            <strong>Your score trend starts with your first saved assessment.</strong>
                            <span>Take a practice exam or finish a Feynman mastery session to see progress here.</span>
                            <button type="button" onClick={() => navigate('/study/exams')}>Start practice <ArrowRight size={14} /></button>
                        </div>
                    )}
                </article>

                <article className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <div>
                            <span className={styles.eyebrow}>STUDY RHYTHM</span>
                            <h2>Recent activity</h2>
                            <p>Saved study records by day. This is activity, not a measure of learning quality.</p>
                        </div>
                        <CalendarDays size={19} />
                    </div>
                    <div className={styles.activityGrid}>
                        {activity.map(day => (
                            <div className={styles.activityDay} key={day.key} title={day.dateLabel + ': ' + day.count + ' saved records'}>
                                <span>{day.label}</span>
                                <div className={styles.activityTrack}>
                                    <div style={{ height: (day.count / maxActivity) * 100 + '%' }} />
                                </div>
                                <strong>{day.count}</strong>
                            </div>
                        ))}
                    </div>
                    <div className={styles.activityFoot}>
                        <span><Zap size={14} /> {activity.reduce((sum, day) => sum + day.count, 0)} records in this view</span>
                        <span>Last {activityDays} days</span>
                    </div>
                </article>
            </section>

            <section className={styles.bottomGrid}>
                <article className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <div>
                            <span className={styles.eyebrow}>WHERE TO FOCUS</span>
                            <h2>Subject performance</h2>
                            <p>Ranked from lower to higher average assessment score.</p>
                        </div>
                    </div>
                    {analytics.subjectPerformance.length > 0 ? (
                        <div className={styles.subjectList}>
                            {analytics.subjectPerformance.map((subject, index) => (
                                <div className={styles.subjectRow} key={subject.subject}>
                                    <div className={styles.subjectRowHead}>
                                        <span><b>{String(index + 1).padStart(2, '0')}</b>{subject.subject}</span>
                                        <strong>{subject.averageScore}%</strong>
                                    </div>
                                    <div className={styles.scoreTrack}>
                                        <span style={{ width: subject.averageScore + '%' }} />
                                    </div>
                                    <div className={styles.subjectMeta}>
                                        <span>{subject.attempts} scored session{subject.attempts === 1 ? '' : 's'}</span>
                                        <button type="button" onClick={() => handlePracticeSubject(subject.subject)}>Practise <ArrowRight size={13} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyText}>Subject comparisons appear once you save scored practice sessions.</div>
                    )}
                </article>

                <article className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <div>
                            <span className={styles.eyebrow}>REPEAT GAPS</span>
                            <h2>Concepts to revisit</h2>
                            <p>Questions missed in saved practice papers, ranked by how often they appeared as a gap.</p>
                        </div>
                    </div>
                    {missedQuestions.length > 0 ? (
                        <div className={styles.missedList}>
                            {missedQuestions.map((item, index) => (
                                <div className={styles.missedItem} key={item.question.toLocaleLowerCase()}>
                                    <div className={styles.missedNumber}>{index + 1}</div>
                                    <div className={styles.missedBody}>
                                        <strong>{item.question}</strong>
                                        <span>{item.subject} · Missed {item.count} time{item.count === 1 ? '' : 's'}</span>
                                        {item.correctAnswer && <small>Correct answer: {item.correctAnswer}</small>}
                                    </div>
                                    <button type="button" onClick={() => handlePracticeSubject(item.subject)} aria-label={'Practise ' + item.subject}>
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyText}>No missed-question patterns in this selection. Keep saving practice results to build this list.</div>
                    )}
                </article>
            </section>

            <section className={styles.panel}>
                <div className={styles.panelHeader}>
                    <div>
                        <span className={styles.eyebrow}>SESSION HISTORY</span>
                        <h2>Recent assessments</h2>
                        <p>Results are taken from saved practice history and remain private to the signed-in account.</p>
                    </div>
                </div>
                {analytics.recentAssessments.length > 0 ? (
                    <div className={styles.historyTable}>
                        <div className={styles.historyHeader}><span>Subject / session</span><span>Date</span><span>Result</span></div>
                        {analytics.recentAssessments.map(attempt => (
                            <div className={styles.historyRow} key={String(attempt.id) + attempt.subject}>
                                <div><strong>{attempt.subject}</strong><span>{attempt.kind}</span></div>
                                <span>{attempt.date ? new Date(attempt.date).toLocaleDateString() : '—'}</span>
                                <b>{attempt.score}% <small>({attempt.correct}/{attempt.total})</small></b>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyText}>No scored assessment results match your current filters.</div>
                )}
            </section>
        </main>
    );
};

export default StudyInsights;
