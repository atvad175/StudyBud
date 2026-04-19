import React, { useState } from 'react';
import styles from '../MindShared.module.css';
import { Star, Heart, PenTool, Calendar, Award, BookOpen } from 'lucide-react';
import { useMind } from '../../../context/MindContext';

const GrowthEngine = () => {
    const { addWin, wins = [] } = useMind();
    const [activeTab, setActiveTab] = useState('wins'); // wins, gratitude, journal

    // Local state for forms
    const [winInput, setWinInput] = useState('');
    const [gratitudeInput, setGratitudeInput] = useState('');
    const [journalInput, setJournalInput] = useState('');

    const handleWinSubmit = (e) => {
        e.preventDefault();
        if (!winInput.trim()) return;
        addWin({ type: 'win', content: winInput, date: new Date().toISOString() });
        setWinInput('');
    };

    const handleGratitudeSubmit = (e) => {
        e.preventDefault();
        if (!gratitudeInput.trim()) return;
        addWin({ type: 'gratitude', content: gratitudeInput, date: new Date().toISOString() });
        setGratitudeInput('');
    };

    const handleJournalSubmit = (e) => {
        e.preventDefault();
        if (!journalInput.trim()) return;
        addWin({ type: 'journal', content: journalInput, date: new Date().toISOString() });
        setJournalInput('');
    };

    const filterEntries = (type) => wins.filter(w => w.type === type);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <span className={styles.breadcrumb}>Mind / Wins</span>
                    <h1>Daily Wins</h1>
                    <p style={{ color: '#666' }}>Celebrate your progress, no matter how small. Every win counts!</p>
                </div>
                <div style={statsPill}>
                    <Award size={16} color="var(--color-gold)" />
                    <span>{wins.length} Successes Logged</span>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem', height: 'calc(100vh - 200px)' }}>
                {/* Sidebar Navigation */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button
                        onClick={() => setActiveTab('wins')}
                        style={activeTab === 'wins' ? activeNavBtn : navBtn}
                    >
                        <div style={iconBox(activeTab === 'wins' ? '#f1c40f' : '#ccc')}>
                            <Star size={18} color="white" fill="white" />
                        </div>
                        <div>
                            <span style={{ display: 'block', fontWeight: '600', fontSize: '1rem' }}>My Wins</span>
                            <span style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7 }}>Track your victories</span>
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveTab('gratitude')}
                        style={activeTab === 'gratitude' ? activeNavBtn : navBtn}
                    >
                        <div style={iconBox(activeTab === 'gratitude' ? '#e17055' : '#ccc')}>
                            <Heart size={18} color="white" fill="white" />
                        </div>
                        <div>
                            <span style={{ display: 'block', fontWeight: '600', fontSize: '1rem' }}>Gratitude</span>
                            <span style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7 }}>What went well?</span>
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveTab('journal')}
                        style={activeTab === 'journal' ? activeNavBtn : navBtn}
                    >
                        <div style={iconBox(activeTab === 'journal' ? '#0984e3' : '#ccc')}>
                            <BookOpen size={18} color="white" />
                        </div>
                        <div>
                            <span style={{ display: 'block', fontWeight: '600', fontSize: '1rem' }}>Journal</span>
                            <span style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7 }}>Write your thoughts</span>
                        </div>
                    </button>
                </div>

                {/* Main Content Area */}
                <div style={{ background: 'white', borderRadius: '32px', padding: '2.5rem', boxShadow: 'var(--shadow-soft)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                    {/* WINS TAB */}
                    {activeTab === 'wins' && (
                        <div style={tabContent}>
                            <h2 style={sectionTitle}>What was your biggest win today?</h2>
                            <form onSubmit={handleWinSubmit} style={{ marginBottom: '2rem' }}>
                                <div style={inputWrapper}>
                                    <input
                                        type="text"
                                        placeholder="E.g. I finished my math homework early!"
                                        value={winInput}
                                        onChange={e => setWinInput(e.target.value)}
                                        style={textInput}
                                    />
                                    <button type="submit" style={submitBtn}>Log Win</button>
                                </div>
                            </form>
                            <div style={feed}>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: '#444' }}>Previous Wins</h3>
                                {filterEntries('win').map((entry, i) => (
                                    <div key={i} style={entryCard('#f1c40f')}>
                                        <p>{entry.content}</p>
                                        <span style={dateStamp}>{new Date(entry.date).toLocaleDateString()}</span>
                                    </div>
                                ))}
                                {filterEntries('win').length === 0 && <EmptyState msg="No wins logged yet. Start celebrating your progress!" />}
                            </div>
                        </div>
                    )}

                    {/* GRATITUDE TAB */}
                    {activeTab === 'gratitude' && (
                        <div style={tabContent}>
                            <h2 style={sectionTitle}>What are you thankful for?</h2>
                            <form onSubmit={handleGratitudeSubmit} style={{ marginBottom: '2rem' }}>
                                <div style={inputWrapper}>
                                    <input
                                        type="text"
                                        placeholder="E.g. A good talk with a friend..."
                                        value={gratitudeInput}
                                        onChange={e => setGratitudeInput(e.target.value)}
                                        style={textInput}
                                    />
                                    <button type="submit" style={submitBtn}>Save</button>
                                </div>
                            </form>
                            <div style={feed}>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: '#444' }}>Previous Gratitude</h3>
                                {filterEntries('gratitude').map((entry, i) => (
                                    <div key={i} style={entryCard('#e17055')}>
                                        <p>{entry.content}</p>
                                        <span style={dateStamp}>{new Date(entry.date).toLocaleDateString()}</span>
                                    </div>
                                ))}
                                {filterEntries('gratitude').length === 0 && <EmptyState msg="Gratitude helps you focus on the positive things in life." />}
                            </div>
                        </div>
                    )}

                    {/* JOURNAL TAB */}
                    {activeTab === 'journal' && (
                        <div style={tabContent}>
                            <h2 style={sectionTitle}>Write down your thoughts.</h2>
                            <form onSubmit={handleJournalSubmit} style={{ marginBottom: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <textarea
                                    placeholder="Start writing your thoughts here..."
                                    value={journalInput}
                                    onChange={e => setJournalInput(e.target.value)}
                                    style={textArea}
                                />
                                <button type="submit" style={{ ...submitBtn, alignSelf: 'flex-end', marginTop: '1rem', width: 'auto', padding: '0.8rem 2rem' }}>Save Entry</button>
                            </form>
                            <div style={{ ...feed, flex: 1, borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: '#444' }}>Previous Entries</h3>
                                {filterEntries('journal').map((entry, i) => (
                                    <div key={i} style={entryCard('#0984e3')}>
                                        <p style={{ whiteSpace: 'pre-wrap' }}>{entry.content}</p>
                                        <span style={dateStamp}>{new Date(entry.date).toLocaleDateString()}</span>
                                    </div>
                                ))}
                                {filterEntries('journal').length === 0 && <EmptyState msg="No journal entries yet. Start writing to clear your mind." />}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

const EmptyState = ({ msg }) => (
    <div style={{ textAlign: 'center', padding: '3rem', color: '#ccc', border: '2px dashed #eee', borderRadius: '16px' }}>
        {msg}
    </div>
)

// Styles using objects for simplicity in single-file component
const navBtn = {
    display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
    background: 'transparent', border: 'none', borderRadius: '16px',
    cursor: 'pointer', textAlign: 'left', color: '#888', transition: 'all 0.2s'
};

const activeNavBtn = {
    ...navBtn, background: 'white', boxShadow: 'var(--shadow-soft)', color: 'var(--color-soft-black)'
};

const iconBox = (color) => ({
    width: '40px', height: '40px', borderRadius: '12px', background: color,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
});

const statsPill = {
    background: 'white', padding: '0.5rem 1rem', borderRadius: '100px',
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    fontSize: '0.9rem', fontWeight: '600', boxShadow: 'var(--shadow-soft)'
};

const tabContent = { display: 'flex', flexDirection: 'column', height: '100%' };
const sectionTitle = { fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--color-soft-black)' };

const inputWrapper = { display: 'flex', gap: '1rem', background: '#f8f9fa', padding: '0.5rem', borderRadius: '16px', paddingLeft: '1.5rem' };
const textInput = { border: 'none', background: 'transparent', fontSize: '1.1rem', flex: 1, outline: 'none' };
const textArea = { border: '1px solid #eee', background: '#f8f9fa', fontSize: '1.1rem', padding: '1.5rem', borderRadius: '20px', flex: 1, outline: 'none', resize: 'none', fontFamily: 'var(--font-sans)' };

const submitBtn = { background: 'var(--color-soft-black)', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' };

const feed = { overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem' };
const entryCard = (color) => ({ background: 'white', padding: '1.5rem', borderRadius: '20px', borderLeft: `4px solid ${color}`, border: '1px solid #f0f0f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' });
const dateStamp = { display: 'block', fontSize: '0.75rem', color: '#ccc', marginTop: '0.5rem', textAlign: 'right' };

export default GrowthEngine;
