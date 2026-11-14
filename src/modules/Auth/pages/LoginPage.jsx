import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
    ArrowRight,
    Eye,
    EyeOff,
} from 'lucide-react';
import { supabase, diagnoseAuthService } from '../../../supabaseClient';
import { useToast } from '../../../context/useToast';
import styles from './Auth.module.css';

const friendlyAuthError = (error) => {
    const message = String(error?.message || '').toLowerCase();

    const status = Number(error?.status ?? error?.context?.status ?? 0);
    const timedOut =
        error?.name === 'AuthRequestTimeoutError' ||
        message.includes('timed out') ||
        message.includes('context deadline exceeded') ||
        error?.code === 'request_timeout' ||
        status === 504;

    if (timedOut) {
        return 'StudyBud’s account service took too long to respond. Check your connection and try again. If the issue persists, contact the StudyBud administrator.';
    }
    if (message.includes('invalid login credentials')) {
        return 'That email and password combination did not work. Check your details and try again.';
    }
    if (message.includes('email not confirmed')) {
        return 'This account is not enabled for password sign-in yet. Contact the StudyBud administrator.';
    }
    if (message.includes('user already registered') || message.includes('already been registered')) {
        return 'An account may already use this email. Switch to Sign In instead.';
    }
    if (message.includes('network') || message.includes('fetch')) {
        return 'StudyBud could not reach the authentication service. Check your connection and try again.';
    }
    return 'We could not complete that request. Please try again in a moment.';
};

const LoginPage = () => {
    const { toast } = useToast();
    const location = useLocation();
    const [mode, setMode] = useState(location.state?.mode || 'login');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState('');

    const switchMode = () => {
        if (isLoading) return;
        setMode(current => current === 'login' ? 'signup' : 'login');
        setFullName('');
        setPassword('');
        setIsPasswordVisible(false);
        setFormError('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isLoading) return;

        const normalizedEmail = email.trim();
        if (!normalizedEmail || !password.trim()) {
            setFormError('Enter your email address and password to continue.');
            return;
        }
        if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
            setFormError('Enter a valid email address.');
            return;
        }
        if (mode === 'signup' && !fullName.trim()) {
            setFormError('Enter your name so we know what to call you.');
            return;
        }
        if (mode === 'signup' && password.length < 8) {
            setFormError('Choose a password with at least 8 characters.');
            return;
        }

        setIsLoading(true);
        setFormError('');
        let navigatingAway = false;

        try {
            if (mode === 'login') {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: normalizedEmail,
                    password,
                });
                if (error) throw error;
                if (!data?.user) {
                    throw new Error('Sign-in returned no authenticated user.');
                }

                localStorage.removeItem('studybud_guest');
                localStorage.removeItem('studybud_password');
                const metadataName = data.user.user_metadata?.full_name;
                if (metadataName) localStorage.setItem('studybud_username', metadataName);

                toast.success('Welcome back!');
                navigatingAway = true;
                window.location.assign('/');
                return;
            }

            // Create the account server-side as email-confirmed so signup never
            // blocks on SMTP or sends a verification email.
            const { data: created, error: createError } = await supabase.functions.invoke('studybud-signup', {
                body: {
                    email: normalizedEmail,
                    password,
                    fullName: fullName.trim(),
                },
            });

            if (createError) {
                let serviceMessage = '';
                let serviceCode = '';
                const serviceStatus = Number(createError.status || createError.context?.status || 0);

                try {
                    if (createError.context && typeof createError.context.json === 'function') {
                        const responseBody = await createError.context.json();
                        serviceMessage = [
                            responseBody?.error,
                            responseBody?.message,
                            responseBody?.msg,
                        ].find(value => typeof value === 'string' && value.trim()) || '';
                        serviceCode = String(responseBody?.code || responseBody?.error_code || '').toUpperCase();
                    }
                } catch {
                    // The response body may already have been consumed by supabase-js.
                }

                const normalizedServiceMessage = serviceMessage.toLowerCase();

                if (
                    serviceStatus === 409 ||
                    /already has an account|already registered|email_exists/.test(normalizedServiceMessage)
                ) {
                    setFormError('An account already exists for this email. Choose “Sign in instead” and use that account’s password.');
                } else if (serviceStatus === 404 || serviceCode === 'NOT_FOUND') {
                    setFormError('StudyBud’s account-creation endpoint is not deployed for this environment. No account was created. Use Sign in if you already have an account.');
                } else if (serviceStatus === 401 || serviceStatus === 403) {
                    setFormError('StudyBud could not authorize the account request. Refresh the page and try again. If this continues, the app configuration needs to be corrected.');
                } else if (serviceStatus === 429) {
                    setFormError(serviceMessage || 'Too many account attempts were made. Wait a little before trying again.');
                } else if (serviceStatus >= 500) {
                    setFormError(serviceMessage || 'StudyBud’s account service is online but returned a server error. No further signup attempt is needed until the service is checked.');
                } else if (
                    createError.name === 'FunctionsFetchError' ||
                    /failed to fetch|networkerror|load failed/i.test(String(createError.message || ''))
                ) {
                    setFormError('Your browser could not connect to StudyBud’s account service. Check your connection and try again once. If you already submitted this signup, choose Sign in before trying again.');
                } else {
                    setFormError(serviceMessage || 'StudyBud could not complete account creation. Refresh the page and try again. If an account may already have been created, choose Sign in instead.');
                }
                return;
            }

            if (!created?.user?.id) {
                setFormError('The account service did not confirm account creation. Do not keep resubmitting; try Sign in once if you believe the account was created.');
                return;
            }

            // Admin-created users are already email-confirmed, so this sign-in
            // creates a normal Supabase session without sending any email.
            const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
                email: normalizedEmail,
                password,
            });

            if (signInError || !sessionData?.user) {
                setFormError('Your account was created, but automatic sign-in did not complete. Select “Sign in instead” and use the password you just entered. Do not create the account again.');
                return;
            }

            localStorage.removeItem('studybud_guest');
            localStorage.removeItem('studybud_password');
            localStorage.setItem('studybud_username', fullName.trim());
            toast.success('Account created!');
            navigatingAway = true;
            window.location.assign('/onboarding/setup');
            return;
        } catch (error) {
            const isTimeout = (() => {
                let current = error;
                for (let depth = 0; current && depth < 4; depth += 1, current = current.cause) {
                    const message = String(current.message || '').toLowerCase();
                    const status = Number(current.status ?? current.context?.status ?? 0);
                    if (
                        current.name === 'AuthRequestTimeoutError' ||
                        message.includes('timed out') ||
                        message.includes('context deadline exceeded') ||
                        current.code === 'request_timeout' ||
                        status === 504
                    ) return true;
                }
                return false;
            })();

            console.warn('Authentication request did not complete:', {
                mode,
                name: error?.name || 'Error',
                code: error?.code || 'unknown',
                status: error?.status || error?.context?.status || null,
            });

            if (isTimeout) {
                const diagnostic = await diagnoseAuthService();
                console.warn('Supabase Auth reachability check:', diagnostic);

                if (diagnostic.reason === 'missing-config') {
                    setFormError('Account creation is not configured for this deployment. The site loads, but its Supabase connection is missing. The deployment environment settings need to be corrected.');
                } else if (!diagnostic.reachable) {
                    setFormError('StudyBud could not reach its account service. This is not necessarily a problem with your general internet connection. Your account may or may not have been created, so please do not keep submitting the form while the service is unresponsive.');
                } else if (mode === 'signup') {
                    // Signup can time out after Supabase has created the account.
                    // Try one direct password sign-in for that existing account.
                    // This never submits a second signup request.
                    try {
                        const { data: existingSession, error: signInError } =
                            await supabase.auth.signInWithPassword({
                                email: normalizedEmail,
                                password,
                            });

                        if (!signInError && existingSession?.user) {
                            localStorage.removeItem('studybud_guest');
                            localStorage.removeItem('studybud_password');
                            const existingName = existingSession.user.user_metadata?.full_name || fullName.trim();
                            if (existingName) localStorage.setItem('studybud_username', existingName);
                            toast.success('You’re signed in!');
                            navigatingAway = true;
                            window.location.assign('/');
                            return;
                        }
                    } catch (signInFallbackError) {
                        console.warn('Fallback sign-in after signup timeout failed:', {
                            name: signInFallbackError?.name || 'Error',
                            code: signInFallbackError?.code || 'unknown',
                        });
                    }

                    setFormError('StudyBud could not finish creating this account. If this email already has an account, select “Sign in instead” and use its existing password. New account creation is still being blocked by the authentication service.');
                } else {
                    setFormError('StudyBud reached its account service, but sign-in did not finish in time. The Supabase Auth logs need to be checked to find the cause.');
                }
            } else {
                setFormError(friendlyAuthError(error));
            }
        } finally {
            // Redirects intentionally leave the loading screen in place. Every
            // other outcome—including unexpected/empty responses—restores the form.
            if (!navigatingAway) setIsLoading(false);
        }
    };

    const brandPanel = (
        <aside className={styles.brandPanel}>
            <div className={styles.brandLockup}>
                <span className={styles.logoMark} aria-hidden="true"><span>sb</span></span>
                <span className={styles.logoText}>
                    <span className={styles.logoName}><span>Study</span><strong>Bud</strong></span>
                    <span className={styles.logoTagline}>Learn at your own pace</span>
                </span>
            </div>

            <div className={styles.brandStory}>
                <span className={styles.brandEyebrow}>A CLEARER WAY TO LEARN</span>
                <h2>Build a better<br /><em>study rhythm.</em></h2>
                <p>Bring planning, focused work and active learning into one considered workspace.</p>
            </div>

            <div className={styles.brandVisual} aria-label="The StudyBud learning process">
                <div className={styles.visualHeader}>
                    <span>THE STUDYBUD METHOD</span>
                    <span>01 — 03</span>
                </div>
                <div className={styles.visualFlow}>
                    <div className={styles.visualStep}>
                        <span className={styles.visualNumber}>01</span>
                        <strong>Plan</strong>
                        <small>Know what matters next.</small>
                    </div>
                    <div className={styles.visualStep}>
                        <span className={styles.visualNumber}>02</span>
                        <strong>Focus</strong>
                        <small>Give the work your attention.</small>
                    </div>
                    <div className={styles.visualStep}>
                        <span className={styles.visualNumber}>03</span>
                        <strong>Learn</strong>
                        <small>Practise. Review. Improve.</small>
                    </div>
                </div>
            </div>

            <p className={styles.brandFootnote}>One workspace. A clearer way forward.</p>
            <div className={styles.brandOrbOne} aria-hidden="true" />
            <div className={styles.brandOrbTwo} aria-hidden="true" />
        </aside>
    );

    return (
        <main className={styles.authContainer}>
            <section className={styles.authShell}>
                {brandPanel}

                <div className={styles.formPanel}>
                    <div className={styles.formTopline}>
                        <span className={styles.formEyebrow}>{mode === 'login' ? 'STUDYBUD / ACCOUNT' : 'CREATE YOUR ACCOUNT'}</span>
                    </div>

                    <header className={styles.headingBlock}>
                        <h1 className={styles.heading}>
                            {mode === 'login' ? 'Welcome back.' : 'Create your account.'}
                        </h1>
                        <p className={styles.subheading}>
                            {mode === 'login'
                                ? 'Sign in to continue to your workspace.'
                                : 'Create your account to set up your learning workspace.'}
                        </p>
                    </header>

                    <form onSubmit={handleSubmit} className={styles.form} noValidate>
                        {mode === 'signup' && (
                            <div className={styles.inputGroup}>
                                <label className={styles.label} htmlFor="studybud-full-name">Your name</label>
                                <input
                                    id="studybud-full-name"
                                    type="text"
                                    placeholder="What should we call you?"
                                    value={fullName}
                                    onChange={event => {
                                        setFullName(event.target.value);
                                        if (formError) setFormError('');
                                    }}
                                    className={styles.input}
                                    autoComplete="name"
                                    autoCapitalize="words"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        )}

                        <div className={styles.inputGroup}>
                            <label className={styles.label} htmlFor="studybud-email">Email address</label>
                            <input
                                id="studybud-email"
                                type="email"
                                inputMode="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={event => {
                                    setEmail(event.target.value);
                                    if (formError) setFormError('');
                                }}
                                className={styles.input}
                                autoComplete="email"
                                autoCapitalize="none"
                                spellCheck="false"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <div className={styles.labelRow}>
                                <label className={styles.label} htmlFor="studybud-password">Password</label>
                                {mode === 'signup'
                                    ? <span className={styles.passwordHint}>At least 8 characters</span>
                                    : <span className={styles.passwordHint}>Your account password</span>}
                            </div>
                            <div className={styles.passwordField}>
                                <input
                                    id="studybud-password"
                                    type={isPasswordVisible ? 'text' : 'password'}
                                    placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
                                    value={password}
                                    onChange={event => {
                                        setPassword(event.target.value);
                                        if (formError) setFormError('');
                                    }}
                                    className={styles.input}
                                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                                    minLength={mode === 'signup' ? 8 : undefined}
                                    required
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    className={styles.passwordToggle}
                                    onClick={() => setIsPasswordVisible(value => !value)}
                                    aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                                    aria-pressed={isPasswordVisible}
                                    disabled={isLoading}
                                >
                                    {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {formError && (
                            <div className={styles.formError} role="alert" aria-live="polite">
                                <span className={styles.errorMark}>!</span>
                                <span>{formError}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={styles.primaryBtn}
                        >
                            {isLoading ? (
                                <>
                                    <span className={styles.spinner} aria-hidden="true" />
                                    <span>{mode === 'login' ? 'Signing you in…' : 'Creating your account…'}</span>
                                </>
                            ) : (
                                <>
                                    <span>{mode === 'login' ? 'Sign in to StudyBud' : 'Create my account'}</span>
                                    <ArrowRight size={18} aria-hidden="true" />
                                </>
                            )}
                        </button>

                        {isLoading && (
                            <p className={styles.loadingHint} role="status" aria-live="polite">
                                Connecting to StudyBud. This usually takes a few seconds.
                            </p>
                        )}
                    </form>

                    <div className={styles.modeSwitch}>
                        <span>{mode === 'login' ? 'New to StudyBud?' : 'Already have an account?'}</span>
                        <button
                            type="button"
                            onClick={switchMode}
                            className={styles.toggleLink}
                            disabled={isLoading}
                        >
                            {mode === 'login' ? 'Create account' : 'Sign in instead'}
                        </button>
                    </div>

                    <p className={styles.legalText}>
                        Your learning workspace, all in one place.
                    </p>
                </div>
            </section>
            <p className={styles.pageFootnote}>STUDYBUD · PLAN WITH INTENTION</p>
        </main>
    );
};

export default LoginPage;
