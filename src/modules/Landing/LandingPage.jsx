import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Brain, Flame, Activity, BookOpenCheck, Timer, Target } from 'lucide-react';
import LandingLayout from './LandingLayout';

const LandingPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const sections = document.querySelectorAll('.reveal-section');
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (reduceMotion || !('IntersectionObserver' in window)) {
            sections.forEach((section) => {
                section.classList.add('visible');
                section.querySelectorAll('.stagger-item').forEach((item) => item.classList.add('visible'));
            });
            return undefined;
        }

        const timers = new Set();
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('visible');
                entry.target.querySelectorAll('.stagger-item').forEach((child, index) => {
                    const timer = window.setTimeout(() => {
                        child.classList.add('visible');
                        timers.delete(timer);
                    }, index * 75);
                    timers.add(timer);
                });
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });

        sections.forEach((section) => observer.observe(section));
        return () => {
            observer.disconnect();
            timers.forEach((timer) => window.clearTimeout(timer));
            timers.clear();
        };
    }, []);

    return (
        <LandingLayout>
            <section className="landing-hero">
                <div className="hero-badge fade-in-up" style={{ animationDelay: '0.05s' }}>
                    <span className="pulse-dot" aria-hidden="true" />
                    BUILT FOR SERIOUS STUDY, NOT BUSYWORK
                </div>

                <h1 className="hero-title fade-in-up" style={{ animationDelay: '0.15s' }}>
                    Know what to study.
                    <br />
                    <span>Know how to improve.</span>
                </h1>

                <p className="hero-subtitle fade-in-up" style={{ animationDelay: '0.3s', maxWidth: '48rem', margin: '0 auto', lineHeight: '1.7' }}>
                    StudyBud brings your subjects, revision, focus sessions, tasks and habits into one place. Choose your curriculum, practise active recall, and turn a crowded to-do list into a clear next step.
                </p>
                <p className="hero-board-note fade-in-up" style={{ animationDelay: '0.38s' }}>
                    Personalise your setup for ICSE, ISC, IGCSE, CBSE or IB. You stay in control of your plan.
                </p>

                <div
                    className="fade-in-up"
                    style={{
                        animationDelay: '0.5s',
                        marginTop: '2.5rem',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '1rem',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <button
                        type="button"
                        onClick={() => navigate('/login', { state: { mode: 'signup' } })}
                        className="btn-primary large-btn pulse-glow"
                    >
                        Start free <ArrowRight size={20} aria-hidden />
                    </button>
                    <button
                        type="button"
                        onClick={() => document.getElementById('bento')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}
                        className="btn-secondary large-btn"
                    >
                        Explore the toolkit
                    </button>
                </div>

                <div className="hero-mockup fade-in-up" style={{ animationDelay: '0.65s' }}>
                    <div className="mockup-header">
                        <div className="dot" style={{ background: '#FF5F56' }} />
                        <div className="dot" style={{ background: '#FFBD2E' }} />
                        <div className="dot" style={{ background: '#27C93F' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 200px' }}>
                            <div
                                style={{
                                    fontSize: '0.75rem',
                                    color: '#dda85d',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.12em',
                                    marginBottom: '0.5rem',
                                }}
                            >
                                Today at a glance
                            </div>
                            <div
                                style={{
                                    fontSize: '1.35rem',
                                    fontFamily: "'Cormorant Garamond', serif",
                                    marginBottom: '0.5rem',
                                    color: '#fff',
                                }}
                            >
                                Focus session on track
                            </div>
                            <div
                                style={{
                                    height: '4px',
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '2px',
                                    overflow: 'hidden',
                                }}
                            >
                                <div
                                    style={{
                                        height: '100%',
                                        width: '78%',
                                        background: 'linear-gradient(90deg, #C9883A, #FFB347)',
                                    }}
                                />
                            </div>
                        </div>
                        <div
                            style={{
                                width: '72px',
                                height: '72px',
                                borderRadius: '50%',
                                border: '4px solid rgba(201,136,58,0.3)',
                                borderTopColor: '#C9883A',
                                animation: 'spin 4s linear infinite',
                            }}
                            aria-hidden
                        />
                    </div>
                </div>
            </section>

            <section
                id="bento"
                className="reveal-section"
                style={{ padding: '6rem 1.5rem 5rem', maxWidth: '1400px', margin: '0 auto' }}
            >
                <div className="text-center stagger-item" style={{ marginBottom: '4rem' }}>
                    <h2
                        style={{
                            fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
                            fontFamily: "'Cormorant Garamond', serif",
                            marginBottom: '1rem',
                            lineHeight: 1.12,
                            color: '#fff',
                        }}
                    >
                        A clearer way to do the work
                    </h2>
                    <p
                        style={{
                            fontSize: '1.15rem',
                            color: 'rgba(255,255,255,0.82)',
                            maxWidth: '36rem',
                            margin: '0 auto',
                            lineHeight: 1.65,
                        }}
                    >
                        Start with one useful action: plan a session, test what you remember, or break a task
                        into smaller steps. Your progress and preferences stay connected as you use the workspace.
                    </p>
                </div>

                <div className="bento-grid">
                    <div className="bento-box bento-large stagger-item">
                        <div className="bento-content">
                            <Brain color="#C9883A" size={40} style={{ marginBottom: '1.25rem' }} />
                            <h3 className="bento-title">Buddy, your study companion</h3>
                            <p className="bento-desc">
                                Use Buddy to clarify a topic, plan a realistic next step, and reflect on what
                                got done. AI suggestions are guidance to review—not a substitute for your teacher
                                or official syllabus.
                            </p>
                        </div>
                        <div className="bento-visual">
                            <div className="ai-chat-mock">
                                <div className="chat-bubble ai">
                                    Can you say back the main idea of what you just read — without looking at
                                    the book?
                                </div>
                                <div className="chat-bubble user">
                                    It is about how speed changes over time, so acceleration is the rate of that
                                    change.
                                </div>
                            </div>
                        </div>
                    </div>



                    <div className="bento-box bento-medium stagger-item">
                        <div className="bento-content">
                            <Flame color="#FF5F56" size={32} style={{ marginBottom: '1rem' }} />
                            <h3 className="bento-title">Small habits, real consistency</h3>
                            <p className="bento-desc">
                                Choose a habit that fits your day, record it when complete, and build a routine
                                you can sustain. No need to make every day perfect.
                            </p>
                        </div>
                        <div className="bento-visual">
                            <div className="streak-mock">
                                <div className="streak-preview-label">
                                    A habit, repeated
                                </div>
                                <div style={{ display: 'flex', gap: '4px', marginTop: '10px' }}>
                                    {[1, 1, 1, 1, 1, 1, 0.5].map((val, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '3px',
                                                background:
                                                    val === 1 ? '#FF5F56' : 'rgba(255,95,86,0.25)',
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bento-box bento-panoramic stagger-item">
                        <div className="bento-content" style={{ maxWidth: '520px' }}>
                            <Activity color="#5B8DEE" size={32} style={{ marginBottom: '1rem' }} />
                            <h3 className="bento-title">A plan that fits your day</h3>
                            <p className="bento-desc">
                                Map tasks to the time you actually have. Use a focus timer for the next block,
                                then adjust the plan when school, activities or deadlines change.
                            </p>
                        </div>
                        <div
                            className="bento-visual"
                            style={{
                                position: 'absolute',
                                right: 0,
                                bottom: 0,
                                width: '50%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'flex-end',
                                justifyContent: 'flex-end',
                                padding: '2rem',
                            }}
                        >
                            <svg viewBox="0 0 200 100" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                                <path
                                    d="M0,80 Q20,20 50,20 T100,50 T150,10 T200,80"
                                    fill="none"
                                    stroke="#5B8DEE"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    className="svg-draw"
                                />
                                <circle cx="150" cy="10" r="6" fill="#5B8DEE" />
                            </svg>
                        </div>
                    </div>
                </div>
            </section>

            <section className="reveal-section board-section" style={{ padding: '2rem 1.5rem 4rem', maxWidth: '1100px', margin: '0 auto' }}>
                <div className="landing-glass-panel stagger-item">
                    <p className="board-section__eyebrow">MADE TO ADAPT TO YOUR CURRICULUM</p>
                    <h2
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
                            marginBottom: '1rem',
                            color: '#fff',
                        }}
                    >
                        Your curriculum. Your approach.
                    </h2>
                    <p style={{ marginBottom: '1rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>
                        Whether you follow ICSE, ISC, IGCSE, CBSE or IB, choose your board and grade during setup
                        so StudyBud can use that context in your study workspace. Subject names and assessment
                        requirements vary, so always follow your current syllabus and your teacher’s guidance.
                    </p>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.82)', lineHeight: 1.7 }}>
                        StudyBud brings together revision techniques, practice tools, focus sessions and habits.
                        Create an account to save your own setup and progress across sessions.
                    </p>
                </div>
            </section>

            <section className="reveal-section" style={{ padding: '2rem 1.5rem 6rem', textAlign: 'center' }}>
                <div className="stagger-item cta-glass">
                    <div className="glow-behind" aria-hidden />
                    <h2
                        style={{
                            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
                            fontFamily: "'Cormorant Garamond', serif",
                            marginBottom: '1.25rem',
                            lineHeight: 1.12,
                        }}
                    >
                        Make your next study session count.
                    </h2>
                    <p
                        style={{
                            fontSize: '1.15rem',
                            marginBottom: '2rem',
                            maxWidth: '32rem',
                            margin: '0 auto 2rem',
                            lineHeight: 1.65,
                        }}
                    >
                        Choose your board, pick the subjects you are working on, and build a plan you can use today.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate('/login', { state: { mode: 'signup' } })}
                        className="btn-primary large-btn pulse-glow"
                        style={{ fontSize: '1.15rem', padding: '1.1rem 2.75rem' }}
                    >
                        Build my study space
                    </button>
                    <p style={{ marginTop: '1.75rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)' }}>
                        Start with a short setup. You can adjust your preferences later.
                    </p>
                </div>
            </section>
        </LandingLayout>
    );
};

export default LandingPage;
