import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import StudyBudLogo from '../../components/brand/StudyBudLogo';
import './landingShared.css';

const LandingLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const go = (path) => () => navigate(path);

    const navClass = (path) =>
        location.pathname === path ? 'nav-link is-active' : 'nav-link';

    return (
        <div className="landing-root">
            <div className="dynamic-bg" aria-hidden>
                <div className="bg-orb orb-primary" />
                <div className="bg-orb orb-secondary" />
                <div className="bg-orb orb-tertiary" />
                <div className="mesh-cortex" />
            </div>
            <div className="noise-overlay" aria-hidden />

            <nav className={`landing-nav ${scrolled ? 'is-scrolled' : ''}`}>
                <div
                    className="landing-nav__left"
                    style={{ display: 'flex', alignItems: 'center', height: '100%' }}
                >
                    <StudyBudLogo variant="onDark" size="sm" onClick={go('/landing')} />
                </div>

                <div className="landing-nav__center landing-nav__links">
                    <button type="button" className={navClass('/features')} onClick={go('/features')}>
                        Features
                    </button>
                    <button type="button" className={navClass('/mission')} onClick={go('/mission')}>
                        Our Mission
                    </button>
                    <button type="button" className={navClass('/about')} onClick={go('/about')}>
                        Our Story
                    </button>
                    <button type="button" className={navClass('/community')} onClick={go('/community')}>
                        Community
                    </button>
                </div>

                <div className="landing-nav__right landing-nav__actions">
                    <button type="button" className="btn-ghost" onClick={go('/login')}>
                        Sign in
                    </button>
                    <button type="button" className="btn-primary" onClick={go('/onboarding/setup')}>
                        Get started
                    </button>
                </div>
            </nav>

            <div className="landing-main">{children}</div>
        </div>
    );
};

export default LandingLayout;
