import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Layers, Brain, Clock, Activity, BookOpen, Sparkles, ArrowRight } from 'lucide-react';
import styles from './MainDashboard.module.css';

const MainDashboard = () => {
    const [name] = useState(() => {
        const storedName = localStorage.getItem('studybud_username') || 'Student';
        const firstName = storedName.split(' ')[0];
        return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    });
    const [welcomeMsg] = useState(() =>
        localStorage.getItem('studybud_first_visit') === 'true' ? 'Welcome' : 'Welcome back'
    );

    useEffect(() => {
        if (localStorage.getItem('studybud_first_visit') === 'true') {
            localStorage.removeItem('studybud_first_visit');
        }
    }, []);

    const modules = [
        {
            title: 'Daily habits',
            name: 'Habits',
            path: '/habits',
            icon: Layers,
            color: '#DDA85D',
            desc: 'Small steps you repeat until they feel easy.',
        },
        {
            title: 'Focus time',
            name: 'Focus',
            path: '/focus',
            icon: Brain,
            color: '#60A5FA',
            desc: 'Timers and rooms to help you stay on task.',
        },
        {
            title: 'Plan your time',
            name: 'Time',
            path: '/time',
            icon: Clock,
            color: '#FB923C',
            desc: 'Tasks and reviews that match your energy.',
        },
        {
            title: 'Mind and mood',
            name: 'Mind',
            path: '/mind',
            icon: Activity,
            color: '#4ADE80',
            desc: 'Notes and calm tools when studying feels heavy.',
        },
        {
            title: 'Subjects and practice',
            name: 'Study',
            path: '/study',
            icon: BookOpen,
            color: '#A78BFA',
            desc: 'Flashcards, exams, and your courses in one place.',
        },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.hero}>
                <div className={styles.badge}>
                    <Sparkles size={14} />
                    <span>{welcomeMsg}, {name}</span>
                </div>
                <h1 className={styles.centerpiece}>
                    Study<span>Bud</span>
                </h1>
                <p className={styles.tagline}>Pick a section below to plan, focus, or study.</p>
            </div>

            <section className={styles.quickStart} aria-labelledby="quick-start-heading">
                <div className={styles.quickStartCopy}>
                    <p className={styles.quickStartEyebrow}>A good place to start</p>
                    <h2 id="quick-start-heading">Start with one small win.</h2>
                    <p>Pick one useful action. You can change course anytime.</p>
                </div>
                <div className={styles.quickStartActions}>
                    <NavLink to="/focus/timer" className={`${styles.quickStartAction} ${styles.primaryAction}`}>
                        <span className={styles.quickStartIcon} aria-hidden="true"><Clock size={22} /></span>
                        <span className={styles.quickStartActionText}>
                            <strong>Start a focus session</strong>
                            <small>Choose one task and get going.</small>
                        </span>
                        <ArrowRight size={18} aria-hidden="true" />
                    </NavLink>
                    <NavLink to="/study" className={`${styles.quickStartAction} ${styles.secondaryAction}`}>
                        <span className={styles.quickStartIcon} aria-hidden="true"><BookOpen size={22} /></span>
                        <span className={styles.quickStartActionText}>
                            <strong>Open Study Hub</strong>
                            <small>Revise, practise, or use flashcards.</small>
                        </span>
                        <ArrowRight size={18} aria-hidden="true" />
                    </NavLink>
                </div>
            </section>

            <div className={styles.grid}>
                {modules.map((m) => (
                    <NavLink to={m.path} key={m.name} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.iconBox} style={{ backgroundColor: `${m.color}15`, color: m.color }}>
                                <m.icon size={24} />
                            </div>
                            <span className={styles.moduleTitle}>{m.title}</span>
                        </div>
                        <div className={styles.cardBody}>
                            <h2>{m.name}</h2>
                            <p>{m.desc}</p>
                        </div>
                        <div className={styles.cardFooter}>
                            <span>Open</span>
                            <ArrowRight size={16} />
                        </div>
                    </NavLink>
                ))}
            </div>

            <footer className={styles.footer}>
                <p>One habit at a time. You’ve got this.</p>
            </footer>
        </div>
    );
};

export default MainDashboard;
