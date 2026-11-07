const DAY_MS = 24 * 60 * 60 * 1000;

const asDate = value => {
    if (!value) return null;
    const parsed = value instanceof Date ? new Date(value) : new Date(value);
    return Number.isFinite(parsed.getTime()) ? parsed : null;
};

const parseQuestionPayload = raw => {
    if (!raw || typeof raw !== 'string') return {};
    try {
        const value = JSON.parse(raw);
        return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    } catch {
        return {};
    }
};

export const parsePracticeAssessment = log => {
    if (!log || typeof log !== 'object') return null;
    const payload = parseQuestionPayload(log.question_content);
    const subject = String(log.subject || payload.topic || 'General practice').trim() || 'General practice';
    const createdAt = asDate(log.created_at)?.toISOString() || null;

    if (Array.isArray(payload.questions) && payload.questions.length > 0) {
        const scored = payload.questions.filter(question => typeof question?.isCorrect === 'boolean');
        if (scored.length > 0) {
            const correct = scored.filter(question => question.isCorrect).length;
            return {
                id: log.id ?? createdAt ?? subject,
                subject,
                score: Math.round((correct / scored.length) * 100),
                correct,
                total: scored.length,
                date: createdAt,
                kind: log.mistake_type === 'practice_exam' ? 'Practice exam' : 'Practice',
                questions: payload.questions,
                notes: log.notes || '',
            };
        }
    }

    if (log.mistake_type === 'feynman_mastery') {
        const rawScore = Number(payload.masteryScore);
        if (Number.isFinite(rawScore) && rawScore >= 0 && rawScore <= 10) {
            return {
                id: log.id ?? createdAt ?? subject,
                subject,
                score: Math.round(rawScore * 10),
                correct: rawScore,
                total: 10,
                date: createdAt,
                kind: 'Feynman mastery',
                questions: [],
                notes: log.notes || '',
            };
        }
    }

    const match = String(log.notes || '').match(/Score:\s*(\d+)\s*\/\s*(\d+)/i);
    if (match) {
        const correct = Number(match[1]);
        const total = Number(match[2]);
        if (total > 0 && correct >= 0 && correct <= total) {
            return {
                id: log.id ?? createdAt ?? subject,
                subject,
                score: Math.round((correct / total) * 100),
                correct,
                total,
                date: createdAt,
                kind: 'Practice',
                questions: [],
                notes: log.notes || '',
            };
        }
    }

    return null;
};

export const getStudyAnalytics = (practiceLogs = [], now = new Date()) => {
    const safeLogs = Array.isArray(practiceLogs) ? practiceLogs : [];
    const assessments = safeLogs
        .map(parsePracticeAssessment)
        .filter(Boolean)
        .sort((a, b) => (asDate(b.date)?.getTime() || 0) - (asDate(a.date)?.getTime() || 0));

    const subjectMap = new Map();
    assessments.forEach(attempt => {
        const key = attempt.subject.toLocaleLowerCase();
        const current = subjectMap.get(key) || {
            subject: attempt.subject,
            attempts: 0,
            scoreTotal: 0,
            latestScore: null,
        };
        current.attempts += 1;
        current.scoreTotal += attempt.score;
        if (current.latestScore === null) current.latestScore = attempt.score;
        subjectMap.set(key, current);
    });

    const subjectPerformance = [...subjectMap.values()]
        .map(item => ({
            ...item,
            averageScore: Math.round(item.scoreTotal / item.attempts),
        }))
        .sort((a, b) => a.averageScore - b.averageScore || b.attempts - a.attempts);

    const lastSevenDays = now.getTime() - 7 * DAY_MS;
    const activityLastSevenDays = safeLogs.filter(log => {
        const date = asDate(log?.created_at);
        return date && date.getTime() >= lastSevenDays && date.getTime() <= now.getTime();
    }).length;

    return {
        totalPracticeRecords: safeLogs.length,
        activityLastSevenDays,
        assessments,
        assessmentCount: assessments.length,
        averageScore: assessments.length
            ? Math.round(assessments.reduce((sum, item) => sum + item.score, 0) / assessments.length)
            : null,
        latestAssessment: assessments[0] || null,
        previousAssessment: assessments[1] || null,
        scoreChange: assessments.length > 1 ? assessments[0].score - assessments[1].score : null,
        subjectPerformance,
        weakestSubject: subjectPerformance[0] || null,
        recentAssessments: assessments.slice(0, 5),
    };
};

const getAssignmentDeadline = assignment =>
    assignment?.deadline || assignment?.due_date || assignment?.due_at || null;

export const buildDailyStudyPlan = ({
    assignments = [],
    reviews = [],
    practiceLogs = [],
    now = new Date(),
    budgetMinutes = 90,
} = {}) => {
    const current = asDate(now) || new Date();
    const startOfToday = new Date(current);
    startOfToday.setHours(0, 0, 0, 0);
    const safeBudget = Math.max(15, Math.min(240, Number(budgetMinutes) || 90));
    const analytics = getStudyAnalytics(practiceLogs, current);
    const candidates = [];

    (Array.isArray(reviews) ? reviews : []).forEach(review => {
        const dueDate = asDate(review?.next_review_date);
        if (!dueDate || dueDate.getTime() > current.getTime()) return;
        const daysOverdue = Math.max(0, Math.floor((startOfToday.getTime() - dueDate.getTime()) / DAY_MS));
        candidates.push({
            id: `review:${review.id}`,
            kind: 'review',
            sourceId: review.id,
            title: review.content || review.subject || 'Scheduled topic review',
            subject: review.subject || '',
            description: 'Retrieve the idea from memory first, then check your notes and close the gaps.',
            minutes: 12,
            priority: dueDate.getTime() < startOfToday.getTime() ? 100 + Math.min(daysOverdue, 20) : 92,
            priorityLabel: daysOverdue > 0 ? `${daysOverdue}d overdue` : 'Due today',
            route: '/study/plan',
        });
    });

    (Array.isArray(assignments) ? assignments : [])
        .filter(item => String(item?.status || '').toLowerCase() !== 'completed')
        .forEach(assignment => {
            const deadline = asDate(getAssignmentDeadline(assignment));
            const remainingSteps = Array.isArray(assignment?.steps)
                ? assignment.steps.filter(step => !step?.done).length
                : 0;
            const daysToDue = deadline
                ? Math.ceil((deadline.getTime() - startOfToday.getTime()) / DAY_MS)
                : null;
            const overdue = daysToDue !== null && daysToDue < 0;
            const nearDeadline = daysToDue !== null && daysToDue <= 3;
            candidates.push({
                id: `assignment:${assignment.id}`,
                kind: 'assignment',
                sourceId: assignment.id,
                title: assignment.title || assignment.name || 'Untitled assignment',
                subject: assignment.subject || '',
                description: remainingSteps
                    ? `Work through the next step. ${remainingSteps} step${remainingSteps === 1 ? '' : 's'} remain.`
                    : 'Define the next deliverable, then work on it for one focused block.',
                minutes: Math.min(40, Math.max(20, remainingSteps * 12 || 25)),
                priority: overdue ? 98 : nearDeadline ? 84 - Math.max(daysToDue ?? 0, 0) : 58,
                priorityLabel: overdue ? 'Overdue' : daysToDue === 0 ? 'Due today' : daysToDue !== null && daysToDue > 0 ? `Due in ${daysToDue}d` : 'Open task',
                route: '/study/assignments',
            });
        });

    if (analytics.weakestSubject) {
        candidates.push({
            id: `practice:${analytics.weakestSubject.subject.toLocaleLowerCase()}`,
            kind: 'practice',
            sourceId: null,
            title: `Strengthen ${analytics.weakestSubject.subject}`,
            subject: analytics.weakestSubject.subject,
            description: `Your recent saved assessments average ${analytics.weakestSubject.averageScore}%. Try active recall, then a short practice quiz.`,
            minutes: 25,
            priority: 76,
            priorityLabel: 'Focus area',
            route: '/study/exams',
        });
    }

    if (candidates.length === 0) {
        candidates.push({
            id: 'practice:starter',
            kind: 'practice',
            sourceId: null,
            title: 'Build a baseline with a short quiz',
            subject: '',
            description: 'Choose one current topic, attempt a few questions without notes, then save the gaps for your next session.',
            minutes: 20,
            priority: 60,
            priorityLabel: 'Good starting point',
            route: '/study/exams',
        });
    }

    candidates.sort((a, b) => b.priority - a.priority || a.minutes - b.minutes);
    const selected = [];
    let usedMinutes = 0;
    for (const item of candidates) {
        if (selected.length >= 5) break;
        if (usedMinutes + item.minutes > safeBudget) {
            if (selected.length === 0) {
                selected.push({ ...item, minutes: safeBudget });
                usedMinutes = safeBudget;
            }
            continue;
        }
        selected.push(item);
        usedMinutes += item.minutes;
    }

    return {
        dateKey: `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`,
        budgetMinutes: safeBudget,
        plannedMinutes: usedMinutes,
        items: selected,
        analytics,
    };
};

export const getNextReviewIntervalDays = (rating, currentInterval = 1) => {
    const interval = Math.max(1, Number(currentInterval) || 1);
    switch (rating) {
        case 'again': return 1;
        case 'hard': return Math.max(2, Math.ceil(interval * 1.5));
        case 'easy': return Math.max(4, Math.round(interval * 2.5));
        case 'good':
        default:
            return interval <= 1 ? 3 : Math.round(interval * 2);
    }
};

const FLASHCARD_DELAYS_MS = {
    again: 10 * 60 * 1000,
    hard: DAY_MS,
    good: 3 * DAY_MS,
    easy: 7 * DAY_MS,
};

export const getFlashcardNextReviewDate = (rating, now = new Date()) => {
    const delay = FLASHCARD_DELAYS_MS[rating];
    if (!delay) throw new Error('Choose a valid flashcard rating.');
    const current = asDate(now);
    if (!current) throw new Error('A valid current date is required.');
    return new Date(current.getTime() + delay).toISOString();
};
