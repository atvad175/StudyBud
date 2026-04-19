import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Layers, Brain, Clock, Activity, BookOpen, Sparkles, ArrowRight } from 'lucide-react';
import styles from './MainDashboard.module.css';

const MainDashboard = () => {
    const [welcomeMsg, setWelcomeMsg] = useState('WELCOME BACK');
    const [name, setName] = useState('');

    useEffect(() => {
        const storedName = localStorage.getItem('studybud_username') || 'Hero';
        const firstName = storedName.split(' ')[0];
        setName(firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase());

        if (localStorage.getItem('studybud_first_visit') === 'true') {
            setWelcomeMsg('Welcome');
            localStorage.removeItem('studybud_first_visit');
        } else {
            setWelcomeMsg('Welcome back');
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
