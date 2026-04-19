import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Brain, Users, Flame, Activity } from 'lucide-react';
import LandingLayout from './LandingLayout';

const LandingPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px',
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    const staggerChildren = entry.target.querySelectorAll('.stagger-item');
                    staggerChildren.forEach((child, idx) => {
                        setTimeout(() => child.classList.add('visible'), idx * 100);
                    });
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal-section').forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return (
        <LandingLayout>
            <section className="landing-hero">
                <h1 className="hero-title fade-in-up" style={{ animationDelay: '0.15s' }}>
                    Build discipline. <br />
                    <span>Excel in your studies.</span> <br />
                    <span className="text-gradient" style={{ fontStyle: 'italic' }}>
                        Design your dream life.
                    </span>
                </h1>

                <p className="hero-subtitle fade-in-up" style={{ animationDelay: '0.35s', maxWidth: '900px', margin: '0 auto', lineHeight: '1.6', fontSize: '1.1rem' }}>
                    StudyBud is an app that helps you pave your way towards ultimate success, build your dream life, discipline, and a completely new identity. It is aligned with the United Nations Sustainability Development Goals, SDG 3 (Good health and well-being) and SDG 4 (Quality education). It helps you build small compounding habits, focus and the ability to do deep work and not procrastinate, manage your time to achieve maximum productivity, maintain your mental health and take care of your mental wellbeing while working through all of this, and as a student provides you with the tools to excel at academics. StudyBud is not just for students but for working professionals, college students, and self-learners who want to live a life they will love.
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
                        onClick={() => navigate('/onboarding/setup')}
                        className="btn-primary large-btn pulse-glow"
                    >
                        Start free <ArrowRight size={20} aria-hidden />
                    </button>
                    <button
                        type="button"
                        onClick={() => document.getElementById('bento')?.scrollIntoView({ behavior: 'smooth' })}
                        className="btn-secondary large-btn"
                    >
                        See what is inside
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
                        Everything in one calm dashboard
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
                        Each part of StudyBud works together: your habits, your focus timer, your schedule, your
                        mood, and your subjects — so you spend less time juggling apps and more time learning.
                    </p>
                </div>

                <div className="bento-grid">
                    <div className="bento-box bento-large stagger-item">
                        <div className="bento-content">
                            <Brain color="#C9883A" size={40} style={{ marginBottom: '1.25rem' }} />
                            <h3 className="bento-title">AI Life & Skill Coach (Gemini)</h3>
                            <p className="bento-desc">
                                Chat with an AI that coaches you on discipline, habits, and skill mastery. It asks
                                the right questions so you cultivate a growth mindset and overcome your limits.
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
                            <h3 className="bento-title">Tiny habits, clear streaks</h3>
                            <p className="bento-desc">
                                Pick one small habit. Mark it done. Watch your streak grow. Small steps beat big
                                plans you never start.
                            </p>
                        </div>
                        <div className="bento-visual">
                            <div className="streak-mock">
                                <div
                                    style={{
                                        fontSize: '2.75rem',
                                        fontWeight: 700,
                                        color: '#FF5F56',
                                        fontFamily: 'Outfit, sans-serif',
                                    }}
                                >
                                    42<span style={{ fontSize: '1rem' }}> days</span>
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
                            <h3 className="bento-title">Time and energy that fit you</h3>
                            <p className="bento-desc">
                                Note when you focus best. Plan harder work for those hours. StudyBud helps you
                                match tasks to your real energy — not a perfect schedule you cannot keep.
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

            <section className="reveal-section" style={{ padding: '2rem 1.5rem 4rem', maxWidth: '900px', margin: '0 auto' }}>
                <div className="landing-glass-panel stagger-item">
                    <h2
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
                            marginBottom: '1rem',
                            color: '#fff',
                        }}
                    >
                        Who is StudyBud for?
                    </h2>
                    <p style={{ marginBottom: '1rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>
                        StudyBud is for the dreamers and the beginners who are ready to take their first steps toward an extraordinary life. If you've ever felt overwhelmed or stuck, this is your clean, quiet space to organize your goals, build better habits, and finally focus on what truly matters to you.
                    </p>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.82)', lineHeight: 1.7 }}>
                        We take privacy seriously: your space is yours. You can also try the app locally without
                        signing in, then connect Google or Microsoft when you want your profile saved in the cloud.
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
                        Ready to design your dream life?
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
                        Set up your profile in a few short steps. No credit card. Free while we are in beta.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="btn-primary large-btn pulse-glow"
                        style={{ fontSize: '1.15rem', padding: '1.1rem 2.75rem' }}
                    >
                        Create your free account
                    </button>
                    <p style={{ marginTop: '1.75rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)' }}>
                        Use your email to join the community — no complex setup required.
                    </p>
                </div>
            </section>
        </LandingLayout>
    );
};

export default LandingPage;
