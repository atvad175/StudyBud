import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, X, Send, ChevronDown } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { chatCompanion, getCompanionWelcome } from '../../services/aiService';

const PERSONAS = [
    { id: 'candid', emoji: '🤝', label: 'Candid Buddy', desc: 'Direct, honest, gets to the point', color: '#5B8DEE' },
    { id: 'ruthless', emoji: '🔥', label: 'Ruthless Mentor', desc: 'High standards, pushes you constructively', color: '#FF5F56' },
    { id: 'warm', emoji: '🌸', label: 'Warm Guide', desc: 'Nurturing, patient, encouraging', color: '#4CAF50' },
];

const readStoredList = (key) => {
    try {
        const parsed = JSON.parse(localStorage.getItem(key) || '[]');
        return Array.isArray(parsed)
            ? parsed.filter(item => typeof item === 'string').slice(0, 8)
            : [];
    } catch {
        return [];
    }
};

const getCompanionProfile = () => ({
    name: localStorage.getItem('studybud_username') || 'Student',
    role: localStorage.getItem('studybud_role') || 'student',
    topics: readStoredList('studybud_fav_subjects'),
    struggles: readStoredList('studybud_struggles'),
    intention: localStorage.getItem('studybud_intention') || '',
    motivation: localStorage.getItem('studybud_motivation') || '',
});

const normalizeMessages = (messages) => {
    const normalized = [];

    for (const message of messages.slice(-12)) {
        if (typeof message?.content !== 'string') continue;
        const content = message.content.trim().slice(0, 3000);
        if (!content) continue;

        const role = message.role === 'user' ? 'user' : 'assistant';
        const last = normalized[normalized.length - 1];
        if (last && last.role === role) {
            last.content = `${last.content}\n\n${content}`.slice(0, 3000);
        } else {
            normalized.push({ role, content });
        }
    }

    while (normalized.length && normalized[0].role !== 'user') normalized.shift();
    return normalized.slice(-12);
};

const AICompanion = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [persona, setPersona] = useState(null);
    const [showPersonaPicker, setShowPersonaPicker] = useState(false);
    const [isMinimised, setIsMinimised] = useState(false);
    const [isHistoryHydrating, setIsHistoryHydrating] = useState(true);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    const triggerPersonalisedWelcome = useCallback(async (selectedPersona) => {
        const profile = getCompanionProfile();
        const chosenPersona = ['candid', 'ruthless', 'warm'].includes(selectedPersona)
            ? selectedPersona
            : 'candid';

        setIsTyping(true);
        setMessages([]);

        try {
            const welcome = await getCompanionWelcome(profile, chosenPersona);
            setMessages([{ role: 'model', content: welcome }]);
        } catch (error) {
            console.warn('Bud welcome request failed:', error?.status || error?.message || 'unknown');
            setMessages([{
                role: 'model',
                content: `Hey ${profile.name}! I'm Bud, your StudyBud companion. I'm here to help you focus, build momentum, and make studying feel more manageable. How would you like me to help today?`,
            }]);
        } finally {
            setIsTyping(false);
            setShowPersonaPicker(true);
        }
    }, []);

    // Restore local chat first, then hydrate from the signed-in account if this
    // device only has the default greeting. Account switching clears the local key.
    useEffect(() => {
        let active = true;
        let welcomeTimeout = null;
        const savedPersona = localStorage.getItem('studybud_bud_persona') || null;
        const defaultMsg = [{ role: 'model', content: "Hi! I'm Bud. How can I help you today?" }];
        let localMessages = defaultMsg;

        try {
            const stored = localStorage.getItem('studybud_bud_chat');
            const parsed = stored ? JSON.parse(stored) : null;
            if (Array.isArray(parsed) && parsed.length) localMessages = parsed.slice(-30);
        } catch {
            // Ignore an invalid old local copy and try the signed-in account below.
        }

        setPersona(savedPersona);
        setMessages(localMessages);

        const isFirst = localStorage.getItem('studybud_first_visit') === 'true';
        if (isFirst) localStorage.removeItem('studybud_first_visit');

        const hydrateHistory = async () => {
            let hasExistingConversation = localMessages.some(message => message?.role === 'user');

            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError) throw sessionError;
                if (!session?.user?.id) return;

                const { data, error } = await supabase
                    .from('chat_history')
                    .select('messages, bud_persona, updated_at')
                    .eq('user_id', session.user.id)
                    .maybeSingle();
                if (error) throw error;
                if (!active || !Array.isArray(data?.messages)) return;

                const remoteMessages = data.messages
                    .filter(message =>
                        message &&
                        ['user', 'model', 'assistant'].includes(message.role) &&
                        typeof message.content === 'string' &&
                        message.content.trim()
                    )
                    .slice(-30);

                const hasRemoteConversation = remoteMessages.some(message => message.role === 'user');
                hasExistingConversation = hasExistingConversation || hasRemoteConversation;

                if (!localMessages.some(message => message?.role === 'user') && hasRemoteConversation) {
                    setMessages(remoteMessages);
                    const remotePersona = data.bud_persona;
                    if (!savedPersona && ['candid', 'ruthless', 'warm'].includes(remotePersona)) {
                        setPersona(remotePersona);
                        localStorage.setItem('studybud_bud_persona', remotePersona);
                    }
                }
            } catch (error) {
                console.warn('Could not restore Bud history:', error?.status || error?.code || 'unknown');
            } finally {
                if (active) {
                    setIsHistoryHydrating(false);
                    if (isFirst && !hasExistingConversation) {
                        welcomeTimeout = window.setTimeout(() => {
                            setIsOpen(true);
                            void triggerPersonalisedWelcome(savedPersona || 'candid');
                        }, 1200);
                    }
                }
            }
        };

        void hydrateHistory();
        return () => {
            active = false;
            if (welcomeTimeout !== null) window.clearTimeout(welcomeTimeout);
        };
    }, [triggerPersonalisedWelcome]);

    // Persist recent messages locally; cap in-memory history at every append below.
    useEffect(() => {
        if (!messages.length) return;
        localStorage.setItem('studybud_bud_chat', JSON.stringify(messages.slice(-30)));
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Persist history to the authenticated account; the local copy remains available if this fails.
    useEffect(() => {
        if (isHistoryHydrating || !messages.length) return undefined;

        const timer = window.setTimeout(async () => {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError) throw sessionError;
                if (!session?.user?.id) return;

                const { error } = await supabase.from('chat_history').upsert({
                    user_id: session.user.id,
                    messages: messages.slice(-30),
                    bud_persona: persona || 'candid',
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'user_id' });
                if (error) throw error;
            } catch (error) {
                console.warn('Bud history was not synced:', error?.status || error?.code || 'unknown');
            }
        }, 2000);

        return () => window.clearTimeout(timer);
    }, [messages, persona, isHistoryHydrating]);

    // Select persona
    const handleSelectPersona = (selected) => {
        setPersona(selected.id);
        setShowPersonaPicker(false);
        localStorage.setItem('studybud_bud_persona', selected.id);

        const confirmMessages = {
            candid: "Perfect — I'll keep it real with you. No fluff, but always in your corner. What's on your plate?",
            ruthless: "Locked in. I'll hold you to a high standard and challenge you constructively. What are we working on today?",
            warm: "Absolutely. I'll be encouraging and patient while we make progress one step at a time. What would you like to start with?",
        };

        setMessages(previous => [
            ...previous,
            { role: 'model', content: confirmMessages[selected.id] || `Got it! I'll be your ${selected.label} from now on. What's on your mind?` },
        ].slice(-30));
    };

    // Send a message through the same authenticated server endpoint used by the rest of StudyBud AI.
    const handleSend = async () => {
        const content = input.trim();
        if (!content || isTyping) return;

        const userMsg = { role: 'user', content: content.slice(0, 3000) };
        setMessages(previous => [...previous, userMsg].slice(-30));
        setInput('');
        setIsTyping(true);

        try {
            const history = normalizeMessages([...messages, userMsg]);
            const reply = await chatCompanion(history, persona || 'candid', getCompanionProfile());
            setMessages(previous => [...previous, { role: 'model', content: reply }].slice(-30));
        } catch (error) {
            console.warn('Bud message request failed:', error?.status || error?.message || 'unknown');
            const message = error?.message || 'Bud could not connect right now. Please try again.';
            setMessages(previous => [...previous, { role: 'model', content: message }].slice(-30));
        } finally {
            setIsTyping(false);
            window.setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            void handleSend();
        }
    };

    const currentPersonaObj = PERSONAS.find(p => p.id === persona);

    return (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000, fontFamily: 'inherit' }}>

            {/* ── Chat Panel ──────────────────────────────────────────────── */}
            {isOpen && (
                <div style={{
                    position: 'absolute', bottom: '5rem', right: 0,
                    width: 340, borderRadius: 24,
                    backgroundColor: '#fffcf5',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)',
                    display: 'flex', flexDirection: 'column', overflow: 'hidden',
                    border: '1px solid var(--color-border)',
                    animation: 'budSlideUp 0.35s cubic-bezier(0.16,1,0.3,1)',
                    maxHeight: isMinimised ? 56 : 480,
                    transition: 'max-height 0.3s cubic-bezier(0.16,1,0.3,1)',
                }}>
                    {/* Header */}
                    <div style={{
                        background: 'linear-gradient(135deg, #C9883A 0%, #dda85d 100%)',
                        color: 'white', padding: '0.85rem 1rem',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        flexShrink: 0,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: '50%',
                                background: 'rgba(255,255,255,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Sparkles size={16} fill="currentColor" />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.2 }}>Bud</div>
                                {currentPersonaObj && (
                                    <div style={{ fontSize: '0.68rem', opacity: 0.85, lineHeight: 1 }}>
                                        {currentPersonaObj.emoji} {currentPersonaObj.label}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 4 }}>
                            <button
                                onClick={() => setIsMinimised(m => !m)}
                                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <ChevronDown size={16} style={{ transform: isMinimised ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {!isMinimised && (
                        <>
                            {/* Messages */}
                            <div style={{
                                flex: 1, overflowY: 'auto', padding: '1rem',
                                display: 'flex', flexDirection: 'column', gap: '0.85rem',
                                maxHeight: 300,
                            }}>
                                {messages.map((msg, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                        {msg.role === 'model' && (
                                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#C9883A,#dda85d)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: 6, marginTop: 2 }}>
                                                <Sparkles size={12} color="white" fill="white" />
                                            </div>
                                        )}
                                        <div style={{
                                            maxWidth: '82%',
                                            padding: '0.75rem 1rem',
                                            borderRadius: 16,
                                            borderBottomRightRadius: msg.role === 'user' ? 4 : 16,
                                            borderBottomLeftRadius: msg.role === 'model' ? 4 : 16,
                                            backgroundColor: msg.role === 'user' ? '#F5E6C8' : 'white',
                                            color: 'var(--color-soft-black)',
                                            boxShadow: msg.role === 'model' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                                            border: msg.role === 'model' ? '1px solid var(--color-border)' : 'none',
                                            fontSize: '0.875rem', lineHeight: 1.5,
                                        }}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}

                                {/* Persona picker */}
                                {showPersonaPicker && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.25rem 0' }}>
                                        {PERSONAS.map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => handleSelectPersona(p)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                                    padding: '0.7rem 1rem', borderRadius: 12,
                                                    border: `1.5px solid ${p.color}30`,
                                                    background: `${p.color}08`,
                                                    cursor: 'pointer', textAlign: 'left',
                                                    transition: 'all 0.2s',
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.background = `${p.color}15`; e.currentTarget.style.borderColor = `${p.color}60`; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = `${p.color}08`; e.currentTarget.style.borderColor = `${p.color}30`; }}
                                            >
                                                <span style={{ fontSize: '1.3rem' }}>{p.emoji}</span>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-soft-black)' }}>{p.label}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{p.desc}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {isTyping && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#C9883A,#dda85d)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Sparkles size={12} color="white" fill="white" />
                                        </div>
                                        <div style={{ padding: '0.75rem 1rem', borderRadius: 16, borderBottomLeftRadius: 4, background: 'white', border: '1px solid var(--color-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', gap: 4 }}>
                                            {[0, 0.2, 0.4].map((delay, i) => (
                                                <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9883A', animation: `budBounce 1.2s ${delay}s infinite` }} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div style={{
                                padding: '0.75rem', background: 'white',
                                borderTop: '1px solid var(--color-border)',
                                display: 'flex', gap: '0.5rem', alignItems: 'flex-end',
                            }}>
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask Bud anything..."
                                    rows={1}
                                    style={{
                                        flex: 1, padding: '0.6rem 1rem',
                                        borderRadius: 100, border: '1px solid var(--color-border)',
                                        fontSize: '0.875rem', resize: 'none', outline: 'none',
                                        fontFamily: 'inherit', lineHeight: 1.4,
                                        background: '#fafafa',
                                    }}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isTyping}
                                    style={{
                                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                                        background: (!input.trim() || isTyping) ? '#e8e0d0' : 'linear-gradient(135deg,#C9883A,#dda85d)',
                                        color: 'white', border: 'none',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: (!input.trim() || isTyping) ? 'default' : 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <Send size={15} />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ── Toggle Button ────────────────────────────────────────────── */}
            <button
                onClick={() => { setIsOpen(o => !o); setIsMinimised(false); }}
                style={{
                    width: 60, height: 60, borderRadius: '50%',
                    background: 'linear-gradient(145deg, #C9883A 0%, #dda85d 100%)',
                    color: '#fff', border: 'none',
                    boxShadow: isOpen ? '0 6px 20px rgba(201,136,58,0.4)' : '0 10px 28px rgba(201,136,58,0.45)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s',
                    transform: isOpen ? 'scale(0.9) rotate(10deg)' : 'scale(1)',
                }}
            >
                {isOpen ? <X size={26} /> : <Sparkles size={26} fill="currentColor" />}
            </button>

            <style>{`
                @keyframes budSlideUp {
                    from { transform: translateY(16px) scale(0.97); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }
                @keyframes budBounce {
                    0%, 80%, 100% { transform: scale(0.4); opacity: 0.5; }
                    40% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default AICompanion;
