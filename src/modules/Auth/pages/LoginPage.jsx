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
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) return toast.error("Please enter both email and password.");

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
            });

            if (error) {
                toast.error(error.message);
            } else {
                if (data?.user?.identities?.length === 0) {
                    toast.info("This email is already registered. Try logging in instead.");
                    setMode('login');
                } else {
                    toast.success("Account created successfully!");
                    // Try to auto-login. If email confirmation is disabled, this will work.
                    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
                    if (!signInError) {
                        window.location.href = '/onboarding/setup';
                    } else {
                        // If signIn fails (e.g. requires email confirmation)
                        toast.success("Check your email for a confirmation link to continue.");
                    }
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

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', marginBottom: '1rem' }}>
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
            </div>
        </div>
    );
};

export default LoginPage;
