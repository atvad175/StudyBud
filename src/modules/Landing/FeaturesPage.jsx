import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Brain, Flame, Clock, Heart, BookOpen, Users,
    Music2, Zap, ArrowRight, CheckCircle2, Sparkles
} from 'lucide-react';
import LandingLayout from './LandingLayout';

const FEATURES = [
    {
        id: 'ai',
        badge: 'Live Now',
        badgeColor: '#27C93F',
        icon: <Brain size={32} />,
        iconBg: 'rgba(201,136,58,0.15)',
        iconColor: '#dda85d',
        title: 'Bud — Your AI Life & Discipline Coach',
        tagline: 'Not Google. Not ChatGPT. Your personal mentor.',
        description: 'Bud doesn\'t give you the answer. Bud asks you the right questions — so you actually grow. Ask for a habit breakdown, get a skill explained, or just vent when things get hard. Bud adapts to your mood: candid, ruthless, or warm.',
        bullets: ['Personalized to your skills & goals', 'Three coaching modes: Candid, Ruthless, Warm', 'Remembers your history & progress'],
        visual: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(201,136,58,0.3), rgba(201,136,58,0.1))',
                        border: '2px solid rgba(201,136,58,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <Sparkles size={14} color="#dda85d" />
                    </div>
                    <div style={{
                        background: 'rgba(201,136,58,0.12)', border: '1px solid rgba(201,136,58,0.25)',
                        borderRadius: '16px 16px 16px 4px', padding: '0.85rem 1.1rem',
                        fontSize: '0.88rem', color: 'rgba(255,255,255,0.9)', maxWidth: '80%', lineHeight: 1.5,
                    }}>
                        Can you explain Newton's 3rd law in your own words — without looking it up?
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.06)', borderRadius: '16px 16px 4px 16px',
                        padding: '0.85rem 1.1rem', fontSize: '0.88rem', color: 'rgba(255,255,255,0.9)',
                        maxWidth: '75%', lineHeight: 1.5,
                    }}>
                        For every action there's an equal and opposite reaction...
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 5, padding: '0 0.5rem' }}>
                    {[1,2,3].map(i => (
                        <div key={i} style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: '#dda85d', opacity: 0.7,
                            animation: `budDot ${0.6 + i*0.2}s infinite alternate ease-in-out`,
                        }} />
                    ))}
                </div>
            </div>
        ),
    },
    {
        id: 'focus',
        badge: 'Live Now',
        badgeColor: '#27C93F',
        icon: <Zap size={32} />,
        iconBg: 'rgba(255,95,86,0.12)',
        iconColor: '#FF5F56',
        title: 'Focus Timer + Sonic Landscapes',
        tagline: 'Deep work mode, beautifully designed.',
        description: 'Start a Pomodoro or deep-work session with one tap. Pair it with your Beats playlist — lo-fi, classical, ambient, nature sounds, or jazz — all streaming from Spotify directly inside the app.',
        bullets: ['25/50/90 min Pomodoro or deep-work modes', '5 handpicked Spotify playlists', 'Session history & streak tracking'],
        visual: (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div style={{ position: 'relative', width: 100, height: 100 }}>
                    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6"/>
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#FF5F56" strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 42}`}
                            strokeDashoffset={`${2 * Math.PI * 42 * 0.28}`}
                            style={{ animation: 'timerDraw 4s linear infinite' }}
                        />
                    </svg>
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                        textAlign: 'center',
                    }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>24:18</div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>remaining</div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                    <Music2 size={13} color="#1DB954" />
                    Lo-fi Study Beats · playing
                </div>
            </div>
        ),
    },
    {
        id: 'habits',
        badge: 'Live Now',
        badgeColor: '#27C93F',
        icon: <Flame size={32} />,
        iconBg: 'rgba(255,95,86,0.12)',
        iconColor: '#FF5F56',
        title: 'Atomic Habits & Streak Engine',
        tagline: 'Small daily wins compound into identity change.',
        description: 'Based on James Clear\'s Atomic Habits — pick one tiny habit, mark it done each day, and watch your streak build. The Fission feature breaks big goals into micro-habits you can actually start tomorrow.',
        bullets: ['Streak tracking with momentum visualization', 'Fission: break goals into micro-habits', 'AI coaching when you miss a day (no shame)'],
        visual: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FF5F56', fontFamily: 'Outfit,sans-serif' }}>
                        42<span style={{ fontSize: '1rem' }}> days</span>
                    </span>
                    <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end' }}>
                        {[12,20,14,22,18,20,24].map((h, i) => (
                            <div key={i} style={{
                                width: 10, borderRadius: 3,
                                height: h,
                                background: i === 6 ? 'rgba(255,95,86,0.3)' : '#FF5F56',
                                animation: `barGrow${i} 1s ease-out`,
                            }} />
                        ))}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 5, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {Array(21).fill(0).map((_, i) => (
                        <div key={i} style={{
                            width: 10, height: 10, borderRadius: 3,
                            background: i < 18 ? '#FF5F56' : 'rgba(255,95,86,0.2)',
                        }} />
                    ))}
                </div>
            </div>
        ),
    },
    {
        id: 'mind',
        badge: 'Live Now',
        badgeColor: '#27C93F',
        icon: <Heart size={32} />,
        iconBg: 'rgba(91,141,238,0.12)',
        iconColor: '#5B8DEE',
        title: 'Mind & Mood — The Mental Layer',
        tagline: 'Studying is emotional. Let\'s treat it that way.',
        description: 'Track your mood over time, offload anxious thoughts, do a guided breathing session, write reflections, and grow through positive psychology exercises. No therapy-speak — just a quiet corner when you need it.',
        bullets: ['Mood timeline with pattern insights', 'Cognitive offload & brain dump tool', 'Guided meditation + breathing sessions'],
        visual: (
            <div style={{ padding: '0.5rem' }}>
                <svg viewBox="0 0 220 80" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                    <defs>
                        <linearGradient id="moodGrad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#FF5F56" />
                            <stop offset="50%" stopColor="#FFB347" />
                            <stop offset="100%" stopColor="#5B8DEE" />
                        </linearGradient>
                    </defs>
                    <path d="M0,60 Q20,50 40,45 T80,30 T120,40 T160,20 T220,25"
                        fill="none" stroke="url(#moodGrad)" strokeWidth="3" strokeLinecap="round"
                        style={{ animation: 'moodDraw 3s ease-in-out infinite' }}
                    />
                    {[0,40,80,120,160,220].map((x, i) => {
                        const y = [60,45,30,40,20,25][i];
                        return <circle key={i} cx={x} cy={y} r="5" fill="url(#moodGrad)" opacity="0.9" />;
                    })}
                </svg>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
                    {['Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <span key={d}>{d}</span>)}
                </div>
            </div>
        ),
    },
    {
        id: 'time',
        badge: 'Live Now',
        badgeColor: '#27C93F',
        icon: <Clock size={32} />,
        iconBg: 'rgba(76,175,80,0.12)',
        iconColor: '#4CAF50',
        title: 'Time & Energy Matching',
        tagline: 'Work with your biology, not against it.',
        description: 'Not all hours are equal. StudyBud helps you discover your peak energy windows, then schedules hard cognitive work for those slots. Miss a deadline? The system adapts — no shame, just an adjusted plan.',
        bullets: ['Peak energy window discovery', 'Smart task-to-energy matching', 'Weekly review with reflection prompts'],
        visual: (
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 70, padding: '0 0.5rem' }}>
                {[
                    { h: 30, label: '6am', active: false },
                    { h: 55, label: '9am', active: true },
                    { h: 65, label: '11am', active: true },
                    { h: 45, label: '2pm', active: false },
                    { h: 35, label: '4pm', active: false },
                    { h: 60, label: '8pm', active: true },
                ].map((bar, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{
                            width: '100%', height: bar.h, borderRadius: '6px 6px 2px 2px',
                            background: bar.active ? 'linear-gradient(180deg,#4CAF50,#2E7D32)' : 'rgba(255,255,255,0.1)',
                            border: bar.active ? '1px solid rgba(76,175,80,0.5)' : '1px solid rgba(255,255,255,0.08)',
                            transition: 'all 0.3s',
                            boxShadow: bar.active ? '0 4px 12px rgba(76,175,80,0.3)' : 'none',
                        }} />
                        <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)' }}>{bar.label}</span>
                    </div>
                ))}
            </div>
        ),
    },
    {
        id: 'study',
        badge: 'Live Now',
        badgeColor: '#27C93F',
        icon: <BookOpen size={32} />,
        iconBg: 'rgba(155,89,182,0.12)',
        iconColor: '#9B59B6',
        title: 'Skill Mastery — Flashcards & Active Recall',
        tagline: 'Master what matters. Stop passive re-reading.',
        description: 'Create flashcard decks, run AI-generated quizzes on any skill, break large goals into steps, and track macro progress. Real learning science, built in.',
        bullets: ['Spaced repetition flashcard engine', 'AI quizzes on any topic in seconds', 'Goal breakdown + progress tracking'],
        visual: (
            <div style={{ perspective: '600px' }}>
                <div style={{
                    background: 'rgba(155,89,182,0.15)', border: '1px solid rgba(155,89,182,0.3)',
                    borderRadius: 16, padding: '1.25rem 1.5rem',
                    transform: 'rotateY(-8deg) rotateX(4deg)',
                    boxShadow: '8px 8px 24px rgba(0,0,0,0.3)',
                }}>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Flashcard · Biochemistry
                    </div>
                    <div style={{ fontSize: '1rem', color: '#fff', fontWeight: 600, lineHeight: 1.4 }}>
                        What enzyme catalyzes the phosphorylation of glucose in glycolysis?
                    </div>
                    <div style={{
                        marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.1)',
                        fontSize: '0.9rem', color: 'rgba(155,89,182,0.9)', fontStyle: 'italic',
                    }}>
                        Hexokinase (Glucokinase in liver)
                    </div>
                </div>
            </div>
        ),
    },
    {
        id: 'community',
        badge: 'Coming Soon',
        badgeColor: '#FFB347',
        icon: <Users size={32} />,
        iconBg: 'rgba(76,175,80,0.12)',
        iconColor: '#4CAF50',
        title: 'Community — The Campus',
        tagline: 'Same energy as an elite workspace. No chat noise.',
        description: 'Virtual rooms where you can sit alongside others who are building their future. See their timer running, feel the collective momentum. No pressure to talk — just the quiet company of driven peers.',
        bullets: ['Virtual focus zones (silent mode)', 'Shared streaks & accountability', 'Community tips & life hacks — coming next'],
        visual: (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '0.5rem 0' }}>
                {Array(9).fill(0).map((_, i) => (
                    <div key={i} style={{
                        width: 38, height: 38, borderRadius: '50%',
                        background: `rgba(76,175,80,${0.1 + (i % 3) * 0.1})`,
                        border: `2px solid rgba(76,175,80,${0.2 + (i % 3) * 0.2})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1rem',
                        animation: `avaPulse ${1.5 + i * 0.3}s infinite alternate ease-in-out`,
                    }}>
                        {['📚','✏️','🎯','💡','🔬','📝','🎓','💻','🧪'][i]}
                    </div>
                ))}
            </div>
        ),
    },
];

const FeaturesPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    entry.target.querySelectorAll('.stagger-item').forEach((child, idx) => {
                        setTimeout(() => child.classList.add('visible'), idx * 80);
                    });
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

        document.querySelectorAll('.reveal-section').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return (
        <LandingLayout>
            {/* Hero */}
            <section style={{
                padding: 'clamp(8rem,14vh,11rem) 1.5rem 4rem',
                textAlign: 'center',
                maxWidth: 900,
                margin: '0 auto',
            }}>
                <p className="fade-in-up" style={{
                    fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.18em',
                    color: '#dda85d', fontWeight: 700, marginBottom: '1.25rem',
                    animationDelay: '0.1s',
                }}>
                    Features
                </p>
                <h1 className="fade-in-up" style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 'clamp(3rem,7vw,5.5rem)',
                    lineHeight: 1.08,
                    color: '#fff',
                    marginBottom: '1.5rem',
                    animationDelay: '0.2s',
                }}>
                    Everything you need
                    <br />
                    <span style={{
                        background: 'linear-gradient(135deg, #fff 0%, #dda85d 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontStyle: 'italic',
                    }}>
                        in one calm space.
                    </span>
                </h1>
                <p className="fade-in-up" style={{
                    fontSize: 'clamp(1.1rem,2vw,1.3rem)',
                    color: 'rgba(255,255,255,0.82)',
                    lineHeight: 1.7,
                    maxWidth: 580,
                    margin: '0 auto 2.5rem',
                    animationDelay: '0.35s',
                }}>
                    Five modules. One dashboard. No app-switching. StudyBud integrates your
                    habits, focus, time, mind, and skills into a single intelligent workspace.
                </p>

                {/* Stats bar */}
                <div className="fade-in-up" style={{
                    display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap',
                    animationDelay: '0.5s',
                    padding: '2rem 2.5rem',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '24px',
                    backdropFilter: 'blur(12px)',
                    maxWidth: 600,
                    margin: '0 auto',
                }}>
                    {[
                        { n: '7', label: 'Core features' },
                        { n: '5', label: 'Spotify playlists' },
                        { n: '3', label: 'AI personas' },
                        { n: '∞', label: 'Streaks possible' },
                    ].map(({ n, label }) => (
                        <div key={label} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#dda85d', fontFamily: 'Outfit,sans-serif' }}>{n}</div>
                            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Feature Sections */}
            {FEATURES.map((feat, idx) => (
                <section
                    key={feat.id}
                    className="reveal-section"
                    style={{
                        maxWidth: 1100,
                        margin: '0 auto',
                        padding: '3rem 1.5rem',
                    }}
                >
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: idx % 2 === 0 ? '1fr 1fr' : '1fr 1fr',
                        gap: '3rem',
                        alignItems: 'center',
                        flexDirection: idx % 2 !== 0 ? 'row-reverse' : 'row',
                    }}>
                        {/* Text side */}
                        <div style={{ order: idx % 2 !== 0 ? 2 : 1 }} className="stagger-item">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <div style={{
                                    width: 52, height: 52, borderRadius: '16px',
                                    background: feat.iconBg, color: feat.iconColor,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: `1px solid ${feat.iconColor}20`,
                                }}>
                                    {feat.icon}
                                </div>
                            </div>

                            <p style={{ fontSize: '0.8rem', color: feat.iconColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>
                                {feat.tagline}
                            </p>
                            <h2 style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontSize: 'clamp(2rem,4vw,2.75rem)',
                                color: '#fff', lineHeight: 1.15,
                                marginBottom: '1.25rem',
                            }}>
                                {feat.title}
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.82)', lineHeight: 1.75, fontSize: '1.05rem', marginBottom: '1.5rem' }}>
                                {feat.description}
                            </p>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                {feat.bullets.map((b) => (
                                    <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', color: 'rgba(255,255,255,0.78)', fontSize: '0.95rem' }}>
                                        <CheckCircle2 size={16} color={feat.iconColor} style={{ marginTop: 3, flexShrink: 0 }} />
                                        {b}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Visual side */}
                        <div
                            className="stagger-item"
                            style={{
                                order: idx % 2 !== 0 ? 1 : 2,
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '28px',
                                padding: '2.5rem',
                                backdropFilter: 'blur(16px)',
                                minHeight: 200,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Subtle glow */}
                            <div style={{
                                position: 'absolute', top: '50%', left: '50%',
                                transform: 'translate(-50%,-50%)',
                                width: 200, height: 200,
                                background: `${feat.iconColor}15`,
                                filter: 'blur(60px)', borderRadius: '50%',
                                pointerEvents: 'none',
                            }} />
                            <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
                                {feat.visual}
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    {idx < FEATURES.length - 1 && (
                        <div style={{
                            height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)',
                            marginTop: '4rem',
                        }} />
                    )}
                </section>
            ))}

            {/* CTA */}
            <section className="reveal-section" style={{ padding: '3rem 1.5rem 6rem', textAlign: 'center' }}>
                <div className="stagger-item cta-glass" style={{ maxWidth: 700 }}>
                    <div className="glow-behind" aria-hidden />
                    <h2 style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 'clamp(2.25rem,5vw,3.5rem)',
                        color: '#fff', marginBottom: '1rem', lineHeight: 1.12,
                    }}>
                        Ready to start?
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: 1.65 }}>
                        Set up your profile in 2 minutes. No credit card. Free while we're in beta.
                    </p>
                    <button
                        type="button"
                        className="btn-primary large-btn pulse-glow"
                        onClick={() => navigate('/onboarding/setup')}
                        style={{ fontSize: '1.1rem' }}
                    >
                        Create your free account <ArrowRight size={20} aria-hidden />
                    </button>
                </div>
            </section>

            <style>{`
                @keyframes budDot {
                    from { transform: translateY(0); opacity: 0.5; }
                    to { transform: translateY(-4px); opacity: 1; }
                }
                @keyframes timerDraw {
                    0% { stroke-dashoffset: ${2 * Math.PI * 42 * 0}; }
                    50% { stroke-dashoffset: ${2 * Math.PI * 42 * 0.6}; }
                    100% { stroke-dashoffset: ${2 * Math.PI * 42 * 0}; }
                }
                @keyframes avaPulse {
                    from { transform: scale(0.95); opacity: 0.6; }
                    to { transform: scale(1.05); opacity: 1; }
                }
                @keyframes moodDraw {
                    0%, 100% { stroke-dashoffset: 0; }
                    50% { stroke-dashoffset: 20; }
                }
                @media (max-width: 768px) {
                    .feat-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </LandingLayout>
    );
};

export default FeaturesPage;
