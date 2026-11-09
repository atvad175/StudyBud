import test from 'node:test';
import assert from 'node:assert/strict';
import {
    BUDDY_QUICK_ACTIONS,
    buildBuddyActionPrompt,
    getBuddyPageLabel,
} from '../src/components/AICompanion/buddyActions.js';

test('Buddy provides three clear prompt-free learning actions', () => {
    assert.deepEqual(BUDDY_QUICK_ACTIONS.map(action => action.id), ['explain', 'quiz', 'mnemonic']);
});

test('page context labels the active student workspace', () => {
    assert.equal(getBuddyPageLabel('/study/exams'), 'Exam Practice');
    assert.equal(getBuddyPageLabel('/study/flashcards'), 'Flashcards');
    assert.equal(getBuddyPageLabel('/focus/timer'), 'your Focus timer');
});

test('explain action uses selected subject without inventing a chapter', () => {
    const prompt = buildBuddyActionPrompt('explain', {
        pathname: '/study',
        selectedSubject: 'Biology',
    });
    assert.match(prompt, /current subject is Biology/);
    assert.match(prompt, /Do not invent a chapter/);
    assert.match(prompt, /everyday analogy/);
});

test('quiz action asks exactly one active-recall question and withholds the answer', () => {
    const prompt = buildBuddyActionPrompt('quiz', {
        pathname: '/study/exams',
        selectedSubject: 'Physics',
    });
    assert.match(prompt, /exactly ONE clear question/);
    assert.match(prompt, /Do not reveal the answer/);
});

test('mnemonic action requires an accurate memory hook', () => {
    const prompt = buildBuddyActionPrompt('mnemonic', { selectedSubject: 'Chemistry' });
    assert.match(prompt, /accurate mnemonic/);
    assert.match(prompt, /misconception/);
});

test('missing subject asks for the exact topic instead of guessing', () => {
    const prompt = buildBuddyActionPrompt('quiz', { pathname: '/study' });
    assert.match(prompt, /No subject or chapter has been selected/);
    assert.match(prompt, /ask one short question/i);
});

test('unsupported Buddy actions fail explicitly', () => {
    assert.throws(() => buildBuddyActionPrompt('unknown'), /Choose a Buddy action/);
});

test('Buddy adapts foundational examples to the saved curriculum', () => {
    const prompt = buildBuddyActionPrompt('explain', {
        pathname: '/study',
        selectedSubject: 'Biology',
        board: 'ICSE',
        grade: '9',
    });
    assert.match(prompt, /ICSE · Grade 9/);
    assert.match(prompt, /foundational, age-appropriate concept/);
    assert.match(prompt, /Do not claim that your chosen concept is from the student’s exact syllabus/);
});
