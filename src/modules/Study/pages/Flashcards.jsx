import React, { useState, useEffect } from 'react';
import { Layers, Plus, BookOpen, Clock, ChevronLeft, Check, X } from 'lucide-react';

const Flashcards = () => {
    const [data, setData] = useState({ decks: [], cards: [] });
    const [viewMode, setViewMode] = useState('DECKS'); // DECKS, DECK_VIEW, STUDY
    const [activeDeckId, setActiveDeckId] = useState(null);

    // Modals & Inputs
    const [showNewDeck, setShowNewDeck] = useState(false);
    const [newDeckName, setNewDeckName] = useState('');
    const [newDeckSubject, setNewDeckSubject] = useState('');

    const [showNewCard, setShowNewCard] = useState(false);
    const [newCardFront, setNewCardFront] = useState('');
    const [newCardBack, setNewCardBack] = useState('');

    // Study Mode
    const [studyQueue, setStudyQueue] = useState([]);
    const [currentStudyIndex, setCurrentStudyIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('studybud_flashcards');
        if (stored) {
            setData(JSON.parse(stored));
        } else {
            setData({ decks: [], cards: [] });
        }
    }, []);

    const saveData = (newData) => {
        setData(newData);
        localStorage.setItem('studybud_flashcards', JSON.stringify(newData));
    };

    // --- DECKS ---
    const handleCreateDeck = () => {
        if (!newDeckName || !newDeckSubject) return;
        const newDeck = {
            id: Date.now().toString(),
            name: newDeckName,
            subject: newDeckSubject,
            last_reviewed: null
        };
        saveData({ ...data, decks: [...data.decks, newDeck] });
        setShowNewDeck(false);
        setNewDeckName('');
        setNewDeckSubject('');
    };

    const getDueCardsCount = (deckId) => {
        const now = new Date();
        return data.cards.filter(c => c.deckId === deckId && (!c.next_review_date || new Date(c.next_review_date) <= now)).length;
    };

    const getTotalCardsCount = (deckId) => {
        return data.cards.filter(c => c.deckId === deckId).length;
    };

    // --- DECK_VIEW ---
    const handleOpenDeck = (deckId) => {
        setActiveDeckId(deckId);
        setViewMode('DECK_VIEW');
    };

    const handleCreateCard = () => {
        if (!newCardFront || !newCardBack) return;
        const newCard = {
            id: Date.now().toString(),
            deckId: activeDeckId,
            front: newCardFront,
            back: newCardBack,
            next_review_date: new Date().toISOString() // Due immediately
        };
        saveData({ ...data, cards: [...data.cards, newCard] });
        setShowNewCard(false);
        setNewCardFront('');
        setNewCardBack('');
    };

    // --- STUDY MODE ---
    const handleStartStudy = () => {
        const now = new Date();
        const due = data.cards.filter(c => c.deckId === activeDeckId && (!c.next_review_date || new Date(c.next_review_date) <= now));
        
        if (due.length === 0) {
            alert('No cards due for review in this deck!');
            return;
        }

        // Update deck's last_reviewed date
        const updatedDecks = data.decks.map(d => d.id === activeDeckId ? { ...d, last_reviewed: new Date().toISOString() } : d);
        saveData({ ...data, decks: updatedDecks });

        setStudyQueue(due);
        setCurrentStudyIndex(0);
        setIsFlipped(false);
        setViewMode('STUDY');
    };

    const handleRateCard = (isEasy) => {
        const currentCard = studyQueue[currentStudyIndex];
        const now = new Date();
        
        if (isEasy) {
            now.setDate(now.getDate() + 3); // next review in 3 days
        } else {
            // Next session (due immediately or tomorrow? prompt says "next session" meaning immediately due again or just leave as now)
            // Let's set it to 1 hour from now so they don't see it this exact second, but next time they open it
            now.setHours(now.getHours() + 1);
        }

        const updatedCards = data.cards.map(c => 
            c.id === currentCard.id ? { ...c, next_review_date: now.toISOString() } : c
        );

        saveData({ ...data, cards: updatedCards });

        // Next card
        if (currentStudyIndex + 1 < studyQueue.length) {
            setCurrentStudyIndex(currentStudyIndex + 1);
            setIsFlipped(false);
        } else {
            alert('Study session complete!');
            setViewMode('DECK_VIEW');
        }
    };


    const activeDeck = data.decks.find(d => d.id === activeDeckId);
    const activeDeckCards = data.cards.filter(c => c.deckId === activeDeckId);

    return (
        <div className="page-container" style={{ paddingBottom: '80px', maxWidth: '900px', margin: '0 auto' }}>
            <header style={{ marginBottom: '3rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Study / Flashcards</span>
                <h1 style={{ fontSize: '3.5rem', fontFamily: 'var(--font-serif)', marginTop: '0.5rem', color: 'var(--color-soft-black)' }}>
                    {viewMode === 'DECKS' ? 'Flashcards' : activeDeck?.name}
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)' }}>
                    {viewMode === 'DECKS' ? 'Active recall and spaced repetition.' : `Subject: ${activeDeck?.subject}`}
                </p>
            </header>

            {/* DECKS LIST */}
            {viewMode === 'DECKS' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Your Decks</h2>
                        <button 
                            onClick={() => setShowNewDeck(true)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.2rem', backgroundColor: 'var(--color-soft-black)', color: 'white', borderRadius: '100px', border: 'none', cursor: 'pointer', fontWeight: 500 }}
                        >
                            <Plus size={18} /> New Deck
                        </button>
                    </div>

                    {showNewDeck && (
                        <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '2rem', boxShadow: 'var(--shadow-soft)', marginBottom: '2rem', border: '1px solid var(--color-border)' }}>
                            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Create New Deck</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Deck Name</label>
                                    <input type="text" value={newDeckName} onChange={e => setNewDeckName(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--color-border)' }} placeholder="e.g. Neuroscience 101" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Subject</label>
                                    <input type="text" value={newDeckSubject} onChange={e => setNewDeckSubject(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--color-border)' }} placeholder="e.g. Biology" />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button onClick={() => setShowNewDeck(false)} style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', border: '1px solid var(--color-border)', backgroundColor: 'transparent', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleCreateDeck} disabled={!newDeckName || !newDeckSubject} style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', border: 'none', backgroundColor: 'var(--color-soft-black)', color: 'white', cursor: 'pointer', opacity: (!newDeckName || !newDeckSubject) ? 0.5 : 1 }}>Create</button>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {data.decks.map(deck => {
                            const due = getDueCardsCount(deck.id);
                            const total = getTotalCardsCount(deck.id);
                            return (
                                <div 
                                    key={deck.id} 
                                    onClick={() => handleOpenDeck(deck.id)}
                                    style={{ backgroundColor: 'white', borderRadius: '24px', padding: '1.5rem', boxShadow: 'var(--shadow-soft)', cursor: 'pointer', border: '1px solid transparent', transition: 'border 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-gold)'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div style={{ width: '48px', height: '48px', backgroundColor: '#f1f1f1', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-soft-black)' }}>
                                            <Layers size={24} />
                                        </div>
                                        {due > 0 && (
                                            <span style={{ backgroundColor: '#fff3e0', color: '#f57c00', padding: '0.3rem 0.8rem', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 600 }}>
                                                {due} due today
                                            </span>
                                        )}
                                    </div>
                                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.3rem', color: 'var(--color-soft-black)' }}>{deck.name}</h3>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>{deck.subject}</div>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-secondary)', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><BookOpen size={14} /> {total} cards</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={14} /> {deck.last_reviewed ? new Date(deck.last_reviewed).toLocaleDateString() : 'Never'}</span>
                                    </div>
                                </div>
                            );
                        })}
                        {data.decks.length === 0 && !showNewDeck && (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
                                You haven't created any flashcard decks yet.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* DECK VIEW */}
            {viewMode === 'DECK_VIEW' && (
                <div>
                    <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                        <button onClick={() => setViewMode('DECKS')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.2rem', backgroundColor: 'white', border: '1px solid var(--color-border)', borderRadius: '100px', cursor: 'pointer', fontWeight: 500 }}>
                            <ChevronLeft size={18} /> Back to Decks
                        </button>
                        <button onClick={handleStartStudy} disabled={getDueCardsCount(activeDeckId) === 0} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', backgroundColor: 'var(--color-soft-black)', color: 'white', borderRadius: '100px', border: 'none', cursor: getDueCardsCount(activeDeckId) === 0 ? 'not-allowed' : 'pointer', fontWeight: 500, opacity: getDueCardsCount(activeDeckId) === 0 ? 0.5 : 1 }}>
                            <BookOpen size={18} fill="currentColor" /> Study Now ({getDueCardsCount(activeDeckId)} due)
                        </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 600 }}>Cards in {activeDeck?.name}</h2>
                        <button 
                            onClick={() => setShowNewCard(true)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', backgroundColor: 'transparent', color: 'var(--color-soft-black)', borderRadius: '100px', border: '1px solid var(--color-soft-black)', cursor: 'pointer', fontWeight: 500 }}
                        >
                            <Plus size={16} /> Add Card
                        </button>
                    </div>

                    {showNewCard && (
                        <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '2rem', boxShadow: 'var(--shadow-soft)', marginBottom: '2rem', border: '1px solid var(--color-gold)' }}>
                            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>New Flashcard</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Front (Prompt)</label>
                                    <textarea value={newCardFront} onChange={e => setNewCardFront(e.target.value)} rows={3} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--color-border)', resize: 'vertical', fontFamily: 'inherit' }} placeholder="Question or concept..." />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Back (Answer)</label>
                                    <textarea value={newCardBack} onChange={e => setNewCardBack(e.target.value)} rows={3} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--color-border)', resize: 'vertical', fontFamily: 'inherit' }} placeholder="Answer or explanation..." />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button onClick={() => setShowNewCard(false)} style={{ padding: '0.6rem 1.2rem', borderRadius: '12px', border: '1px solid var(--color-border)', backgroundColor: 'transparent', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleCreateCard} disabled={!newCardFront || !newCardBack} style={{ padding: '0.6rem 1.2rem', borderRadius: '12px', border: 'none', backgroundColor: 'var(--color-gold)', color: 'white', cursor: 'pointer', fontWeight: 600, opacity: (!newCardFront || !newCardBack) ? 0.5 : 1 }}>Save Card</button>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {activeDeckCards.map(c => {
                            const isDue = !c.next_review_date || new Date(c.next_review_date) <= new Date();
                            return (
                                <div key={c.id} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--color-border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', position: 'relative' }}>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Front</div>
                                        <div style={{ fontSize: '1rem', color: 'var(--color-soft-black)' }}>{c.front}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Back</div>
                                        <div style={{ fontSize: '1rem', color: 'var(--color-soft-black)' }}>{c.back}</div>
                                    </div>
                                    {isDue && (
                                        <div style={{ position: 'absolute', top: '10px', right: '10px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f57c00' }} title="Due for review"></div>
                                    )}
                                </div>
                            );
                        })}
                        {activeDeckCards.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '16px' }}>
                                No cards in this deck yet. Add your first card above.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* STUDY MODE */}
            {viewMode === 'STUDY' && studyQueue.length > 0 && (
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <button onClick={() => setViewMode('DECK_VIEW')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                            <X size={20} /> Exit Study
                        </button>
                        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                            Card {currentStudyIndex + 1} of {studyQueue.length}
                        </div>
                    </div>

                    {/* Card Container - Flip Effect */}
                    <div 
                        onClick={() => setIsFlipped(!isFlipped)}
                        style={{ 
                            perspective: '1000px',
                            minHeight: '350px',
                            cursor: 'pointer',
                            marginBottom: '2rem'
                        }}
                    >
                        <div style={{
                            width: '100%',
                            height: '100%',
                            position: 'relative',
                            transition: 'transform 0.6s',
                            transformStyle: 'preserve-3d',
                            transform: isFlipped ? 'rotateX(180deg)' : 'rotateX(0deg)'
                        }}>
                            {/* Front */}
                            <div style={{
                                position: 'absolute',
                                width: '100%',
                                minHeight: '100%',
                                backfaceVisibility: 'hidden',
                                backgroundColor: 'white',
                                borderRadius: '32px',
                                padding: '3rem',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                textAlign: 'center',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                                border: '1px solid var(--color-border)'
                            }}>
                                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', position: 'absolute', top: '2rem' }}>Prompt</div>
                                <div style={{ fontSize: '1.8rem', color: 'var(--color-soft-black)', lineHeight: 1.4 }}>
                                    {studyQueue[currentStudyIndex].front}
                                </div>
                                {!isFlipped && (
                                    <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', position: 'absolute', bottom: '2rem' }}>Click to reveal</div>
                                )}
                            </div>

                            {/* Back */}
                            <div style={{
                                position: 'absolute',
                                width: '100%',
                                minHeight: '100%',
                                backfaceVisibility: 'hidden',
                                backgroundColor: 'var(--color-soft-black)',
                                color: 'white',
                                borderRadius: '32px',
                                padding: '3rem',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                textAlign: 'center',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                                transform: 'rotateX(180deg)'
                            }}>
                                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', position: 'absolute', top: '2rem' }}>Answer</div>
                                <div style={{ fontSize: '1.5rem', lineHeight: 1.5 }}>
                                    {studyQueue[currentStudyIndex].back}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rating Actions */}
                    <div style={{ display: 'flex', gap: '1rem', opacity: isFlipped ? 1 : 0, transition: 'opacity 0.3s', pointerEvents: isFlipped ? 'auto' : 'none' }}>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleRateCard(false); }}
                            style={{ flex: 1, padding: '1.2rem', borderRadius: '16px', border: '1px solid #ffcdd2', backgroundColor: '#ffebee', color: '#c62828', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        >
                            Hard <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>(Review soon)</span>
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleRateCard(true); }}
                            style={{ flex: 1, padding: '1.2rem', borderRadius: '16px', border: '1px solid #c8e6c9', backgroundColor: '#e8f5e9', color: '#2e7d32', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        >
                            <Check size={20} /> Easy <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>(in 3 days)</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Flashcards;
