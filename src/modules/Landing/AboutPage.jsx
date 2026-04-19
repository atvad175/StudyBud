import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Brain, Shield, Heart } from 'lucide-react';
import LandingLayout from './LandingLayout';

const AboutPage = () => {
    const navigate = useNavigate();

    return (
        <LandingLayout>
            <article className="landing-inner">
                <p className="landing-inner__eyebrow">Our story</p>
                <h1>Our Story</h1>
                
                <div
                    className="landing-glass-panel"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: '2rem',
                        alignItems: 'center',
                        marginBottom: '2.5rem',
                        marginTop: '2rem'
                    }}
                >
                    <div
                        style={{
                            width: '100%',
                            maxWidth: '240px',
                            aspectRatio: '1',
                            borderRadius: '120px',
                            margin: '0 auto',
                            background: 'rgba(201,136,58,0.12)',
                            border: '2px solid rgba(201,136,58,0.35)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                        }}
                    >
                        <img src="/atharv_pic.jpg" alt="Atharv Mittal" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 25%' }} />
                    </div>
                    <div>
                        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem', marginBottom: '0.75rem' }}>
                            Hi! I’m Atharv Mittal, the creator of StudyBud.
                        </h2>
                        <p style={{ marginBottom: '1rem', lineHeight: 1.6, fontSize: '1.1rem', color: 'rgba(255,255,255,0.9)' }}>
                            I built this app because I believe that staying organized shouldn't be the hardest part of studying. As someone who loves exploring new things and skills, I wanted to create a clean, efficient space where students can focus on their goals and build their dream life without the clutter of traditional apps.
                        </p>
                        <p style={{ marginBottom: '1rem', lineHeight: 1.6 }}>
                            When I'm not working or debugging StudyBud or building new features, you’ll probably find me playing pickleball, reading, playing the guitar, and exploring and learning new things.
                        </p>
                        <p style={{ margin: 0, lineHeight: 1.6 }}>
                            StudyBud is a passion project of mine, and I’m always looking for ways to improve it. Thanks for being part of the journey!
                        </p>
                    </div>
                </div>

                {/* Personal Section / Philosophy */}
                <div style={{ marginTop: '4rem' }}>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.5rem', textAlign: 'center', marginBottom: '3rem' }}>The StudyBud Philosophy</h2>
                    <div className="landing-split">
                        <div className="landing-glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
                            <div style={{ background: 'rgba(201,136,58,0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <span style={{ fontSize: '1.5rem' }}>🎯</span>
                            </div>
                            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', marginBottom: '1rem' }}>Clarity Over Clutter</h3>
                            <p style={{ color: 'rgba(255,255,255,0.8)' }}>I believe your study space should be as clean as your mind needs to be. No useless features, just what works.</p>
                        </div>
                        <div className="landing-glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
                            <div style={{ background: 'rgba(201,136,58,0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <span style={{ fontSize: '1.5rem' }}>🌱</span>
                            </div>
                            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', marginBottom: '1rem' }}>Growth is Atomic</h3>
                            <p style={{ color: 'rgba(255,255,255,0.8)' }}>Big dreams are built on tiny actions. StudyBud helps you master the small steps that lead to an extraordinary life.</p>
                        </div>
                    </div>
                </div>
            </article>
            <p className="landing-footer-note">StudyBud — life-design workspace for discipline, focus, and skill mastery.</p>
        </LandingLayout>
    );
};

export default AboutPage;
