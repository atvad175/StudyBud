import React, { useState, useEffect } from 'react';
import { useHabits } from '../../../context/HabitsContext';
import { FISSION_LEVELS } from '../data/fissionContent';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, ChevronRight, MessageCircle, Target, ArrowLeft } from 'lucide-react';
import styles from './Fission.module.css';

const Fission = () => {
    const { atoms, updateLog } = useHabits();
    const [selectedLevel, setSelectedLevel] = useState(FISSION_LEVELS[0]);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [reflections, setReflections] = useState({});

    // Filter atoms with fission entries for the sidebar
    const fissionAtoms = Array.isArray(atoms) ? atoms.filter(a => a.fission_entry) : [];

    const handleQuickLog = async (atomId) => {
        await updateLog(atomId, { status: 'completed' });
        alert('Entry Point Logged! Momentum started. 🚀');
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
                    </section>

                    <section className={styles.challengeSection}>
                        <div className={styles.sectionHeader}>
                            <Target size={20} color="var(--color-gold)" />
                            <h3>Action / Challenge</h3>
                        </div>
                        <div className={styles.challengeCard}>
                            <p>{selectedLesson.challenge}</p>
                            <button className={styles.acceptBtn}>Accept Challenge</button>
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
                                    onClick={() => handleQuickLog(atom.id)}
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
