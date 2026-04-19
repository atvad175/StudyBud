import React, { useState } from 'react';
import styles from '../StudyShared.module.css';
import { BookOpen, AlertTriangle, Target, HelpCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import { useStudy } from '../../../context/StudyContext';

const SubjectsHub = () => {
    const { subjects } = useStudy();
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedBoard, setSelectedBoard] = useState('All');

    const filteredSubjects = subjects.filter(s => 
        selectedBoard === 'All' || (s.boards && s.boards.includes(selectedBoard))
    );

    const boards = ['All', 'CBSE', 'ICSE', 'IGCSE', 'IB', 'ISC'];

    if (selectedSubject) {
        const subject = subjects.find(s => s.id === selectedSubject);
        const strategies = subject.strategies || {};

        return (
            <div className={styles.container}>
                {/* Ambient Background */}
                <div className={styles.ambientBg}></div>

                <header className={styles.header}>
                    <button
                        onClick={() => setSelectedSubject(null)}
                        style={{
                            marginBottom: '1rem',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: '1px solid var(--study-border)',
                            background: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            color: 'var(--study-secondary)',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.borderColor = 'var(--study-accent)'}
                        onMouseOut={e => e.currentTarget.style.borderColor = 'var(--study-border)'}
                    >
                        <ArrowLeft size={14} /> Back to Subjects
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span className={styles.subjectIcon}>{subject.icon}</span>
                        <div>
                            <span className={styles.breadcrumb}>Study / Subjects / {subject.name}</span>
                            <h1>{subject.name}</h1>
                        </div>
                    </div>
                </header>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* How to Study */}
                    <div className={styles.strategySection}>
                        <h3>
                            <Target size={20} color="var(--study-accent)" />
                            How to Study {subject.name}
                        </h3>
                        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: 'var(--study-primary)' }}>
                            {strategies.how_to_study}
                        </p>
                    </div>

                    {/* Common Traps */}
                    <div className={styles.strategySection} style={{ borderLeftColor: '#e74c3c' }}>
                        <h3>
                            <AlertTriangle size={20} color="#e74c3c" />
                            Common Traps
                        </h3>
                        <ul>
                            {(strategies.common_traps || []).map((trap, i) => (
                                <li key={i}>{trap}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Practice Tips */}
                    <div className={styles.strategySection} style={{ borderLeftColor: '#2ecc71' }}>
                        <h3>
                            <CheckCircle size={20} color="#2ecc71" />
                            Practice Tips
                        </h3>
                        <ul>
                            {(strategies.practice_tips || []).map((tip, i) => (
                                <li key={i}>{tip}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Before Exam */}
                    {strategies.before_exam && (
                        <div className={styles.strategySection} style={{ borderLeftColor: '#f39c12' }}>
                            <h3>
                                <HelpCircle size={20} color="#f39c12" />
                                Before the Exam
                            </h3>
                            <p style={{ fontSize: '1rem', lineHeight: 1.6, color: 'var(--study-primary)' }}>
                                {strategies.before_exam}
                            </p>
                        </div>
                    )}

                    {/* When Stuck */}
                    {strategies.when_stuck && (
                        <div className={styles.strategySection} style={{ borderLeftColor: '#9b59b6' }}>
                            <h3>
                                <BookOpen size={20} color="#9b59b6" />
                                When You're Stuck
                            </h3>
                            <p style={{ fontSize: '1rem', lineHeight: 1.6, color: 'var(--study-primary)' }}>
                                {strategies.when_stuck}
                            </p>
                        </div>
                    )}

                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Ambient Background */}
            <div className={styles.ambientBg}></div>
            {[...Array(3)].map((_, i) => (
                <div
                    key={i}
                    className={styles.floatingParticle}
                    style={{
                        width: `${Math.random() * 200 + 100}px`,
                        height: `${Math.random() * 200 + 100}px`,
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${i * 3}s`
                    }}
                ></div>
            ))}

            <header className={styles.header}>
                <span className={styles.breadcrumb}>Study / Subjects</span>
                <h1>Subject Strategies</h1>
                <p style={{ fontSize: '0.95rem', color: 'var(--study-secondary)', marginTop: '0.5rem', maxWidth: '600px' }}>
                    Each subject needs a different approach. Math isn't history. Physics isn't English.
                    Learn what works for each board.
                </p>
            </header>

            {/* Board Filter */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
                {boards.map(board => (
                    <button
                        key={board}
                        onClick={() => setSelectedBoard(board)}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '12px',
                            border: '1px solid var(--study-border)',
                            background: selectedBoard === board ? 'var(--study-accent)' : 'white',
                            color: selectedBoard === board ? 'white' : 'var(--study-secondary)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: selectedBoard === board ? '0 4px 12px rgba(116, 185, 255, 0.25)' : 'none'
                        }}
                    >
                        {board}
                    </button>
                ))}
            </div>

            <div className={styles.grid}>
                {filteredSubjects.map(subject => (
                    <div
                        key={subject.id}
                        className={styles.subjectCard}
                        onClick={() => setSelectedSubject(subject.id)}
                    >
                        <span className={styles.subjectIcon}>{subject.icon}</span>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: '500', color: 'var(--study-primary)', marginBottom: '0.5rem' }}>
                            {subject.name}
                        </h2>
                        <p style={{ color: 'var(--study-secondary)', fontSize: '0.9rem', marginTop: 'auto', paddingTop: '1rem' }}>
                            View strategies →
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SubjectsHub;
