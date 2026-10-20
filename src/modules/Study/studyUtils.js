// Spaced Repetition Algorithm (SM-2)
export const calculateNextReview = (quality, interval, repetition) => {
    // quality: 0-5 (how well you remembered)
    // interval: days until next review
    // repetition: number of times reviewed

    let newInterval = interval;
    let newRepetition = repetition;
    let easeFactor = 2.5;

    if (quality >= 3) {
        if (repetition === 0) {
            newInterval = 1;
        } else if (repetition === 1) {
            newInterval = 6;
        } else {
            newInterval = Math.round(interval * easeFactor);
        }
        newRepetition += 1;
    } else {
        newRepetition = 0;
        newInterval = 1;
    }

    return {
        interval: newInterval,
        repetition: newRepetition,
        nextReviewDate: new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000)
    };
};

// Study Session Recommendations
// Treat the learner's stated energy/availability as preferences, not measurements.
// If the user has not set a preference, use the current daypart only as a neutral default.
export const getStudyRecommendation = (timeOfDay, energyLevel, subject) => {
    const hour = new Date().getHours();
    const selectedDaypart = String(timeOfDay || '').trim().toLowerCase();
    const daypart = selectedDaypart || (hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening');
    const energy = String(energyLevel || 'medium').trim().toLowerCase();
    const chosenSubject = typeof subject === 'string' ? subject.trim() : '';
    const subjectRecommendation = chosenSubject ? [chosenSubject, 'Flashcards', 'Practice Questions'] : null;

    if (energy === 'low' || daypart.includes('evening') || daypart.includes('night')) {
        return {
            recommended: subjectRecommendation || ['Review', 'Flashcards', 'Light Practice'],
            technique: 'Spaced Review',
            duration: 20,
            reason: 'A short review session may be a manageable option when you want a lighter task.'
        };
    }

    if (energy === 'high' || daypart.includes('morning')) {
        return {
            recommended: subjectRecommendation || ['Math', 'Science', 'Problem Solving'],
            technique: 'Practice Problems',
            duration: 35,
            reason: 'If you feel alert, try a focused problem-solving session and adjust the length to suit your day.'
        };
    }

    return {
        recommended: subjectRecommendation || ['Reading', 'Active Recall', 'Short Practice'],
        technique: 'Active Recall & Outlines',
        duration: 25,
        reason: 'Try a balanced session with recall and a few practice questions; change the method if it does not fit your energy or subject.'
    };
};

// Mistake Pattern Analysis
export const analyzeMistakePatterns = (logs) => {
    const patterns = {
        didnt_understand: [],
        forgot: [],
        rushed: [],
        careless: [],
        skipped_step: []
    };

    logs.forEach(log => {
        if (patterns[log.mistake_type]) {
            patterns[log.mistake_type].push(log);
        }
    });

    // Find dominant pattern
    const counts = Object.entries(patterns).map(([type, items]) => ({
        type,
        count: items.length
    }));

    counts.sort((a, b) => b.count - a.count);

    return {
        patterns,
        dominant: counts[0],
        recommendation: getRecommendationForPattern(counts[0]?.type)
    };
};

const getRecommendationForPattern = (patternType) => {
    const recommendations = {
        didnt_understand: "Focus on understanding concepts before memorizing. Use 'Explain in Your Words' technique.",
        forgot: "Increase review frequency. Use spaced repetition to strengthen memory.",
        rushed: "Slow down. Quality over speed. Take breaks between problems.",
        careless: "Double-check your work. Create a checklist of common mistakes.",
        skipped_step: "Write out every step, even if it seems obvious. Build the habit."
    };

    return recommendations[patternType] || "Keep practicing consistently.";
};

// Progress Tracking
export const calculateStudyStreak = (sessions) => {
    if (!sessions || sessions.length === 0) return 0;

    let streak = 0;
    const today = new Date().setHours(0, 0, 0, 0);

    for (let i = 0; i < sessions.length; i++) {
        const sessionDate = new Date(sessions[i].created_at).setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((today - sessionDate) / (1000 * 60 * 60 * 24));

        if (daysDiff === i) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
};
