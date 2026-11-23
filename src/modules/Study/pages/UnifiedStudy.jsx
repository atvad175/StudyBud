import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen,
    Zap,
    Target,
    ArrowRight,
    BrainCircuit,
    Library,
    Search,
    Layers,
    ClipboardList,
    CalendarClock,
} from 'lucide-react';
import styles from '../StudyShared.module.css';
import { useStudy } from '../../../context/useStudy';

const QUICK_ACTIONS = [
    {
        id: 'flashcards',
        title: 'Review flashcards',
        description: 'Strengthen recall with cards due for review.',
        label: 'Open flashcards',
        path: '/study/flashcards',
        icon: Layers,
        tone: 'blue',
    },
    {
        id: 'exams',
        title: 'Practice exam',
        description: 'Build a timed quiz from your study material.',
        label: 'Start practice',
        path: '/study/exams',
        icon: Target,
        tone: 'green',
    },
    {
        id: 'assignments',
        title: 'Break down work',
        description: 'Turn a large assignment into clear next steps.',
        label: 'Plan assignment',
        path: '/study/assignments',
        icon: ClipboardList,
        tone: 'gold',
    },
    {
        id: 'feynman',
        title: 'Explain a topic',
        description: 'Find gaps by teaching the idea in plain language.',
        label: 'Try the Feynman method',
        path: '/study/feynman',
        icon: BrainCircuit,
        tone: 'purple',
    },
];

const DEFAULT_FRAMEWORKS = [
    {
        name: 'Active recall',
        description: 'Close your notes and retrieve the idea from memory. Check what you missed, then try again.',
        bestFor: 'Definitions, processes, formulas and key facts',
    },
    {
        name: 'Spaced repetition',
        description: 'Return to material over several sessions instead of trying to learn it all in one sitting.',
        bestFor: 'Keeping earlier chapters fresh while learning new ones',
    },
    {
        name: 'The Feynman technique',
        description: 'Explain the concept in plain language. Every place you get vague points to a gap worth revisiting.',
        bestFor: 'Complex concepts and topics that feel memorised but unclear',
    },
];

const KNOWN_BOARDS = ['ICSE', 'IGCSE', 'ISC', 'CBSE', 'IB', 'Other'];

const UnifiedStudy = () => {
    const navigate = useNavigate();
    const {
        subjects = [],
        boards = [],
        techniques = [],
        assignments = [],
        practiceLogs = [],
        reviews = [],
        loading = false,
        loadError = '',
    } = useStudy();

    const [activeTab, setActiveTab] = useState('subjects');
    const [subjectQuery, setSubjectQuery] = useState('');
    const [selectedBoard, setSelectedBoard] = useState(() => {
        const savedBoard = localStorage.getItem('studybud_board') || 'all';
        return KNOWN_BOARDS.includes(savedBoard) ? savedBoard : 'all';
    });

    const boardOptions = useMemo(() => {
        const fromContext = boards
            .map(board => board?.name)
            .filter(name => typeof name === 'string' && name.trim());
        return ['all', ...new Set([...KNOWN_BOARDS, ...fromContext])];
    }, [boards]);

    const visibleSubjects = useMemo(() => {
        const query = subjectQuery.trim().toLocaleLowerCase();
        return subjects.filter(subject => {
            const matchesQuery = !query || String(subject.name || '').toLocaleLowerCase().includes(query);
            const subjectBoards = Array.isArray(subject.boards) ? subject.boards : [];
            const matchesBoard = selectedBoard === 'all' ||
                subjectBoards.length === 0 ||
                subjectBoards.includes(selectedBoard);
            return matchesQuery && matchesBoard;
        });
    }, [subjects, subjectQuery, selectedBoard]);

    const frameworks = techniques.length
        ? techniques.map(technique => ({
            name: technique.name,
            description: technique.description || technique.why_it_works || 'A practical framework to use during your next study session.',
            bestFor: technique.when_to_use || technique.category || 'General revision',
        }))
        : DEFAULT_FRAMEWORKS;

    const activeBoard = useMemo(
        () => selectedBoard === 'all'
            ? null
            : boards.find(board => board?.name === selectedBoard) || null,
        [boards, selectedBoard]
    );

    const dueReviewItems = useMemo(() => reviews
        .filter(review => {
            if (!review?.next_review_date) return false;
            const timestamp = new Date(review.next_review_date).getTime();
            return Number.isFinite(timestamp) && timestamp <= Date.now();
        })
        .sort((a, b) => new Date(a.next_review_date) - new Date(b.next_review_date)), [reviews]);

    const dueReviewCount = dueReviewItems.length;
    const openAssignments = useMemo(() => assignments
        .filter(assignment => String(assignment?.status || '').toLowerCase() !== 'completed')
        .sort((a, b) => {
            const dateFor = assignment => {
                const raw = assignment?.due_date || assignment?.due_at || assignment?.deadline;
                const parsed = raw ? Date.parse(raw) : NaN;
                return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
            };
            return dateFor(a) - dateFor(b);
        }), [assignments]);

    const overdueAssignments = openAssignments.filter(assignment => {
        const raw = assignment?.due_date || assignment?.due_at || assignment?.deadline;
        const parsed = raw ? new Date(raw) : null;
        return parsed && !Number.isNaN(parsed.getTime()) && parsed.getTime() < new Date().setHours(0, 0, 0, 0);
    });

    const greetingBoard = selectedBoard === 'all' ? '' : selectedBoard;
    const formatCount = (count, singular, plural = `${singular}s`) =>
        `${count} ${count === 1 ? singular : plural}`;

    return (
        <div className={styles.container}>
            <header className={styles.hubHero}>
                <div className={styles.hubHeroCopy}>
                    <span className={styles.hubEyebrow}>YOUR LEARNING WORKSPACE</span>
                    <h1 className={styles.hubTitle}>Make your next study session count.</h1>
                    <p className={styles.hubSubtitle}>
                        Pick one useful action, work on it, then come back to what needs review.
                        StudyBud keeps your tools in one place.
                    </p>
                    <p className={styles.hubStudyDisclaimer} role="note">
                        Subject tips are general learning guidance tagged to common curricula—not an official syllabus or mark scheme. Confirm chapter lists, weightings and exam requirements with your current board or school.
                    </p>
                    {greetingBoard && (
                        <span className={styles.hubBoardBadge}>
                            <BookOpen size={14} aria-hidden="true" />
                            {greetingBoard} study strategies
                        </span>
                    )}
                </div>
                <div className={styles.hubHeroMark} aria-hidden="true">
                    <BrainCircuit size={42} strokeWidth={1.5} />
                    <span>Learn · Practise · Recall</span>
                </div>
            </header>

            {activeBoard?.strategies?.length > 0 && (
                <section className={styles.hubLibrarySection} aria-labelledby="board-guidance-title">
                    <div className={styles.hubSectionHeading}>
                        <div>
                            <span className={styles.hubEyebrow}>CURRICULUM APPROACH</span>
                            <h2 id="board-guidance-title">{activeBoard.name} study approaches</h2>
                            <p className={styles.hubSectionDescription}>
                                General ways to prepare for this curriculum. Check your current subject syllabus for exact topics, weightings and mark schemes.
                            </p>
                        </div>
                    </div>
                    <div className={styles.hubFrameworkGrid}>
                        {activeBoard.strategies.map((strategy, index) => (
                            <article key={`${activeBoard.name}-${strategy.title}`} className={styles.hubFrameworkCard}>
                                <span className={styles.hubFrameworkNumber}>{String(index + 1).padStart(2, '0')}</span>
                                <h3>{strategy.title}</h3>
                                <p>{strategy.content}</p>
                            </article>
                        ))}
                    </div>
                </section>
            )}

            {loadError && (
                <div className={styles.hubDataWarning} role="alert">
                    <div>
                        <strong>Saved Study data is unavailable</strong>
                        <p>{loadError}</p>
                    </div>
                    <button type="button" onClick={() => window.location.reload()}>
                        Retry
                    </button>
                </div>
            )}

            <section className={styles.hubQuickSection} aria-labelledby="quick-actions-title">
                <div className={styles.hubSectionHeading}>
                    <div>
                        <span className={styles.hubEyebrow}>START HERE</span>
                        <h2 id="quick-actions-title">What do you want to do?</h2>
                    </div>
                    <span className={styles.hubSectionHint}>Choose one. You can switch tools any time.</span>
                </div>

                <div className={styles.hubActionGrid}>
                    {QUICK_ACTIONS.map(action => {
                        const Icon = action.icon;
                        return (
                            <button
                                key={action.id}
                                type="button"
                                className={`${styles.hubActionCard} ${styles[`hubTone_${action.tone}` ]}`}
                                onClick={() => navigate(action.path)}
                            >
                                <span className={styles.hubActionIcon}>
                                    <Icon size={21} aria-hidden="true" />
                                </span>
                                <span className={styles.hubActionTitle}>{action.title}</span>
                                <span className={styles.hubActionDescription}>{action.description}</span>
                                <span className={styles.hubActionLink}>
                                    {action.label} <ArrowRight size={15} aria-hidden="true" />
                                </span>
                            </button>
                        );
                    })}
                </div>
            </section>

            <section className={styles.hubStats} aria-label="Your study overview">
                <div className={styles.hubStat}>
                    <span className={styles.hubStatIcon}><ClipboardList size={17} aria-hidden="true" /></span>
                    <span className={styles.hubStatValue}>{loading ? '—' : openAssignments.length}</span>
                    <span className={styles.hubStatLabel}>{formatCount(openAssignments.length, 'open assignment')}</span>
                </div>
                <div className={styles.hubStat}>
                    <span className={styles.hubStatIcon}><Zap size={17} aria-hidden="true" /></span>
                    <span className={styles.hubStatValue}>{loading ? '—' : practiceLogs.length}</span>
                    <span className={styles.hubStatLabel}>{formatCount(practiceLogs.length, 'practice record')}</span>
                </div>
                <div className={styles.hubStat}>
                    <span className={styles.hubStatIcon}><CalendarClock size={17} aria-hidden="true" /></span>
                    <span className={styles.hubStatValue}>{loading ? '—' : dueReviewCount}</span>
                    <span className={styles.hubStatLabel}>{formatCount(dueReviewCount, 'review due', 'reviews due')}</span>
                </div>
            </section>

            <section className={styles.hubPriorityGrid} aria-label="What needs attention next">
                <article className={styles.hubPriorityCard}>
                    <div className={styles.hubPriorityTop}>
                        <span className={styles.hubPriorityIcon}><CalendarClock size={19} aria-hidden="true" /></span>
                        <span className={dueReviewCount ? styles.hubPriorityBadge : styles.hubPriorityBadgeQuiet}>
                            {loading ? 'Loading' : dueReviewCount ? `${dueReviewCount} due` : 'Clear'}
                        </span>
                    </div>
                    <h2>Review queue</h2>
                    <p>
                        {loading
                            ? 'Loading your saved review dates…'
                            : dueReviewCount
                                ? `${dueReviewCount} scheduled review${dueReviewCount === 1 ? ' is' : 's are'} ready. Do a short recall pass before moving on.`
                                : 'No saved reviews are due. Use a short practice session to keep older topics fresh.'}
                    </p>
                    {dueReviewItems[0] && (
                        <div className={styles.hubPriorityDetail}>
                            <strong>Next in queue</strong>
                            <span>{dueReviewItems[0].title || dueReviewItems[0].topic || dueReviewItems[0].subject || 'Scheduled review'}</span>
                        </div>
                    )}
                    <button type="button" className={styles.hubPriorityAction} onClick={() => navigate('/study/flashcards')}>
                        Open flashcards <ArrowRight size={15} aria-hidden="true" />
                    </button>
                </article>

                <article className={styles.hubPriorityCard}>
                    <div className={styles.hubPriorityTop}>
                        <span className={styles.hubPriorityIcon}><ClipboardList size={19} aria-hidden="true" /></span>
                        <span className={overdueAssignments.length ? styles.hubPriorityBadge : styles.hubPriorityBadgeQuiet}>
                            {loading ? 'Loading' : overdueAssignments.length ? `${overdueAssignments.length} overdue` : `${openAssignments.length} open`}
                        </span>
                    </div>
                    <h2>Assignment runway</h2>
                    <p>
                        {loading
                            ? 'Loading your assignments…'
                            : openAssignments.length
                                ? 'Start with the next deadline when one is recorded; otherwise pick the first open assignment.'
                                : 'Your saved assignments are clear. Add the next piece of work before it becomes urgent.'}
                    </p>
                    {openAssignments[0] && (
                        <div className={styles.hubPriorityDetail}>
                            <strong>Suggested next</strong>
                            <span>{openAssignments[0].title || openAssignments[0].name || 'Untitled assignment'}</span>
                            {(openAssignments[0].due_date || openAssignments[0].due_at || openAssignments[0].deadline) && (
                                <small>Due {new Date(openAssignments[0].due_date || openAssignments[0].due_at || openAssignments[0].deadline).toLocaleDateString()}</small>
                            )}
                        </div>
                    )}
                    <button type="button" className={styles.hubPriorityAction} onClick={() => navigate('/study/assignments')}>
                        Plan assignment <ArrowRight size={15} aria-hidden="true" />
                    </button>
                </article>
            </section>

            <section className={styles.hubLibrarySection} aria-labelledby="study-library-title">
                <div className={styles.hubSectionHeading}>
                    <div>
                        <span className={styles.hubEyebrow}>BUILD YOUR METHOD</span>
                        <h2 id="study-library-title">Study library</h2>
                        <p className={styles.hubSectionDescription}>
                            Find a subject strategy or choose a repeatable technique.
                        </p>
                    </div>
                </div>

                <div className={styles.hubLibraryToolbar}>
                    <div className={styles.hubTabs} role="tablist" aria-label="Study library">
                        <button
                            id="study-tab-subjects"
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'subjects'}
                            aria-controls="study-panel-subjects"
                            className={activeTab === 'subjects' ? styles.hubTabActive : styles.hubTab}
                            onClick={() => setActiveTab('subjects')}
                        >
                            <Library size={17} aria-hidden="true" /> Subjects
                        </button>
                        <button
                            id="study-tab-frameworks"
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'frameworks'}
                            aria-controls="study-panel-frameworks"
                            className={activeTab === 'frameworks' ? styles.hubTabActive : styles.hubTab}
                            onClick={() => setActiveTab('frameworks')}
                        >
                            <BrainCircuit size={17} aria-hidden="true" /> Study techniques
                        </button>
                    </div>

                    {activeTab === 'subjects' && (
                        <div className={styles.hubFilters}>
                            <label className={styles.hubSearch}>
                                <Search size={17} aria-hidden="true" />
                                <span className={styles.visuallyHidden}>Search subjects</span>
                                <input
                                    type="search"
                                    value={subjectQuery}
                                    onChange={event => setSubjectQuery(event.target.value)}
                                    placeholder="Find a subject…"
                                />
                            </label>
                            <label className={styles.hubBoardFilter}>
                                <span className={styles.visuallyHidden}>Filter subjects by curriculum</span>
                                <select
                                    value={selectedBoard}
                                    onChange={event => setSelectedBoard(event.target.value)}
                                >
                                    <option value="all">All curricula</option>
                                    {boardOptions.filter(board => board !== 'all').map(board => (
                                        <option key={board} value={board}>{board}</option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    )}
                </div>

                {activeTab === 'subjects' && (
                    <div id="study-panel-subjects" role="tabpanel" aria-labelledby="study-tab-subjects">
                        {loading && (
                            <div className={styles.hubNotice} role="status">Loading your study library…</div>
                        )}

                        {!loading && visibleSubjects.length > 0 && (
                            <div className={styles.hubSubjectGrid}>
                                {visibleSubjects.map(subject => (
                                    <article key={subject.id || subject.name} className={styles.hubSubjectCard}>
                                        <div className={styles.hubSubjectHead}>
                                            <span className={styles.hubSubjectIcon} aria-hidden="true">{subject.icon || '📘'}</span>
                                            <div>
                                                <h3>{subject.name}</h3>
                                                <div className={styles.hubBoardTags}>
                                                    {(subject.boards || []).map(board => (
                                                        <span key={board}>{board}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <p className={styles.hubStrategyCopy}>
                                            {subject.strategies?.how_to_study || subject.description || 'Choose one topic, test what you remember, then review the gaps.'}
                                        </p>
                                        <div className={styles.hubStuckTip}>
                                            <strong>When you get stuck</strong>
                                            <p>{subject.strategies?.when_stuck || 'Write down the exact part that confuses you, then work through one example step by step.'}</p>
                                        </div>
                                        <button
                                            type="button"
                                            className={styles.hubSubjectAction}
                                            onClick={() => {
                                                localStorage.setItem('studybud_selected_subject', subject.name || '');
                                                navigate('/study/exams');
                                            }}
                                        >
                                            Practise this subject <ArrowRight size={15} aria-hidden="true" />
                                        </button>
                                    </article>
                                ))}
                            </div>
                        )}

                        {!loading && visibleSubjects.length === 0 && (
                            <div className={styles.hubEmptyState}>
                                <div className={styles.hubEmptyIcon}><Search size={22} aria-hidden="true" /></div>
                                <h3>No subjects match that filter.</h3>
                                <p>Clear the search or show all curricula to find another subject.</p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSubjectQuery('');
                                        setSelectedBoard('all');
                                    }}
                                >
                                    Show all subjects
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'frameworks' && (
                    <div id="study-panel-frameworks" role="tabpanel" aria-labelledby="study-tab-frameworks">
                        <div className={styles.hubFrameworkGrid}>
                            {frameworks.map((framework, index) => (
                                <article key={framework.id || framework.name || index} className={styles.hubFrameworkCard}>
                                    <span className={styles.hubFrameworkNumber}>{String(index + 1).padStart(2, '0')}</span>
                                    <h3>{framework.name}</h3>
                                    <p>{framework.description}</p>
                                    <div className={styles.hubFrameworkBestFor}>
                                        <strong>Useful for</strong>
                                        <span>{framework.bestFor}</span>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};

export default UnifiedStudy;
