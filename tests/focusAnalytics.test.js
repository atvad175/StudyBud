import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeFocusWindow } from '../src/modules/Focus/focusStats.js';

const localDate = (year, month, day, hour = 12) =>
    new Date(year, month, day, hour, 0, 0).toISOString();

test('builds a seven-day activity series including empty days', () => {
    const now = new Date(2026, 4, 10, 14, 0);
    const result = summarizeFocusWindow([
        { created_at: localDate(2026, 4, 10, 9), duration_seconds: 1800, category: 'Maths' },
        { created_at: localDate(2026, 4, 8, 9), duration_seconds: 900, category: 'Physics' },
    ], 7, now);
    assert.equal(result.dailyBuckets.length, 7);
    assert.equal(result.totalSessions, 2);
    assert.equal(result.totalMinutes, 45);
    assert.equal(result.activeDays, 2);
    assert.equal(result.dailyBuckets[6].sessions, 1);
    assert.equal(result.dailyBuckets[4].sessions, 1);
    assert.equal(result.dailyBuckets[2].sessions, 0);
});

test('thirty-day view includes sessions across the full calendar window', () => {
    const now = new Date(2026, 4, 30, 18, 0);
    const result = summarizeFocusWindow([
        { created_at: localDate(2026, 4, 1), duration_seconds: 3600, category: 'Maths' },
        { created_at: localDate(2026, 4, 2), duration_seconds: 1800, category: 'Physics' },
        { created_at: localDate(2026, 2, 1), duration_seconds: 900, category: 'Old' },
        { created_at: localDate(2026, 4, 31), duration_seconds: 600, category: 'Future' },
    ], 30, now);
    assert.equal(result.days, 30);
    assert.equal(result.totalSessions, 2);
    assert.equal(result.totalMinutes, 90);
    assert.equal(result.dailyBuckets.length, 30);
});

test('groups category totals by saved duration and sorts largest first', () => {
    const now = new Date(2026, 4, 10, 14, 0);
    const result = summarizeFocusWindow([
        { created_at: localDate(2026, 4, 10), duration_seconds: 600, category: 'Maths' },
        { created_at: localDate(2026, 4, 9), duration_seconds: 2400, category: 'Physics' },
        { created_at: localDate(2026, 4, 9), duration_seconds: 1200, category: 'Physics' },
    ], 7, now);
    assert.deepEqual(result.categories.map(item => item.category), ['Physics', 'Maths']);
    assert.equal(result.categories[0].minutes, 60);
    assert.equal(result.categories[0].sessions, 2);
});

test('ignores malformed records and falls back to an uncategorised label', () => {
    const now = new Date(2026, 4, 10, 14, 0);
    const result = summarizeFocusWindow([
        { created_at: 'bad-date', duration_seconds: 1200, category: 'Ignore' },
        { created_at: localDate(2026, 4, 10), duration_seconds: -10, category: '' },
        { created_at: localDate(2026, 4, 9), duration_seconds: 120, category: '  ' },
    ], 7, now);
    assert.equal(result.totalSessions, 2);
    assert.equal(result.totalMinutes, 2);
    assert.equal(result.categories[0].category, 'Uncategorised');
});

test('rejects an invalid injected date rather than silently corrupting analytics', () => {
    assert.throws(() => summarizeFocusWindow([], 7, new Date('invalid')), /valid date/);
});
