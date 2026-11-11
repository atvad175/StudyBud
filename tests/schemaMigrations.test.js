import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const readSql = relativePath => readFile(new URL(relativePath, import.meta.url), 'utf8');

test('the earlier private-data RLS migration defers Focus, Profile and legacy Tasks tables', async () => {
    const sql = await readSql('../supabase/migrations/20261017130100_private_data_rls.sql');
    assert.doesNotMatch(
        sql,
        /(?:alter\s+table|create\s+policy|drop\s+policy|on)\s+(?:public\.)?(?:focus_sessions|profiles)\b/i
    );
    assert.doesNotMatch(sql, /alter\s+table\s+public\.tasks\s+enable\s+row level security/i);
    assert.doesNotMatch(sql, /create\s+policy\s+["']?tasks_/i);
});

test('Focus and Profile tables are created before RLS is enabled and policies are installed', async () => {
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

test('all existing policies are cleared before installing owner-only rules on new tables', async () => {
    const sql = await readSql('../supabase/migrations/20261021170000_core_feature_schema_repair.sql');
    const cleanupIndex = sql.indexOf("tablename = any (array['focus_sessions', 'profiles'])");
    const firstOwnerPolicyIndex = sql.indexOf('create policy focus_sessions_select_owner');
    assert.ok(cleanupIndex >= 0, 'policy cleanup must include both tables');
    assert.ok(firstOwnerPolicyIndex > cleanupIndex);
    assert.match(sql, /auth\.uid\(\)\)\s*=\s*user_id/);
    assert.match(sql, /auth\.uid\(\)\)\s*=\s*id/);
});

test('the Data API grants migration keeps public and private table privileges separate', async () => {
    const sql = (await readSql('../supabase/migrations/20261110183000_data_api_table_grants.sql')).toLowerCase();
    assert.match(sql, /grant select on table[\s\S]*?to anon, authenticated;/);
    assert.match(sql, /revoke all privileges on table[\s\S]*?from anon;/);
    assert.match(sql, /grant select, insert, update, delete on table[\s\S]*?to authenticated;/);
    assert.doesNotMatch(sql, /grant select, insert, update, delete on table[\s\S]*?to anon/);
    assert.doesNotMatch(sql, /public\.tasks/);
    assert.doesNotMatch(sql, /disable row level security/);
});

test('onboarding and chat-history repair enforces current account-upsert requirements', async () => {
    const sql = await readSql('../supabase/migrations/20261111163102_studybud_onboarding_chat_schema_repair.sql');
    assert.match(sql, /add column if not exists board text not null default ''/i);
    assert.match(sql, /add column if not exists grade text not null default ''/i);
    assert.match(sql, /user_onboarding\s+alter column user_id set not null/i);
    assert.match(sql, /chat_history\s+alter column user_id set not null/i);
});

test('RLS tuning migration adds Focus and flashcard foreign-key indexes and keeps owner checks', async () => {
    const sql = await readSql('../supabase/migrations/20261111163420_studybud_rls_performance_indexes_and_policy_tuning_retry.sql');
    assert.match(sql, /focus_sessions_user_created_idx/);
    assert.match(sql, /flashcards_deck_owner_fk_idx/);
    assert.match(sql, /using \(\(select auth\.uid\(\)\) = user_id\)/i);
    assert.match(sql, /with check \(\(select auth\.uid\(\)\) = user_id\)/i);
});
