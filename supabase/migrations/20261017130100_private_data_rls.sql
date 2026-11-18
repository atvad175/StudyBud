-- Align schema columns with the existing app and enforce per-user access.
--
-- Replayable from an empty project: this migration used to abort on a fresh
-- Supabase instance because it touched legacy tables (atoms, logs, tasks,
-- mind_*) that no earlier migration creates. Every statement is now guarded by
-- a to_regclass()/information_schema check, so tables that exist get owner-only
-- policies and tables that do not exist are skipped with a notice.
--
-- It deliberately replaces every existing policy on the tables it does find:
-- PostgreSQL combines permissive policies with OR, so one old broad policy
-- would defeat the owner-only ones below.

alter table if exists public.atoms add column if not exists notes text;
alter table if exists public.atoms add column if not exists time text;
alter table if exists public.logs add column if not exists mood text;
alter table if exists public.logs add column if not exists duration integer;
alter table if exists public.logs add column if not exists time text;

do $$
declare
  target_table text;
  owner_column text;
  existing_policy record;
begin
  foreach target_table in array array[
    'atoms', 'logs', 'study_assignments', 'study_practice_logs',
    'study_reviews', 'mind_logs', 'mind_offload_items', 'mind_wins',
    'tasks', 'focus_sessions', 'profiles'
  ]
  loop
    if to_regclass(format('public.%I', target_table)) is null then
      raise notice 'studybud: skipping % (table does not exist)', target_table;
      continue;
    end if;

    owner_column := case when target_table = 'profiles' then 'id' else 'user_id' end;

    if not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = target_table
        and column_name = owner_column
    ) then
      raise notice 'studybud: skipping % (no % column)', target_table, owner_column;
      continue;
    end if;

    execute format('alter table public.%I enable row level security', target_table);

    for existing_policy in
      select policyname
      from pg_policies
      where schemaname = 'public' and tablename = target_table
    loop
      execute format(
        'drop policy if exists %I on public.%I',
        existing_policy.policyname,
        target_table
      );
    end loop;

    execute format(
      'create policy %I on public.%I for select to authenticated using ((select auth.uid()) = %I)',
      target_table || '_select_owner', target_table, owner_column
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated with check ((select auth.uid()) = %I)',
      target_table || '_insert_owner', target_table, owner_column
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using ((select auth.uid()) = %I) with check ((select auth.uid()) = %I)',
      target_table || '_update_owner', target_table, owner_column, owner_column
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using ((select auth.uid()) = %I)',
      target_table || '_delete_owner', target_table, owner_column
    );
  end loop;
end
$$;
