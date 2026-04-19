import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFocus } from '../../../context/FocusContext';
import { Play, Clock, Timer, ChevronDown } from 'lucide-react';
import styles from './FocusMenu.module.css';

const CATEGORIES = [
    "School Homework",
    "School Research",
    "School Exam",
    "Test",
    "Project",
    "Personal"
];

const FocusMenu = () => {
    const navigate = useNavigate();
    const {
        mode, setMode,
        duration, updateDuration,
        category, setCategory,
        startSession
    } = useFocus();

    const handleStart = () => {
        startSession();
        navigate('/focus/active');
    };

    // Convert seconds to minutes for display/input
    const currentMinutes = Math.floor(duration / 60);

    return (
        <div className="page-container">
            <div className={styles.header}>
                <span className={styles.breadcrumb}>Focus / Deep Work</span>
                <h1>Deep Work</h1>
                <p>Set a timer or stopwatch, pick what you are working on, then start. You can join study rooms from the Focus home page.</p>
            </div>

            <div className={styles.mainCard}>
                <div className={styles.modeToggle}>
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

                <div className={styles.timerDisplay}>
                    {mode === 'TIMER' ? (
                        <span className={styles.timeValue}>{currentMinutes}:00</span>
                    ) : (
                        <span className={styles.timeValue}>00:00</span>
                    )}
                </div>

                {mode === 'TIMER' && (
                    <div className={styles.durationControl}>
                        <label>Session Length</label>
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

                <div className={styles.categorySection}>
                    <label>Focus Category</label>
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

                <button className={styles.startBtn} onClick={handleStart}>
                    <Play fill="currentColor" size={24} />
                    <span>Start Session</span>
                </button>
            </div>
        </div>
    );
};

export default FocusMenu;
