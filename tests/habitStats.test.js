import test from 'node:test';
import assert from 'node:assert/strict';
import { buildHabitStreakData } from '../src/modules/Habits/habitStats.js';

const makeLogs = dates => Object.fromEntries(dates.map(date => [
    date,
    { habitA: { status: 'completed' } },
]));

test('13-week heatmap starts on Monday and includes the current week', () => {
    const now = new Date(2026, 10, 9, 15, 0, 0); // Monday
    const result = buildHabitStreakData({}, now);
    assert.equal(result.heatmap.length, 91);
    assert.equal(new Date(result.heatmap[0].date + 'T00:00:00').getDay(), 1);
    assert.equal(result.heatmap[84].date, '2026-11-09');
    assert.equal(result.heatmap[85].isFuture, true);
});

test('longest recorded streak includes history older than the heatmap', () => {
    const dates = Array.from({ length: 30 }, (_, index) => {
        const date = new Date(2026, 2, 1 + index);
        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, '0'),
            String(date.getDate()).padStart(2, '0'),
        ].join('-');
    });
    const result = buildHabitStreakData(makeLogs(dates), new Date(2026, 10, 9, 12));
    assert.equal(result.stats.longestStreak, 30);
});

test('current streak continues through yesterday but resets after two missed days', () => {
    const yesterday = makeLogs(['2026-11-08']);
    const stillCurrent = buildHabitStreakData(yesterday, new Date(2026, 10, 9, 12));
    assert.equal(stillCurrent.stats.currentStreak, 1);

    const twoDaysAgo = makeLogs(['2026-11-07']);
    const ended = buildHabitStreakData(twoDaysAgo, new Date(2026, 10, 9, 12));
    assert.equal(ended.stats.currentStreak, 0);
});

test('monthly activity uses elapsed days in the current month only', () => {
    const logs = makeLogs(['2026-11-01', '2026-11-03', '2026-10-31']);
    const result = buildHabitStreakData(logs, new Date(2026, 10, 9, 12));
    assert.equal(result.stats.monthActiveDays, 2);
    assert.equal(result.stats.monthElapsedDays, 9);
    assert.equal(result.stats.monthActiveRate, 22);
});

test('invalid dates and future logs are ignored', () => {
    const logs = {
        '2026-02-31': { a: { status: 'completed' } },
        '2026-11-10': { a: { status: 'completed' } },
        '2026-11-09': { a: { status: 'pending' } },
    };
    const result = buildHabitStreakData(logs, new Date(2026, 10, 9, 12));
    assert.equal(result.stats.currentStreak, 0);
    assert.equal(result.stats.longestStreak, 0);
});
