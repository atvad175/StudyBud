import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const readSql = relativePath => readFile(new URL(relativePath, import.meta.url), 'utf8');

test('the early private-data RLS migration does not reference tables created later', async () => {
    const sql = await readSql('../supabase/migrations/20261017130100_private_data_rls.sql');
    assert.doesNotMatch(sql, /(?:alter\s+table|create\s+policy|drop\s+policy|on)\s+(?:public\.)?(?:focus_sessions|profiles)\b/i);
});

test('focus session and profile tables are created before their RLS policies', async () => {
    const sql = await readSql('../supabase/migrations/20261021170000_core_feature_schema_repair.sql');
    for (const table of ['focus_sessions', 'profiles']) {
        const createIndex = sql.toLowerCase().indexOf('create table if not exists public.' + table);
        const rlsIndex = sql.toLowerCase().indexOf('alter table public.' + table + ' enable row level security');
        const policyIndex = sql.toLowerCase().indexOf('create policy ' + table + '_select_owner');
        assert.ok(createIndex >= 0, table + ' table must be created');
        assert.ok(rlsIndex > createIndex, table + ' RLS must be enabled after creation');
        assert.ok(policyIndex > rlsIndex, table + ' policies must be created after RLS is enabled');
    }
});

test('newly created tables remove every previous policy before installing owner policies', async () => {
    const sql = await readSql('../supabase/migrations/20261021170000_core_feature_schema_repair.sql');
    const cleanupIndex = sql.indexOf("tablename = any (array['focus_sessions', 'profiles'])");
    const firstOwnerPolicyIndex = sql.indexOf('create policy focus_sessions_select_owner');
    assert.ok(cleanupIndex >= 0);
    assert.ok(firstOwnerPolicyIndex > cleanupIndex);
    assert.match(sql, /auth\.uid\(\)\s*\)\s*=\s*user_id/);
    assert.match(sql, /auth\.uid\(\)\s*\)\s*=\s*id/);
});

test('flashcard tables have RLS and owner-specific policies for every operation', async () => {
    const sql = await readSql('../supabase/migrations/20261017130200_flashcard_storage.sql');
    for (const table of ['flashcard_decks', 'flashcards']) {
        assert.match(sql, new RegExp('alter table public\\.' + table + ' enable row level security', 'i'));
        for (const operation of ['select', 'insert', 'update', 'delete']) {
            assert.match(sql, new RegExp('on public\\.' + table + ' for ' + operation, 'i'));
        }
    }
});

test('onboarding and server chat-history tables are protected by RLS', async () => {
    const sql = await readSql('../supabase/migrations/20261017130000_onboarding_and_chat_history.sql');
    for (const table of ['user_onboarding', 'chat_history']) {
        assert.match(sql, new RegExp('alter table public\\.' + table + ' enable row level security', 'i'));
        assert.match(sql, new RegExp('on public\\.' + table + ' for select', 'i'));
        assert.match(sql, new RegExp('on public\\.' + table + ' for insert', 'i'));
        assert.match(sql, new RegExp('on public\\.' + table + ' for update', 'i'));
        assert.match(sql, new RegExp('on public\\.' + table + ' for delete', 'i'));
    }
});

test('the shared legacy tasks table is deferred until its unowned record has an explicit owner decision', async () => {
    const sql = await readSql('../supabase/migrations/20261017130100_private_data_rls.sql');
    assert.doesNotMatch(sql, /alter\s+table\s+public\.tasks\s+enable\s+row level security/i);
    assert.doesNotMatch(sql, /create\s+policy\s+["']?tasks_/i);
    assert.doesNotMatch(sql, /drop\s+policy\s+[^\n]*\s+on\s+public\.tasks/i);
});
