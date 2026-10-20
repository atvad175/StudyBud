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

            <style>{`
                .studybudQuickStart {
                    display: grid;
                    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
                    align-items: center;
                    gap: 2rem;
                    padding: 2rem;
                    border: 1px solid rgba(221, 168, 93, 0.25);
                    border-radius: 28px;
                    background: linear-gradient(135deg, rgba(221, 168, 93, 0.14), rgba(255,255,255,0.96));
                    box-shadow: var(--shadow-soft);
                }
                .studybudQuickStartCopy { text-align: left; }
                .studybudQuickStartEyebrow {
                    margin: 0 0 0.75rem;
                    color: var(--color-gold);
                    font-size: 0.75rem;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                }
                .studybudQuickStartCopy h2 {
                    margin: 0 0 0.65rem;
                    color: var(--color-soft-black);
                    font-family: var(--font-serif);
                    font-size: clamp(1.8rem, 3vw, 2.4rem);
                    font-weight: 500;
                    line-height: 1.15;
                }
                .studybudQuickStartCopy p:last-child {
                    max-width: 28rem;
                    margin: 0;
                    color: var(--color-text-secondary);
                    line-height: 1.6;
                }
                .studybudQuickStartActions { display: grid; gap: 0.8rem; min-width: 0; }
                .studybudQuickStartAction {
                    display: flex;
                    align-items: center;
                    box-sizing: border-box;
                    gap: 1rem;
                    width: 100%;
                    min-height: 76px;
                    padding: 1rem 1.1rem;
                    border: 1px solid rgba(0,0,0,0.08);
                    border-radius: 18px;
                    text-decoration: none;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .studybudQuickStartAction:hover { transform: translateY(-2px); box-shadow: var(--shadow-medium); }
                .studybudQuickStartAction:focus-visible { outline: 3px solid var(--color-gold); outline-offset: 3px; }
                .studybudQuickStartPrimary { background: var(--color-soft-black); color: #fff; }
                .studybudQuickStartSecondary { background: #fff; color: var(--color-soft-black); }
                .studybudQuickStartIcon {
                    display: flex; align-items: center; justify-content: center;
                    flex: 0 0 44px; width: 44px; height: 44px; border-radius: 14px;
                    background: rgba(221,168,93,0.16); color: var(--color-gold);
                }
                .studybudQuickStartText { display: flex; flex: 1; flex-direction: column; min-width: 0; gap: 0.25rem; }
                .studybudQuickStartText strong { color: inherit; font-size: 0.98rem; font-weight: 650; }
                .studybudQuickStartText small { color: var(--color-text-secondary); font-size: 0.82rem; line-height: 1.4; }
                .studybudQuickStartPrimary .studybudQuickStartText small { color: rgba(255,255,255,0.75); }
                .studybudQuickStartAction > svg:last-child { flex-shrink: 0; }
                @media (max-width: 768px) {
                    .studybudQuickStart { grid-template-columns: minmax(0,1fr); padding: 1.25rem; gap: 1.25rem; }
                }
                @media (prefers-reduced-motion: reduce) {
                    .studybudQuickStartAction, .studybudQuickStartAction:hover { transition: none; transform: none; }
                }
            `}</style>

            <section className="studybudQuickStart" aria-labelledby="studybud-quick-start-heading">
                <div className="studybudQuickStartCopy">
                    <p className="studybudQuickStartEyebrow">A good place to start</p>
                    <h2 id="studybud-quick-start-heading">Start with one small win.</h2>
                    <p>Pick one useful action. You can change course anytime.</p>
                </div>
                <div className="studybudQuickStartActions">
                    <NavLink to="/focus/timer" className="studybudQuickStartAction studybudQuickStartPrimary">
                        <span className="studybudQuickStartIcon" aria-hidden="true"><Clock size={22} /></span>
                        <span className="studybudQuickStartText">
                            <strong>Start a focus session</strong>
                            <small>Choose one task and get going.</small>
                        </span>
                        <ArrowRight size={18} aria-hidden="true" />
                    </NavLink>
                    <NavLink to="/study" className="studybudQuickStartAction studybudQuickStartSecondary">
                        <span className="studybudQuickStartIcon" aria-hidden="true"><BookOpen size={22} /></span>
                        <span className="studybudQuickStartText">
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
