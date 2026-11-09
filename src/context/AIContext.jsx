import React, { useState, useCallback, useRef } from 'react';
import { AIContext } from './AIContextCore.js';
import * as aiService from '../services/aiService';
import { prepareChatHistory } from './chatHistoryUtils.js';

const EMPTY_CHAT_HISTORY = Object.freeze([]);

export const AIProvider = ({ children }) => {
    const isAvailable = aiService.isAIAvailable();
    const [chatHistory, setChatHistory] = useState({});
    const [activeRequests, setActiveRequests] = useState(0);
    const [error, setError] = useState(null);
    const chatLocksRef = useRef(new Set());
    const chatGenerationRef = useRef(new Map());
    const loading = activeRequests > 0;

    // Use a request counter rather than a boolean. One finished request must not
    // hide the loading state of another request that is still in flight.
    const runRequest = useCallback(async request => {
        setActiveRequests(count => count + 1);
        setError(null);
        try {
            return await request();
        } catch (requestError) {
            const message = requestError?.message || 'StudyBud AI could not complete that request. Please try again.';
            setError(message);
            throw requestError;
        } finally {
            setActiveRequests(count => Math.max(0, count - 1));
        }
    }, []);

    const getStudyHelp = (subject, topic, level) =>
        runRequest(() => aiService.getStudyRecommendation(subject, topic, level));

    const getHabitHelp = (habitName, struggle) =>
        runRequest(() => aiService.getHabitCoaching(habitName, struggle));

    const getSupport = (emotion, situation) =>
        runRequest(() => aiService.getSupportiveGuidance(emotion, situation));

    const runChat = async (message, context, sessionId, sendRequest) => {
        const key = String(sessionId || 'default');
        if (chatLocksRef.current.has(key)) {
            const busyError = new Error('A reply is already being prepared in this chat. Wait for it to finish before sending another message.');
            setError(busyError.message);
            throw busyError;
        }

        chatLocksRef.current.add(key);
        const generation = chatGenerationRef.current.get(key) || 0;
        try {
            return await runRequest(async () => {
                const history = chatHistory[key] || EMPTY_CHAT_HISTORY;
                const newMessage = { role: 'user', content: message };
                const { updatedHistory, requestHistory } = prepareChatHistory(history, newMessage);
                const response = await sendRequest(requestHistory);
                const assistantMessage = { role: 'assistant', content: response };

                // Clearing a conversation while a response is in flight must win;
                // a late response must not repopulate the cleared chat.
                if ((chatGenerationRef.current.get(key) || 0) === generation) {
                    const finalHistory = [...updatedHistory, assistantMessage];
                    setChatHistory(previous => ({
                        ...previous,
                        [key]: finalHistory,
                    }));
                }
                return response;
            });
        } finally {
            chatLocksRef.current.delete(key);
        }
    };

    const sendMessage = (message, context = 'general', sessionId = 'default') =>
        runChat(message, context, sessionId, requestHistory => aiService.chat(requestHistory, context));

    const sendMessageStream = (message, context = 'general', sessionId = 'default', onChunk) =>
        runChat(message, context, sessionId, requestHistory =>
            aiService.chatStream(requestHistory, context, onChunk)
        );

    const clearChat = (sessionId = 'default') => {
        const key = String(sessionId || 'default');
        chatGenerationRef.current.set(key, (chatGenerationRef.current.get(key) || 0) + 1);
        setChatHistory(previous => {
            const updated = { ...previous };
            delete updated[key];
            return updated;
        });
    };

    const getChatHistory = useCallback((sessionId = 'default') => {
        return chatHistory[String(sessionId || 'default')] || EMPTY_CHAT_HISTORY;
    }, [chatHistory]);

    return (
        <AIContext.Provider value={{
            isAvailable,
            loading,
            error,
            getStudyHelp,
            getHabitHelp,
            getSupport,
            sendMessage,
            sendMessageStream,
            clearChat,
            getChatHistory
        }}>
            {children}
        </AIContext.Provider>
    );
};
