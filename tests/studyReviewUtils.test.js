import test from 'node:test';
import assert from 'node:assert/strict';
import { getStudyReviewDedupeKey } from '../src/modules/Study/studyReviewUtils.js';

test('review identity ignores case and repeated whitespace', () => {
    assert.equal(
        getStudyReviewDedupeKey(' Biology ', '  Explain   osmosis '),
        getStudyReviewDedupeKey('biology', 'explain osmosis')
    );
});

test('review identity distinguishes different subjects and concepts', () => {
    assert.notEqual(getStudyReviewDedupeKey('Biology', 'Osmosis'), getStudyReviewDedupeKey('Chemistry', 'Osmosis'));
    assert.notEqual(getStudyReviewDedupeKey('Biology', 'Osmosis'), getStudyReviewDedupeKey('Biology', 'Diffusion'));
});

test('review identity is empty for an empty concept', () => {
    assert.equal(getStudyReviewDedupeKey('Biology', '   '), '');
});
