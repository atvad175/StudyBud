import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader, X, Copy, Check } from 'lucide-react';
import { useAI } from '../../context/AIContext';
import styles from './AIChat.module.css';

const AIChat = ({
    context = 'general',
    sessionId = 'default',
    placeholder = 'Type your message...',
    title = 'Chat',
    onClose
}) => {
    const { sendMessage, loading, error, getChatHistory, clearChat } = useAI();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const messagesEndRef = useRef(null);

    // Load chat history on mount
    useEffect(() => {
        const history = getChatHistory(sessionId);
        setMessages(history);
    }, [sessionId, getChatHistory]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');

        // Add user message immediately
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

        try {
            const response = await sendMessage(userMessage, context, sessionId);
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (err) {
            console.error('Chat error:', err);
            // Error is handled by context
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleClear = () => {
        clearChat(sessionId);
        setMessages([]);
    };

    const handleCopy = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>{title}</h3>
                <div className={styles.headerActions}>
                    {messages.length > 0 && (
                        <button onClick={handleClear} className={styles.clearBtn} title="Clear chat">
                            Clear
                        </button>
                    )}
                    {onClose && (
                        <button onClick={onClose} className={styles.closeBtn} title="Close">
                            <X size={20} />
                        </button>
                    )}
                </div>
            </div>

            <div className={styles.messages}>
                {messages.length === 0 && (
                    <div className={styles.emptyState}>
                        <p>Start a conversation...</p>
                    </div>
                )}

                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.assistantMessage}`}
                    >
                        <div className={styles.messageContent}>
                            {msg.content}
                        </div>
                        {msg.role === 'assistant' && (
                            <button
                                onClick={() => handleCopy(msg.content, index)}
                                className={styles.copyBtn}
                                title="Copy message"
                            >
                                {copiedIndex === index ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                        )}
                    </div>
                ))}

                {loading && (
                    <div className={`${styles.message} ${styles.assistantMessage}`}>
                        <div className={styles.messageContent}>
                            <Loader className={styles.spinner} size={16} />
                            <span>Thinking...</span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputArea}>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={placeholder}
                    className={styles.input}
                    rows={1}
                    disabled={loading}
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className={styles.sendBtn}
                    title="Send message"
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
};

export default AIChat;
