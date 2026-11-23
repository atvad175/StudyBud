import test from 'node:test';
import assert from 'node:assert/strict';
import { getLocalDateKey } from '../src/utils/localDateKey.js';

test('uses the local calendar date rather than the UTC date', () => {
    const justAfterLocalMidnight = new Date(2026, 9, 21, 0, 15, 0);
    assert.equal(getLocalDateKey(justAfterLocalMidnight), '2026-10-21');
});

test('pads single-digit months and days', () => {
    assert.equal(getLocalDateKey(new Date(2026, 0, 3, 12, 0, 0)), '2026-01-03');
});

test('accepts date-like values and returns an empty key for invalid dates', () => {
    assert.equal(getLocalDateKey('2026-10-21T08:00:00'), '2026-10-21');
    assert.equal(getLocalDateKey('not-a-date'), '');
});
