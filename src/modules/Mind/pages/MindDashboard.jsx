import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import styles from '../MindShared.module.css';
import { MessageCircle, Feather, Wind, Archive, Smile, ArrowRight, Zap, Activity } from 'lucide-react';
import { useMind } from '../../../context/MindContext';

const MindDashboard = () => {
    const { logs } = useMind();
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

    // Viz Data (Mock for now, will connect to logs)
    const moodData = [3, 4, 3.5, 5, 2, 4, 4.5];

    return (
        <div className={styles.container}>
            {/* Background Gizmos */}
            <div className={styles.aliveBackground}></div>
            {[...Array(5)].map((_, i) => (
                <div key={i} className={styles.particle} style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    width: `${Math.random() * 200 + 50}px`,
                    height: `${Math.random() * 200 + 50}px`,
                    animationDuration: `${Math.random() * 20 + 10}s`
                }}></div>
            ))}

            <header className={styles.header}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <span className={styles.breadcrumb}>{greeting}, {localStorage.getItem('studybud_username')?.split(' ')[0] || 'Student'}.</span>
                        <h1>Mind Space</h1>
                    </div>
                </div>
            </header>

            {/* Mood River Chart */}
            <div className={styles.chartContainer} style={{ marginBottom: '3rem', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="100%" height="100%" viewBox="0 0 1000 200" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#6c5ce7" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#6c5ce7" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path d="M0,100 C150,50 350,150 500,100 C650,50 850,150 1000,80 L1000,200 L0,200 Z" fill="url(#gradient)" />
                    <path d="M0,100 C150,50 350,150 500,100 C650,50 850,150 1000,80" fill="none" stroke="#6c5ce7" strokeWidth="4" />

                    {/* Interactive Points */}
                    <circle cx="500" cy="100" r="8" fill="white" stroke="#6c5ce7" strokeWidth="3" className={styles.pulseRing} />
                </svg>
                <div style={{ position: 'absolute', top: '2rem', left: '2rem', fontWeight: 'bold', color: '#999', fontSize: '0.8rem', letterSpacing: '0.1em' }}>MOOD HISTORY (7 DAYS)</div>
            </div>

            <div className={styles.grid}>


                {/* Regulation */}
                <NavLink to="meditation" className={styles.card}>
                    <div className={styles.iconBox} style={{ background: '#e0fcf5', color: '#00b894' }}>
                        <Wind size={32} />
                    </div>
                    <h2>Relax</h2>
                    <p>Physical Feeling & breathing exercises.</p>
                </NavLink>

                {/* Clarity */}
                <NavLink to="reflection" className={styles.card}>
                    <div className={styles.iconBox} style={{ background: '#f0f3ff', color: '#6c5ce7' }}>
                        <Feather size={32} />
                    </div>
                    <h2>Reflect</h2>
                    <p>Understand your emotional patterns.</p>
                </NavLink>

                {/* Offload */}
                <NavLink to="offload" className={styles.card}>
                    <div className={styles.iconBox} style={{ background: '#fff5eb', color: '#e17055' }}>
                        <Archive size={32} />
                    </div>
                    <h2>Brain Dump</h2>
                    <p>Clear your mind of busy thoughts.</p>
                </NavLink>

                {/* Growth */}
                <NavLink to="growth" className={styles.card}>
                    <div className={styles.iconBox} style={{ background: '#fff9e6', color: '#f1c40f' }}>
                        <Smile size={32} />
                    </div>
                    <h2>Wins</h2>
                    <p>Keep track of your progress and success.</p>
                </NavLink>

            </div>
        </div>
    );
};

export default MindDashboard;
