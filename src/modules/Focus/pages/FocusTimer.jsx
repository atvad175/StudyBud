import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFocus } from '../../../context/FocusContext';
import { Play, Clock, Timer, ChevronDown, Zap } from 'lucide-react';
import styles from './FocusMenu.module.css'; // Reusing styles from the previous menu but enhancing

const CATEGORIES = ["School Homework", "School Research", "School Exam", "Test", "Project", "Personal"];

// Simple visual "Gizmo" component - just a placeholder for aesthetic
const GizmoRing = ({ active }) => (
    <div style={{
        position: 'absolute',
        width: '120%',
        height: '120%',
        border: '1px dashed rgba(221, 168, 93, 0.3)',
        borderRadius: '50%',
        animation: active ? 'spin 10s linear infinite' : 'none',
        pointerEvents: 'none'
    }} />
);

const FocusTimer = () => {
    const navigate = useNavigate();
    const {
        mode, setMode,
        duration, updateDuration,
        category, setCategory,
        startSession
    } = useFocus();

    const [isHovering, setIsHovering] = useState(false);

    const handleStart = () => {
        startSession();
        navigate('/focus/active'); // This goes to the Standby session
    };

    const currentMinutes = Math.floor(duration / 60);

    return (
        <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>

            {/* The Gizmo / Main Interaction Zone */}
            <div
                className={styles.mainCard}
                style={{ position: 'relative', overflow: 'visible', maxWidth: '600px', width: '100%' }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
            >
                {/* Visual Gizmo Backgrounds */}
                <GizmoRing active={isHovering} />

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '0.5rem' }}>Focus Engine</h2>
                    <p style={{ color: 'var(--color-text-secondary)' }}>Configure your session</p>
                </div>

                {/* Mode Select */}
                <div className={styles.modeToggle} style={{ marginBottom: '2rem' }}>
                    <button
                        className={`${styles.modeBtn} ${mode === 'TIMER' ? styles.activeMode : ''}`}
                        onClick={() => setMode('TIMER')}
                    >
                        <Timer size={16} /> Timer
                    </button>
                    <button
                        className={`${styles.modeBtn} ${mode === 'STOPWATCH' ? styles.activeMode : ''}`}
                        onClick={() => setMode('STOPWATCH')}
                    >
                        <Clock size={16} /> Stopwatch
                    </button>
                </div>

                {/* Time Display */}
                <div className={styles.timerDisplay}>
                    {mode === 'TIMER' ? (
                        <span className={styles.timeValue} style={{ fontSize: '5rem' }}>{currentMinutes}:00</span>
                    ) : (
                        <span className={styles.timeValue} style={{ fontSize: '5rem' }}>00:00</span>
                    )}
                </div>

                {/* Slider (only for Timer) */}
                {mode === 'TIMER' && (
                    <div className={styles.durationControl} style={{ marginBottom: '2rem' }}>
                        <input
                            type="range"
                            min="25"
                            max="180"
                            step="5"
                            value={currentMinutes}
                            onChange={(e) => updateDuration(Number(e.target.value))}
                            className={styles.slider}
                        />
                        <div className={styles.rangeLabels}>
                            <span>25m</span>
                            <span>3h</span>
                        </div>
                    </div>
                )}

                {/* Category & Start */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%' }}>
                    <div className={styles.categorySection} style={{ marginTop: 0 }}>
                        <label>Category</label>
                        <div className={styles.selectWrapper}>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className={styles.categorySelect}
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <ChevronDown className={styles.selectIcon} size={20} />
                        </div>
                    </div>

                    <button className={styles.startBtn} onClick={handleStart} style={{ transform: isHovering ? 'scale(1.05)' : 'scale(1)' }}>
                        <Zap fill="currentColor" size={28} />
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes spin { 
                    from { transform: rotate(0deg); } 
                    to { transform: rotate(360deg); } 
                }
            `}</style>
        </div>
    );
};

export default FocusTimer;
