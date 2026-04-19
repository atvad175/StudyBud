import React, { useState, useEffect } from 'react';
import { User, Palette, Shield, HardDrive, Download, AlertTriangle } from 'lucide-react';
import styles from './SettingsPage.module.css';

const SettingsPage = () => {
    // Section 1: Profile
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [nameChanged, setNameChanged] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState('');

    // Section 2: Appearance
    const [warmMode, setWarmMode] = useState(false);
    const [fontSize, setFontSize] = useState('Normal');
    const [nightLightIntensity, setNightLightIntensity] = useState(15); // 0 to 100 scale

    // Section 3: Account
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Section 4: Data
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [clearText, setClearText] = useState('');

    useEffect(() => {
        setName(localStorage.getItem('studybud_username') || '');
        setRole(localStorage.getItem('studybud_role') || '');
        setAvatarUrl(localStorage.getItem('studybud_avatar') || '');
        
        try {
            const settings = JSON.parse(localStorage.getItem('studybud_settings') || '{}');
            setWarmMode(!!settings.warmMode);
            if (settings.largeFont) {
                setFontSize('Large');
                document.documentElement.classList.add('font-large');
            }
            if (settings.nightLightIntensity !== undefined) {
                setNightLightIntensity(settings.nightLightIntensity);
                document.documentElement.style.setProperty('--night-light-intensity', settings.nightLightIntensity / 100);
            } else {
                // Default 15%
                document.documentElement.style.setProperty('--night-light-intensity', 0.15);
            }
        } catch(e){}
    }, []);

    const handleSaveProfile = () => {
        localStorage.setItem('studybud_username', name);
        localStorage.setItem('studybud_role', role);
        localStorage.setItem('studybud_avatar', avatarUrl);
        setNameChanged(false);
        // Dispatch event or just let it be for next load
    };

    const handleAppearanceChange = (key, value) => {
        let settings = {};
        try { settings = JSON.parse(localStorage.getItem('studybud_settings') || '{}'); } catch(e){}
        
        if (key === 'warmMode') {
            setWarmMode(value);
            settings.warmMode = value;
            if (value) {
                document.documentElement.classList.add('warm-mode');
            } else {
                document.documentElement.classList.remove('warm-mode');
            }
        }
        
        if (key === 'fontSize') {
            setFontSize(value);
            settings.largeFont = (value === 'Large');
            if (value === 'Large') {
                document.documentElement.classList.add('font-large');
            } else {
                document.documentElement.classList.remove('font-large');
            }
        }
        if (key === 'nightLightIntensity') {
            setNightLightIntensity(value);
            settings.nightLightIntensity = value;
            document.documentElement.style.setProperty('--night-light-intensity', value / 100);
        }
        
        localStorage.setItem('studybud_settings', JSON.stringify(settings));
    };

    const handleExport = () => {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('studybud_')) {
                data[key] = localStorage.getItem(key);
            }
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `studybud_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleClearData = () => {
        if (clearText !== 'DELETE') return;
        
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('studybud_')) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
        window.location.href = '/landing'; // Hard reload to clear state and redirect correctly
    };

    const getInitials = (n) => {
        if (!n) return 'S';
        return n.split(' ').map(w => w[0]).join('').substring(0,2).toUpperCase();
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1 className={styles.title}>Settings</h1>
                <p className={styles.subtitle}>Profile, appearance, and data — tuned to match the rest of StudyBud.</p>
            </header>

            <div className={styles.sections}>
                <section className={styles.section}>
                    <div className={styles.sectionHead}>
                        <User size={20} strokeWidth={1.75} />
                        <span>Profile</span>
                    </div>

                    <div className={styles.profileRow}>
                        <div className={styles.avatarWrap}>
                            <div className={styles.avatar}>
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    getInitials(name)
                                )}
                            </div>
                            <label className={styles.avatarBtn}>
                                <input
                                    type="file"
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setAvatarUrl(reader.result);
                                                setNameChanged(true);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                                +
                            </label>
                        </div>
                        <div className={styles.fields}>
                            <div>
                                <label className={styles.label}>Display name</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        setNameChanged(true);
                                    }}
                                />
                            </div>
                            <div>
                                <label className={styles.label}>I am a</label>
                                <select
                                    className={styles.select}
                                    value={role}
                                    onChange={(e) => {
                                        setRole(e.target.value);
                                        setNameChanged(true);
                                    }}
                                >
                                    <option value="" disabled>
                                        Select your path
                                    </option>
                                    <option value="School student">School student</option>
                                    <option value="College student">College student</option>
                                    <option value="Self-learner">Self-learner</option>
                                    <option value="Working professional">Working professional</option>
                                </select>
                            </div>
                            <div className={styles.actionsRight}>
                                <button
                                    type="button"
                                    className={styles.btnGold}
                                    onClick={handleSaveProfile}
                                    disabled={!nameChanged}
                                >
                                    Save changes
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className={`${styles.section} ${styles.sectionAccentGreen}`}>
                    <div className={styles.sectionHead}>
                        <Palette size={20} strokeWidth={1.75} />
                        <span>Appearance</span>
                    </div>

                    <div>
                        <div className={styles.rowBetween}>
                            <div className={styles.rowText}>
                                <strong>Warm mode</strong>
                                <span>Applies a warm tint across the interface to ease long sessions.</span>
                            </div>
                            <label className={styles.toggle}>
                                <input
                                    type="checkbox"
                                    checked={warmMode}
                                    onChange={(e) => handleAppearanceChange('warmMode', e.target.checked)}
                                />
                                <span className={styles.toggleSlider}>
                                    <span className={styles.toggleKnob} />
                                </span>
                            </label>
                        </div>

                        <div className={styles.rowBetween}>
                            <div className={styles.rowText} style={{ flex: '1 1 200px' }}>
                                <strong>Night light strength</strong>
                                <span>Fine-tune the overlay — same idea as system night light.</span>
                            </div>
                            <div className={styles.rangeRow}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Off</span>
                                <input
                                    type="range"
                                    min="0"
                                    max="60"
                                    value={nightLightIntensity}
                                    onChange={(e) =>
                                        handleAppearanceChange('nightLightIntensity', parseInt(e.target.value, 10))
                                    }
                                />
                                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Strong</span>
                            </div>
                        </div>

                        <div className={styles.rowBetween}>
                            <div className={styles.rowText}>
                                <strong>Font size</strong>
                                <span>Comfortable reading for different screens and distances.</span>
                            </div>
                            <div className={styles.pillGroup}>
                                <button
                                    type="button"
                                    className={`${styles.pill} ${fontSize === 'Normal' ? styles.pillActive : ''}`}
                                    onClick={() => handleAppearanceChange('fontSize', 'Normal')}
                                >
                                    Normal
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.pill} ${fontSize === 'Large' ? styles.pillActive : ''}`}
                                    onClick={() => handleAppearanceChange('fontSize', 'Large')}
                                >
                                    Large
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className={`${styles.section} ${styles.sectionAccentBlue}`}>
                    <div className={styles.sectionHead}>
                        <Shield size={20} strokeWidth={1.75} />
                        <span>Account &amp; app</span>
                    </div>

                    <div>
                        <div className={styles.rowBetween}>
                            <div className={styles.rowText}>
                                <strong>Push notifications</strong>
                                <span>Gentle nudges for habits — when the browser supports them.</span>
                            </div>
                            <label className={styles.toggle}>
                                <input type="checkbox" defaultChecked readOnly />
                                <span className={styles.toggleSlider}>
                                    <span className={styles.toggleKnob} />
                                </span>
                            </label>
                        </div>

                        <div className={styles.rowBetween}>
                            <div className={styles.rowText}>
                                <strong>Sound effects</strong>
                                <span>Short feedback sounds for completions (where implemented).</span>
                            </div>
                            <label className={styles.toggle}>
                                <input type="checkbox" defaultChecked readOnly />
                                <span className={styles.toggleSlider}>
                                    <span className={styles.toggleKnob} />
                                </span>
                            </label>
                        </div>

                        <div style={{ marginTop: '1rem' }}>
                            <label className={styles.label}>Email</label>
                            <input
                                type="text"
                                className={styles.readonlyInput}
                                readOnly
                                placeholder="Shown when you sign in with email or OAuth"
                            />
                        </div>

                        <div className={styles.cardInset}>
                            <div className={styles.label} style={{ marginBottom: '0.75rem' }}>
                                Change password
                            </div>
                            <div className={styles.grid2}>
                                <input
                                    type="password"
                                    className={styles.input}
                                    placeholder="New password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <input
                                    type="password"
                                    className={styles.input}
                                    placeholder="Confirm password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                            <div className={styles.actionsRight} style={{ marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    className={styles.btnDark}
                                    disabled={!password || password !== confirmPassword}
                                >
                                    Update password
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className={`${styles.section} ${styles.sectionAccentRose}`}>
                    <div className={styles.sectionHead}>
                        <HardDrive size={20} strokeWidth={1.75} />
                        <span>Data &amp; privacy</span>
                    </div>

                    <div className={styles.dataStack}>
                        <div className={styles.dataCard}>
                            <div className={styles.rowText}>
                                <strong>Export your data</strong>
                                <span>Download a JSON backup of everything saved locally for StudyBud.</span>
                            </div>
                            <button type="button" className={styles.btnOutline} onClick={handleExport}>
                                <Download size={16} strokeWidth={2} aria-hidden />
                                Export my data
                            </button>
                        </div>

                        <div className={styles.dangerCard}>
                            <div>
                                <div className={styles.dangerTitle}>
                                    <AlertTriangle size={16} strokeWidth={2} aria-hidden />
                                    Danger zone
                                </div>
                                <p className={styles.dangerDesc}>
                                    Permanently remove all local StudyBud data and return to the landing experience.
                                </p>
                            </div>

                            {!showClearConfirm ? (
                                <button
                                    type="button"
                                    className={styles.btnDangerOutline}
                                    onClick={() => setShowClearConfirm(true)}
                                >
                                    Clear all data
                                </button>
                            ) : (
                                <div className={styles.confirmRow}>
                                    <input
                                        type="text"
                                        className={styles.confirmInput}
                                        placeholder="Type DELETE"
                                        value={clearText}
                                        onChange={(e) => setClearText(e.target.value)}
                                        aria-label="Type DELETE to confirm"
                                    />
                                    <button
                                        type="button"
                                        className={styles.btnDangerFill}
                                        onClick={handleClearData}
                                        disabled={clearText !== 'DELETE'}
                                    >
                                        Confirm
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.btnLink}
                                        onClick={() => {
                                            setShowClearConfirm(false);
                                            setClearText('');
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
            
            <style>{`
                :root.font-large {
                    font-size: 18px; /* Base was 16px */
                }
            `}</style>
        </div>
    );
};

export default SettingsPage;
