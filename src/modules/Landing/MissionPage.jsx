import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AlertTriangle, Lightbulb, Trophy, Heart, Rocket,
    Users, Brain, Shield, ArrowRight, CheckCircle2, Star
} from 'lucide-react';
import LandingLayout from './LandingLayout';

const MISSION_SECTIONS = [
    {
        id: 'problem',
        eyebrow: 'The Problem',
        icon: <AlertTriangle size={28} />,
        iconColor: '#FF5F56',
        iconBg: 'rgba(255,95,86,0.12)',
        title: 'People are distracted. We are handing them more noise.',
        body: [
            'The average person uses 6–10 different apps to manage their life. A to-do list here. A timer there. Notes on one platform, and maybe a meditation app for the anxiety in between.',
            'The result? Cognitive overload before the deep work even begins. App-switching eats focus. Disconnected tools never give you the full picture. And the moment life gets hard, the system collapses.',
            'Meanwhile, AI tools are making it worse — flooding us with shortcuts instead of building discipline. Copy-paste living creates the illusion of progress without the substance.',
        ],
        highlight: '73% of students report feeling overwhelmed by technology, not helped by it.',
        highlightColor: '#FF5F56',
    },
    {
        id: 'solution',
        eyebrow: 'Our Solution',
        icon: <Lightbulb size={28} />,
        iconColor: '#dda85d',
        iconBg: 'rgba(201,136,58,0.12)',
        title: 'One calm, intelligent workspace to forge an extraordinary life.',
        body: [
            'StudyBud integrates everything you need to build discipline into a single, beautifully designed hub. Habits. Focus. Time. Mind. Skill Mastery. All in one dashboard.',
            'Our AI coach, Bud, is built differently. Instead of giving you answers, Bud asks you questions. It challenges your limits, helps you break bad habits, and adapts its coaching style to your emotional state. Life design, not AI shortcuts.',
            'And when the pursuit gets heavy — because transformation is hard — the mind module is right there. Mood tracking, breathing exercises, reflection prompts, and cognitive offloading.',
        ],
        highlight: 'One app. Five modules. Infinite clarity.',
        highlightColor: '#dda85d',
    },
    {
        id: 'better',
        eyebrow: 'Why We\'re Different',
        icon: <Trophy size={28} />,
        iconColor: '#5B8DEE',
        iconBg: 'rgba(91,141,238,0.12)',
        title: 'We compete on depth, not dopamine.',
        body: null,
        cards: [
            { vs: 'Notion / To-do lists', us: 'We combine planning with habits, focus, and emotional tracking — not just task lists.' },
            { vs: 'ChatGPT for shortcuts', us: 'Bud coaches using inquiry-based coaching. It builds discipline, not dependency.' },
            { vs: 'Separate meditation apps', us: 'Mental fortitude is built into the workflow. Not bolted on after.' },
            { vs: 'Duolingo / gamification', us: 'Meaningful streaks tied to habit science, not artificial reward loops.' },
            { vs: 'Generic AI life coaches', us: 'Bud knows your schedule, your habits, your goals, and your emotional state.' },
        ],
        highlight: null,
        highlightColor: '#5B8DEE',
    },
    {
        id: 'why',
        eyebrow: 'Why Use StudyBud',
        icon: <Heart size={28} />,
        iconColor: '#4CAF50',
        iconBg: 'rgba(76,175,80,0.12)',
        title: 'Built for the ambitious. Privacy first. Free first.',
        body: [
            'StudyBud was born from the desire to break out of mediocrity, and the desperate search for a system that forged real discipline. We got tired of switching tools every week and making no progress.',
            'So we built what we wished existed: a life-design workspace that respects your intelligence, challenges your focus, and doesn\'t sell your data.',
        ],
        bullets: [
            'Free during the entire beta — no credit card required',
            'Privacy-first: your reflections and mood data stay yours',
            'Works offline with local profile, syncs when you sign in',
            'No gamification gimmicks — just genuine learning science',
            'Continuously improved based on real student feedback',
        ],
        highlight: null,
        highlightColor: '#4CAF50',
    },
    {
        id: 'vision',
        eyebrow: 'Our Future Vision',
        icon: <Rocket size={28} />,
        iconColor: '#9B59B6',
        iconBg: 'rgba(155,89,182,0.12)',
        title: 'The OS for lifelong learning.',
        body: [
            'StudyBud is just getting started. We\'re building toward a world where every ambitious person has a personalized AI life coach that understands them as deeply as the best human mentor, keeping them on the path to their dream life.',
        ],
        roadmap: [
            { label: 'Now', items: ['AI Bud companion', 'Habits + streaks', 'Focus timer + Spotify beats', 'Mood & mind tools', 'Study tools & flashcards'] },
            { label: 'Next', items: ['Community study rooms (live)', 'Shared learning challenges', 'Discord integration'] },
            { label: 'Future', items: ['Mobile app (iOS + Android)', 'AI tutor specializations', 'Teacher & institution dashboards', 'Study group AI facilitation'] },
        ],
        highlight: null,
        highlightColor: '#9B59B6',
    },
];

const MissionPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    entry.target.querySelectorAll('.stagger-item').forEach((child, i) => {
                        setTimeout(() => child.classList.add('visible'), i * 80);
                    });
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
        document.querySelectorAll('.reveal-section').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return (
        <LandingLayout>
            {/* Hero */}
            <section style={{ padding: 'clamp(8rem,14vh,11rem) 1.5rem 4rem', textAlign: 'center', maxWidth: 860, margin: '0 auto' }}>
                <p className="fade-in-up" style={{
                    fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.18em',
                    color: '#dda85d', fontWeight: 700, marginBottom: '1.25rem', animationDelay: '0.1s',
                }}>
                    Our Mission
                </p>
                <h1 className="fade-in-up" style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 'clamp(3rem,7vw,5.5rem)', lineHeight: 1.08, color: '#fff',
                    marginBottom: '1.5rem', animationDelay: '0.2s',
                }}>
                    Make learning feel
                    <br />
                    <span style={{
                        background: 'linear-gradient(135deg, #fff 0%, #dda85d 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        fontStyle: 'italic',
                    }}>
                        human again.
                    </span>
                </h1>
                <p className="fade-in-up" style={{
                    fontSize: 'clamp(1.1rem,2vw,1.3rem)', color: 'rgba(255,255,255,0.82)',
                    lineHeight: 1.7, maxWidth: 560, margin: '0 auto', animationDelay: '0.35s',
                }}>
                    Education is the greatest equalizer — but the tools have gotten in the way.
                    We're here to fix that.
                </p>
            </section>

            {/* Mission sections */}
            {MISSION_SECTIONS.map((section, idx) => (
                <section
                    key={section.id}
                    className="reveal-section"
                    style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 1.5rem' }}
                >
                    <div className="stagger-item landing-glass-panel" style={{ padding: '2.5rem 3rem' }}>
                        {/* Section header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
                            <div style={{
                                width: 52, height: 52, borderRadius: '16px',
                                background: section.iconBg, color: section.iconColor,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: `1px solid ${section.iconColor}20`, flexShrink: 0,
                            }}>
                                {section.icon}
                            </div>
                            <div>
                                <p style={{
                                    fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.14em',
                                    color: section.iconColor, fontWeight: 700, margin: '0 0 0.25rem',
                                }}>
                                    {section.eyebrow}
                                </p>
                                <h2 style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontSize: 'clamp(1.5rem,3vw,2.25rem)', color: '#fff',
                                    lineHeight: 1.2, margin: 0,
                                }}>
                                    {section.title}
                                </h2>
                            </div>
                        </div>

                        {/* Body text */}
                        {section.body && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: section.highlight || section.cards || section.bullets || section.roadmap ? '1.75rem' : 0 }}>
                                {section.body.map((para, i) => (
                                    <p key={i} style={{ color: 'rgba(255,255,255,0.82)', lineHeight: 1.75, fontSize: '1.02rem', margin: 0 }}>
                                        {para}
                                    </p>
                                ))}
                            </div>
                        )}

                        {/* Highlight quote */}
                        {section.highlight && (
                            <div style={{
                                borderLeft: `3px solid ${section.highlightColor}`,
                                paddingLeft: '1.25rem', marginBottom: '1.75rem',
                            }}>
                                <p style={{
                                    fontSize: '1.15rem', fontWeight: 600,
                                    color: section.highlightColor, fontStyle: 'italic', lineHeight: 1.5, margin: 0,
                                }}>
                                    "{section.highlight}"
                                </p>
                            </div>
                        )}

                        {/* Comparison cards */}
                        {section.cards && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {section.cards.map((card, i) => (
                                    <div key={i} style={{
                                        display: 'grid', gridTemplateColumns: '1fr auto 1fr',
                                        gap: '1rem', alignItems: 'center',
                                        padding: '1rem 1.25rem',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.07)',
                                        borderRadius: '16px',
                                    }}>
                                        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem', textDecoration: 'line-through' }}>
                                            {card.vs}
                                        </div>
                                        <div style={{
                                            width: 28, height: 28, borderRadius: '50%',
                                            background: 'rgba(91,141,238,0.15)',
                                            border: '1px solid rgba(91,141,238,0.3)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            <Star size={12} color="#5B8DEE" fill="#5B8DEE" />
                                        </div>
                                        <div style={{ color: 'rgba(255,255,255,0.88)', fontSize: '0.88rem', lineHeight: 1.4 }}>
                                            {card.us}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Bullet list */}
                        {section.bullets && (
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                {section.bullets.map((b, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', color: 'rgba(255,255,255,0.82)', fontSize: '1rem', lineHeight: 1.5 }}>
                                        <CheckCircle2 size={16} color={section.iconColor} style={{ marginTop: 3, flexShrink: 0 }} />
                                        {b}
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* Roadmap */}
                        {section.roadmap && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginTop: '1rem' }}>
                                {section.roadmap.map((phase, i) => (
                                    <div key={phase.label} style={{
                                        padding: '1.25rem',
                                        background: i === 0 ? 'rgba(201,136,58,0.1)' : 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${i === 0 ? 'rgba(201,136,58,0.25)' : 'rgba(255,255,255,0.07)'}`,
                                        borderRadius: '16px',
                                    }}>
                                        <div style={{
                                            fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
                                            letterSpacing: '0.12em', color: i === 0 ? '#dda85d' : 'rgba(255,255,255,0.45)',
                                            marginBottom: '0.75rem',
                                        }}>
                                            {phase.label}
                                        </div>
                                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                            {phase.items.map(item => (
                                                <li key={item} style={{
                                                    fontSize: '0.85rem', color: i === 0 ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.5)',
                                                    display: 'flex', alignItems: 'center', gap: 6,
                                                }}>
                                                    <span style={{
                                                        width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
                                                        background: i === 0 ? '#dda85d' : 'rgba(255,255,255,0.2)',
                                                    }} />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Connector line between sections */}
                    {idx < MISSION_SECTIONS.length - 1 && (
                        <div style={{
                            width: 2, height: 40, background: 'linear-gradient(180deg, rgba(201,136,58,0.3), transparent)',
                            margin: '0 auto',
                        }} />
                    )}
                </section>
            ))}

            {/* CTA */}
            <section className="reveal-section" style={{ padding: '2rem 1.5rem 6rem', textAlign: 'center' }}>
                <div className="stagger-item cta-glass" style={{ maxWidth: 700 }}>
                    <div className="glow-behind" aria-hidden />
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        {[Brain, Users, Shield].map((Icon, i) => (
                            <div key={i} style={{
                                width: 44, height: 44, borderRadius: '12px',
                                background: 'rgba(201,136,58,0.12)', border: '1px solid rgba(201,136,58,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Icon size={20} color="#dda85d" />
                            </div>
                        ))}
                    </div>
                    <h2 style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 'clamp(2rem,4.5vw,3rem)',
                        color: '#fff', marginBottom: '1rem', lineHeight: 1.15,
                    }}>
                        Be part of the mission.
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '1.05rem', marginBottom: '2rem', lineHeight: 1.65 }}>
                        Every user who signs up shapes the product. Free during beta. Your feedback builds what comes next.
                    </p>
                    <button
                        type="button"
                        className="btn-primary large-btn pulse-glow"
                        onClick={() => navigate('/onboarding/setup')}
                    >
                        Get started free <ArrowRight size={20} aria-hidden />
                    </button>
                </div>
            </section>

            <p className="landing-footer-note">
                StudyBud — built with conviction, shipped with care.
            </p>
        </LandingLayout>
    );
};

export default MissionPage;
