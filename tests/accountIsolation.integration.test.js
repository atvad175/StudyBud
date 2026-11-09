import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const environment = globalThis.process?.env || {};
const env = {
    url: environment.SUPABASE_TEST_URL,
    anonKey: environment.SUPABASE_TEST_ANON_KEY,
    accountAEmail: environment.SUPABASE_TEST_USER_A_EMAIL,
    accountAPassword: environment.SUPABASE_TEST_USER_A_PASSWORD,
    accountBEmail: environment.SUPABASE_TEST_USER_B_EMAIL,
    accountBPassword: environment.SUPABASE_TEST_USER_B_PASSWORD,
};
const configured = Object.values(env).every(value => typeof value === 'string' && value.length > 0);

const createTestClient = () => createClient(env.url, env.anonKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
});

const signIn = async (client, email, password) => {
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data?.user?.id) throw new Error('Test account sign-in returned no user.');
    return data.user;
};

test('two test accounts cannot read, update or delete each other’s private rows', {
    skip: !configured && 'Set the six SUPABASE_TEST_* variables to run the staging RLS integration test.',
    timeout: 60_000,
}, async () => {
    const clientA = createTestClient();
    const clientB = createTestClient();
    const userA = await signIn(clientA, env.accountAEmail, env.accountAPassword);
    const userB = await signIn(clientB, env.accountBEmail, env.accountBPassword);

    assert.notEqual(userA.id, userB.id, 'The integration test requires two distinct test accounts.');

    const marker = 'studybud-rls-test-' + randomUUID();
    const createdDeckIds = [];
    const createdFocusIds = [];

    let operationError = null;
    const cleanupErrors = [];
    try {
        const { data: deck, error: deckInsertError } = await clientA
            .from('flashcard_decks')
            .insert({
                user_id: userA.id,
                name: marker,
                subject: 'Integration test',
            })
            .select('id, user_id, name')
            .single();
        if (deckInsertError) throw deckInsertError;
        createdDeckIds.push(deck.id);
        assert.equal(deck.user_id, userA.id);

        const { data: focusSession, error: focusInsertError } = await clientA
            .from('focus_sessions')
            .insert({
                user_id: userA.id,
                category: marker,
                duration_seconds: 60,
                mode: 'TIMER',
            })
            .select('id, user_id, category')
            .single();
        if (focusInsertError) throw focusInsertError;
        createdFocusIds.push(focusSession.id);
        assert.equal(focusSession.user_id, userA.id);

        const { data: deckVisibleToB, error: deckReadError } = await clientB
            .from('flashcard_decks')
            .select('id')
            .eq('id', deck.id)
            .maybeSingle();
        if (deckReadError) throw deckReadError;
        assert.equal(deckVisibleToB, null, 'Account B must not read Account A’s flashcard deck.');

        const { data: deckUpdatedByB, error: deckUpdateError } = await clientB
            .from('flashcard_decks')
            .update({ name: marker + '-tampered' })
            .eq('id', deck.id)
            .select('id')
            .maybeSingle();
        if (deckUpdateError) throw deckUpdateError;
        assert.equal(deckUpdatedByB, null, 'Account B must not update Account A’s flashcard deck.');

        const { data: deckDeletedByB, error: deckDeleteError } = await clientB
            .from('flashcard_decks')
            .delete()
            .eq('id', deck.id)
            .select('id')
            .maybeSingle();
        if (deckDeleteError) throw deckDeleteError;
        assert.equal(deckDeletedByB, null, 'Account B must not delete Account A’s flashcard deck.');

        const { data: focusVisibleToB, error: focusReadError } = await clientB
            .from('focus_sessions')
            .select('id')
            .eq('id', focusSession.id)
            .maybeSingle();
        if (focusReadError) throw focusReadError;
        assert.equal(focusVisibleToB, null, 'Account B must not read Account A’s focus session.');

        const { data: focusUpdatedByB, error: focusUpdateError } = await clientB
            .from('focus_sessions')
            .update({ category: marker + '-tampered' })
            .eq('id', focusSession.id)
            .select('id')
            .maybeSingle();
        if (focusUpdateError) throw focusUpdateError;
        assert.equal(focusUpdatedByB, null, 'Account B must not update Account A’s focus session.');

        const { data: focusDeletedByB, error: focusDeleteError } = await clientB
            .from('focus_sessions')
            .delete()
            .eq('id', focusSession.id)
            .select('id')
            .maybeSingle();
        if (focusDeleteError) throw focusDeleteError;
        assert.equal(focusDeletedByB, null, 'Account B must not delete Account A’s focus session.');

        const { data: ownerDeck, error: ownerDeckError } = await clientA
            .from('flashcard_decks')
            .select('id, name, user_id')
            .eq('id', deck.id)
            .single();
        if (ownerDeckError) throw ownerDeckError;
        assert.equal(ownerDeck.name, marker);
        assert.equal(ownerDeck.user_id, userA.id);

        const { data: ownerFocus, error: ownerFocusError } = await clientA
            .from('focus_sessions')
            .select('id, category, user_id')
            .eq('id', focusSession.id)
            .single();
        if (ownerFocusError) throw ownerFocusError;
        assert.equal(ownerFocus.category, marker);
        assert.equal(ownerFocus.user_id, userA.id);
    } catch (error) {
        operationError = error;
    } finally {
        if (createdDeckIds.length) {
            const { error } = await clientA
                .from('flashcard_decks')
                .delete()
                .in('id', createdDeckIds)
                .eq('user_id', userA.id);
            if (error) cleanupErrors.push(error);
        }
        if (createdFocusIds.length) {
            const { error } = await clientA
                .from('focus_sessions')
                .delete()
                .in('id', createdFocusIds)
                .eq('user_id', userA.id);
            if (error) cleanupErrors.push(error);
        }
        const signOutResults = await Promise.all([
            clientA.auth.signOut(),
            clientB.auth.signOut(),
        ]);
        signOutResults.forEach(result => {
            if (result.error) cleanupErrors.push(result.error);
        });
    }

    if (operationError) throw operationError;
    if (cleanupErrors.length) {
        throw new Error('The integration test passed its assertions but could not clean up every staging record.');
    }
});
