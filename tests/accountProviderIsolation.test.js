import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');

test('private feature providers are remounted when the signed-in account changes', () => {
    assert.match(
        app,
        /<MusicProvider key=\{session\?\.user\?\.id \|\| 'signed-out'\}>/
    );

    const identityBoundary = app.indexOf("<MusicProvider key={session?.user?.id || 'signed-out'}>");
    assert.notEqual(identityBoundary, -1);

    const privateProviders = [
        '<HabitsProvider>',
        '<FocusProvider>',
        '<TimeProvider>',
        '<MindProvider>',
        '<StudyProvider>',
        '<ToastProvider>',
    ];

    for (const provider of privateProviders) {
        assert.ok(
            app.indexOf(provider, identityBoundary) > identityBoundary,
            `${provider} must stay inside the account-scoped provider subtree`
        );
    }
});

test('Bud is also scoped to the current user instead of retaining the previous chat context', () => {
    assert.match(
        app,
        /<AIProvider key=\{session\?\.user\?\.id \|\| 'signed-out'\}>/
    );
});
