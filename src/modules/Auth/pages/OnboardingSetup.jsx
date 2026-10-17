import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, BookOpen, Activity, Wind, CheckSquare, Moon, Zap } from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import StudyBudLogo from '../../../components/brand/StudyBudLogo';
import { useToast } from '../../../context/ToastContext';
import styles from './OnboardingSetup.module.css';

const SUBJECTS = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History',
    'English', 'Economics', 'Computer Science', 'Geography',
    'Business', 'Art & Design', 'Music', 'Languages', 'Psychology',
];

const PROFESSIONS = [
    'Engineering', 'Medicine & Healthcare', 'Law', 'Finance & Banking',
    'Marketing & Sales', 'Design & Creative', 'Education & Teaching',
    'Technology & Software', 'Research & Science', 'Entrepreneurship',
    'Consulting', 'Media & Journalism', 'Architecture', 'Other',
];

const BOARDS = ['ICSE', 'ISC', 'IGCSE', 'IB', 'CBSE', 'Other'];
const GRADES = ['6', '7', '8', '9', '10', '11', '12', 'Other'];

const ATOM_OPTIONS = [
    { id: 'early', label: 'Wake up early', icon: <Sun size={20} /> },
    { id: 'read', label: 'Read 20 minutes', icon: <BookOpen size={20} /> },
    { id: 'nophone', label: 'Phone-free first hour', icon: <Activity size={20} /> },
    { id: 'exercise', label: 'Exercise', icon: <Zap size={20} /> },
    { id: 'meditate', label: 'Meditate', icon: <Wind size={20} /> },
    { id: 'plan', label: 'Plan the day', icon: <CheckSquare size={20} /> },
    { id: 'sleep11', label: 'Consistent sleep time', icon: <Moon size={20} /> },
];

const LEARNING_STYLES = [
    { id: 'visual', label: 'Visual', desc: 'Diagrams and charts' },
    { id: 'reading', label: 'Reading / writing', desc: 'Notes and summaries' },
    { id: 'auditory', label: 'Listen and discuss', desc: 'Talk ideas through' },
    { id: 'hands-on', label: 'Hands-on practice', desc: 'Learn by doing' },
    { id: 'social', label: 'Study with others', desc: 'Groups and discussions' },
    { id: 'solo', label: 'Solo deep work', desc: 'Quiet, independent focus' },
];

const STRUGGLES = [
    'Focus', 'Procrastination', 'Time management', 'Motivation',
    'Consistency', 'Exam preparation', 'Stress',
];

const MOTIVATIONS = [
    'To prove it to myself',
    'To get into my dream institution',
    'To get really good at what I do',
    'To build something impactful',
    'To make my family proud',
];

const OnboardingSetup = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [step, setStep] = useState(1);
    const [name, setName] = useState(localStorage.getItem('studybud_username') || '');
    const [role, setRole] = useState('School student');
    const [board, setBoard] = useState('');
    const [grade, setGrade] = useState('');
    const [favTopics, setFavTopics] = useState([]);
    const [struggles, setStruggles] = useState([]);
    const [learningStyle, setLearningStyle] = useState('');
    const [firstAtom, setFirstAtom] = useState('');
    const [intention, setIntention] = useState('');
    const [productiveTime, setProductiveTime] = useState('');
    const [motivation, setMotivation] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const isSchoolStudent = role === 'School student';
    const topicList = role === 'Working professional' ? PROFESSIONS : SUBJECTS;

    const toggleValue = (value, setter) => {
        setter(current => current.includes(value)
            ? current.filter(item => item !== value)
            : [...current, value]);
    };

    const isStepValid = () => {
        if (step === 1) return Boolean(name.trim() && role);
        if (step === 2) {
            return favTopics.length > 0 && (!isSchoolStudent || Boolean(board && grade));
        }
        return true;
    };

    const persistLocalData = () => {
        const atom = ATOM_OPTIONS.find(option => option.id === firstAtom);
        localStorage.setItem('studybud_username', name.trim());
        localStorage.setItem('studybud_role', role);
        localStorage.setItem('studybud_board', board);
        localStorage.setItem('studybud_grade', grade);
        localStorage.setItem('studybud_struggles', JSON.stringify(struggles));
        localStorage.setItem('studybud_intention', intention.trim());
        localStorage.setItem('studybud_learning_style', learningStyle);
        localStorage.setItem('studybud_fav_subjects', JSON.stringify(favTopics));
        localStorage.setItem('studybud_fav_topics', JSON.stringify(favTopics));
        localStorage.setItem('studybud_topic_type', role === 'Working professional' ? 'professions' : 'subjects');
        localStorage.setItem('studybud_productive_time', productiveTime);
        localStorage.setItem('studybud_motivation', motivation);
        if (atom) {
            localStorage.setItem('studybud_onboarding_atom', JSON.stringify({ id: atom.id, label: atom.label }));
        } else {
            localStorage.removeItem('studybud_onboarding_atom');
        }
    };

    const finishOnboarding = async () => {
        setIsSaving(true);
        try {
            const { data, error: sessionError } = await supabase.auth.getSession();
            const userId = data?.session?.user?.id;
            if (sessionError || !userId) {
                toast.error('Please sign in before saving your setup.');
                navigate('/login', { replace: true, state: { mode: 'login' } });
                return;
            }

            const { error } = await supabase.from('user_onboarding').upsert({
                user_id: userId,
                name: name.trim(),
                role,
                board,
                grade,
                struggles,
                learning_style: learningStyle,
                fav_topics: favTopics,
                topic_type: role === 'Working professional' ? 'professions' : 'subjects',
                first_atom: firstAtom || null,
                intention: intention.trim(),
                productive_time: productiveTime,
                motivation,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });

            if (error) throw error;

            persistLocalData();
            localStorage.setItem('studybud_onboarded_user_id', userId);
            localStorage.setItem('studybud_first_visit', 'true');
            localStorage.removeItem('studybud_onboarded');
            window.dispatchEvent(new CustomEvent('studybud-onboarded', { detail: { userId } }));
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Unable to save onboarding:', error);
            toast.error('We could not save your setup. Check your connection and try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const nextStep = async () => {
        if (!isStepValid() || isSaving) return;
        if (step < 4) {
            setStep(current => current + 1);
            return;
        }
        await finishOnboarding();
    };

    return (
        <div className={styles.onboardingRoot}>
            <div className={styles.glowTop} aria-hidden="true" />
            <div className={styles.glowBottom} aria-hidden="true" />

            <header className={styles.topBar}>
                <StudyBudLogo variant="onLight" size="md" stacked showTagline />
                <div className={styles.progressRow} aria-label={`Step ${step} of 4`}>
                    {[1, 2, 3, 4].map(index => (
                        <div
                            key={index}
                            className={`${styles.progressSeg} ${index <= step ? styles.progressSegActive : ''}`}
                        />
                    ))}
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.inner}>
                    {step === 1 && (
                        <section className="fade-in-up">
                            <p className="step-subtitle">STEP 1 OF 4 · YOUR PROFILE</p>
                            <h1 className="step-title">Let's make StudyBud yours.</h1>
                            <p className="step-subtitle">Just the basics. You can change them later.</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '2rem' }}>
                                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <span>Your name</span>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={event => setName(event.target.value)}
                                        placeholder="Enter your name"
                                        className="hitech-input"
                                        autoComplete="name"
                                        autoFocus
                                        required
                                    />
                                </label>
                                <div>
                                    <p style={{ marginBottom: '0.75rem' }}>Which best describes you?</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '0.75rem' }}>
                                        {['School student', 'College student', 'Self-learner', 'Working professional'].map(option => (
                                            <button
                                                key={option}
                                                type="button"
                                                onClick={() => setRole(option)}
                                                aria-pressed={role === option}
                                                className={`hitech-choice ${role === option ? 'selected' : ''}`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {step === 2 && (
                        <section className="fade-in-up">
                            <p className="step-subtitle">STEP 2 OF 4 · YOUR LEARNING WORLD</p>
                            <h1 className="step-title">{isSchoolStudent ? 'What are you studying?' : 'What do you want to work on?'}</h1>
                            <p className="step-subtitle">This helps StudyBud tailor techniques and practice to your subjects.</p>

                            {isSchoolStudent && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '1rem', marginTop: '1.75rem' }}>
                                    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <span>Board / curriculum</span>
                                        <select value={board} onChange={event => setBoard(event.target.value)} className="hitech-input" required>
                                            <option value="">Choose a board</option>
                                            {BOARDS.map(option => <option key={option} value={option}>{option}</option>)}
                                        </select>
                                    </label>
                                    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <span>Grade</span>
                                        <select value={grade} onChange={event => setGrade(event.target.value)} className="hitech-input" required>
                                            <option value="">Choose your grade</option>
                                            {GRADES.map(option => <option key={option} value={option}>{option}</option>)}
                                        </select>
                                    </label>
                                </div>
                            )}

                            <div style={{ marginTop: '1.75rem' }}>
                                <p style={{ marginBottom: '0.75rem' }}>Choose your subjects or areas</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    {topicList.map(topic => (
                                        <button
                                            key={topic}
                                            type="button"
                                            onClick={() => toggleValue(topic, setFavTopics)}
                                            aria-pressed={favTopics.includes(topic)}
                                            className={`hitech-pill ${favTopics.includes(topic) ? 'selected' : ''}`}
                                        >
                                            {topic}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {!isStepValid() && (
                                <p role="status" style={{ color: '#9a5a13', marginTop: '1rem' }}>
                                    {isSchoolStudent ? 'Choose your board, grade and at least one subject to continue.' : 'Choose at least one area to continue.'}
                                </p>
                            )}
                        </section>
                    )}

                    {step === 3 && (
                        <section className="fade-in-up">
                            <p className="step-subtitle">STEP 3 OF 4 · OPTIONAL PERSONALIZATION</p>
                            <h1 className="step-title">Where should Bud help first?</h1>
                            <p className="step-subtitle">Pick any challenges that sound familiar. This step is optional.</p>

                            <div style={{ marginTop: '1.5rem' }}>
                                <p style={{ marginBottom: '0.75rem' }}>What gets in your way?</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                                    {STRUGGLES.map(value => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => toggleValue(value, setStruggles)}
                                            aria-pressed={struggles.includes(value)}
                                            className={`hitech-pill ${struggles.includes(value) ? 'selected' : ''}`}
                                        >
                                            {value}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginTop: '1.5rem' }}>
                                <p style={{ marginBottom: '0.75rem' }}>How do you prefer to learn?</p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '0.75rem' }}>
                                    {LEARNING_STYLES.map(option => (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() => setLearningStyle(option.id)}
                                            aria-pressed={learningStyle === option.id}
                                            className={`hitech-box-choice ${learningStyle === option.id ? 'selected' : ''}`}
                                            style={{ textAlign: 'left' }}
                                        >
                                            <div style={{ fontWeight: 600 }}>{option.label}</div>
                                            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{option.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginTop: '1.5rem' }}>
                                <p style={{ marginBottom: '0.75rem' }}>One small habit to build (optional)</p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: '0.65rem' }}>
                                    {ATOM_OPTIONS.map(option => (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() => setFirstAtom(current => current === option.id ? '' : option.id)}
                                            aria-pressed={firstAtom === option.id}
                                            className={`hitech-choice ${firstAtom === option.id ? 'selected' : ''}`}
                                            style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}
                                        >
                                            {option.icon}<span>{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {step === 4 && (
                        <section className="fade-in-up">
                            <p className="step-subtitle">STEP 4 OF 4 · YOUR FIRST GOAL</p>
                            <h1 className="step-title">Start small. Build momentum.</h1>
                            <p className="step-subtitle">Set one goal if useful. Everything on this page is optional.</p>

                            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem' }}>
                                <span>What would make this week a success?</span>
                                <textarea
                                    value={intention}
                                    onChange={event => setIntention(event.target.value)}
                                    placeholder="For example, finish my chemistry revision."
                                    rows={3}
                                    className="hitech-input"
                                    style={{ resize: 'vertical' }}
                                />
                            </label>

                            <div style={{ marginTop: '1.5rem' }}>
                                <p style={{ marginBottom: '0.75rem' }}>When do you usually focus best?</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                                    {['Morning', 'Afternoon', 'Evening', 'It varies'].map(option => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => setProductiveTime(current => current === option ? '' : option)}
                                            aria-pressed={productiveTime === option}
                                            className={`hitech-pill ${productiveTime === option ? 'selected' : ''}`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginTop: '1.5rem' }}>
                                <p style={{ marginBottom: '0.75rem' }}>What motivates you?</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                                    {MOTIVATIONS.map(option => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => setMotivation(current => current === option ? '' : option)}
                                            aria-pressed={motivation === option}
                                            className={`hitech-pill ${motivation === option ? 'selected' : ''}`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    <div className={styles.navRow}>
                        {step > 1 ? (
                            <button type="button" onClick={() => setStep(current => current - 1)} className="nav-btn-back" disabled={isSaving}>
                                ← Back
                            </button>
                        ) : <span />}

                        <button
                            type="button"
                            onClick={nextStep}
                            disabled={!isStepValid() || isSaving}
                            className={`nav-btn-next ${isStepValid() && !isSaving ? 'active' : ''}`}
                        >
                            {isSaving ? 'Saving…' : step === 4 ? 'Finish setup' : 'Continue →'}
                        </button>
                    </div>
                    {step >= 3 && step < 4 && (
                        <p style={{ textAlign: 'center', fontSize: '0.9rem', marginTop: '1rem', opacity: 0.7 }}>
                            Optional — you can continue without answering these questions.
                        </p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default OnboardingSetup;
