import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migrationUrl = new URL('../supabase/migrations/20261022170000_restore_feature_rls.sql', import.meta.url);
const migration = await readFile(migrationUrl, 'utf8');
const normalized = migration.toLowerCase().replace(/\s+/g, ' ');

test('private feature tables have row-level security re-enabled', () => {
    const privateTables = [
        'atoms',
        'logs',
        'study_assignments',
        'study_practice_logs',
        'study_reviews',
        'mind_logs',
        'mind_offload_items',
        'mind_wins',
        'tasks',
    ];

    for (const table of privateTables) {
        assert.match(
            normalized,
            new RegExp('alter table public\\.' + table + ' enable row level security'),
            `RLS must be enabled on public.${table}`
        );
    }
});

test('task reads and writes are restricted to the authenticated owner', () => {
    for (const action of ['select', 'insert', 'update', 'delete']) {
        assert.match(normalized, new RegExp('create policy tasks_' + action + '_owner on public\\.tasks'));
    }

    assert.match(normalized, /for select using \(auth\.uid\(\) = user_id\)/);
    assert.match(normalized, /for insert with check \(auth\.uid\(\) = user_id\)/);
    assert.match(normalized, /for update using \(auth\.uid\(\) = user_id\) with check \(auth\.uid\(\) = user_id\)/);
    assert.match(normalized, /for delete using \(auth\.uid\(\) = user_id\)/);
});

test('shared study reference tables remain readable but protected by RLS', () => {
    for (const table of ['study_subjects', 'study_techniques']) {
        assert.match(normalized, new RegExp('alter table public\\.' + table + ' enable row level security'));
        assert.match(normalized, new RegExp('create policy ' + table + '_public_read on public\\.' + table));
    }

    assert.equal((normalized.match(/for select using \(true\)/g) || []).length, 2);
});

test('migration does not delete, truncate, or reassign existing task data', () => {
    assert.doesNotMatch(normalized, /\b(delete from|truncate table|update public\.tasks)\b/);
    assert.match(normalized, /unowned legacy rows in public\.tasks are deliberately not reassigned/);
});
