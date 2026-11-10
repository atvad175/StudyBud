import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migrationPath = '../supabase/migrations/20261110183000_data_api_table_grants.sql';
const readMigration = async () => (
    await readFile(new URL(migrationPath, import.meta.url), 'utf8')
).toLowerCase().replace(/\s+/g, ' ');

test('public Study reference tables are read-only through the Data API', async () => {
    const sql = await readMigration();
    assert.match(
        sql,
        /grant select on table public\.study_techniques, public\.study_subjects to anon, authenticated;/
    );
});

test('private student tables are granted only to authenticated', async () => {
    const sql = await readMigration();
    const privateTables = [
        'user_onboarding',
        'chat_history',
        'atoms',
        'logs',
        'study_assignments',
        'study_practice_logs',
        'study_reviews',
        'mind_logs',
        'mind_offload_items',
        'mind_wins',
        'tasks',
        'focus_sessions',
        'profiles',
        'flashcard_decks',
        'flashcards',
    ];

    assert.match(
        sql,
        /grant select, insert, update, delete on table[\s\S]*?to authenticated;/
    );
    for (const table of privateTables) {
        assert.match(sql, new RegExp('public\\.' + table + '\\b'));
    }
    assert.doesNotMatch(
        sql,
        /grant select, insert, update, delete on table[\s\S]*?to anon/
    );
});

test('identity sequence access is granted for only the application tables that need it', async () => {
    const sql = await readMigration();
    assert.match(sql, /pg_get_serial_sequence\(/);
    assert.match(sql, /grant usage, select on sequence %s to authenticated/);

    for (const table of [
        'atoms',
        'logs',
        'study_assignments',
        'study_practice_logs',
        'study_reviews',
        'mind_logs',
        'mind_offload_items',
        'mind_wins',
        'tasks',
        'focus_sessions',
        'flashcard_decks',
        'flashcards',
    ]) {
        assert.match(sql, new RegExp("'" + table + "'"));
    }
});

test('the grants migration is transactional and keeps privileges separate from RLS', async () => {
    const sql = await readMigration();
    assert.match(sql, /^--[\s\S]*?begin;/);
    assert.match(sql, /commit;\s*$/);
    assert.match(sql, /owner-specific rls policies/);
    assert.doesNotMatch(sql, /disable row level security/);
});
