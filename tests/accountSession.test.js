import test from 'node:test';
import assert from 'node:assert/strict';
import { isExpectedAccountUser, requireExpectedAccountUser } from '../src/utils/accountSession.js';

const authReturning = result => ({ getUser: async () => result });

test('accepts only the authenticated user matching the provider owner', async () => {
    const user = { id: 'account-a' };
    const actual = await requireExpectedAccountUser(
        authReturning({ data: { user }, error: null }),
        'account-a',
        'save tasks'
    );
    assert.equal(actual, user);
    assert.equal(isExpectedAccountUser(user, 'account-a'), true);
});

test('rejects a session that changed to another account', async () => {
    await assert.rejects(
        () => requireExpectedAccountUser(
            authReturning({ data: { user: { id: 'account-b' } }, error: null }),
            'account-a',
            'save tasks'
        ),
        /account changed/
    );
    assert.equal(isExpectedAccountUser({ id: 'account-b' }, 'account-a'), false);
});

test('rejects signed-out or missing account identities', async () => {
    await assert.rejects(
        () => requireExpectedAccountUser(authReturning({ data: { user: null }, error: null }), 'account-a'),
        /account changed/
    );
    await assert.rejects(
        () => requireExpectedAccountUser(authReturning({ data: { user: { id: 'account-a' } }, error: null }), null),
        /Sign in/
    );
});

test('fails closed when Supabase cannot verify the session', async () => {
    await assert.rejects(
        () => requireExpectedAccountUser(authReturning({ data: { user: null }, error: new Error('network') }), 'account-a'),
        /could not be verified/
    );
    await assert.rejects(
        () => requireExpectedAccountUser({ getUser: async () => { throw new Error('network'); } }, 'account-a'),
        /could not be verified/
    );
});
