import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Model fallback chain — tries each in order on quota errors
const MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash'];

let genAI = null;

const getClient = () => {
    if (!API_KEY) return null;
    if (!genAI) genAI = new GoogleGenerativeAI(API_KEY);
    return genAI;
};

const isQuotaError = (error) => {
    const msg = error?.message || '';
    const status = error?.status || error?.httpErrorCode || 0;
    return status === 429 ||
        msg.includes('429') ||
        msg.toLowerCase().includes('quota') ||
        msg.toLowerCase().includes('resource exhausted') ||
        msg.toLowerCase().includes('rate limit') ||
        msg.toLowerCase().includes('too many requests');
};

const parseAIError = (error) => {
    // Log the raw error so developers can immediately see the true cause in F12 console
    console.error('[AI SERVICE RAW ERROR]:', error);

    const msg = error?.message || '';
    const msgLower = msg.toLowerCase();

    // Quota / rate limit — check this FIRST before generic network
    if (isQuotaError(error)) {
        return '😴 Bud needs a breather — the free AI quota for today has been reached. The quota resets every 24 hours. Everything else in the app still works perfectly!';
    }
    if (msg.includes('400') || msgLower.includes('api key') || msgLower.includes('api_key_invalid')) {
        return '🔑 Bud cannot connect. Your API key is invalid or misshaped. Please verify VITE_GEMINI_API_KEY in your .env file.';
    }
    if (msg.includes('403')) {
        return '🚫 Access denied. Check that your API key has Gemini API permission in Google AI Studio.';
    }
    if (msg.includes('500') || msg.includes('503')) {
        return '🔧 Google\'s AI servers are temporarily unavailable. Please try again in a few moments.';
    }
    if (msgLower.includes('failed to fetch') || msgLower.includes('networkerror') || msgLower.includes('network request failed')) {
        return '😴 AI quota may be exhausted for today, or there was a temporary connection issue. Please try again in a few moments or tomorrow.';
    }
    return `Something went wrong: ${msg.substring(0, 80)}. Please try again.`;
};

export const isAIAvailable = () => !!getClient();

// Core generation with model fallback
const generateWithFallback = async (buildPrompt) => {
    const client = getClient();
    if (!client) throw new Error('🔑 AI not configured. Add VITE_GEMINI_API_KEY to your .env file.');

    let lastError;
    for (const modelName of MODELS) {
        try {
            const model = client.getGenerativeModel({ model: modelName });
            return await buildPrompt(model);
        } catch (err) {
            if (isQuotaError(err) && modelName !== MODELS[MODELS.length - 1]) {
                console.warn(`${modelName} quota hit — falling back to next model`);
                lastError = err;
                continue;
            }
            throw err;
        }
    }
    throw lastError;
};

export const getStudyRecommendation = async (subject, topic, currentLevel = 'beginner') => {
    const prompt = `You are a strict but supportive life and discipline coach helping a ${currentLevel} person master the skill of ${subject}.
Topic: ${topic}
Provide a concise, actionable mastery plan with:
1. The best learning technique (Active Recall, Spaced Review, First Principles, Practice, etc.)
2. Why this technique builds mastery for this topic
3. A 3-step actionable protocol to execute today
4. One common trap or excuse to avoid
Keep under 200 words, intense but empowering.`;

    try {
        return await generateWithFallback(async (model) => {
            const result = await model.generateContent(prompt);
            return result.response.text();
        });
    } catch (error) {
        throw new Error(parseAIError(error));
    }
};

export const getHabitCoaching = async (habitName, struggle = null) => {
    const prompt = struggle
        ? `You are a supportive habit coach. User wants habit: "${habitName}" but struggles with: "${struggle}". Provide: 1. Empathetic acknowledgment 2. One practical tip 3. Motivational reminder. Under 150 words, warm.`
        : `You are a supportive habit coach. User wants habit: "${habitName}". Provide: 1. Why it's valuable 2. Tip to stick with it 3. Motivational quote. Under 150 words, warm.`;

    try {
        return await generateWithFallback(async (model) => {
            const result = await model.generateContent(prompt);
            return result.response.text();
        });
    } catch (error) {
        throw new Error(parseAIError(error));
    }
};

export const getSupportiveGuidance = async (emotion, situation, nickname = 'friend') => {
    const prompt = `You are a compassionate supporter talking to ${nickname}. They feel ${emotion} about: "${situation}".
Provide: 1. Validation 2. Gentle reframing 3. One grounding technique.
Be warm, non-judgmental, empowering. Under 150 words. Do NOT say you are an AI.`;

    try {
        return await generateWithFallback(async (model) => {
            const result = await model.generateContent(prompt);
            return result.response.text();
        });
    } catch (error) {
        throw new Error(parseAIError(error));
    }
};

export const chat = async (messages, context = 'general') => {
    const contextPrompts = {
        study: 'You are a strict but supportive discipline coach pushing the user to mastery using inquiry-based coaching.',
        habits: 'You are an elite habit coach helping the user forge iron routines and break bad cycles.',
        mind: 'You are a resilient mindset coach for mental toughness and emotional balance. Never mention you are an AI.',
        general: 'You are Bud, a high-performance AI life coach inside the StudyBud app. Push the user to design an extraordinary life.',
    };

    const conversationHistory = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
    }));

    try {
        return await generateWithFallback(async (model) => {
            const chatSession = model.startChat({
                history: conversationHistory.slice(0, -1),
                generationConfig: { maxOutputTokens: 500 },
            });
            const lastMsg = messages[messages.length - 1];
            const result = await chatSession.sendMessage(lastMsg.content);
            return result.response.text();
        });
    } catch (error) {
        throw new Error(parseAIError(error));
    }
};

export const chatStream = async (messages, context = 'general', onChunk) => {
    const conversationHistory = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
    }));

    try {
        return await generateWithFallback(async (model) => {
            const chatSession = model.startChat({
                history: conversationHistory.slice(0, -1),
            });
            const lastMsg = messages[messages.length - 1];
            const result = await chatSession.sendMessageStream(lastMsg.content);
            let fullText = '';
            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                fullText += chunkText;
                if (onChunk) onChunk(chunkText, fullText);
            }
            return fullText;
        });
    } catch (error) {
        throw new Error(parseAIError(error));
    }
};

export const getMockExam = async (topic, numQuestions = 5) => {
    const prompt = `You are an expert examiner. Generate a multiple-choice mock exam about: "${topic}".
Generate exactly ${numQuestions} questions.
Return ONLY a valid JSON array. Do not include any other text.
Each object: { "question": string, "options": [4 strings], "correctAnswer": string }`;

    try {
        return await generateWithFallback(async (model) => {
            const result = await model.generateContent(prompt);
            let text = result.response.text();
            
            // Extract the first array bracket and the last
            const firstBracket = text.indexOf('[');
            const lastBracket = text.lastIndexOf(']');
            if (firstBracket !== -1 && lastBracket !== -1) {
                text = text.slice(firstBracket, lastBracket + 1);
            }
            
            return JSON.parse(text);
        });
    } catch (error) {
        console.error("Mock Exam Parsing Error:", error);
        throw new Error(parseAIError(error));
    }
};

export default { isAIAvailable, getStudyRecommendation, getHabitCoaching, getSupportiveGuidance, chat, chatStream, getMockExam };
