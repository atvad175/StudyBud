import React, { useState, useRef, useEffect } from 'react';
import styles from '../MindShared.module.css';
import { Send, User, Heart, ShieldCheck, Sparkles, Wind, Waves } from 'lucide-react';
import { useMind } from '../../../context/MindContext';
import { useAI } from '../../../context/AIContext';
import { supabase } from '../../../supabaseClient';

const VIBES = [
    { id: 'comfort', label: 'Presence', icon: <Heart size={14} /> },
    { id: 'straight', label: 'Clarity', icon: <Wind size={14} /> },
    { id: 'analysis', label: 'Reflection', icon: <Waves size={14} /> },
];

const EmotionalBuddy = () => {
    const { addLog } = useMind();
    const { sendMessage } = useAI();
    const [nickname, setNickname] = useState('Friend');
    const [messages, setMessages] = useState([
        { id: 1, sender: 'buddy', text: "I'm here. Whenever you're ready to share, I'm listening." }
    ]);
    const [input, setInput] = useState('');
    const [currentVibe, setCurrentVibe] = useState('comfort');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        const fetchNickname = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('nickname').eq('id', user.id).single();
                if (data?.nickname) setNickname(data.nickname);
            }
        };
        fetchNickname();
    }, []);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, isTyping]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsgText = input.trim();
        const userMsg = { id: Date.now(), sender: 'user', text: userMsgText };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            // Updated context for Mind module (Buddy)
            const response = await sendMessage(
                `[Nickname: ${nickname}, Perspective: ${currentVibe}] ${userMsgText}`,
                'mind',
                'mind-buddy-session'
            );

            const buddyMsg = { id: Date.now() + 1, sender: 'buddy', text: response };
            setMessages(prev => [...prev, buddyMsg]);

            addLog({
                type: 'chat',
                content: { user: userMsgText, buddy: response },
                tags: ['support-session', currentVibe]
            });
        } catch (error) {
            console.error('Support error:', error);
            setMessages(prev => [...prev, { id: Date.now() + 2, sender: 'buddy', text: "I'm here, but I'm having a bit of trouble connecting right now. Can we try again in a moment?" }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header} style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <span className={styles.breadcrumb}>Mind / Center</span>
                    <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', color: 'var(--color-soft-black)' }}>Supportive Buddy</h2>
                </div>
                <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                    <div className={styles.pulseRing} style={{ borderColor: 'var(--color-gold)' }}></div>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
                        <Heart size={32} color="var(--color-gold)" fill="var(--color-gold)" style={{ opacity: 0.6 }} />
                    </div>
                </div>
            </header>

            <div className={styles.chatContainer}>
                <div style={{ padding: '0.75rem 2rem', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.5)' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#999', textTransform: 'uppercase' }}>Perspective:</span>
                    {VIBES.map(v => (
                        <button
                            key={v.id}
                            onClick={() => setCurrentVibe(v.id)}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '100px',
                                border: 'none',
                                background: currentVibe === v.id ? 'var(--color-soft-black)' : 'transparent',
                                color: currentVibe === v.id ? 'white' : '#666',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s'
                            }}
                        >
                            {v.icon} {v.label}
                        </button>
                    ))}
                </div>

                <div className={styles.chatHistory} ref={scrollRef}>
                    {messages.map(msg => (
                        <div key={msg.id} className={`${styles.messageRow} ${msg.sender === 'user' ? styles.userRow : styles.buddyRow}`}>
                            {msg.sender === 'buddy' && <div className={`${styles.avatar} ${styles.buddyAvatar}`} style={{ background: '#f8f9fa' }}><Heart size={16} color="var(--color-gold)" /></div>}
                            <div className={`${styles.bubble} ${msg.sender === 'user' ? styles.userBubble : styles.buddyBubble}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className={`${styles.messageRow} ${styles.buddyRow}`}>
                            <div className={`${styles.avatar} ${styles.buddyAvatar}`} style={{ background: '#f8f9fa' }}><Heart size={16} color="var(--color-gold)" /></div>
                            <div className={`${styles.bubble} ${styles.buddyBubble}`} style={{ padding: '1rem' }}>
                                <div className={styles.typingDot}></div>
                                <div className={styles.typingDot} style={{ margin: '0 4px' }}></div>
                                <div className={styles.typingDot}></div>
                            </div>
                        </div>
                    )}
                </div>

                <form className={styles.inputArea} onSubmit={handleSend} style={{ background: 'transparent' }}>
                    <input
                        className={styles.mainInput}
                        placeholder={`Talk to me, ${nickname}...`}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        disabled={isTyping}
                        autoFocus
                    />
                    <button type="submit" className={styles.sendBtn} style={{ width: '60px', height: '60px', borderRadius: '20px', backgroundColor: 'var(--color-soft-black)' }}>
                        <Send size={24} />
                    </button>
                </form>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.6, fontSize: '0.8rem', justifyContent: 'center', color: '#636e72' }}>
                <ShieldCheck size={14} />
                <span>Private & Secure. I'm here for you.</span>
            </div>
        </div>
    );
};

export default EmotionalBuddy;

