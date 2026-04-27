import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';
import { Brain } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import styles from './Auth.module.css';

const LoginPage = () => {
    const { toast } = useToast();
    const location = useLocation();
    const [mode, setMode] = useState(location.state?.mode || 'login');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [successState, setSuccessState] = useState(false);

    const switchMode = () => {
        setMode(m => m === 'login' ? 'signup' : 'login');
        setFullName('');
        setEmail('');
        setPassword('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            return toast.error('Please fill in all fields.');
        }
        if (mode === 'signup' && !fullName.trim()) {
            return toast.error('Please enter your full name.');
        }

        setIsLoading(true);

        try {
            if (mode === 'login') {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email.trim(),
                    password,
                });
                if (error) {
                    toast.error(error.message);
                    setIsLoading(false);
                } else if (data?.user) {
                    toast.success('Welcome back!');
                    window.location.href = '/';
                }
            } else {
                // Sign up
                const { data, error } = await supabase.auth.signUp({
                    email: email.trim(),
                    password,
                    options: {
                        data: { full_name: fullName.trim() },
                    },
                });

                if (error) {
                    toast.error(error.message);
                    setIsLoading(false);
                    return;
                }

                // Duplicate account (Supabase returns empty identities for existing unconfirmed emails)
                if (data?.user?.identities?.length === 0) {
                    toast.info('This email is already registered. Please sign in instead.');
                    setMode('login');
                    setIsLoading(false);
                    return;
                }

                // Success — store name and show celebration
                localStorage.setItem('studybud_username', fullName.trim());
                setSuccessState(true);
                setIsLoading(false);

                // Navigate to onboarding after celebration
                setTimeout(() => {
                    window.location.href = '/onboarding/setup';
                }, 2800);
            }
        } catch (err) {
            console.error('Auth error:', err);
            toast.error('Something went wrong. Please check your connection and try again.');
            setIsLoading(false);
        }
    };

    const handleGuest = () => {
        localStorage.setItem('studybud_guest', 'true');
        window.location.href = '/';
    };

    if (successState) {
        return (
            <div className={styles.authContainer}>
                <div className={styles.authCard}>
                    <div className={styles.successBox}>
                        <div className={styles.confettiEmoji}>🥳</div>
                        <h2 className={styles.successTitle}>
                            You're all set, {fullName}!
                        </h2>
                        <p className={styles.successSub}>
                            Your account has been created. Taking you to your dashboard…
                        </p>
                        <div className={styles.successLoader}>
                            <div className={styles.successLoaderBar} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.authContainer}>
            {/* Ambient blobs */}
            <div className={styles.blob1} />
            <div className={styles.blob2} />

            <div className={styles.authCard}>
                {/* Logo */}
                <div className={styles.logoRow}>
                    <div className={styles.logoMark}>
                        <Brain size={22} strokeWidth={1.8} />
                    </div>
                    <div className={styles.logoText}>
                        <span className={styles.logoStudy}>Study</span><span className={styles.logoBud}>Bud</span>
                        <span className={styles.logoTagline}>Learn at your own pace.</span>
                    </div>
                </div>

                {/* Heading */}
                <div className={styles.headingBlock}>
                    <h1 className={styles.heading}>
                        {mode === 'login' ? 'Welcome back' : 'Create account'}
                    </h1>
                    <p className={styles.subheading}>
                        {mode === 'login'
                            ? 'Sign in to continue your journey.'
                            : 'Join StudyBud and design your dream life.'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className={styles.form} noValidate>
                    {mode === 'signup' && (
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Full name</label>
                            <input
                                type="text"
                                placeholder="Atharv Mittal"
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                className={styles.input}
                                autoComplete="name"
                                required
                            />
                        </div>
                    )}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Email address</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className={styles.input}
                            autoComplete="email"
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Password</label>
                        <input
                            type="password"
                            placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className={styles.input}
                            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={styles.submitBtn}
                    >
                        {isLoading
                            ? <span className={styles.spinner} />
                            : (mode === 'login' ? 'Sign In' : 'Create Account')}
                    </button>
                </form>

                {/* Toggle */}
                <p className={styles.toggleText}>
                    {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                    <button type="button" onClick={switchMode} className={styles.toggleLink}>
                        {mode === 'login' ? 'Sign Up' : 'Sign In'}
                    </button>
                </p>

                {/* Divider */}
                <div className={styles.divider}>
                    <span className={styles.dividerLine} />
                    <span className={styles.dividerWord}>or</span>
                    <span className={styles.dividerLine} />
                </div>

                {/* Guest */}
                <button type="button" onClick={handleGuest} className={styles.guestBtn}>
                    Continue as Guest
                </button>

                <p className={styles.legalText}>
                    By continuing, you agree to use StudyBud responsibly.
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
