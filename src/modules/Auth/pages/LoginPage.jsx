import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';
import StudyBudLogo from '../../../components/brand/StudyBudLogo';
import { useToast } from '../../../context/ToastContext';
import styles from './Auth.module.css';

const LoginPage = () => {
    const { toast } = useToast();
    const location = useLocation();
    const [mode, setMode] = useState(location.state?.mode || 'login'); // 'login' or 'signup'
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [successState, setSuccessState] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) return toast.error("Please enter both email and password.");
        if (mode === 'signup' && !fullName) return toast.error("Please enter your full name.");

        setIsLoading(true);
        if (mode === 'login') {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                toast.error(error.message);
            } else {
                toast.success("Successfully signed in!");
                window.location.href = '/';
            }
        } else {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { full_name: fullName } },
            });

            if (error) {
                toast.error(error.message);
            } else {
                if (data?.user?.identities?.length === 0) {
                    toast.info("This email is already registered. Try logging in instead.");
                    setMode('login');
                } else {
                    localStorage.setItem('studybud_username', fullName);
                    setSuccessState(true);

                    // We ensure the user enters the app regardless of email confirmation
                    setTimeout(async () => {
                        const { data: sessionData } = await supabase.auth.getSession();
                        if (!sessionData?.session) {
                            // If email confirmation prevented immediate login, allow guest entry
                            localStorage.setItem('studybud_guest', 'true');
                        }
                        window.location.href = '/onboarding/setup';
                    }, 2500);
                }
            }
        }
        setIsLoading(false);
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <StudyBudLogo variant="onLight" size="xl" stacked showTagline tagline="Learn at your own pace." />
                </div>
                <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', color: '#ffffff', fontWeight: '700', fontSize: '2.2rem', fontFamily: 'Cormorant Garamond, serif' }}>
                    {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className={styles.subtitle}>
                    {mode === 'login'
                        ? 'Sign in to continue your journey.'
                        : 'Join StudyBud to design your dream life.'}
                </p>

                {!successState ? (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', marginBottom: '1rem' }}>
                        {mode === 'signup' && (
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                className={styles.formInput}
                                required
                            />
                        )}
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className={styles.formInput}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className={styles.formInput}
                            required
                        />
                        <button type="submit" disabled={isLoading} className={styles.submitBtn}>
                            {isLoading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Sign Up')}
                        </button>
                    </form>
                ) : (
                    <div style={{ textAlign: 'center', margin: '2rem 0', animation: 'fadeInUp 0.5s ease forwards' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🥳</div>
                        <h3 style={{ color: '#fff', fontSize: '1.8rem', fontFamily: 'Cormorant Garamond, serif' }}>
                            You are all set, {fullName}!
                        </h3>
                        <p style={{ color: '#aaa', marginTop: '0.5rem' }}>Taking you to your dashboard...</p>
                    </div>
                )}

                {!successState && (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <button
                                type="button"
                                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                                className={styles.toggleBtn}
                            >
                                {mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                            </button>
                        </div>

                        <div className={styles.divider}>
                            <div className={styles.dividerLine}></div>
                            <span className={styles.dividerText}>OR</span>
                            <div className={styles.dividerLine}></div>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                localStorage.setItem('studybud_guest', 'true');
                                window.location.reload();
                            }}
                            className={styles.guestBtn}
                        >
                            Continue as Guest
                        </button>

                        <div className={styles.footer}>By continuing you agree to use the app responsibly.</div>
                    </>
                )}
            </div>
        </div>
    );
};

export default LoginPage;
