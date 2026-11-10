import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const readSql = relativePath => readFile(new URL(relativePath, import.meta.url), 'utf8');

test('the earlier private-data RLS migration does not reference tables created later', async () => {
    const sql = await readSql('../supabase/migrations/20261017130100_private_data_rls.sql');
    assert.doesNotMatch(
        sql,
        /(?:alter\s+table|create\s+policy|drop\s+policy|on)\s+(?:public\.)?(?:focus_sessions|profiles)\b/i
    );
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
    assert.match(sql, /grant select, insert, update, delete on table[\s\S]*?to authenticated;/);
    assert.doesNotMatch(sql, /grant select, insert, update, delete on table[\s\S]*?to anon/);
    assert.doesNotMatch(sql, /disable row level security/);
});
