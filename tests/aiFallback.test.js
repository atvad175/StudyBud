import test from 'node:test';
import assert from 'node:assert/strict';
import { isQuotaError, shouldTryNextModel } from '../api/aiFallback.js';

test('tries the next model when quota is exhausted', () => {
    assert.equal(isQuotaError({ status: 429, message: 'Too many requests' }), true);
    assert.equal(shouldTryNextModel({ status: 429 }, true), true);
});

test('tries the next model when the provider is overloaded or temporarily unavailable', () => {
    assert.equal(shouldTryNextModel({ status: 503, message: 'Service unavailable' }, true), true);
    assert.equal(shouldTryNextModel({ message: 'The model is overloaded' }, true), true);
});

test('tries the next model when a configured model is unavailable', () => {
    assert.equal(shouldTryNextModel({ status: 404, message: 'Model not found' }, true), true);
    assert.equal(shouldTryNextModel({ status: 404, message: 'Resource not found' }, true), false);
});

test('tries the next model after transient network failures', () => {
    assert.equal(shouldTryNextModel({ code: 'ETIMEDOUT', message: 'request timed out' }, true), true);
    assert.equal(shouldTryNextModel({ message: 'fetch failed' }, true), true);
});

test('does not retry invalid requests or credential failures', () => {
    assert.equal(shouldTryNextModel({ status: 400, message: 'Invalid prompt' }, true), false);
    assert.equal(shouldTryNextModel({ status: 401, message: 'Unauthorised' }, true), false);
    assert.equal(shouldTryNextModel({ status: 403, message: 'Permission denied' }, true), false);
});

test('does not try to fall back after the final configured model fails', () => {
    assert.equal(shouldTryNextModel({ status: 503 }, false), false);
});

test('recognises quota errors even when the provider omits an HTTP status', () => {
    assert.equal(isQuotaError({ message: 'Resource exhausted: quota exceeded' }), true);
    assert.equal(shouldTryNextModel({ message: 'Resource exhausted: quota exceeded' }, true), true);
});

test('does not classify ordinary content/validation errors as transient', () => {
    assert.equal(shouldTryNextModel({ message: 'Question 2 had an invalid answer key.' }, true), false);
});
