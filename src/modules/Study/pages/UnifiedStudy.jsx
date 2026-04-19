import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../StudyShared.module.css';
import { BookOpen, Zap, Target, ArrowRight, BrainCircuit, Library } from 'lucide-react';
import { useStudy } from '../../../context/StudyContext';

const UnifiedStudy = () => {
    const navigate = useNavigate();
    const { subjects, boards, techniques } = useStudy();
    const [activeTab, setActiveTab] = useState('subjects'); // subjects, frameworks

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Study Hub</h1>
                    <p className={styles.subtitle}>Curriculum strategies and high-performance frameworks.</p>
                </div>
            </header>

            <div className={styles.dashboardGrid}>
                {/* Left Panel: Tabs & Content */}
                <div className={styles.mainPanel}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                        <button 
                            onClick={() => setActiveTab('subjects')}
                            style={{ 
                                padding: '0.8rem 1.5rem', 
                                border: 'none', 
                                borderRadius: '8px', 
                                background: activeTab === 'subjects' ? '#2F2F2F' : '#E8E8E8',
                                color: activeTab === 'subjects' ? '#FFF' : '#333',
                                cursor: 'pointer',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <Library size={18} /> Curriculum Strategies
                        </button>
                        <button 
                            onClick={() => setActiveTab('frameworks')}
                            style={{ 
                                padding: '0.8rem 1.5rem', 
                                border: 'none', 
                                borderRadius: '8px', 
                                background: activeTab === 'frameworks' ? '#2F2F2F' : '#E8E8E8',
                                color: activeTab === 'frameworks' ? '#FFF' : '#333',
                                cursor: 'pointer',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <BrainCircuit size={18} /> Master Frameworks
                        </button>
                    </div>

                    {activeTab === 'subjects' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                            {subjects.map(sub => (
                                <div key={sub.id} className={styles.card} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ fontSize: '2rem' }}>{sub.icon}</div>
                                        <div>
                                            <h3 style={{ margin: 0 }}>{sub.name}</h3>
                                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                                                {sub.boards.map(b => (
                                                    <span key={b} style={{ fontSize: '0.7rem', background: '#F0F0F0', padding: '2px 6px', borderRadius: '4px' }}>{b}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: '#555', flex: 1 }}>{sub.strategies.how_to_study}</p>
                                    <div style={{ background: '#FDF8F3', padding: '0.8rem', borderRadius: '6px', borderLeft: '3px solid #C9883A' }}>
                                        <strong style={{ fontSize: '0.8rem', color: '#C9883A', display: 'block', marginBottom: '4px' }}>When Stuck:</strong>
                                        <span style={{ fontSize: '0.85rem' }}>{sub.strategies.when_stuck}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'frameworks' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                            {/* Static Frameworks since Context might be empty temporarily */}
                            <div className={styles.card}>
                                <h3>Active Recall</h3>
                                <p style={{ fontSize: '0.95rem', color: '#444', marginTop: '8px' }}>Stop re-reading. Force your brain to fetch information without looking at the source. This creates stronger neural pathways.</p>
                            </div>
                            <div className={styles.card}>
                                <h3>Spaced Repetition</h3>
                                <p style={{ fontSize: '0.95rem', color: '#444', marginTop: '8px' }}>Review material at systematically increasing intervals to flatten the forgetting curve.</p>
                            </div>
                            <div className={styles.card}>
                                <h3>The Feynman Technique</h3>
                                <p style={{ fontSize: '0.95rem', color: '#444', marginTop: '8px' }}>Simplify a concept so much that a 6th grader could understand it. Identifies gaps in logic immediately.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel: Interactive Tools Menu */}
                <div className={styles.sidePanel}>
                    <h3 style={{ marginBottom: '1rem' }}>Interactive Tools</h3>
                    
                    <div 
                        className={styles.card} 
                        style={{ cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid transparent' }}
                        onMouseOver={e => e.currentTarget.style.borderColor = '#C9883A'}
                        onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}
                        onClick={() => navigate('/study/feynman')}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div style={{ background: '#FFF3E0', padding: '8px', borderRadius: '8px', color: '#F57C00' }}>
                                <Zap size={20} />
                            </div>
                            <h4 style={{ margin: 0 }}>Feynman Sandbox</h4>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: '1.4' }}>
                            Explain a topic in your own words. Our AI acts as a 6th grader and critiques your explanation for jargon and logic gaps.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#C9883A', marginTop: '12px', fontWeight: 500 }}>
                            Launch Sandbox <ArrowRight size={14} />
                        </div>
                    </div>

                    <div 
                        className={styles.card} 
                        style={{ cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid transparent', marginTop: '1rem' }}
                        onMouseOver={e => e.currentTarget.style.borderColor = '#2E7D32'}
                        onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}
                        onClick={() => navigate('/study/exams')}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div style={{ background: '#E8F5E9', padding: '8px', borderRadius: '8px', color: '#2E7D32' }}>
                                <Target size={20} />
                            </div>
                            <h4 style={{ margin: 0 }}>Mock Exam Simulator</h4>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: '1.4' }}>
                            Upload a PDF or paste text. The AI will generate a strict, timed multiple-choice exam based precisely on your material.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#2E7D32', marginTop: '12px', fontWeight: 500 }}>
                            Take Exam <ArrowRight size={14} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnifiedStudy;
