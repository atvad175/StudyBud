import React, { useState } from 'react';
import styles from '../MindShared.module.css';
import { Archive, Trash2, Box, ArrowRight } from 'lucide-react';
import { useMind } from '../../../context/MindContext';

const BUCKETS = ['Worry', 'Conflict', 'Conversation', 'Regret'];

const CognitiveOffload = () => {
    const { offloadItems = [], addOffloadItem, deleteOffloadItem } = useMind(); // Default to empty array
    const [newItem, setNewItem] = useState('');

    const handleOffload = (e) => {
        e.preventDefault();
        if (!newItem.trim()) return;
        addOffloadItem({ content: newItem, bucket_category: 'Inbox' });
        setNewItem('');
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <span className={styles.breadcrumb}>Mind / Brain Dump</span>
                    <h1>Brain Dump</h1>
                    <p style={{ color: '#666', marginTop: '0.5rem', lineHeight: '1.6', maxWidth: '800px' }}>
                        When your head feels full of worries or random thoughts, it's hard to focus. Use this space to dump everything that's on your mind. Once it's written down, your brain can stop looping over it, leaving you with more energy to study and reach your goals.
                    </p>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem' }}>
                {/* Input Zone */}
                <div style={{ background: 'white', padding: '2.5rem', borderRadius: '32px', height: 'fit-content', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.4rem', fontFamily: 'var(--font-serif)' }}>
                        <Archive size={24} color="#6c5ce7" />
                        Clear Your Mind
                    </h3>
                    <form onSubmit={handleOffload}>
                        <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.9rem', fontWeight: '700', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em' }}>What's on your mind?</label>
                        <textarea
                            className={styles.mainInput}
                            rows={6}
                            placeholder="Type anything that's bothering you or that you need to remember later..."
                            value={newItem}
                            onChange={e => setNewItem(e.target.value)}
                            style={{ width: '100%', marginBottom: '1.5rem', border: '1px solid #eee', borderRadius: '16px' }}
                        />
                        <button type="submit" className={styles.sendBtn} style={{ width: '100%', borderRadius: '16px', padding: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>
                            Dump Thought & Focus
                        </button>
                    </form>
                </div>

                {/* Thoughts List */}
                <div>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '1.5rem' }}>Offloaded Thoughts</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {offloadItems.length === 0 && (
                            <div style={{ padding: '3rem', textAlign: 'center', background: '#f8f9fa', borderRadius: '24px', color: '#999' }}>
                                <Box size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                <p>Your mind is clear. No offloaded thoughts yet.</p>
                            </div>
                        )}
                        {offloadItems.map(item => (
                            <div key={item.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.03)' }}>
                                <div style={{ fontSize: '1.05rem', color: '#444', lineHeight: '1.5' }}>
                                    {item.content}
                                </div>
                                <button 
                                    onClick={() => deleteOffloadItem && deleteOffloadItem(item.id)} 
                                    style={{ background: 'none', border: 'none', color: '#ff7675', cursor: 'pointer', padding: '8px', opacity: 0.6, transition: 'opacity 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                    onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CognitiveOffload;
