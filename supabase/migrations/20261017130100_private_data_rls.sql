-- Align schema columns with the existing app and enforce per-user access.
-- Apply only after the current StudyBud baseline tables have been created.
-- Review any production-only policies before applying; this deliberately replaces
-- existing policies on the private tables below with owner-only policies.

alter table if exists public.atoms add column if not exists notes text;
alter table if exists public.atoms add column if not exists time text;
alter table if exists public.logs add column if not exists mood text;
alter table if exists public.logs add column if not exists duration integer;
alter table if exists public.logs add column if not exists time text;

alter table public.atoms enable row level security;
alter table public.logs enable row level security;
alter table public.study_assignments enable row level security;
alter table public.study_practice_logs enable row level security;
alter table public.study_reviews enable row level security;
alter table public.mind_logs enable row level security;
alter table public.mind_offload_items enable row level security;
alter table public.mind_wins enable row level security;

do $$
declare
  p record;
begin
  -- Remove all previous policies from private tables. PostgreSQL combines
  -- permissive policies with OR, so one old broad policy can defeat a new one.
  for p in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = any (array[
        'atoms', 'logs', 'study_assignments', 'study_practice_logs',
        'study_reviews', 'mind_logs', 'mind_offload_items', 'mind_wins',
      ])
  loop
    execute format('drop policy if exists %I on %I.%I', p.policyname, p.schemaname, p.tablename);
  end loop;
end $$;

create policy "atoms_select_owner" on public.atoms
  for select using ((select auth.uid()) = user_id);
create policy "atoms_insert_owner" on public.atoms
  for insert with check ((select auth.uid()) = user_id);
create policy "atoms_update_owner" on public.atoms
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "atoms_delete_owner" on public.atoms
  for delete using ((select auth.uid()) = user_id);

create policy "logs_select_owner" on public.logs
  for select using ((select auth.uid()) = user_id);
create policy "logs_insert_owner" on public.logs
  for insert with check ((select auth.uid()) = user_id);
create policy "logs_update_owner" on public.logs
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "logs_delete_owner" on public.logs
  for delete using ((select auth.uid()) = user_id);

create policy "study_assignments_select_owner" on public.study_assignments
  for select using ((select auth.uid()) = user_id);
create policy "study_assignments_insert_owner" on public.study_assignments
  for insert with check ((select auth.uid()) = user_id);
create policy "study_assignments_update_owner" on public.study_assignments
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "study_assignments_delete_owner" on public.study_assignments
  for delete using ((select auth.uid()) = user_id);

create policy "study_practice_logs_select_owner" on public.study_practice_logs
  for select using ((select auth.uid()) = user_id);
create policy "study_practice_logs_insert_owner" on public.study_practice_logs
  for insert with check ((select auth.uid()) = user_id);
create policy "study_practice_logs_update_owner" on public.study_practice_logs
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "study_practice_logs_delete_owner" on public.study_practice_logs
  for delete using ((select auth.uid()) = user_id);

create policy "study_reviews_select_owner" on public.study_reviews
  for select using ((select auth.uid()) = user_id);
create policy "study_reviews_insert_owner" on public.study_reviews
  for insert with check ((select auth.uid()) = user_id);
create policy "study_reviews_update_owner" on public.study_reviews
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "study_reviews_delete_owner" on public.study_reviews
  for delete using ((select auth.uid()) = user_id);

create policy "mind_logs_select_owner" on public.mind_logs
  for select using ((select auth.uid()) = user_id);
create policy "mind_logs_insert_owner" on public.mind_logs
  for insert with check ((select auth.uid()) = user_id);
create policy "mind_logs_update_owner" on public.mind_logs
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "mind_logs_delete_owner" on public.mind_logs
  for delete using ((select auth.uid()) = user_id);

create policy "mind_offload_items_select_owner" on public.mind_offload_items
  for select using ((select auth.uid()) = user_id);
create policy "mind_offload_items_insert_owner" on public.mind_offload_items
  for insert with check ((select auth.uid()) = user_id);
create policy "mind_offload_items_update_owner" on public.mind_offload_items
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "mind_offload_items_delete_owner" on public.mind_offload_items
  for delete using ((select auth.uid()) = user_id);

create policy "mind_wins_select_owner" on public.mind_wins
  for select using ((select auth.uid()) = user_id);
create policy "mind_wins_insert_owner" on public.mind_wins
  for insert with check ((select auth.uid()) = user_id);
create policy "mind_wins_update_owner" on public.mind_wins
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "mind_wins_delete_owner" on public.mind_wins
  for delete using ((select auth.uid()) = user_id);

-- focus_sessions and profiles are created by the later
-- 20261021170000_core_feature_schema_repair migration. That migration
-- enables RLS and creates owner-only policies after creating those tables.
