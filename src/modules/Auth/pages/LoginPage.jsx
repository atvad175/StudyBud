import React, { useState } from 'react';
import { supabase } from '../../../supabaseClient';
import StudyBudLogo from '../../../components/brand/StudyBudLogo';
import { useToast } from '../../../context/ToastContext';
import styles from './Auth.module.css';

const LoginPage = () => {
    const { toast } = useToast();
    const [mode, setMode] = useState('login'); // 'login' or 'signup'
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
                options: {
                    emailRedirectTo: `${window.location.origin}/onboarding/setup`
                }
            });
            if (error) {
                toast.error(error.message);
            } else {
                if (data?.user?.identities?.length === 0) {
                    toast.warning("This email is already registered. Try logging in instead.");
                    setMode('login');
                } else {
                    toast.success("Account created! Check your email for a confirmation link.");
                }
            }
        }
        setIsLoading(false);
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
                    <StudyBudLogo variant="onLight" size="lg" stacked showTagline tagline="Learn at your own pace." />
                </div>
                <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', color: '#1a1a1a', fontWeight: '700' }}>
                    {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className={styles.subtitle} style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    {mode === 'login' 
                        ? 'Sign in to continue your journey.' 
                        : 'Join StudyBud to design your dream life.'}
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', marginBottom: '1rem' }}>
                    <input 
                        type="email" 
                        placeholder="Email address" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={{ padding: '0.8rem', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', fontSize: '0.95rem' }}
                        required
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={{ padding: '0.8rem', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', fontSize: '0.95rem' }}
                        required
                    />
                    <button type="submit" disabled={isLoading} className={styles.googleBtn} style={{ background: '#C9883A', color: 'white', border: 'none', height: '48px', fontWeight: '600' }}>
                        {isLoading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <button 
                        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                        style={{ background: 'none', border: 'none', color: '#C9883A', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' }}
                    >
                        {mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                    </button>
                </div>

                <div style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.1)' }}></div>
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.1)' }}></div>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        localStorage.setItem('studybud_guest', 'true');
                        window.location.reload();
                    }}
                    className={styles.googleBtn}
                    style={{ background: 'transparent', color: '#666', border: '1px solid #ddd', height: '48px' }}
                >
                    Continue as Guest
                </button>

                <div className={styles.footer} style={{ marginTop: '1.5rem', opacity: 0.6 }}>By continuing you agree to use the app responsibly.</div>
            </div>
        </div>
    );
};

export default LoginPage;
