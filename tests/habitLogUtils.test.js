import test from 'node:test';
import assert from 'node:assert/strict';
import { buildHabitLogMap, buildHabitLogPayload } from '../src/modules/Habits/habitLogUtils.js';

test('mood-only updates preserve completed status and other saved details', () => {
    const payload = buildHabitLogPayload({
        atomId: 7,
        date: '2026-11-09',
        userId: 'student-1',
        previousLog: { status: 'completed', duration: 25, time: 'After school' },
        changes: { mood: 'Good' },
    });
    assert.equal(payload.status, 'completed');
    assert.equal(payload.mood, 'Good');
    assert.equal(payload.duration, 25);
    assert.equal(payload.time, 'After school');
});

test('time and duration edits do not reset a completed habit', () => {
    const payload = buildHabitLogPayload({
        atomId: 7,
        date: '2026-11-09',
        userId: 'student-1',
        previousLog: { status: 'completed', mood: 'Amazing', duration: 10, time: 'Morning' },
        changes: { duration: 35, time: 'Evening' },
    });
    assert.equal(payload.status, 'completed');
    assert.equal(payload.mood, 'Amazing');
    assert.equal(payload.duration, 35);
    assert.equal(payload.time, 'Evening');
});

test('explicit completion and uncompletion actions change status deliberately', () => {
    const completed = buildHabitLogPayload({
        atomId: 2, date: '2026-11-09', userId: 'student-1',
        previousLog: { status: 'pending' }, changes: { completed: true },
    });
    const pending = buildHabitLogPayload({
        atomId: 2, date: '2026-11-09', userId: 'student-1',
        previousLog: { status: 'completed' }, changes: { completed: false },
    });
    assert.equal(completed.status, 'completed');
    assert.equal(pending.status, 'pending');
});

test('explicit status takes precedence over a legacy completed flag', () => {
    const payload = buildHabitLogPayload({
        atomId: 2, date: '2026-11-09', userId: 'student-1',
        previousLog: { status: 'completed' }, changes: { status: 'pending', mood: 'Neutral' },
    });
    assert.equal(payload.status, 'pending');
});

test('hydration restores mood, duration, time and completion state', () => {
    const map = buildHabitLogMap([{
        id: 91, atom_id: 7, date_logged: '2026-11-09',
        status: 'completed', mood: 'Good', duration: 30, time: 'Morning',
    }]);
    assert.deepEqual(map['2026-11-09']['7'], {
        id: 91, status: 'completed', completed: true,
        mood: 'Good', duration: 30, time: 'Morning',
    });
});

test('invalid log rows are ignored during hydration', () => {
    const map = buildHabitLogMap([null, {}, { date_logged: '2026-11-09' }]);
    assert.deepEqual(map, {});
});
