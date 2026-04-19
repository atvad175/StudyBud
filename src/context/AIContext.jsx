import React, { createContext, useContext, useState } from 'react';
import * as aiService from '../services/aiService';

const AIContext = createContext();

export const useAI = () => {
    const context = useContext(AIContext);
    if (!context) throw new Error('useAI must be used within AIProvider');
    return context;
};

export const AIProvider = ({ children }) => {
    const [isAvailable, setIsAvailable] = useState(aiService.isAIAvailable());
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
        const updatedHistory = [...history, newMessage];

        try {
            const response = await aiService.chat(updatedHistory, context);
            const assistantMessage = { role: 'assistant', content: response };

            // Update chat history
            const finalHistory = [...updatedHistory, assistantMessage];
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
        const updatedHistory = [...history, newMessage];

        try {
            const response = await aiService.chatStream(updatedHistory, context, onChunk);
            const assistantMessage = { role: 'assistant', content: response };

            const finalHistory = [...updatedHistory, assistantMessage];
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
    const getChatHistory = (sessionId = 'default') => {
        return chatHistory[sessionId] || [];
    };

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
