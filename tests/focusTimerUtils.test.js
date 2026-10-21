import test from 'node:test';
import assert from 'node:assert/strict';
import {
    hydrateActiveFocusSession,
    remainingSeconds,
    stopwatchElapsedSeconds,
} from '../src/modules/Focus/focusTimerUtils.js';

test('deadline timer keeps correct remaining time after a delayed background tick', () => {
    const deadline = 120_000;
    assert.equal(remainingSeconds(deadline, 90_100), 30);
    assert.equal(remainingSeconds(deadline, 120_001), 0);
});

test('deadline timer rounds up partial seconds so it does not finish early', () => {
    assert.equal(remainingSeconds(10_500, 10_000), 1);
    assert.equal(remainingSeconds(10_000, 10_000), 0);
});

test('stopwatch includes time elapsed while the tab is inactive', () => {
    assert.equal(stopwatchElapsedSeconds(10_000, 12, 43_999), 45);
});

test('paused stopwatch does not keep advancing', () => {
    assert.equal(stopwatchElapsedSeconds(null, 45, 900_000), 45);
});

test('rehydrates a running timer from its deadline after reload', () => {
    const hydrated = hydrateActiveFocusSession({
        version: 1,
        isActive: true,
        isPaused: false,
        mode: 'TIMER',
        duration: 1500,
        timeLeft: 900,
        deadlineAt: 60_000,
        category: 'School Exam',
    }, 35_000);

    assert.equal(hydrated.timeLeft, 25);
    assert.equal(hydrated.category, 'School Exam');
    assert.equal(hydrated.isPaused, false);
});

test('rehydrates a paused timer without advancing it', () => {
    const hydrated = hydrateActiveFocusSession({
        version: 1,
        isActive: true,
        isPaused: true,
        mode: 'TIMER',
        duration: 1500,
        timeLeft: 600,
        deadlineAt: null,
    }, 500_000);

    assert.equal(hydrated.timeLeft, 600);
    assert.equal(hydrated.isPaused, true);
});

test('rehydrates running stopwatch from accumulated elapsed time', () => {
    const hydrated = hydrateActiveFocusSession({
        version: 1,
        isActive: true,
        isPaused: false,
        mode: 'STOPWATCH',
        duration: 0,
        timeLeft: 0,
        stopwatchStartedAt: 10_000,
        stopwatchElapsedBase: 30,
    }, 45_500);

    assert.equal(hydrated.timeLeft, 65);
});

test('does not restore malformed session data or unsupported modes', () => {
    assert.equal(hydrateActiveFocusSession(null, 1000), null);
    assert.equal(hydrateActiveFocusSession({ version: 1, isActive: false, mode: 'TIMER' }, 1000), null);
    assert.equal(hydrateActiveFocusSession({ version: 1, isActive: true, mode: 'ALIEN' }, 1000), null);
});
