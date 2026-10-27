import test from 'node:test';
import assert from 'node:assert/strict';
import {
    buildDailyStudyPlan,
    getFlashcardNextReviewDate,
    getNextReviewIntervalDays,
    getStudyAnalytics,
    parsePracticeAssessment,
} from '../src/modules/Study/studyPlannerUtils.js';

const fixedNow = new Date('2026-10-27T12:00:00.000Z');

test('parses exam performance from saved question-level results', () => {
    const result = parsePracticeAssessment({
        id: 1,
        subject: 'Physics',
        mistake_type: 'practice_exam',
        created_at: '2026-10-27T10:00:00.000Z',
        question_content: JSON.stringify({
            questions: [
                { isCorrect: true, selectedAnswer: 'A', correctAnswer: 'A' },
                { isCorrect: false, selectedAnswer: 'B', correctAnswer: 'C' },
                { isCorrect: true, selectedAnswer: 'D', correctAnswer: 'D' },
                { isCorrect: false, selectedAnswer: null, correctAnswer: 'A' },
            ],
        }),
        notes: 'Score: 2/4 (50%).',
    });
    assert.equal(result.score, 50);
    assert.equal(result.correct, 2);
    assert.equal(result.total, 4);
    assert.equal(result.subject, 'Physics');
});

test('parses Feynman mastery and ignores unscored logs', () => {
    const feynman = parsePracticeAssessment({
        id: 2,
        subject: 'Cell Biology',
        mistake_type: 'feynman_mastery',
        created_at: '2026-10-26T10:00:00.000Z',
        question_content: JSON.stringify({ masteryScore: 8 }),
        notes: 'Feynman mastery score: 8/10.',
    });
    assert.equal(feynman.score, 80);
    assert.equal(parsePracticeAssessment({ mistake_type: 'other', notes: 'Saved a reflection' }), null);
});

test('analytics ranks the weaker subject and computes a recent activity count', () => {
    const logs = [
        { id: 1, subject: 'Math', mistake_type: 'practice_exam', created_at: '2026-10-27T09:00:00.000Z', question_content: JSON.stringify({ questions: [{ isCorrect: true }, { isCorrect: true }] }), notes: 'Score: 2/2 (100%).' },
        { id: 2, subject: 'Physics', mistake_type: 'practice_exam', created_at: '2026-10-26T09:00:00.000Z', question_content: JSON.stringify({ questions: [{ isCorrect: false }, { isCorrect: true }, { isCorrect: false }, { isCorrect: false }] }), notes: 'Score: 1/4 (25%).' },
        { id: 3, subject: 'Math', mistake_type: 'other', created_at: '2026-10-26T09:00:00.000Z', notes: 'Saved a note' },
    ];
    const analytics = getStudyAnalytics(logs, fixedNow);
    assert.equal(analytics.assessmentCount, 2);
    assert.equal(analytics.averageScore, 63);
    assert.equal(analytics.weakestSubject.subject, 'Physics');
    assert.equal(analytics.weakestSubject.averageScore, 25);
    assert.equal(analytics.activityLastSevenDays, 3);
});

test('daily plan prioritizes overdue reviews and urgent assignments within the budget', () => {
    const plan = buildDailyStudyPlan({
        now: fixedNow,
        budgetMinutes: 60,
        reviews: [
            { id: 1, content: 'Cell respiration', subject: 'Biology', next_review_date: '2026-10-24T09:00:00.000Z', interval_days: 1 },
            { id: 2, content: 'Current electricity', subject: 'Physics', next_review_date: '2026-10-28T09:00:00.000Z', interval_days: 1 },
        ],
        assignments: [
            { id: 10, title: 'Physics lab report', subject: 'Physics', deadline: '2026-10-27T23:59:00.000Z', status: 'not_started', steps: [{ name: 'Analysis', done: false }] },
            { id: 11, title: 'Completed work', deadline: '2026-10-26T23:59:00.000Z', status: 'completed', steps: [] },
        ],
        practiceLogs: [],
    });
    assert.equal(plan.dateKey, '2026-10-27');
    assert.equal(plan.plannedMinutes <= 60, true);
    assert.equal(plan.items[0].kind, 'review');
    assert.equal(plan.items.some(item => item.title === 'Completed work'), false);
    assert.equal(plan.items.some(item => item.kind === 'assignment'), true);
});

test('daily plan gives a helpful start when a student has no saved activity yet', () => {
    const plan = buildDailyStudyPlan({ now: fixedNow, reviews: [], assignments: [], practiceLogs: [], budgetMinutes: 60 });
    assert.equal(plan.items.length, 1);
    assert.equal(plan.items[0].kind, 'practice');
    assert.match(plan.items[0].title, /baseline/i);
});

test('review intervals adapt to recall rating', () => {
    assert.equal(getNextReviewIntervalDays('again', 6), 1);
    assert.equal(getNextReviewIntervalDays('hard', 2), 3);
    assert.equal(getNextReviewIntervalDays('good', 1), 3);
    assert.equal(getNextReviewIntervalDays('good', 3), 6);
    assert.equal(getNextReviewIntervalDays('easy', 2), 5);
});

test('flashcard ratings create distinct, predictable review dates', () => {
    assert.equal(getFlashcardNextReviewDate('again', fixedNow), '2026-10-27T12:10:00.000Z');
    assert.equal(getFlashcardNextReviewDate('hard', fixedNow), '2026-10-28T12:00:00.000Z');
    assert.equal(getFlashcardNextReviewDate('good', fixedNow), '2026-10-30T12:00:00.000Z');
    assert.equal(getFlashcardNextReviewDate('easy', fixedNow), '2026-11-03T12:00:00.000Z');
    assert.throws(() => getFlashcardNextReviewDate('maybe', fixedNow), /valid flashcard rating/i);
});
