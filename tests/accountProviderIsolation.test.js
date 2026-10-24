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
        '<HabitsProvider key={session?.user?.id || \'signed-out\'}>',
        '<FocusProvider key={session?.user?.id || \'signed-out\'}>',
        '<TimeProvider key={session?.user?.id || \'signed-out\'}>',
        '<MindProvider key={session?.user?.id || \'signed-out\'}>',
        '<StudyProvider key={session?.user?.id || \'signed-out\'}>',
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


test('local meditation and Feynman drafts use account-scoped storage keys', async () => {
    const appSource = app;
    const meditation = await readFile(new URL('../src/modules/Mind/pages/MeditationSanctuary.jsx', import.meta.url), 'utf8');
    const feynman = await readFile(new URL('../src/modules/Study/pages/FeynmanSandbox.jsx', import.meta.url), 'utf8');

    assert.match(appSource, /studybud_meditations_\$\{owner\}/);
    assert.match(appSource, /studybud_feynman_draft_v1_\$\{owner\}/);
    assert.match(appSource, /Unable to isolate legacy/);

    assert.match(meditation, /studybud_meditations_\$\{ownerId\}/);
    assert.doesNotMatch(meditation, /localStorage\.getItem\('studybud_meditations'\)/);
    assert.doesNotMatch(meditation, /localStorage\.setItem\('studybud_meditations',/);

    assert.match(feynman, /studybud_feynman_draft_v1_\$\{ownerId\}/);
    assert.doesNotMatch(feynman, /FEYNMAN_DRAFT_KEY/);
});
