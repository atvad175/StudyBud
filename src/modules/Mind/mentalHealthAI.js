import React from 'react';

// A sophisticated pattern-matching AI loop simulation
// This replaces an external API for the "Source it yourself" requirement.

export const processUserMessage = (input) => {
    const text = input.toLowerCase();

    // 1. Validation Logic
    if (text.length < 3) return { text: "I'm listening. Could you say a bit more?", action: 'wait' };

    // 2. Pattern Matching Dictionary
    const patterns = [
        {
            keywords: ['tired', 'exhausted', 'drain', 'fatigue', 'sleep'],
            response: "It sounds like your battery is fully depleted. Physical rest is productivity, not the enemy of it. Can you grant yourself permission to do absolutely nothing for 15 minutes?",
            mode: 'comfort'
        },
        {
            keywords: ['fail', 'stupid', 'dumb', 'idiot', 'useless'],
            response: "I hear a lot of self-attack in that statement. Let's look at the evidence. Is this a permanent trait, or a temporary situation? You are not your output.",
            mode: 'analysis'
        },
        {
            keywords: ['anxious', 'scared', 'panic', 'nervous', 'racing'],
            response: "Take a breath with me. Anxiety is just your body's energy trying to find a place to go. Let's ground it. Name 3 things you can see right now.",
            mode: 'comfort'
        },
        {
            keywords: ['overwhelmed', 'too much', 'drowning', 'stuck'],
            response: "The mountain looks huge because you're looking at the summit. Look at your feet. What is the single smallest, stupidest step you can take right now? Just one.",
            mode: 'straight'
        },
        {
            keywords: ['procrastinat', 'lazy', 'avoid', 'doomscrolling'],
            response: "Procrastination isn't laziness; it's emotional regulation. You're avoiding the *feeling* of the task, not the task itself. What is the feeling you're avoiding? Fear? Boredom?",
            mode: 'analysis'
        },
        {
            keywords: ['lonely', 'alone', 'isolated'],
            response: "Isolation distorts reality. It makes problems feel infinite. You are valid, and your struggle is real. I'm right here with you.",
            mode: 'comfort'
        }
    ];

    // 3. Find Match
    for (const p of patterns) {
        if (p.keywords.some(k => text.includes(k))) {
            return p.response;
        }
    }

    // 4. Default Reflective Responses (Eliza-style but smarter)
    const defaults = [
        "That sounds heavy. Tell me more about what that feels like in your body.",
        "I understand. What do you think is the root driver of this feeling?",
        "Thank you for sharing that with me. How long have you been carrying this?",
        "It's okay to feel this way. It makes sense given the context.",
        "Let's unpack that. What would you tell a friend who said this to you?"
    ];

    return defaults[Math.floor(Math.random() * defaults.length)];
};
