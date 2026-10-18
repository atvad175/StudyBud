import React, { useState, useCallback } from 'react';
import { AIContext } from './AIContextCore.js';
import * as aiService from '../services/aiService';

const EMPTY_CHAT_HISTORY = [];
const MAX_CONTEXT_MESSAGES = 12;
const MAX_STORED_CHAT_MESSAGES = 30;

const prepareChatHistory = (history, newMessage) => {
    const updatedHistory = [...history, newMessage].slice(-MAX_STORED_CHAT_MESSAGES);
    const requestHistory = updatedHistory.slice(-MAX_CONTEXT_MESSAGES);

    // Gemini chat history must begin with a user message. This also guarantees
    // the current user message is the final item sent to the server.
    while (requestHistory.length && requestHistory[0].role !== 'user') {
        requestHistory.shift();
    }

    return { updatedHistory, requestHistory };
};

export const AIProvider = ({ children }) => {
    const isAvailable = aiService.isAIAvailable();
    const [chatHistory, setChatHistory] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Get study recommendation
    const getStudyHelp = async (subject, topic, level) => {
        setLoading(true);
        setError(null);
        try {
            const response = await aiService.getStudyRecommendation(subject, topic, level);
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Get habit coaching
    const getHabitHelp = async (habitName, struggle) => {
        setLoading(true);
        setError(null);
        try {
            const response = await aiService.getHabitCoaching(habitName, struggle);
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Get supportive guidance (Mind module - no "AI" terminology)
    const getSupport = async (emotion, situation) => {
        setLoading(true);
        setError(null);
        try {
            const response = await aiService.getSupportiveGuidance(emotion, situation);
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Chat interface
    const sendMessage = async (message, context = 'general', sessionId = 'default') => {
        setLoading(true);
        setError(null);

        // Get or create chat history for this session
        const history = chatHistory[sessionId] || [];
        const newMessage = { role: 'user', content: message };
        const { updatedHistory, requestHistory } = prepareChatHistory(history, newMessage);

        try {
            const response = await aiService.chat(requestHistory, context);
            const assistantMessage = { role: 'assistant', content: response };

            // Keep bounded UI history, but send only the supported recent context.
            const finalHistory = [...updatedHistory, assistantMessage].slice(-MAX_STORED_CHAT_MESSAGES);
            setChatHistory(prev => ({
                ...prev,
                [sessionId]: finalHistory
            }));

            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Streaming chat
    const sendMessageStream = async (message, context = 'general', sessionId = 'default', onChunk) => {
        setLoading(true);
        setError(null);

        const history = chatHistory[sessionId] || [];
        const newMessage = { role: 'user', content: message };
        const { updatedHistory, requestHistory } = prepareChatHistory(history, newMessage);

        try {
            const response = await aiService.chatStream(requestHistory, context, onChunk);
            const assistantMessage = { role: 'assistant', content: response };

            const finalHistory = [...updatedHistory, assistantMessage].slice(-MAX_STORED_CHAT_MESSAGES);
            setChatHistory(prev => ({
                ...prev,
                [sessionId]: finalHistory
            }));

            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Clear chat history for a session
    const clearChat = (sessionId = 'default') => {
        setChatHistory(prev => {
            const updated = { ...prev };
            delete updated[sessionId];
            return updated;
        });
    };

    // Get chat history for a session
    const getChatHistory = useCallback((sessionId = 'default') => {
        return chatHistory[sessionId] || EMPTY_CHAT_HISTORY;
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
