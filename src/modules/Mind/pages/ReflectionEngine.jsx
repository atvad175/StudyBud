import React, { useState } from 'react';
import styles from '../MindShared.module.css';
import { Feather, Sun, Moon, CheckCircle } from 'lucide-react';
import { useMind } from '../../../context/MindContext';

const ReflectionEngine = () => {
    const { addLog } = useMind();
    const [mode, setMode] = useState('daily'); // daily, weekly
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const checkinQuestions = [
        { id: 'heavy', label: "What felt heavy today?" },
        { id: 'light', label: "What felt lighter than expected?" },
        { id: 'drain', label: "What drained your energy?" },
        { id: 'nourish', label: "What gave you energy?" },
    ];

    const weeklyQuestions = [
        { id: 'pattern', label: "What emotion kept coming up this week?" },
        { id: 'win', label: "One thing you handled better than last week?" },
        { id: 'identity', label: "What story are you telling yourself about your ability?" },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        addLog({
            type: 'reflection',
            content: { mode, answers },
            tags: [mode]
        });
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className={styles.container} style={{ textAlign: 'center', paddingTop: '5rem' }}>
                <div style={{ background: '#eafaf1', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                    <CheckCircle size={40} color="#2ecc71" />
                </div>
                <h2>Reflection Captured.</h2>
                <p style={{ color: '#666', marginBottom: '2rem' }}>Your clarity has been logged.</p>
                <button onClick={() => { setSubmitted(false); setAnswers({}); }} className={styles.modeBtn} style={{ background: '#6c5ce7', color: 'white' }}>
                    New Reflection
                </button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <span className={styles.breadcrumb}>Mind / Clarity</span>
                    <h1>Reflection Engine</h1>
                </div>
                <div className={styles.modeSelector}>
                    <button className={`${styles.modeBtn} ${mode === 'daily' ? styles.active : ''}`} onClick={() => setMode('daily')}>
                        <Sun size={14} style={{ marginRight: '6px' }} /> Daily Micro
                    </button>
                    <button className={`${styles.modeBtn} ${mode === 'weekly' ? styles.active : ''}`} onClick={() => setMode('weekly')}>
                        <Moon size={14} style={{ marginRight: '6px' }} /> Weekly Macro
                    </button>
                </div>
            </header>

            <div className={styles.chatContainer} style={{ height: 'auto', padding: '3rem', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <Feather size={48} color="#6c5ce7" style={{ opacity: 0.8 }} />
                    <h2 style={{ fontSize: '2rem', marginTop: '1rem', fontFamily: 'var(--font-serif)' }}>
                        {mode === 'daily' ? "Decode Your Day" : "Decode Your Week"}
                    </h2>
                    <p style={{ color: '#999' }}>
                        {mode === 'daily'
                            ? "A quick check-in to process emotional weight."
                            : "A deeper look at your recurring patterns."}
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {(mode === 'daily' ? checkinQuestions : weeklyQuestions).map(q => (
                        <div key={q.id}>
                            <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: '600', color: '#444' }}>{q.label}</label>
                            <textarea
                                className={styles.mainInput}
                                rows={3}
                                placeholder="..."
                                style={{ width: '100%', resize: 'none' }}
                                value={answers[q.id] || ''}
                                onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                            />
                        </div>
                    ))}

                    <button type="submit" className={styles.sendBtn} style={{ width: '100%', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold' }}>
                        Log Reflection
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReflectionEngine;
