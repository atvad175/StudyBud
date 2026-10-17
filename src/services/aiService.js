import { supabase } from '../supabaseClient';

const getAccessToken = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw new Error('Your session could not be verified. Please sign in again.');
    const accessToken = data?.session?.access_token;
    if (!accessToken) throw new Error('Sign in to use StudyBud AI.');
    return accessToken;
};

const requestAI = async (payload) => {
    const accessToken = await getAccessToken();
    let response;
    try {
        response = await fetch('/api/ai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
        });
    } catch {
        throw new Error('StudyBud AI could not connect. Check your connection and try again.');
    }

    let body;
    try {
        body = await response.json();
    } catch {
        throw new Error('StudyBud AI returned an unexpected response. Please try again.');
    }

    if (!response.ok) {
        if (response.status === 401) throw new Error('Your session expired. Sign in again.');
        if (response.status === 429) throw new Error(body?.error || 'You have made several AI requests. Please wait and try again.');
        throw new Error(body?.error || 'StudyBud AI could not complete that request. Please try again.');
    }

    return body?.result;
};

// AI availability now depends on authenticated access to the server endpoint.
// The provider API key is deliberately not read by the frontend.
export const isAIAvailable = () => Boolean(
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const getStudyRecommendation = async (subject, topic, currentLevel = 'beginner') =>
    requestAI({ operation: 'studyRecommendation', subject, topic, currentLevel });

export const getHabitCoaching = async (habitName, struggle = null) =>
    requestAI({ operation: 'habitCoaching', habitName, struggle });

export const getSupportiveGuidance = async (emotion, situation, nickname = 'friend') =>
    requestAI({ operation: 'supportiveGuidance', emotion, situation, nickname });

export const chat = async (messages, context = 'general') =>
    requestAI({ operation: 'chat', messages, context });

export const chatStream = async (messages, context = 'general', onChunk) => {
    // The endpoint currently returns the complete response. Keep the existing
    // callback contract so current screens work; true server-sent streaming can
    // be introduced separately when it is tested end to end.
    const result = await requestAI({ operation: 'chatStream', messages, context });
    if (typeof onChunk === 'function') onChunk(result, result);
    return result;
};

export const getCompanionWelcome = async (profile, persona = 'candid') =>
    requestAI({ operation: 'companionWelcome', profile, persona });

export const chatCompanion = async (messages, persona = 'candid', profile = {}) =>
    requestAI({ operation: 'companionChat', messages, persona, profile });

export const getMockExam = async (topic, numQuestions = 5) => {
    if (typeof topic !== 'string' || !topic.trim()) {
        throw new Error('Add a subject, topic, or study extract to generate a practice exam.');
    }
    if (!Number.isInteger(numQuestions) || numQuestions < 1 || numQuestions > 20) {
        throw new Error('Choose between 1 and 20 questions per practice exam.');
    }
    return requestAI({ operation: 'mockExam', topic: topic.slice(0, 12000), numQuestions });
};

export default {
    isAIAvailable,
    getStudyRecommendation,
    getHabitCoaching,
    getSupportiveGuidance,
    getCompanionWelcome,
    chatCompanion,
    chat,
    chatStream,
    getMockExam,
};
