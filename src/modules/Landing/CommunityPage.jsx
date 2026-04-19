import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Users, MessagesSquare, Bell, ArrowRight, Clock, Sparkles } from 'lucide-react';
import LandingLayout from './LandingLayout';

const CommunityPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [dots, setDots] = useState(0);

    // Animated counting dots for the "building" effect
    useEffect(() => {
        const interval = setInterval(() => setDots(d => (d + 1) % 4), 600);
        return () => clearInterval(interval);
    }, []);

    const handleNotify = (e) => {
        e.preventDefault();
        if (email.trim()) {
            const existing = JSON.parse(localStorage.getItem('studybud_notify_emails') || '[]');
            localStorage.setItem('studybud_notify_emails', JSON.stringify([...existing, email.trim()]));
            setSubmitted(true);
        }
    };

    const PANELS = [
        {
            icon: <Users size={28} color="#dda85d" />,
            title: 'Virtual Study Rooms',
            body: 'Join a room, start a focus session, and feel the quiet energy of others working alongside you. No pressure to chat — just shared momentum.',
            status: 'live',
        },
        {
            icon: <MessagesSquare size={28} color="#dda85d" />,
            title: 'Study Tips & Method Sharing',
            body: 'A space to swap proven techniques, flashcard strategies, and weekly plan breakdowns — peer wisdom at scale.',
            status: 'soon',
        },
        {
            icon: <Globe size={28} color="#dda85d" />,
            title: 'Discord Community',
            body: 'A dedicated Discord server for announcements, accountability check-ins, study sprints, and friendly help.',
            status: 'soon',
        },
        {
            icon: <Sparkles size={28} color="#dda85d" />,
            title: 'AI Group Sessions',
            body: 'Study alongside others with Bud acting as a shared tutor — group inquiry-based sessions, collaborative mock exams.',
            status: 'soon',
        },
        {
            icon: <Clock size={28} color="#dda85d" />,
            title: 'StudyBud Calendar & Day Planner',
            body: 'A comprehensive calendar and day planner to help you map out your long-term goals and daily actions in one beautiful interface.',
            status: 'soon',
        },
    ];

    return (
        <LandingLayout>
            {/* Construction Banner */}
            <section style={{ padding: 'clamp(7.5rem,14vh,11rem) 1.5rem 3rem', maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>

                {/* Pulsing status pill */}
                <div className="fade-in-up" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.65rem 1.5rem',
                    background: 'rgba(255,179,71,0.1)',
                    border: '1px solid rgba(255,179,71,0.35)',
                    borderRadius: 100, marginBottom: '2rem',
                    animationDelay: '0.1s',
                }}>
                    <span style={{ position: 'relative', display: 'inline-flex' }}>
                        <span style={{
                            width: 8, height: 8, borderRadius: '50%', background: '#FFB347', display: 'block',
                        }} />
                        <span style={{
                            position: 'absolute', top: 0, left: 0,
                            width: 8, height: 8, borderRadius: '50%', background: '#FFB347',
                            animation: 'communityPing 1.5s infinite',
                        }} />
                    </span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFB347', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        Under Construction
                    </span>
                    <Clock size={13} color="#FFB347" />
                </div>

                {/* Globe icon */}
                <div className="fade-in-up" style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(201,136,58,0.2), rgba(201,136,58,0))',
                    border: '1px solid rgba(201,136,58,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    animationDelay: '0.15s',
                }}>
                    <Globe size={38} color="#dda85d" />
                </div>

                <p className="landing-inner__eyebrow fade-in-up" style={{ animationDelay: '0.2s' }}>Community</p>
                <h1 className="fade-in-up" style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 'clamp(2.75rem,6vw,4.5rem)',
                    color: '#fff', lineHeight: 1.1, margin: '0 auto 1.25rem',
                    animationDelay: '0.3s',
                }}>
                    Coming shortly
                    <span style={{ color: '#dda85d' }}>
                        {'...'.slice(0, dots)}
                    </span>
                </h1>
                <p className="fade-in-up landing-inner__lead" style={{
                    margin: '0 auto 2.5rem', maxWidth: 520, animationDelay: '0.4s',
                }}>
                    Community is our next big venture. We're building spaces where students can study together, share wins, and support each other. Watch this space.
                </p>

                {/* Email notify form */}
                {!submitted ? (
                    <form
                        onSubmit={handleNotify}
                        className="fade-in-up"
                        style={{
                            display: 'flex', gap: '0.75rem', maxWidth: 440,
                            margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center',
                            animationDelay: '0.5s',
                        }}
                    >
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                            style={{
                                flex: '1 1 240px', padding: '0.85rem 1.25rem',
                                borderRadius: 100, border: '1px solid rgba(255,255,255,0.12)',
                                background: 'rgba(255,255,255,0.06)', color: '#fff',
                                fontSize: '0.95rem', outline: 'none', backdropFilter: 'blur(8px)',
                            }}
                        />
                        <button type="submit" className="btn-primary" style={{ flexShrink: 0 }}>
                            <Bell size={15} /> Notify me
                        </button>
                    </form>
                ) : (
                    <div className="fade-in-up" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.85rem 1.75rem',
                        background: 'rgba(39,201,63,0.1)', border: '1px solid rgba(39,201,63,0.3)',
                        borderRadius: 100, color: '#27C93F', fontWeight: 600, fontSize: '0.95rem',
                    }}>
                        ✓ You're on the list! We'll let you know when community launches.
                    </div>
                )}
            </section>

            {/* Feature cards */}
            <section style={{ maxWidth: 960, margin: '0 auto', padding: '1rem 1.5rem 5rem' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1.25rem',
                }}>
                    {PANELS.map((panel) => {
                        const isLive = panel.status === 'live';
                        return (
                            <div
                                key={panel.title}
                                style={{
                                    position: 'relative',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: 24, padding: '2rem',
                                    backdropFilter: 'blur(12px)',
                                    overflow: 'hidden',
                                    opacity: isLive ? 1 : 0.6,
                                    transition: 'opacity 0.3s',
                                }}
                            >
                                {!isLive && (
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: 'rgba(5,5,5,0.3)',
                                        backdropFilter: 'blur(1px)',
                                        borderRadius: 24,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        zIndex: 2,
                                    }}>
                                        <span style={{
                                            fontSize: '0.72rem', fontWeight: 700,
                                            color: '#FFB347',
                                            background: 'rgba(255,179,71,0.12)',
                                            border: '1px solid rgba(255,179,71,0.3)',
                                            padding: '4px 14px', borderRadius: 100,
                                            textTransform: 'uppercase', letterSpacing: '0.1em',
                                        }}>
                                            Coming Soon
                                        </span>
                                    </div>
                                )}
                                <div style={{ marginBottom: '0.75rem' }}>{panel.icon}</div>
                                <h3 style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontSize: '1.4rem', color: '#fff', marginBottom: '0.6rem',
                                }}>
                                    {panel.title}
                                </h3>
                                <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.65, margin: 0, fontSize: '0.95rem' }}>
                                    {panel.body}
                                </p>
                                {isLive && (
                                    <button
                                        type="button"
                                        onClick={() => navigate('/')}
                                        className="btn-secondary"
                                        style={{ marginTop: '1.25rem', fontSize: '0.875rem', padding: '0.6rem 1.25rem' }}
                                    >
                                        Try in app <ArrowRight size={14} style={{ display: 'inline', marginLeft: 4 }} />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            <p className="landing-footer-note">
                Thank you for being early — your feedback shapes every feature we build next.
            </p>

            <style>{`
                @keyframes communityPing {
                    0% { transform: scale(1); opacity: 1; }
                    75%, 100% { transform: scale(2.2); opacity: 0; }
                }
            `}</style>
        </LandingLayout>
    );
};

export default CommunityPage;
