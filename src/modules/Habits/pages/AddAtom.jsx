import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHabits } from '../../../context/HabitsContext';
import { ArrowLeft, Check, Clock } from 'lucide-react';
import styles from './AddAtom.module.css';

const TIME_OPTIONS = [
    { value: '', label: 'Select a time...' },
    { value: 'Early Morning (5–7 AM)', label: '🌅 Early Morning (5–7 AM)' },
    { value: 'Morning (7–9 AM)', label: '☀️ Morning (7–9 AM)' },
    { value: 'Mid-Morning (9–11 AM)', label: '🕙 Mid-Morning (9–11 AM)' },
    { value: 'Midday (11 AM–1 PM)', label: '🕛 Midday (11 AM–1 PM)' },
    { value: 'Afternoon (1–4 PM)', label: '🌤 Afternoon (1–4 PM)' },
    { value: 'Evening (4–7 PM)', label: '🌇 Evening (4–7 PM)' },
    { value: 'Night (7–10 PM)', label: '🌙 Night (7–10 PM)' },
    { value: 'Late Night (10 PM+)', label: '🌃 Late Night (10 PM+)' },
    { value: 'Anytime', label: '✨ Anytime — flexible' },
];

const DURATION_OPTIONS = [
    { value: '', label: 'Select duration...' },
    { value: '5 min', label: '5 minutes' },
    { value: '10 min', label: '10 minutes' },
    { value: '15 min', label: '15 minutes' },
    { value: '20 min', label: '20 minutes' },
    { value: '30 min', label: '30 minutes' },
    { value: '45 min', label: '45 minutes' },
    { value: '1 hr', label: '1 hour' },
    { value: '1.5 hr', label: '1.5 hours' },
    { value: '2 hr', label: '2 hours' },
];

const AddAtom = () => {
    const navigate = useNavigate();
    const { addAtom } = useHabits();
    const [formData, setFormData] = useState({
        title: '',
        time: '',
        duration: '',
        fission_entry: '',
        notes: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title.trim()) return;
        const durationStr = formData.duration ? formData.duration + ' min' : '';
        const combinedTime = [formData.time, durationStr].filter(Boolean).join(' · ');
        addAtom({ ...formData, time: combinedTime });
        navigate('/habits/track');
    };

    const selectStyle = {
        width: '100%',
        padding: '0.8rem 1rem',
        borderRadius: '12px',
        border: '1px solid rgba(0,0,0,0.08)',
        fontFamily: 'inherit',
        fontSize: '1rem',
        backgroundColor: '#FAFAF9',
        color: '#1a1a1a',
        appearance: 'none',
        cursor: 'pointer',
        outline: 'none',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23999\' d=\'M6 8L1 3h10z\'/%3E%3C/svg%3E")',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 1rem center',
        paddingRight: '2.5rem'
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button className={styles.backButton} onClick={() => navigate('/habits')}>
                    <ArrowLeft size={24} />
                </button>
                <h2>Create New Atom</h2>
            </header>

            <div className={styles.card}>
                <form onSubmit={handleSubmit} className={styles.form}>

                    <div className={styles.field}>
                        <label>Describe what the habit is</label>
                        <div className={styles.inputWrapper}>
                            <input
                                type="text"
                                name="title"
                                placeholder="e.g. Morning Physics Study"
                                value={formData.title}
                                onChange={handleChange}
                                autoFocus
                                autoComplete="off"
                            />
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label>What's the entry-point action? (The one step that starts it)</label>
                        <div className={styles.inputWrapper}>
                            <input
                                type="text"
                                name="fission_entry"
                                placeholder="e.g. Open the textbook to page 1"
                                value={formData.fission_entry}
                                onChange={handleChange}
                                autoComplete="off"
                            />
                        </div>
                        <p className={styles.helperText}>Make it tiny. Impossible to fail.</p>
                    </div>

                    <div className={styles.field}>
                        <label><Clock size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />When do you do this habit?</label>
                        <div className={styles.inputWrapper}>
                            <select name="time" value={formData.time} onChange={handleChange} style={selectStyle}>
                                {TIME_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label>How many minutes does it take?</label>
                        <div className={styles.inputWrapper}>
                            <input
                                type="number"
                                name="duration"
                                placeholder="e.g. 15"
                                value={formData.duration}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '0.8rem 1rem',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(0,0,0,0.08)',
                                    fontFamily: 'inherit',
                                    fontSize: '1rem',
                                    backgroundColor: '#FAFAF9',
                                    color: '#1a1a1a',
                                    outline: 'none'
                                }}
                                min="1"
                                autoComplete="off"
                            />
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label>Reward or extra notes</label>
                        <div className={styles.inputWrapper}>
                            <input
                                type="text"
                                name="notes"
                                placeholder="e.g. Reward: A piece of dark chocolate"
                                value={formData.notes}
                                onChange={handleChange}
                                autoComplete="off"
                            />
                        </div>
                    </div>

                    <button type="submit" className={styles.submitButton} disabled={!formData.title.trim()}>
                        <span>Create Atom</span>
                        <Check size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddAtom;
