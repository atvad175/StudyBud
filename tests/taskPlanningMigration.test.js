import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile(
    new URL('../supabase/migrations/20261022180000_add_task_planning_fields.sql', import.meta.url),
    'utf8'
);
const normalized = migration.toLowerCase().replace(/\s+/g, ' ');

test('task planning stores the fields already consumed by TimeDashboard', () => {
    assert.match(normalized, /alter table public\.tasks add column if not exists due_date date/);
    assert.match(normalized, /alter table public\.tasks add column if not exists priority text/);
});

test('task planning migration preserves existing rows and permits unset optional values', () => {
    assert.match(normalized, /deadlines and priority are optional for legacy tasks/);
    assert.doesNotMatch(normalized, /\b(delete from|truncate table|update public\.tasks)\b/);
    assert.doesNotMatch(normalized, /due_date date not null|priority text not null/);
});
