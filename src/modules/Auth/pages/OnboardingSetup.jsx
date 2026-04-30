import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, BookOpen, Activity, Wind, CheckSquare, Moon, Zap } from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import StudyBudLogo from '../../../components/brand/StudyBudLogo';
import { useToast } from '../../../context/ToastContext';
import styles from './OnboardingSetup.module.css';

const SUBJECTS = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History',
    'English', 'Economics', 'Computer Science', 'Psychology', 'Geography',
    'Business', 'Art & Design', 'Music', 'Languages', 'Philosophy',
];

const PROFESSIONS = [
    'Engineering', 'Medicine & Healthcare', 'Law', 'Finance & Banking',
    'Marketing & Sales', 'Design & Creative', 'Education & Teaching',
    'Technology & Software', 'Research & Science', 'Entrepreneurship',
    'Consulting', 'Media & Journalism', 'Architecture', 'Human Resources', 'Other',
];

const ATOM_OPTIONS = [
    { id: 'early', label: 'Wake up early', icon: <Sun size={24} /> },
    { id: 'read', label: 'Read 20 mins', icon: <BookOpen size={24} /> },
    { id: 'nophone', label: 'No phone first hour', icon: <Activity size={24} /> },
    { id: 'exercise', label: 'Exercise', icon: <Zap size={24} /> },
    { id: 'meditate', label: 'Meditate', icon: <Wind size={24} /> },
    { id: 'plan', label: 'Plan the day', icon: <CheckSquare size={24} /> },
    { id: 'sleep11', label: 'Sleep by 11pm', icon: <Moon size={24} /> },
];

const OnboardingSetup = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [step, setStep] = useState(1);

    // Step 1
    const [name, setName] = useState(localStorage.getItem('studybud_username') || '');
    const [role, setRole] = useState('');

    // Step 2
    const [struggles, setStruggles] = useState([]);

    // Step 3 – learning style
    const [learningStyle, setLearningStyle] = useState('');

    // Step 4 – subjects OR professions depending on role
    const [favTopics, setFavTopics] = useState([]);

    // Step 5 – keystone habit
    const [firstAtom, setFirstAtom] = useState(null);

    // Step 6 – north star intention
    const [intention, setIntention] = useState('');

    // Step 7 – productive time
    const [productiveTime, setProductiveTime] = useState('');

    // Step 8 – motivation
    const [motivation, setMotivation] = useState('');

    // Step 9 – sign up
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSigningUp, setIsSigningUp] = useState(false);

    const isWorkingPro = role === 'Working professional';
    const topicList = isWorkingPro ? PROFESSIONS : SUBJECTS;
    const step4Title = isWorkingPro ? 'Which field do you work in?' : 'Which subjects are yours?';
    const step4Subtitle = isWorkingPro
        ? 'Pick your field or fields — Bud will tailor support to your professional context.'
        : 'Pick everything you study or care about.';

    useEffect(() => {
        if (localStorage.getItem('studybud_onboarded') === 'true') setStep(9);
    }, []);

    const toggleStruggle = (s) =>
        setStruggles(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

    const toggleTopic = (t) =>
        setFavTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

    // ── Save everything ──────────────────────────────────────────────────────
    const persistLocalData = () => {
        const atom = ATOM_OPTIONS.find(a => a.id === firstAtom);
        try {
            localStorage.setItem('studybud_username', name);
            localStorage.setItem('studybud_role', role);
            localStorage.setItem('studybud_struggles', JSON.stringify(struggles));
            localStorage.setItem('studybud_intention', intention);
            localStorage.setItem('studybud_learning_style', learningStyle);
            localStorage.setItem('studybud_fav_subjects', JSON.stringify(favTopics));
            localStorage.setItem('studybud_fav_topics', JSON.stringify(favTopics));
            localStorage.setItem('studybud_topic_type', isWorkingPro ? 'professions' : 'subjects');
            localStorage.setItem('studybud_productive_time', productiveTime);
            localStorage.setItem('studybud_motivation', motivation);
            if (atom) localStorage.setItem('studybud_onboarding_atom', JSON.stringify({ id: atom.id, label: atom.label }));
        } catch (err) { console.warn('Onboarding local save failed:', err); }
    };

    const persistToSupabase = async (userId) => {
        if (!userId || userId === 'guest-user') return;
        try {
            await supabase.from('user_onboarding').upsert({
                user_id: userId,
                name,
                role,
                struggles,
                learning_style: learningStyle,
                fav_topics: favTopics,
                topic_type: isWorkingPro ? 'professions' : 'subjects',
                first_atom: firstAtom,
                intention,
                productive_time: productiveTime,
                motivation,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });
        } catch (e) { console.warn('Supabase onboarding save failed:', e); }
    };

    const finishOnboarding = async (userId) => {
        persistLocalData();
        localStorage.setItem('studybud_onboarded', 'true');
        localStorage.setItem('studybud_first_visit', 'true');
        await persistToSupabase(userId);
        window.dispatchEvent(new Event('studybud-onboarded'));
    };

    const handleEmailSignup = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!email.trim() || !password.trim()) {
            toast.error('Please fill in all fields.');
            return;
        }
        
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters.');
            return;
        }

        setIsSigningUp(true);
        
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password,
                options: { data: { full_name: name, role } },
            });
            
            if (error) {
                toast.error(error.message);
                setIsSigningUp(false);
                return;
            }

            // Check for duplicate account (unconfirmed email)
            if (data?.user?.identities?.length === 0) {
                toast.info('This email is already registered. Please sign in instead.');
                setIsSigningUp(false);
                return;
            }

            await finishOnboarding(data?.user?.id);
            navigate('/', { replace: true });
        } catch (err) {
            console.error('Signup error:', err);
            toast.error('Something went wrong. Please try again.');
            setIsSigningUp(false);
        }
    };

    const handleOAuthLogin = async (provider) => {
        persistLocalData();
        localStorage.setItem('studybud_onboarded', 'true');
        localStorage.setItem('studybud_first_visit', 'true');
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: { redirectTo: `${window.location.origin}/` },
        });
        if (error) {
            alert(`${error.message} — Enable this provider in Supabase → Authentication → Providers, and add ${window.location.origin}/ to Redirect URLs.`);
        }
    };

    const handleSkipAuth = async () => {
        await finishOnboarding(null);
        navigate('/', { replace: true });
    };

    const isStepValid = () => {
        if (step === 1) return name.trim().length > 0 && role !== '';
        if (step === 2) return struggles.length > 0;
        if (step === 3) return learningStyle !== '';
        if (step === 4) return favTopics.length > 0;
        if (step === 5) return firstAtom !== null;
        if (step === 6) return intention.trim().length > 0;
        if (step === 7) return productiveTime !== '';
        if (step === 8) return motivation !== '';
        return true;
    };

    const nextStep = async () => {
        if (isStepValid()) {
            if (step === 8) {
                // If they have a session or are already a guest, skip step 9 and finish
                const { data } = await supabase.auth.getSession();
                const isGuest = localStorage.getItem('studybud_guest') === 'true';
                if (data?.session || isGuest) {
                    await finishOnboarding(data?.session?.user?.id || 'guest-user');
                    navigate('/', { replace: true });
                    return;
                }
            }
            setStep(s => s + 1);
        }
    };

    return (
        <div className={styles.onboardingRoot}>
            <div className={styles.glowTop} aria-hidden />
            <div className={styles.glowBottom} aria-hidden />

            <header className={styles.topBar}>
                <StudyBudLogo variant="onLight" size="md" stacked showTagline />
                <div className={styles.progressRow}>
                    {[1,2,3,4,5,6,7,8,9].map(i => (
                        <div key={i}
                            className={`${styles.progressSeg} ${i <= step ? styles.progressSegActive : ''}`}
                        />
                    ))}
                </div>
            </header>

            <div className={styles.main}>
                <div className={styles.inner}>

                    {/* ── Step 1: Name + Role ─────────────────────────────── */}
                    {step === 1 && (
                        <div className="fade-in-up">
                            <h1 className="step-title">First, tell us about you</h1>
                            <p className="step-subtitle">Your name and where you are in your journey.</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '3rem' }}>
                                <input
                                    type="text" value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="hitech-input" autoFocus
                                    onKeyDown={e => e.key === 'Enter' && role && name ? nextStep() : null}
                                />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    {['School student', 'College student', 'Self-learner', 'Working professional'].map(r => (
                                        <button key={r} type="button"
                                            onClick={() => setRole(r)}
                                            className={`hitech-choice ${role === r ? 'selected' : ''}`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Step 2: Struggles ───────────────────────────────── */}
                    {step === 2 && (
                        <div className="fade-in-up">
                            <h1 className="step-title">What gets in your way?</h1>
                            <p className="step-subtitle">Pick anything that fits. Bud will shape its support around these.</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '3rem' }}>
                                {['Focus', 'Procrastination', 'Anxiety', 'Sleep', 'Time management', 'Motivation', 'Consistency', 'Stress'].map(s => (
                                    <button key={s} type="button"
                                        onClick={() => toggleStruggle(s)}
                                        className={`hitech-pill ${struggles.includes(s) ? 'selected' : ''}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Step 3: Learning Style ──────────────────────────── */}
                    {step === 3 && (
                        <div className="fade-in-up">
                            <h1 className="step-title">How do you learn best?</h1>
                            <p className="step-subtitle">This helps Bud give you the right kind of advice.</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '3rem' }}>
                                {[
                                    { id: 'visual',      emoji: '👁️',  label: 'Visual',          desc: 'Diagrams, charts, colour-coding' },
                                    { id: 'reading',     emoji: '📖',  label: 'Reading / Writing', desc: 'Notes, textbooks, summaries' },
                                    { id: 'auditory',    emoji: '🎧',  label: 'Auditory',          desc: 'Listening, talking through ideas' },
                                    { id: 'kinesthetic', emoji: '🤲',  label: 'Hands-on',          desc: 'Practice, doing, building' },
                                    { id: 'social',      emoji: '👥',  label: 'Social',            desc: 'Study groups, discussions' },
                                    { id: 'solo',        emoji: '🧘',  label: 'Solo deep work',    desc: 'Quiet, focused, independent' },
                                ].map(s => (
                                    <div key={s.id}
                                        onClick={() => setLearningStyle(s.id)}
                                        className={`hitech-box-choice ${learningStyle === s.id ? 'selected' : ''}`}
                                    >
                                        <div className="icon-wrapper" style={{ fontSize: '1.5rem' }}>{s.emoji}</div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{s.label}</div>
                                            <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: 2 }}>{s.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Step 4: Subjects OR Professions ────────────────── */}
                    {step === 4 && (
                        <div className="fade-in-up">
                            <h1 className="step-title">{step4Title}</h1>
                            <p className="step-subtitle">{step4Subtitle}</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '3rem' }}>
                                {topicList.map(t => (
                                    <button key={t} type="button"
                                        onClick={() => toggleTopic(t)}
                                        className={`hitech-pill ${favTopics.includes(t) ? 'selected' : ''}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Step 5: Keystone Atom ───────────────────────────── */}
                    {step === 5 && (
                        <div className="fade-in-up">
                            <h1 className="step-title">Pick one small habit to start</h1>
                            <p className="step-subtitle">Something tiny you can do tomorrow. You can change it later.</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '3rem' }}>
                                {ATOM_OPTIONS.map(atom => (
                                    <div key={atom.id}
                                        onClick={() => setFirstAtom(atom.id)}
                                        className={`hitech-box-choice ${firstAtom === atom.id ? 'selected' : ''}`}
                                    >
                                        <div className="icon-wrapper">{atom.icon}</div>
                                        <div>{atom.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Step 6: North Star Intention ────────────────────── */}
                    {step === 6 && (
                        <div className="fade-in-up">
                            <h1 className="step-title">Your main goal this week</h1>
                            <p className="step-subtitle">One sentence is enough. What matters most right now?</p>
                            <div style={{ marginTop: '3rem' }}>
                                <textarea
                                    value={intention}
                                    onChange={e => setIntention(e.target.value)}
                                    placeholder="I will finally..."
                                    rows={4}
                                    className="hitech-input"
                                    style={{ resize: 'vertical' }}
                                />
                            </div>
                        </div>
                    )}

                    {/* ── Step 7: Productive Time ──────────────────────────── */}
                    {step === 7 && (
                        <div className="fade-in-up">
                            <h1 className="step-title">When are you most focused?</h1>
                            <p className="step-subtitle">We'll schedule harder work for when you're naturally sharpest.</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '3rem' }}>
                                {['Early Bird (5am–9am)', 'Morning (9am–12pm)', 'Afternoon (1pm–5pm)', 'Night Owl (8pm–2am)'].map(t => (
                                    <button key={t} type="button"
                                        onClick={() => setProductiveTime(t)}
                                        className={`hitech-choice ${productiveTime === t ? 'selected' : ''}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Step 8: Motivation ───────────────────────────────── */}
                    {step === 8 && (
                        <div className="fade-in-up">
                            <h1 className="step-title">What drives you?</h1>
                            <p className="step-subtitle">When things get hard — what's the real reason you keep going?</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginTop: '3rem' }}>
                                {[
                                    'To prove it to myself',
                                    "To secure my family's future",
                                    'To get into my dream institution',
                                    'To get really good at what I do',
                                    'I want to build something impactful',
                                ].map(m => (
                                    <button key={m} type="button"
                                        onClick={() => setMotivation(m)}
                                        className={`hitech-choice ${motivation === m ? 'selected' : ''}`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Step 9: Sign Up / In ─────────────────────────────── */}
                    {step === 9 && (
                        <div className={`fade-in-up ${styles.step9Wrap}`}>
                            <div className={styles.step9Logo}>
                                <StudyBudLogo variant="onLight" size="hero" stacked showTagline={false} />
                            </div>
                            <h1 className="step-title">You're all set{name ? `, ${name}` : ''}!</h1>
                            <p className="step-subtitle">Create an account to save everything, or skip and keep it on this device.</p>

                            <div className={styles.authCol}>
                                <form onSubmit={handleEmailSignup} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', textAlign: 'left' }}>
                                    <input type="email" placeholder="Email address" value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="hitech-input" style={{ padding: '1rem', fontSize: '1rem' }} required />
                                    <input type="password" placeholder="Create password" value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="hitech-input" style={{ padding: '1rem', fontSize: '1rem' }} required />
                                    <button type="submit" className="auth-btn" style={{ backgroundColor: '#C9883A', color: '#fff', border: 'none', marginTop: '0.5rem' }} disabled={isSigningUp}>
                                        {isSigningUp ? 'Creating account...' : 'Create account'}
                                    </button>
                                </form>



                                <button type="button" onClick={handleSkipAuth} className={styles.skipBtn}>
                                    Skip sign-in (this device only)
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Navigation ───────────────────────────────────────── */}
                    {step < 9 && (
                        <div className={styles.navRow}>
                            {step > 1 ? (
                                <button type="button" onClick={() => setStep(s => s - 1)} className="nav-btn-back">
                                    ← Back
                                </button>
                            ) : <div />}
                            <button
                                type="button" onClick={nextStep}
                                disabled={!isStepValid()}
                                className={`nav-btn-next ${isStepValid() ? 'active' : ''}`}
                            >
                                Continue →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OnboardingSetup;
