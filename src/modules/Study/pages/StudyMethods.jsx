import React, { useState } from 'react';
import styles from '../StudyShared.module.css';
import { Lightbulb, Clock, Brain, CheckCircle, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import AIChat from '../../../components/ai/AIChat';
import { useStudy } from '../../../context/StudyContext';

// Hardcoded study techniques - content to be filled in later
const STUDY_TECHNIQUES = [
    {
        id: 1,
        name: 'Active Recall',
        description: 'Trying to remember information without looking at notes or textbooks.',
        category: 'memory',
        difficulty: 'medium',
        effectiveness_rating: 9,
        why_it_works: 'Makes the brain pull information out on its own. This creates stronger memory compared to rereading.',
        when_to_use: 'Before tests, during revision, after finishing a chapter, for memory-heavy subjects.',
        time_needed: '5–30 minutes'
    },
    {
        id: 2,
        name: 'Blurting',
        description: 'Write down everything remembered about a topic without checking notes.',
        category: 'memory',
        difficulty: 'easy',
        effectiveness_rating: 8,
        why_it_works: 'Shows what you actually know vs what feels familiar. Helps find weak spots quickly.',
        when_to_use: 'End of chapters, before tests, quick revision, when short on time.',
        time_needed: '5–15 minutes'
    },
    {
        id: 3,
        name: 'Feynman Explanation',
        description: 'Explain a concept in simple language as if teaching a friend.',
        category: 'understanding',
        difficulty: 'medium',
        effectiveness_rating: 9,
        why_it_works: 'If you can teach it, you understand it. If you can’t explain it, you find exactly what to fix.',
        when_to_use: 'When topics feel confusing, before group study, for science, math, or essays.',
        time_needed: '10–20 minutes'
    },
    {
        id: 4,
        name: 'Chunking',
        description: 'Break big chapters or tasks into smaller, manageable pieces.',
        category: 'organization',
        difficulty: 'easy',
        effectiveness_rating: 7,
        why_it_works: 'Brains learn better when information is grouped instead of large and overwhelming.',
        when_to_use: 'Long chapters, big study sessions, essays, projects, before exams.',
        time_needed: 'Varies with topic size'
    },
    {
        id: 5,
        name: 'Spaced Review',
        description: 'Review information multiple times spread across days instead of cramming.',
        category: 'memory',
        difficulty: 'medium',
        effectiveness_rating: 10,
        why_it_works: 'Forgetting then remembering builds strong long-term memory.',
        when_to_use: 'Big tests, finals, memorization, early studying.',
        time_needed: '5–30 minutes per review session'
    },
    {
        id: 6,
        name: 'Practice Problems',
        description: 'Learn by doing questions instead of reading solutions or notes.',
        category: 'practice',
        difficulty: 'medium',
        effectiveness_rating: 9,
        why_it_works: 'Math and science understanding develops through practice and making mistakes.',
        when_to_use: 'Math, physics, chemistry, exam prep.',
        time_needed: '15–45 minutes'
    },
    {
        id: 7,
        name: 'Worked Examples + Copying',
        description: 'Copy a solved example step-by-step, then try a similar problem alone.',
        category: 'practice',
        difficulty: 'easy',
        effectiveness_rating: 7,
        why_it_works: 'Shows how problems are structured and teaches problem-solving patterns.',
        when_to_use: 'Algebra, chemistry equations, physics problems, when stuck or confused.',
        time_needed: '10–25 minutes'
    },
    {
        id: 8,
        name: 'Timelines + Linking',
        description: 'Turn events or processes into timelines or linked chains.',
        category: 'organization',
        difficulty: 'medium',
        effectiveness_rating: 8,
        why_it_works: 'Connections are easier to remember than random facts.',
        when_to_use: 'History, biology processes, geography, big chapters.',
        time_needed: '10–30 minutes'
    },
    {
        id: 9,
        name: 'Question Generation',
        description: 'Turn notes into questions and answer without looking.',
        category: 'understanding',
        difficulty: 'medium',
        effectiveness_rating: 8,
        why_it_works: 'Exams ask questions, not paragraphs. This trains exam-style thinking.',
        when_to_use: 'Tests, quizzes, revision week, after new chapters.',
        time_needed: '10–20 minutes'
    },
    {
        id: 10,
        name: 'Exam Simulation',
        description: 'Pretend a study session is the real exam with timer and no notes.',
        category: 'practice',
        difficulty: 'hard',
        effectiveness_rating: 10,
        why_it_works: 'Reduces panic, improves timing, shows what needs more practice.',
        when_to_use: 'Before major tests, mock exams, last week of revision, performance anxiety.',
        time_needed: '20–90 minutes'
    }
];

const StudyMethods = () => {
    const { boards } = useStudy();
    const [selectedBoard, setSelectedBoard] = useState(null);
    const [expandedTechnique, setExpandedTechnique] = useState(null);

    const renderStars = (rating) => {
        return (
            <div className={styles.effectivenessRating} title={`Effectiveness: ${rating}/10`}>
                {[...Array(10)].map((_, i) => (
                    <div key={i} className={`${styles.star} ${i >= rating ? styles.empty : ''}`}></div>
                ))}
            </div>
        );
    };

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
                <div>
                    <span className={styles.breadcrumb}>Study / Methods</span>
                    <h1>Study Frameworks</h1>
                    <p style={{ fontSize: '0.95rem', color: 'var(--study-secondary)', marginTop: '0.5rem', maxWidth: '600px' }}>
                        Advanced mental models and board-specific strategies to maximize retention and mastery.
                    </p>
                </div>
            </header>

            {/* Board Strategies Selector */}
            <section style={{ marginBottom: '4rem' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--study-primary)' }}>Board Mastery</h2>
                <p style={{ color: 'var(--study-secondary)', marginBottom: '2rem', maxWidth: '800px' }}>
                    Every board has a different "flavor" of assessment. Pick your curriculum to see strategies tailored to how you will be tested.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    {boards?.map(board => (
                        <button
                            key={board.id}
                            onClick={() => setSelectedBoard(selectedBoard === board.id ? null : board.id)}
                            style={{
                                padding: '1.5rem',
                                borderRadius: '20px',
                                border: `2px solid ${selectedBoard === board.id ? 'var(--study-accent)' : 'var(--study-border)'}`,
                                background: selectedBoard === board.id ? 'rgba(116, 185, 255, 0.1)' : 'var(--study-surface)',
                                color: selectedBoard === board.id ? 'var(--study-accent)' : 'var(--study-primary)',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textAlign: 'center',
                                boxShadow: selectedBoard === board.id ? '0 10px 20px rgba(116, 185, 255, 0.1)' : 'none'
                            }}
                        >
                            <div style={{ fontSize: '1.25rem' }}>{board.name}</div>
                        </button>
                    ))}
                </div>

                {selectedBoard && boards?.find(b => b.id === selectedBoard) && (
                    <div style={{ background: 'var(--study-surface)', padding: '2.5rem', borderRadius: '32px', border: '1px solid var(--study-border)', boxShadow: '0 10px 40px rgba(0,0,0,0.02)' }}>
                        <h3 style={{ fontSize: '1.6rem', marginBottom: '1rem', color: 'var(--study-accent)' }}>
                            {boards.find(b => b.id === selectedBoard).name} Strategy Pack
                        </h3>
                        <p style={{ color: 'var(--study-secondary)', marginBottom: '2rem' }}>{boards.find(b => b.id === selectedBoard).desc}</p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
                            {boards.find(b => b.id === selectedBoard).strategies.map((strat, i) => (
                                <div key={i}>
                                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', fontWeight: '700', color: 'var(--study-primary)' }}>{strat.title}</h4>
                                    <p style={{ fontSize: '0.95rem', color: 'var(--study-secondary)', lineHeight: '1.6' }}>{strat.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {/* General Methods */}
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'var(--study-primary)' }}>Universal Methods</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {STUDY_TECHNIQUES.map(technique => (
                    <div
                        key={technique.id}
                        className={styles.techniqueCard}
                        style={{ cursor: 'pointer' }}
                    >
                        <div
                            className={styles.techniqueHeader}
                            onClick={() => setExpandedTechnique(expandedTechnique === technique.id ? null : technique.id)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                <Lightbulb size={20} color="var(--study-accent)" />
                                <h3 className={styles.techniqueName}>{technique.name}</h3>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {renderStars(technique.effectiveness_rating)}
                                <span className={`${styles.badge} ${styles['badge' + technique.difficulty.charAt(0).toUpperCase() + technique.difficulty.slice(1)]}`}>
                                    {technique.difficulty}
                                </span>
                                {expandedTechnique === technique.id ? (
                                    <ChevronUp size={20} color="var(--study-secondary)" />
                                ) : (
                                    <ChevronDown size={20} color="var(--study-secondary)" />
                                )}
                            </div>
                        </div>

                        {expandedTechnique === technique.id && (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                gap: '1.5rem',
                                background: 'var(--study-surface)',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                marginTop: '1rem',
                                animation: 'fadeIn 0.3s ease',
                                borderTop: '2px solid var(--study-border)'
                            }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <div style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '6px',
                                            background: 'rgba(116, 185, 255, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Brain size={16} color="var(--study-accent)" />
                                        </div>
                                        <strong style={{ fontSize: '0.8rem', color: 'var(--study-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Description
                                        </strong>
                                    </div>
                                    <p style={{ color: 'var(--study-primary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                        {technique.description}
                                    </p>
                                </div>

                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <div style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '6px',
                                            background: 'rgba(116, 185, 255, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Lightbulb size={16} color="var(--study-accent)" />
                                        </div>
                                        <strong style={{ fontSize: '0.8rem', color: 'var(--study-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Why it works
                                        </strong>
                                    </div>
                                    <p style={{ color: 'var(--study-primary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                        {technique.why_it_works}
                                    </p>
                                </div>

                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <div style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '6px',
                                            background: 'rgba(116, 185, 255, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <CheckCircle size={16} color="var(--study-accent)" />
                                        </div>
                                        <strong style={{ fontSize: '0.8rem', color: 'var(--study-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            When to use
                                        </strong>
                                    </div>
                                    <p style={{ color: 'var(--study-primary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                        {technique.when_to_use}
                                    </p>
                                </div>

                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <div style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '6px',
                                            background: 'rgba(116, 185, 255, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Clock size={16} color="var(--study-accent)" />
                                        </div>
                                        <strong style={{ fontSize: '0.8rem', color: 'var(--study-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Time needed
                                        </strong>
                                    </div>
                                    <p style={{ color: 'var(--study-primary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                        {technique.time_needed}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudyMethods;
