import test from 'node:test';
import assert from 'node:assert/strict';
import { getCurrentHabitStreak } from '../src/modules/Habits/habitStats.js';
import { getLocalDateKey } from '../src/utils/localDateKey.js';

const dayKey = (date, daysAgo = 0) => {
    const value = new Date(date);
    value.setDate(value.getDate() - daysAgo);
    return getLocalDateKey(value);
};

const completedLog = (atomId = 1) => ({
    [atomId]: { status: 'completed' },
});

test('counts the real streak when a habit was completed today and on prior days', () => {
    const now = new Date(2026, 9, 22, 12, 0);
    const logs = {
        [dayKey(now)]: completedLog(1),
        [dayKey(now, 1)]: completedLog(2),
        [dayKey(now, 2)]: completedLog(1),
        [dayKey(now, 4)]: completedLog(1),
    };

    assert.equal(getCurrentHabitStreak(logs, now), 3);
});

test('keeps yesterday streak during an unfinished current day', () => {
    const now = new Date(2026, 9, 22, 9, 0);
    const logs = {
        [dayKey(now)]: { 1: { status: 'skipped' } },
        [dayKey(now, 1)]: completedLog(1),
        [dayKey(now, 2)]: completedLog(1),
    };

    assert.equal(getCurrentHabitStreak(logs, now), 2);
});

test('returns zero when the prior day has no completed habit', () => {
    const now = new Date(2026, 9, 22, 12, 0);
    const logs = {
        [dayKey(now)]: { 1: { status: 'pending' } },
        [dayKey(now, 1)]: { 1: { status: 'skipped' } },
        [dayKey(now, 2)]: completedLog(1),
    };

    assert.equal(getCurrentHabitStreak(logs, now), 0);
});

test('counts a current-day completion as a one-day streak', () => {
    const now = new Date(2026, 9, 22, 12, 0);
    assert.equal(getCurrentHabitStreak({ [dayKey(now)]: completedLog() }, now), 1);
});

test('handles missing or malformed history safely', () => {
    const now = new Date(2026, 9, 22, 12, 0);
    assert.equal(getCurrentHabitStreak(null, now), 0);
    assert.equal(getCurrentHabitStreak([], now), 0);
    assert.equal(getCurrentHabitStreak({ invalid: completedLog() }, now), 0);
});
