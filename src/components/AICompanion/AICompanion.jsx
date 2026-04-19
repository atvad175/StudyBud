import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, ChevronDown } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash'];

const PERSONAS = [
    {
        id: 'candid',
        emoji: '🤝',
        label: 'Candid Buddy',
        desc: 'Direct, honest, gets to the point',
        color: '#5B8DEE',
    },
    {
        id: 'ruthless',
        emoji: '🔥',
        label: 'Ruthless Mentor',
        desc: 'High standards, no excuses, pushes you hard',
        color: '#FF5F56',
    },
    {
        id: 'warm',
        emoji: '🌸',
        label: 'Warm Guide',
        desc: 'Nurturing, patient, lots of encouragement',
        color: '#4CAF50',
    },
];

const PERSONA_PROMPTS = {
    candid: 'Be direct and honest. Get to the point fast. No fluff, but stay friendly and supportive. Give real, practical advice.',
    ruthless: 'Be a tough mentor. High standards. Call out excuses. Push the user hard but with genuine care for their growth. Be blunt but never cruel.',
    warm: 'Be nurturing, patient, and deeply encouraging. Celebrate every small win. Be the most supportive presence in their day.',
};

const isQuotaError = (status, data) =>
    status === 429 ||
    (data?.error?.message || '').toLowerCase().includes('quota') ||
    (data?.error?.message || '').toLowerCase().includes('resource exhausted');

const AICompanion = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [persona, setPersona] = useState(null);
    const [showPersonaPicker, setShowPersonaPicker] = useState(false);
    const [isMinimised, setIsMinimised] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // ── Bootstrap: load history + persona, trigger first-visit welcome ──────
    useEffect(() => {
        const savedPersona = localStorage.getItem('studybud_bud_persona') || null;
        setPersona(savedPersona);

        const defaultMsg = [{ role: 'model', content: "Hi! I'm Bud. How can I help you today?" }];
        try {
            const stored = localStorage.getItem('studybud_bud_chat');
            const parsed = stored ? JSON.parse(stored) : null;
            setMessages(Array.isArray(parsed) && parsed.length ? parsed : defaultMsg);
        } catch {
            setMessages(defaultMsg);
        }

        // Fire welcome on first visit
        const isFirst = localStorage.getItem('studybud_first_visit') === 'true';
        if (isFirst) {
            localStorage.removeItem('studybud_first_visit');
            setTimeout(() => {
                setIsOpen(true);
                triggerPersonalisedWelcome();
            }, 1200);
        }
    }, []);

    // ── Persist to localStorage whenever messages change ─────────────────────
    useEffect(() => {
        if (!messages.length) return;
        const recent = messages.slice(-30);
        localStorage.setItem('studybud_bud_chat', JSON.stringify(recent));
        if (messages.length > 30) setMessages(recent);
        scrollToBottom();
    }, [messages]);

    // ── Persist to Supabase (debounced) ──────────────────────────────────────
    useEffect(() => {
        if (!messages.length) return;
        const timer = setTimeout(async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user?.id || session.user.id === 'guest-user') return;
                await supabase.from('chat_history').upsert({
                    user_id: session.user.id,
                    messages: messages.slice(-30),
                    bud_persona: persona || 'candid',
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'user_id' });
            } catch (e) {
                // silently fail — localStorage is the fallback
            }
        }, 2000);
        return () => clearTimeout(timer);
    }, [messages, persona]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // ── Build system prompt from persona + onboarding data ───────────────────
    const buildSystemPrompt = (selectedPersona) => {
        const name = localStorage.getItem('studybud_username') || 'Student';
        const role = localStorage.getItem('studybud_role') || 'student';
        const topics = (() => {
            try { return JSON.parse(localStorage.getItem('studybud_fav_subjects') || '[]').join(', '); }
            catch { return 'various subjects'; }
        })();
        
        const struggles = (() => {
            try { return JSON.parse(localStorage.getItem('studybud_struggles') || '[]').join(', '); }
            catch { return ''; }
        })();
        
        const intention = localStorage.getItem('studybud_intention') || '';
        const motivation = localStorage.getItem('studybud_motivation') || '';
        const p = selectedPersona || persona || 'candid';
        const personaInstruction = PERSONA_PROMPTS[p] || PERSONA_PROMPTS.candid;

        return `You are Bud, the AI companion inside StudyBud app. The student's name is ${name}. They are a ${role}${topics ? ` studying/working in ${topics}` : ''}${motivation ? `. Their core motivation is: "${motivation}"` : ''}.
${struggles ? `They struggle with: ${struggles}.` : ''}
${intention ? `Their overarching intention is: "${intention}".` : ''}
Persona instruction: ${personaInstruction}

Keep replies to 2–4 sentences unless asked for detail. Be genuinely helpful, not generic.`;
    };

    // ── First-visit personalised welcome ─────────────────────────────────────
    const triggerPersonalisedWelcome = async () => {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            setMessages([{
                role: 'model',
                content: "Hey! I'm Bud, your study companion. I'm ready to help you focus, build habits, and stay on track. Before we start — how would you like me to show up for you?",
            }]);
            setShowPersonaPicker(true);
            return;
        }

        const name = localStorage.getItem('studybud_username') || 'there';
        const role = localStorage.getItem('studybud_role') || 'student';
        const motivation = localStorage.getItem('studybud_motivation') || '';
        const topics = (() => {
            try { return JSON.parse(localStorage.getItem('studybud_fav_subjects') || '[]').slice(0, 3).join(', '); }
            catch { return ''; }
        })();

        const welcomePrompt = `You are Bud, a friendly AI study companion. Write a warm, personal welcome message to ${name} who is a ${role}${topics ? ` interested in ${topics}` : ''}${motivation ? `. Their driving motivation is: "${motivation}"` : ''}. 

The message should:
- Address them by name
- Reference 1-2 specific things from their profile naturally  
- Be energising and feel like you genuinely know them
- End with asking how they'd like you to show up for them (without listing options — just invite them to pick)
- Keep it to 3-4 sentences max, conversational, not corporate`;

        setIsTyping(true);
        setMessages([]);

        let succeeded = false;
        for (const modelName of MODELS) {
            try {
                const res = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: welcomePrompt }] }] }),
                    }
                );
                const data = await res.json();
                if (isQuotaError(res.status, data)) { continue; }
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                    setMessages([{ role: 'model', content: text }]);
                    succeeded = true;
                    break;
                }
            } catch { /* try next model */ }
        }

        if (!succeeded) {
            setMessages([{
                role: 'model',
                content: `Hey ${name}! I'm Bud — your study companion inside StudyBud. I'm here to help you stay focused, build momentum, and actually enjoy the process. Before we dive in, how would you like me to show up for you?`,
            }]);
        }

        setIsTyping(false);
        setShowPersonaPicker(true);
    };

    // ── Select persona ────────────────────────────────────────────────────────
    const handleSelectPersona = async (p) => {
        setPersona(p.id);
        setShowPersonaPicker(false);
        localStorage.setItem('studybud_bud_persona', p.id);

        const confirmMessages = {
            candid: `Perfect — I'll keep it real with you. No sugar-coating, but always in your corner. Let's get to work. What's on your plate?`,
            ruthless: `Locked in. I'll hold you to a high standard and won't let you off the hook easily. That's what you asked for. Now — what are we working on today?`,
            warm: `Absolutely. I'll be your biggest cheerleader. Every step forward matters, and I'm here for all of it. What would you like to start with?`,
        };

        setMessages(prev => [
            ...prev,
            {
                role: 'model',
                content: confirmMessages[p.id] || `Got it! I'll be your ${p.label} from now on. What's on your mind?`,
            },
        ]);
    };

    // ── Send message ──────────────────────────────────────────────────────────
    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMsg = { role: 'user', content: input.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            setTimeout(() => {
                setMessages(prev => [...prev, { role: 'model', content: "I need an API key to respond. Please add VITE_GEMINI_API_KEY to your .env file." }]);
                setIsTyping(false);
            }, 800);
            return;
        }

        const systemInstruction = buildSystemPrompt(persona);
        const history = [...messages, userMsg].slice(-16);

        // Ensure history strictly alternates roles, starting with "user"
        let validHist = [];
        let currentRole = null;
        for (const msg of history) {
            const role = msg.role === 'user' ? 'user' : 'model';
            if (role !== currentRole) {
                validHist.push({ role, parts: [{ text: msg.content }] });
                currentRole = role;
            } else {
                validHist[validHist.length - 1].parts[0].text += '\n\n' + msg.content;
            }
        }
        
        while (validHist.length > 0 && validHist[0].role !== 'user') {
            validHist.shift();
        }

        const contents = [
            ...validHist,
            { role: 'user', parts: [{ text: userMsg.content }] },
        ];

        let replied = false;
        for (const modelName of MODELS) {
            try {
                const res = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            systemInstruction: { parts: [{ text: systemInstruction }] },
                            contents,
                            generationConfig: { maxOutputTokens: 350 },
                        }),
                    }
                );
                const data = await res.json();

                if (isQuotaError(res.status, data)) {
                    if (modelName !== MODELS[MODELS.length - 1]) continue;
                    setMessages(prev => [...prev, { role: 'model', content: '😴 Bud is resting for today — the AI quota has been reached. Everything else in StudyBud works perfectly. Come back tomorrow and I\'ll be fully charged!' }]);
                    replied = true;
                    break;
                }

                // Handle other API errors (e.g., 400, 403, 500)
                if (data?.error) {
                    const errorMsg = data.error.message || '';
                    if (errorMsg.includes('API key') || res.status === 403) {
                        setMessages(prev => [...prev, { role: 'model', content: '🔑 Bud cannot connect. There might be an issue with the API key configuration.' }]);
                    } else {
                        setMessages(prev => [...prev, { role: 'model', content: 'Something went wrong on my end. Please try again or rephrase your message.' }]);
                    }
                    replied = true;
                    break;
                }

                const candidate = data?.candidates?.[0];
                const text = candidate?.content?.parts?.[0]?.text;
                
                if (text) {
                    setMessages(prev => [...prev, { role: 'model', content: text }]);
                    replied = true;
                    break;
                }

                // No text returned - check finish reason
                const reason = candidate?.finishReason;
                const errorMessage = reason === 'SAFETY' 
                    ? "I couldn't send that reply because of safety filters — try rephrasing your prompt." 
                    : "I didn't get a proper reply from the server. Try asking something else or check your connection.";
                
                setMessages(prev => [...prev, { role: 'model', content: errorMessage }]);
                replied = true;
                break;
            } catch (err) {
                if (modelName === MODELS[MODELS.length - 1]) {
                    console.error('AI Companion Error:', err);
                    setMessages(prev => [...prev, { role: 'model', content: 'Something went wrong connecting. Check your network and try again.' }]);
                    replied = true;
                }
            }
        }

        setIsTyping(false);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
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
