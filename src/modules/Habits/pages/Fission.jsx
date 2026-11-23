import React, { useState } from 'react';
import { useHabits } from '../../../context/useHabits';
import { useStudy } from '../../../context/useStudy';
import { useMind } from '../../../context/useMind';
import { useToast } from '../../../context/useToast';
import { FISSION_LEVELS } from '../data/fissionContent';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, ChevronRight, MessageCircle, Target, ArrowLeft } from 'lucide-react';
import styles from './Fission.module.css';

const Fission = () => {
    const { atoms, updateLog } = useHabits();
    const { addAssignment, assignments = [] } = useStudy();
    const { addLog } = useMind();
    const { toast } = useToast();
    const [selectedLevel, setSelectedLevel] = useState(FISSION_LEVELS[0]);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [reflections, setReflections] = useState({});
    const [savingAtomId, setSavingAtomId] = useState(null);
    const [isSavingReflection, setIsSavingReflection] = useState(false);
    const [isAcceptingChallenge, setIsAcceptingChallenge] = useState(false);

    // Filter atoms with fission entries for the sidebar
    const fissionAtoms = Array.isArray(atoms) ? atoms.filter(a => a.fission_entry) : [];

    const handleQuickLog = async (atomId) => {
        if (savingAtomId !== null) return;
        setSavingAtomId(atomId);
        try {
            await updateLog(atomId, { status: 'completed' });
            toast.success('Habit entry point logged.');
        } catch (error) {
            toast.error(error?.message || 'Your habit could not be logged. Please try again.');
        } finally {
            setSavingAtomId(null);
        }
    };

    const saveLessonReflection = async () => {
        if (!selectedLesson || isSavingReflection) return;
        const answers = {};
        selectedLesson.reflection.forEach((question, index) => {
            const answer = String(reflections[selectedLesson.id + '-' + index] || '').trim();
            if (answer) answers[question] = answer;
        });
        if (Object.keys(answers).length === 0) {
            toast.info('Write at least one reflection before saving.');
            return;
        }

        setIsSavingReflection(true);
        try {
            await addLog({
                type: 'reflection',
                content: {
                    source: 'fission',
                    lesson_id: selectedLesson.id,
                    lesson_title: selectedLesson.title,
                    level_title: selectedLevel.title,
                    answers,
                },
                tags: ['fission', 'lesson-' + selectedLesson.id],
            });
            toast.success('Your lesson reflection was saved to Mind Timeline.');
        } catch (error) {
            toast.error(error?.message || 'Your reflection could not be saved. Please try again.');
        } finally {
            setIsSavingReflection(false);
        }
    };

    const challengeTitle = selectedLesson ? 'Fission Challenge: ' + selectedLesson.title : '';
    const challengeAlreadyAdded = Boolean(challengeTitle && assignments.some(item => item.title === challengeTitle));

    const acceptLessonChallenge = async () => {
        if (!selectedLesson || isAcceptingChallenge || challengeAlreadyAdded) return;
        setIsAcceptingChallenge(true);
        try {
            await addAssignment({
                title: challengeTitle,
                subject: 'Fission Principle',
                deadline: '',
                notes: selectedLesson.challenge,
                steps: [{ name: selectedLesson.challenge, done: false }],
                status: 'not_started',
            });
            toast.success('Challenge added to Study Assignments.');
        } catch (error) {
            toast.error(error?.message || 'The challenge could not be saved. Please try again.');
        } finally {
            setIsAcceptingChallenge(false);
        }
    };

    const handleReflectionChange = (lessonId, index, value) => {
        setReflections(prev => ({
            ...prev,
            [`${lessonId}-${index}`]: value
        }));
    };

    if (selectedLesson) {
        return (
            <div className="page-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
                <button className={styles.backLink} onClick={() => setSelectedLesson(null)}>
                    <ArrowLeft size={18} />
                    <span>Back to Curriculum</span>
                </button>

                <div className={styles.lessonReader}>
                    <div className={styles.lessonMeta}>
                        <span className={styles.levelTag}>LEVEL {selectedLevel.id} — {selectedLevel.title}</span>
                        <h1>Lesson {selectedLesson.id} — {selectedLesson.title}</h1>
                    </div>

                    <section className={styles.chapterContent}>
                        <h3>Chapter</h3>
                        <div className={styles.readingText}>
                            {selectedLesson.chapter.split('\n\n').map((para, i) => (
                                <p key={i}>{para}</p>
                            ))}
                        </div>
                    </section>

                    <section className={styles.reflectionSection}>
                        <div className={styles.sectionHeader}>
                            <MessageCircle size={20} color="var(--color-gold)" />
                            <h3>Reflection</h3>
                        </div>
                        <div className={styles.reflectionList}>
                            {selectedLesson.reflection.map((q, i) => (
                                <div key={i} className={styles.reflectionItem}>
                                    <label>{q}</label>
                                    <textarea
                                        placeholder="Write your thoughts..."
                                        value={reflections[`${selectedLesson.id}-${i}`] || ''}
                                        onChange={(e) => handleReflectionChange(selectedLesson.id, i, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            <button
                                type="button"
                                onClick={() => { void saveLessonReflection(); }}
                                disabled={isSavingReflection}
                                className={styles.acceptBtn}
                                style={{ opacity: isSavingReflection ? 0.6 : 1, cursor: isSavingReflection ? 'wait' : 'pointer' }}
                            >
                                {isSavingReflection ? 'Saving reflection…' : 'Save reflection'}
                            </button>
                        </div>
                    </section>

                    <section className={styles.challengeSection}>
                        <div className={styles.sectionHeader}>
                            <Target size={20} color="var(--color-gold)" />
                            <h3>Action / Challenge</h3>
                        </div>
                        <div className={styles.challengeCard}>
                            <p>{selectedLesson.challenge}</p>
                            <button
                                type="button"
                                className={styles.acceptBtn}
                                onClick={() => { void acceptLessonChallenge(); }}
                                disabled={isAcceptingChallenge || challengeAlreadyAdded}
                                style={{ opacity: isAcceptingChallenge || challengeAlreadyAdded ? 0.6 : 1, cursor: isAcceptingChallenge ? 'wait' : 'pointer' }}
                            >
                                {isAcceptingChallenge ? 'Saving challenge…' : challengeAlreadyAdded ? 'Added to assignments' : 'Accept Challenge'}
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className={styles.header}>
                <span className={styles.breadcrumb}>Habits / Growth System</span>
                <h1>Fission Principle</h1>
                <p>The energy of a habit comes from the split second decision to just start.</p>
            </div>

            <div className={styles.mainLayout}>
                <div className={styles.curriculumGrid}>
                    <div className={styles.levelHeader}>
                        <div className={styles.levelBadge}>LEVEL {selectedLevel.id}</div>
                        <h2>{selectedLevel.title}</h2>
                    </div>

                    <div role="group" aria-label="Choose a Fission learning level" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem', marginBottom: '1rem' }}>
                        {FISSION_LEVELS.map(level => (
                            <button
                                key={level.id}
                                type="button"
                                aria-pressed={selectedLevel.id === level.id}
                                onClick={() => {
                                    setSelectedLevel(level);
                                    setSelectedLesson(null);
                                }}
                                style={{
                                    padding: '0.55rem 0.8rem',
                                    borderRadius: '999px',
                                    border: selectedLevel.id === level.id ? '1px solid #c7a144' : '1px solid var(--color-border)',
                                    background: selectedLevel.id === level.id ? '#fff7dc' : 'white',
                                    color: 'var(--color-soft-black)',
                                    cursor: 'pointer',
                                    fontWeight: selectedLevel.id === level.id ? 700 : 500,
                                }}
                            >
                                Level {level.id}
                            </button>
                        ))}
                    </div>

                    <div className={styles.lessonList}>
                        {selectedLevel.lessons.map(lesson => (
                            <div key={lesson.id} className={styles.lessonCard} onClick={() => setSelectedLesson(lesson)}>
                                <div className={styles.lessonIcon}>
                                    <BookOpen size={20} />
                                </div>
                                <div className={styles.lessonInfo}>
                                    <span className={styles.lessonNumber}>Lesson {lesson.id}</span>
                                    <h3>{lesson.title}</h3>
                                </div>
                                <ChevronRight className={styles.arrow} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Interactive Sidebar */}
                <aside className={styles.quickFission}>
                    <h3>Quick Fission</h3>
                    <p className={styles.sidebarHint}>Just do the entry point. Nothing else.</p>

                    <div className={styles.fissionList}>
                        {fissionAtoms.map(atom => (
                            <div key={atom.id} className={styles.fissionCard}>
                                <div className={styles.fissionInfo}>
                                    <span className={styles.atomTitle}>{atom.title}</span>
                                    <span className={styles.entryPoint}>{atom.fission_entry}</span>
                                </div>
                                <button
                                    className={styles.fissionBtn}
                                    onClick={() => { void handleQuickLog(atom.id); }}
                                    disabled={savingAtomId !== null}
                                    style={{ opacity: savingAtomId !== null ? 0.6 : 1, cursor: savingAtomId !== null ? 'wait' : 'pointer' }}
                                >
                                    Log
                                </button>
                            </div>
                        ))}
                        {fissionAtoms.length === 0 && (
                            <div className={styles.emptyState}>
                                <p>No fission entry points defined yet.</p>
                                <Link to="/habits/add" style={{ color: 'var(--color-gold)', fontSize: '0.9rem' }}>Add one now →</Link>
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Fission;
