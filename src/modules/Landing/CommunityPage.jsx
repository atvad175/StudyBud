import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Users, MessagesSquare, Bell, ArrowRight, Clock, Sparkles } from 'lucide-react';
import LandingLayout from './LandingLayout';

const CommunityPage = () => {
    const navigate = useNavigate();
    const [dots, setDots] = useState(0);

    // Animated counting dots for the "building" effect
    useEffect(() => {
        const interval = setInterval(() => setDots(d => (d + 1) % 4), 600);
        return () => clearInterval(interval);
    }, []);


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

                {/* Notification signup stays closed until a real service can deliver the promised updates. */}
                <div
                    className="fade-in-up"
                    role="status"
                    aria-live="polite"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        maxWidth: 560,
                        margin: '0 auto 1.25rem',
                        padding: '0.95rem 1.25rem',
                        textAlign: 'left',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 18,
                        animationDelay: '0.5s',
                    }}
                >
                    <Bell size={18} color="#dda85d" style={{ flexShrink: 0 }} />
                    <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.55, margin: 0, fontSize: '0.92rem' }}>
                        Launch notifications aren't open yet. We won't collect your email until we can actually send updates.
                    </p>
                </div>
                <button
                    type="button"
                    className="btn-primary fade-in-up"
                    onClick={() => navigate('/login', { state: { mode: 'signup' } })}
                    style={{ animationDelay: '0.6s' }}
                >
                    Get started with StudyBud <ArrowRight size={14} style={{ display: 'inline', marginLeft: 4 }} />
                </button>
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
