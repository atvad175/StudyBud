import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import styles from '../StudyShared.module.css';
import { BookOpen, Lightbulb, FileText, Target, TrendingUp, Clock, Zap } from 'lucide-react';
import { useStudy } from '../../../context/StudyContext';
import { getStudyRecommendation, calculateStudyStreak } from '../studyUtils';

const StudyDashboard = () => {
    const { techniques, assignments, practiceLogs, boards } = useStudy();
    const [recommendation, setRecommendation] = useState(null);
    const [selectedBoard, setSelectedBoard] = useState(null);

    useEffect(() => {
        const rec = getStudyRecommendation();
        setRecommendation(rec);
    }, []);

    const activeAssignments = assignments.filter(a => a.status !== 'completed').length;
    const completedSteps = assignments.reduce((acc, a) =>
        acc + (a.steps?.filter(s => s.done).length || 0), 0
    );

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <span className={styles.breadcrumb}>Study Hub</span>
                        <h1>Learning Strategy</h1>
                    </div>
                    {recommendation && (
                        <div className={styles.focusIndicator}>
                            <div className={styles.focusDot}></div>
                            Best for {recommendation.recommended[0]} now
                        </div>
                    )}
                </div>
            </header>

            {/* Smart Recommendation Card */}
            {recommendation && (
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '16px',
                    padding: '2rem',
                    color: 'white',
                    marginBottom: '3rem',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                            <Zap size={20} />
                            <span style={{ fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                Smart Recommendation
                            </span>
                        </div>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', fontWeight: '400' }}>
                            {recommendation.technique}
                        </h2>
                        <p style={{ opacity: 0.9, fontSize: '0.95rem', marginBottom: '1rem' }}>
                            {recommendation.reason}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                            <div>
                                <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                {recommendation.duration} min
                            </div>
                            <div>
                                Subjects: {recommendation.recommended.join(', ')}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className={styles.statsGrid} style={{ marginBottom: '3rem' }}>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Active Assignments</div>
                    <div className={styles.statValue}>{activeAssignments}</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Steps Completed</div>
                    <div className={styles.statValue}>{completedSteps}</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Practice Sessions</div>
                    <div className={styles.statValue}>{practiceLogs.length}</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Techniques Learned</div>
                    <div className={styles.statValue}>{techniques.length}</div>
                </div>
            </div>

            {/* Main Sections */}
            <div className={styles.grid}>

                <NavLink to="methods" className={styles.card}>
                    <div className={styles.iconBox}>
                        <Lightbulb size={24} />
                    </div>
                    <h2>Study Methods</h2>
                    <p>Evidence-based techniques for better retention and understanding.</p>
                </NavLink>

                <NavLink to="subjects" className={styles.card}>
                    <div className={styles.iconBox}>
                        <BookOpen size={24} />
                    </div>
                    <h2>Subjects</h2>
                    <p>Subject-specific strategies and common traps to avoid.</p>
                </NavLink>

                <NavLink to="assignments" className={styles.card}>
                    <div className={styles.iconBox}>
                        <FileText size={24} />
                    </div>
                    <h2>Assignments</h2>
                    <p>Break down projects into manageable steps.</p>
                </NavLink>

                <NavLink to="exams" className={styles.card}>
                    <div className={styles.iconBox}>
                        <Target size={24} />
                    </div>
                    <h2>Exam Prep</h2>
                    <p>Practice tracking and mistake pattern analysis.</p>
                </NavLink>

            </div>
        </div>
    );
};

export default StudyDashboard;
