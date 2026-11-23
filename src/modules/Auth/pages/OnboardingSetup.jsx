import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Sun, BookOpen, Activity, Wind, CheckSquare, Moon, Zap } from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import StudyBudLogo from '../../../components/brand/StudyBudLogo';
import { useToast } from '../../../context/useToast';
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

const ROLES = [
    { label: 'School student', hint: 'Board and grade' },
    { label: 'College student', hint: 'Subjects and exams' },
    { label: 'Self-learner', hint: 'Your own path' },
    { label: 'Working professional', hint: 'Career skills' },
];

const STEPS = [
    { title: 'Your profile', hint: 'Name and role' },
    { title: 'Learning world', hint: 'Board and subjects' },
    { title: 'How Bud helps', hint: 'Optional' },
    { title: 'First goal', hint: 'Optional' },
];

const ATOM_OPTIONS = [
    { id: 'early', label: 'Wake up early', icon: <Sun size={18} />, category: 'health', fissionEntry: 'Set your alarm and place your feet on the floor when it rings.' },
    { id: 'read', label: 'Read 20 minutes', icon: <BookOpen size={18} />, category: 'study', fissionEntry: 'Open your book and read one page.' },
    { id: 'nophone', label: 'Phone-free first hour', icon: <Activity size={18} />, category: 'mind', fissionEntry: 'Put your phone out of reach for the next two minutes.' },
    { id: 'exercise', label: 'Exercise', icon: <Zap size={18} />, category: 'health', fissionEntry: 'Do two minutes of comfortable movement.' },
    { id: 'meditate', label: 'Meditate', icon: <Wind size={18} />, category: 'mind', fissionEntry: 'Sit comfortably and take five slow, natural breaths.' },
    { id: 'plan', label: 'Plan the day', icon: <CheckSquare size={18} />, category: 'study', fissionEntry: 'Write down the single most important task for today.' },
    { id: 'sleep11', label: 'Consistent sleep time', icon: <Moon size={18} />, category: 'health', fissionEntry: 'Choose a realistic wind-down time for tonight.' },
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

    const createStarterHabit = async (userId) => {
        const starter = ATOM_OPTIONS.find(option => option.id === firstAtom);
        if (!starter) return;

        // Do not create duplicate starter habits when setup is retried or revisited.
        const { data: existing, error: lookupError } = await supabase
            .from('atoms')
            .select('id')
            .eq('user_id', userId)
            .eq('title', starter.label)
            .limit(1)
            .maybeSingle();
        if (lookupError) throw lookupError;
        if (existing) return;

        const { data: createdHabit, error } = await supabase
            .from('atoms')
            .insert({
                user_id: userId,
                title: starter.label,
                frequency: 'daily',
                category: starter.category,
                fission_entry: starter.fissionEntry,
            })
            .select()
            .single();
        if (error) throw error;

        window.dispatchEvent(new CustomEvent('studybud-starter-habit-created', {
            detail: { userId, habit: createdHabit },
        }));
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

            // The starter habit is optional: profile setup should still complete if
            // the separate Habits write fails, but the student must be told clearly.
            try {
                await createStarterHabit(userId);
            } catch (habitError) {
                console.warn('Starter habit was not saved:', habitError?.code || 'unknown');
                toast.info('Your setup was saved, but the starter habit could not be added. You can create it later from Habits.');
            }

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

    const steps = [
        {
            title: 'Your profile',
            eyebrow: 'Step 1 of 4',
            heading: 'Let’s make StudyBud yours.',
            lede: 'Two details, then your space is ready. You can change both later.',
            body: (
                <>
                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>Your name</span>
                        <input
                            type="text"
                            value={name}
                            onChange={event => setName(event.target.value)}
                            placeholder="What should Bud call you?"
                            className={styles.input}
                            autoComplete="name"
                            autoFocus
                            required
                        />
                    </label>

                    <div className={styles.group}>
                        <p className={styles.groupLabel}>Which best describes you?</p>
                        <div className={styles.roleGrid}>
                            {ROLES.map(option => (
                                <button
                                    key={option.label}
                                    type="button"
                                    onClick={() => {
                                        setRole(option.label);
                                        if (option.label !== 'School student') {
                                            setBoard('');
                                            setGrade('');
                                        }
                                    }}
                                    aria-pressed={role === option.label}
                                    className={`${styles.roleCard} ${role === option.label ? styles.selected : ''}`}
                                >
                                    <span className={styles.roleLabel}>{option.label}</span>
                                    <span className={styles.roleHint}>{option.hint}</span>
                                    <span className={styles.tick} aria-hidden="true">
                                        {role === option.label && <Check size={11} strokeWidth={3} />}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            ),
        },
        {
            title: 'Learning world',
            eyebrow: 'Step 2 of 4',
            heading: isSchoolStudent ? 'What are you studying?' : 'What do you want to work on?',
            lede: 'This is what StudyBud tailors your techniques, practice and revision around.',
            body: (
                <>
                    {isSchoolStudent && (
                        <div className={styles.twoCol}>
                            <label className={styles.field}>
                                <span className={styles.fieldLabel}>Board / curriculum</span>
                                <select
                                    value={board}
                                    onChange={event => setBoard(event.target.value)}
                                    className={styles.select}
                                    required
                                >
                                    <option value="">Choose a board</option>
                                    {BOARDS.map(option => <option key={option} value={option}>{option}</option>)}
                                </select>
                            </label>
                            <label className={styles.field}>
                                <span className={styles.fieldLabel}>Grade</span>
                                <select
                                    value={grade}
                                    onChange={event => setGrade(event.target.value)}
                                    className={styles.select}
                                    required
                                >
                                    <option value="">Choose your grade</option>
                                    {GRADES.map(option => <option key={option} value={option}>{option}</option>)}
                                </select>
                            </label>
                        </div>
                    )}

                    <div className={styles.group}>
                        <div className={styles.groupHead}>
                            <p className={styles.groupLabel}>
                                {isSchoolStudent ? 'Your subjects' : 'Your areas'}
                            </p>
                            <span className={styles.counter}>
                                {favTopics.length ? `${favTopics.length} selected` : 'Pick at least one'}
                            </span>
                        </div>
                        <div className={styles.pills}>
                            {topicList.map(topic => (
                                <button
                                    key={topic}
                                    type="button"
                                    onClick={() => toggleValue(topic, setFavTopics)}
                                    aria-pressed={favTopics.includes(topic)}
                                    className={`${styles.pill} ${favTopics.includes(topic) ? styles.pillSelected : ''}`}
                                >
                                    {favTopics.includes(topic) && <Check size={13} strokeWidth={2.6} aria-hidden="true" />}
                                    {topic}
                                </button>
                            ))}
                        </div>
                    </div>

                    {!isStepValid() && (
                        <p role="status" className={styles.noteError}>
                            {isSchoolStudent
                                ? 'Choose your board, grade and at least one subject to continue.'
                                : 'Choose at least one area to continue.'}
                        </p>
                    )}
                </>
            ),
        },
        {
            title: 'How Bud helps',
            eyebrow: 'Step 3 of 4 · Optional',
            heading: 'Where should Bud help first?',
            lede: 'Pick whatever sounds familiar. Nothing here is required — you can skip it.',
            body: (
                <>
                    <div className={styles.group}>
                        <p className={styles.groupLabel}>What gets in your way?</p>
                        <div className={styles.pills}>
                            {STRUGGLES.map(value => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => toggleValue(value, setStruggles)}
                                    aria-pressed={struggles.includes(value)}
                                    className={`${styles.pill} ${struggles.includes(value) ? styles.pillSelected : ''}`}
                                >
                                    {struggles.includes(value) && <Check size={13} strokeWidth={2.6} aria-hidden="true" />}
                                    {value}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.group}>
                        <p className={styles.groupLabel}>How do you prefer to learn?</p>
                        <div className={styles.cardGrid}>
                            {LEARNING_STYLES.map(option => (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => setLearningStyle(option.id)}
                                    aria-pressed={learningStyle === option.id}
                                    className={`${styles.optionCard} ${learningStyle === option.id ? styles.selected : ''}`}
                                >
                                    <span className={styles.optionTitle}>{option.label}</span>
                                    <span className={styles.optionDesc}>{option.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.group}>
                        <div className={styles.groupHead}>
                            <p className={styles.groupLabel}>One small habit to start with</p>
                            <span className={styles.counter}>Optional</span>
                        </div>
                        <div className={styles.chipGrid}>
                            {ATOM_OPTIONS.map(option => (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => setFirstAtom(current => current === option.id ? '' : option.id)}
                                    aria-pressed={firstAtom === option.id}
                                    className={`${styles.chip} ${firstAtom === option.id ? styles.selected : ''}`}
                                >
                                    <span className={styles.chipIcon} aria-hidden="true">{option.icon}</span>
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            ),
        },
        {
            title: 'First goal',
            eyebrow: 'Step 4 of 4 · Optional',
            heading: 'Start small. Build momentum.',
            lede: 'One sentence about this week is enough. Every field on this step is optional.',
            body: (
                <>
                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>What would make this week a success?</span>
                        <textarea
                            value={intention}
                            onChange={event => setIntention(event.target.value)}
                            placeholder="For example, finish my chemistry revision."
                            rows={3}
                            className={styles.textarea}
                        />
                    </label>

                    <div className={styles.group}>
                        <p className={styles.groupLabel}>When do you usually focus best?</p>
                        <div className={styles.pills}>
                            {['Morning', 'Afternoon', 'Evening', 'It varies'].map(option => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => setProductiveTime(current => current === option ? '' : option)}
                                    aria-pressed={productiveTime === option}
                                    className={`${styles.pill} ${productiveTime === option ? styles.pillSelected : ''}`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.group}>
                        <p className={styles.groupLabel}>What motivates you?</p>
                        <div className={styles.pills}>
                            {MOTIVATIONS.map(option => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => setMotivation(current => current === option ? '' : option)}
                                    aria-pressed={motivation === option}
                                    className={`${styles.pill} ${motivation === option ? styles.pillSelected : ''}`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            ),
        },
    ][step - 1];

    return (
        <div className={styles.root}>
            <div className={styles.glowTop} aria-hidden="true" />
            <div className={styles.glowBottom} aria-hidden="true" />

            <header className={styles.mobileHeader}>
                <StudyBudLogo variant="onLight" size="sm" />
                <span className={styles.mobileStep}>{step} / 4</span>
            </header>

            <div className={styles.shell}>
                <aside className={styles.rail}>
                    <div>
                        <StudyBudLogo variant="onLight" size="md" stacked showTagline />
                    </div>

                    <ol className={styles.stepList} aria-label={`Step ${step} of 4`}>
                        {STEPS.map((item, index) => {
                            const number = index + 1;
                            const state = number < step
                                ? styles.stepDone
                                : number === step ? styles.stepCurrent : '';
                            return (
                                <li
                                    key={item.title}
                                    className={`${styles.stepItem} ${state}`}
                                    aria-current={number === step ? 'step' : undefined}
                                >
                                    <span className={styles.stepNumber} aria-hidden="true">
                                        {number < step ? <Check size={12} strokeWidth={3} /> : number}
                                    </span>
                                    <span className={styles.stepText}>
                                        <span className={styles.stepLabel}>{item.title}</span>
                                        <span className={styles.stepHint}>{item.hint}</span>
                                    </span>
                                </li>
                            );
                        })}
                    </ol>

                    <p className={styles.railNote}>
                        Everything here can be changed later from your profile. Nothing is locked in.
                    </p>
                </aside>

                <main className={styles.panel}>
                    <div className={styles.panelHead}>
                        <p className={styles.eyebrow}>{steps.eyebrow}</p>
                        <h1 className={styles.title}>{steps.heading}</h1>
                        <p className={styles.lede}>{steps.lede}</p>
                    </div>

                    <div key={step} className={styles.body}>
                        {steps.body}
                    </div>

                    <div className={styles.navRow}>
                        {step > 1 ? (
                            <button
                                type="button"
                                onClick={() => setStep(current => current - 1)}
                                className={styles.backBtn}
                                disabled={isSaving}
                            >
                                Back
                            </button>
                        ) : <span />}

                        <div className={styles.navRight}>
                            <span className={styles.stepCount}>
                                {String(step).padStart(2, '0')} <span>/ 04</span>
                            </span>
                            <button
                                type="button"
                                onClick={nextStep}
                                disabled={!isStepValid() || isSaving}
                                className={`${styles.nextBtn} ${isStepValid() && !isSaving ? styles.nextBtnActive : ''}`}
                            >
                                {isSaving ? 'Saving…' : step === 4 ? 'Finish setup' : 'Continue'}
                                {!isSaving && step < 4 && <span aria-hidden="true">→</span>}
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default OnboardingSetup;
