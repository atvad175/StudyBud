import React, { useState, useEffect } from 'react';
import styles from '../MindShared.module.css';
import { Wind, Play, Pause, Square, Info, Anchor, Brain, Heart, ChevronDown } from 'lucide-react';
import { useMind } from '../../../context/MindContext';

const SESSIONS = [
    {
        id: 'body',
        label: 'Body Grounding',
        desc: 'Focus on your physical sensations.',
        color: '#e056fd',
        icon: Anchor,
        instructions: {
            sit: "Find a firm chair or sit on a cushion with your hips elevated above your knees. Keep your spine straight but not rigid.",
            do: "Bring your attention to the points of contact between your body and the chair/floor. Feel the weight of gravity.",
            info: "Focusing on your body helps calm your mind by shifting focus from busy thoughts to physical feeling."
        }
    },
    {
        id: 'cognitive',
        label: 'Labeling',
        desc: 'Note thoughts without attachment.',
        color: '#686de0',
        icon: Brain,
        instructions: {
            sit: "Sit comfortably with your hands resting on your lap. Close your eyes or soften your gaze.",
            do: "Observe thoughts as they arise. Label them gently: 'Planning', 'Worrying', 'Remembering'. Then return to the breath.",
            info: "Mental noting creates distance between you and your thoughts, reducing their emotional charge."
        }
    },
    {
        id: 'emotional',
        label: 'Feeling',
        desc: 'Process stuck emotions.',
        color: '#f0932b',
        icon: Heart,
        instructions: {
            sit: "Place one hand on your heart and one on your belly.",
            do: "Locate the raw sensation of the emotion in your body (tightness, heat, pulsing). Breathe into that space.",
            info: "Emotions are physiological events. By feeling them directly without the narrative story, they can metabolize and pass."
        }
    },
];

const MeditationSanctuary = () => {
    const { addLog } = useMind();
    const [activeSession, setActiveSession] = useState(null);
    const [timer, setTimer] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [showInfo, setShowInfo] = useState(true);
    const [meditationLogs, setMeditationLogs] = useState(() => {
        const saved = localStorage.getItem('studybud_meditations');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        let interval;
        if (isRunning) interval = setInterval(() => setTimer(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, [isRunning]);

    const formatTime = (s) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleStop = () => {
        if (timer > 0) {
            const newLog = {
                id: Date.now(),
                session: activeSession.label,
                duration: timer,
                date: new Date().toISOString()
            };
            const updatedLogs = [newLog, ...meditationLogs];
            setMeditationLogs(updatedLogs);
            localStorage.setItem('studybud_meditations', JSON.stringify(updatedLogs));
            
            // Also save to MindContext if needed
            if (addLog) {
                addLog({
                    type: 'meditation',
                    content: `Completed ${activeSession.label} for ${formatTime(timer)}`,
                    mood_score: 5 // Default high mood after meditation
                });
            }
        }
        setActiveSession(null);
        setIsRunning(false);
        setTimer(0);
    };

    if (activeSession) {
        return (
            <div className={styles.container} style={{ height: '80vh', display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                {/* Left: Timer & Visual */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>

                    {/* Visual Breath Gizmo */}
                    <div
                        className={styles.breathingOrb}
                        style={{
                            background: `radial-gradient(circle, ${activeSession.color} 0%, transparent 70%)`,
                            animationDuration: isRunning ? '6s' : '0s' // Only animate when running
                        }}
                    ></div>

                    <h1 style={{ fontSize: '5rem', margin: '2rem 0', fontFamily: 'var(--font-serif)', zIndex: 2, fontVariantNumeric: 'tabular-nums' }}>
                        {formatTime(timer)}
                    </h1>

                    <div style={{ display: 'flex', gap: '2rem', zIndex: 2 }}>
                        <button onClick={() => setIsRunning(!isRunning)} className={styles.sendBtn} style={{ padding: '1rem 3rem', borderRadius: '100px' }}>
                            {isRunning ? <Pause /> : (timer === 0 ? 'Start Session' : <Play />)}
                        </button>
                        <button onClick={handleStop} className={styles.sendBtn} style={{ padding: '1rem', background: '#333' }}>
                            <Square />
                        </button>
                    </div>
                </div>

                {/* Right: Instructions Panel */}
                <div style={{
                    background: 'white',
                    borderRadius: '24px',
                    padding: '2rem',
                    boxShadow: 'var(--shadow-soft)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                    height: 'fit-content',
                    alignSelf: 'center'
                }}>
                    <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid #f0f0f0', paddingBottom: '1rem' }}>
                        <div style={{ background: `${activeSession.color}20`, padding: '10px', borderRadius: '12px', color: activeSession.color }}>
                            <activeSession.icon size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{activeSession.label}</h2>
                            <p style={{ margin: 0, color: '#999', fontSize: '0.9rem' }}>{activeSession.desc}</p>
                        </div>
                    </header>

                    <div>
                        <h3 style={instructionTitle}>Posture</h3>
                        <p style={instructionText}>{activeSession.instructions.sit}</p>
                    </div>

                    <div>
                        <h3 style={instructionTitle}>Practice</h3>
                        <p style={instructionText}>{activeSession.instructions.do}</p>
                    </div>

                    <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '12px' }}>
                        <h3 style={{ ...instructionTitle, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Info size={14} /> Why this works
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.5 }}>{activeSession.instructions.info}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <span className={styles.breadcrumb}>Mind / Regulation</span>
                <h1>Relaxation Tools</h1>
            </header>

            <div className={styles.grid}>
                {SESSIONS.map(s => (
                    <div
                        key={s.id}
                        className={styles.card}
                        onClick={() => { setActiveSession(s); setIsRunning(false); setTimer(0); }}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className={styles.iconBox} style={{ background: `${s.color}20`, color: s.color }}>
                            <s.icon size={32} />
                        </div>
                        <h2>{s.label}</h2>
                        <p>{s.desc}</p>
                    </div>
                ))}
            </div>

            {/* Meditation History */}
            {meditationLogs.length > 0 && (
                <div style={{ marginTop: '4rem' }}>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '1.5rem' }}>Your Recent Sessions</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                        {meditationLogs.slice(0, 4).map(log => (
                            <div key={log.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.04)', boxShadow: 'var(--shadow-soft)' }}>
                                <div style={{ fontSize: '0.8rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                                    {new Date(log.date).toLocaleDateString()}
                                </div>
                                <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>{log.session}</h3>
                                <div style={{ color: 'var(--primary-mind)', fontWeight: '600' }}>{formatTime(log.duration)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const instructionTitle = {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#999',
    marginBottom: '0.5rem',
    fontWeight: '700'
};

const instructionText = {
    fontSize: '1rem',
    color: 'var(--color-text-primary)',
    lineHeight: 1.6
};

export default MeditationSanctuary;
