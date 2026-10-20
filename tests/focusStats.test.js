import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeFocusSessions } from '../src/modules/Focus/focusStats.js';

const localDate = (year, month, day, hour = 12, minute = 0) =>
    new Date(year, month, day, hour, minute).toISOString();

test('counts saved sessions and minutes for today', () => {
    const now = new Date(2026, 0, 8, 12, 0);
    const sessions = [
        { created_at: localDate(2026, 0, 8, 9), duration_seconds: 1500 },
        { created_at: localDate(2026, 0, 8, 11), duration_seconds: 600 },
        { created_at: localDate(2026, 0, 7, 11), duration_seconds: 900 },
    ];

    assert.deepEqual(summarizeFocusSessions(sessions, now), {
        sessionsToday: 2,
        minutesToday: 35,
        sessionsLastSevenDays: 3,
        minutesLastSevenDays: 50,
    });
});

test('excludes sessions outside the rolling seven-day window', () => {
    const now = new Date(2026, 0, 8, 12, 0);
    const sessions = [
        { created_at: localDate(2026, 0, 8, 10), duration_seconds: 600 },
        { created_at: localDate(2025, 11, 30, 10), duration_seconds: 3600 },
        { created_at: localDate(2026, 0, 8, 13), duration_seconds: 600 },
    ];

    assert.deepEqual(summarizeFocusSessions(sessions, now), {
        sessionsToday: 1,
        minutesToday: 10,
        sessionsLastSevenDays: 1,
        minutesLastSevenDays: 10,
    });
});

test('returns zero metrics for an empty session history', () => {
    assert.deepEqual(summarizeFocusSessions([], new Date(2026, 0, 8, 12, 0)), {
        sessionsToday: 0,
        minutesToday: 0,
        sessionsLastSevenDays: 0,
        minutesLastSevenDays: 0,
    });
});

test('ignores invalid dates and invalid or negative durations', () => {
    const now = new Date(2026, 0, 8, 12, 0);
    const sessions = [
        { created_at: 'not-a-date', duration_seconds: 1200 },
        { created_at: localDate(2026, 0, 8, 10), duration_seconds: -50 },
        { created_at: localDate(2026, 0, 8, 11), duration_seconds: 'bad' },
    ];

    assert.deepEqual(summarizeFocusSessions(sessions, now), {
        sessionsToday: 2,
        minutesToday: 0,
        sessionsLastSevenDays: 2,
        minutesLastSevenDays: 0,
    });
});

test('handles a non-array session value without throwing', () => {
    assert.deepEqual(summarizeFocusSessions(null, new Date(2026, 0, 8, 12, 0)), {
        sessionsToday: 0,
        minutesToday: 0,
        sessionsLastSevenDays: 0,
        minutesLastSevenDays: 0,
    });
});
