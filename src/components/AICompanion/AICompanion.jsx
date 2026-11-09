import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, X, Send, ChevronDown } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { chatCompanion, getCompanionWelcome } from '../../services/aiService';
import { BUDDY_QUICK_ACTIONS, buildBuddyActionPrompt } from './buddyActions';

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
    board: localStorage.getItem('studybud_board') || '',
    grade: localStorage.getItem('studybud_grade') || '',
});

const getSelectedBuddySubject = () => {
    try {
        const selected = localStorage.getItem('studybud_selected_subject');
        if (selected && selected.trim()) return selected.trim();
        return readStoredList('studybud_fav_subjects')[0] || '';
    } catch {
        return '';
    }
};

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
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [persona, setPersona] = useState(null);
    const [showPersonaPicker, setShowPersonaPicker] = useState(false);
    const [isMinimised, setIsMinimised] = useState(false);
    const [isHistoryHydrating, setIsHistoryHydrating] = useState(true);
    const [canSyncHistory, setCanSyncHistory] = useState(false);
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
            let canDecideWelcome = false;

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
                canDecideWelcome = true;
                if (!active) return;

                // Only permit remote writes after a successful read. A transient
                // read failure must never replace older cloud chat with a greeting.
                if (!data) {
                    setCanSyncHistory(true);
                    return;
                }
                if (!Array.isArray(data.messages)) return;
                setCanSyncHistory(true);

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
                    if (isFirst && canDecideWelcome && !hasExistingConversation) {
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
        if (isHistoryHydrating || !canSyncHistory || !messages.length) return undefined;

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
    }, [messages, persona, isHistoryHydrating, canSyncHistory]);

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

    // Both typed chat and one-tap actions use the same authenticated Buddy endpoint.
    // displayLabel keeps the quick action readable while its richer instruction stays in history.
    const handleSend = async (contentOverride = input.trim(), displayLabel = '') => {
        const content = String(contentOverride || '').trim();
        if (!content || isTyping) return;

        const userMsg = {
            role: 'user',
            content: content.slice(0, 3000),
            ...(displayLabel ? { displayContent: displayLabel } : {}),
        };
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
            if (!displayLabel) window.setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleQuickAction = (action) => {
        const prompt = buildBuddyActionPrompt(action.id, {
            pathname: location.pathname,
            selectedSubject: getSelectedBuddySubject(),
            board: getCompanionProfile().board,
            grade: getCompanionProfile().grade,
        });
        void handleSend(prompt, action.label);
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            void handleSend();
        }
    };

    const currentPersonaObj = PERSONAS.find(p => p.id === persona);

    return (
        <div className="budRoot">
            {isOpen && (
                <section
                    className={`budPanel ${isMinimised ? 'budPanelMinimised' : ''}`}
                    aria-label="Buddy learning companion"
                >
                    <header className="budHeader">
                        <div className="budHeaderIdentity">
                            <span className="budAvatar"><Sparkles size={18} fill="currentColor" aria-hidden="true" /></span>
                            <div>
                                <div className="budHeaderName">Bud</div>
                                <div className="budHeaderPersona">
                                    {currentPersonaObj ? `${currentPersonaObj.emoji} ${currentPersonaObj.label}` : 'Your learning companion'}
                                </div>
                            </div>
                        </div>
                        <div className="budHeaderActions">
                            <button
                                type="button"
                                className="budHeaderButton"
                                onClick={() => setIsMinimised(value => !value)}
                                aria-label={isMinimised ? 'Expand Buddy' : 'Minimise Buddy'}
                                aria-expanded={!isMinimised}
                            >
                                <ChevronDown size={17} style={{ transform: isMinimised ? 'rotate(180deg)' : 'none' }} />
                            </button>
                            <button
                                type="button"
                                className="budHeaderButton"
                                onClick={() => setIsOpen(false)}
                                aria-label="Close Buddy"
                            >
                                <X size={17} />
                            </button>
                        </div>
                    </header>

                    {!isMinimised && (
                        <>
                            <div className="budMessages" aria-live="polite" aria-relevant="additions text">
                                {messages.map((msg, i) => (
                                    <div
                                        key={i}
                                        className={`budMessageRow ${msg.role === 'user' ? 'budMessageRowUser' : ''}`}
                                    >
                                        {msg.role === 'model' && (
                                            <span className="budMessageAvatar" aria-hidden="true">
                                                <Sparkles size={12} fill="currentColor" />
                                            </span>
                                        )}
                                        <div className={`budBubble ${msg.role === 'user' ? 'budBubbleUser' : ''}`}>
                                            {msg.displayContent || msg.content}
                                        </div>
                                    </div>
                                ))}

                                {showPersonaPicker && (
                                    <div className="budPersonaList" aria-label="Choose Buddy's tone">
                                        {PERSONAS.map(p => (
                                            <button
                                                type="button"
                                                key={p.id}
                                                className="budPersonaButton"
                                                onClick={() => handleSelectPersona(p)}
                                            >
                                                <span className="budPersonaEmoji" aria-hidden="true">{p.emoji}</span>
                                                <span>
                                                    <span className="budPersonaTitle">{p.label}</span>
                                                    <span className="budPersonaDescription">{p.desc}</span>
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {!isHistoryHydrating && (
                                    <div className="budQuickActions">
                                        <span className="budQuickActionsLabel">Try a one-tap learning action</span>
                                        <div className="budQuickActionGrid">
                                            {BUDDY_QUICK_ACTIONS.map(action => (
                                                <button
                                                    type="button"
                                                    key={action.id}
                                                    className="budQuickAction"
                                                    onClick={() => handleQuickAction(action)}
                                                    disabled={isTyping}
                                                >
                                                    <span className="budQuickActionEmoji" aria-hidden="true">{action.emoji}</span>
                                                    <span>{action.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {isTyping && (
                                    <div className="budMessageRow" role="status" aria-label="Bud is preparing a reply">
                                        <span className="budMessageAvatar" aria-hidden="true">
                                            <Sparkles size={12} fill="currentColor" />
                                        </span>
                                        <span className="budTypingBubble">
                                            {[0, 0.18, 0.36].map(delay => (
                                                <span key={delay} className="budTypingDot" style={{ animationDelay: `${delay}s` }} />
                                            ))}
                                        </span>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <form
                                className="budInputBar"
                                onSubmit={event => {
                                    event.preventDefault();
                                    void handleSend();
                                }}
                            >
                                <textarea
                                    ref={inputRef}
                                    className="budInput"
                                    value={input}
                                    onChange={event => setInput(event.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Or ask Bud something specific…"
                                    rows={1}
                                    aria-label="Message Bud"
                                />
                                <button
                                    type="submit"
                                    className="budSend"
                                    disabled={!input.trim() || isTyping}
                                    aria-label="Send message to Bud"
                                >
                                    <Send size={16} />
                                </button>
                            </form>
                            <p className="budNote">
                                Bud can help you learn, practise and plan. Check important answers against your course material, and never share passwords or private account details.
                            </p>
                        </>
                    )}
                </section>
            )}

            <button
                type="button"
                className="budFab"
                onClick={() => { setIsOpen(open => !open); setIsMinimised(false); }}
                aria-label={isOpen ? 'Close Buddy' : 'Open Buddy'}
                aria-expanded={isOpen}
            >
                {isOpen ? <X size={25} /> : <Sparkles size={25} fill="currentColor" />}
            </button>

            <style>{`
                @keyframes budSlideUp {
                    from { transform: translateY(12px) scale(0.985); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );

};

export default AICompanion;
