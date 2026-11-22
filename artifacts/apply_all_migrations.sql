-- ===========================================================================
-- StudyBud — all migrations in one script (filename order).
-- Paste this whole file into Supabase -> SQL Editor -> New query -> Run.
-- Safe to run more than once: every statement is guarded/idempotent.
-- Target project ref: vuyovxdmqoltderpbiqp
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- >>> 20261017130000_onboarding_and_chat_history.sql
-- ---------------------------------------------------------------------------
-- StudyBud onboarding and chat history tables.
-- Apply this migration in the Supabase SQL editor before deploying this branch.
-- Private rows are scoped to the authenticated user; never disable RLS in production.

create table if not exists public.user_onboarding (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  role text not null default 'School student',
  board text not null default '',
  grade text not null default '',
  struggles jsonb not null default '[]'::jsonb,
  learning_style text not null default '',
  fav_topics jsonb not null default '[]'::jsonb,
  topic_type text not null default 'subjects',
  first_atom text,
  intention text not null default '',
  productive_time text not null default '',
  motivation text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.user_onboarding add column if not exists board text not null default '';
alter table public.user_onboarding add column if not exists grade text not null default '';
alter table public.user_onboarding enable row level security;

drop policy if exists "Users can read own onboarding" on public.user_onboarding;
create policy "Users can read own onboarding"
  on public.user_onboarding for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own onboarding" on public.user_onboarding;
create policy "Users can insert own onboarding"
  on public.user_onboarding for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own onboarding" on public.user_onboarding;
create policy "Users can update own onboarding"
  on public.user_onboarding for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own onboarding" on public.user_onboarding;
create policy "Users can delete own onboarding"
  on public.user_onboarding for delete
  using (auth.uid() = user_id);


create table if not exists public.chat_history (
  user_id uuid primary key references auth.users(id) on delete cascade,
  messages jsonb not null default '[]'::jsonb,
  bud_persona text not null default 'candid',
  updated_at timestamptz not null default now()
);

alter table public.chat_history enable row level security;

drop policy if exists "Users can read own chat history" on public.chat_history;
create policy "Users can read own chat history"
  on public.chat_history for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own chat history" on public.chat_history;
create policy "Users can insert own chat history"
  on public.chat_history for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own chat history" on public.chat_history;
create policy "Users can update own chat history"
  on public.chat_history for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own chat history" on public.chat_history;
create policy "Users can delete own chat history"
  on public.chat_history for delete
  using (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- >>> 20261017130100_private_data_rls.sql
-- ---------------------------------------------------------------------------
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


-- ---------------------------------------------------------------------------
-- >>> 20261017130200_flashcard_storage.sql
-- ---------------------------------------------------------------------------
-- Account-owned flashcard decks and cards.
-- Apply in the test Supabase project first. RLS prevents users from reading or
-- changing another user's decks/cards, and the composite FK prevents cross-user deck links.

create table if not exists public.flashcard_decks (
  id bigint generated by default as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  subject text not null,
  last_reviewed timestamptz,
  legacy_id text,
  created_at timestamptz not null default now(),
  unique (id, user_id),
  unique (user_id, legacy_id)
);

create table if not exists public.flashcards (
  id bigint generated by default as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  deck_id bigint not null,
  front text not null,
  back text not null,
  next_review_date timestamptz,
  legacy_id text,
  created_at timestamptz not null default now(),
  foreign key (deck_id, user_id)
    references public.flashcard_decks(id, user_id) on delete cascade,
  unique (user_id, legacy_id)
);

create index if not exists flashcard_decks_owner_created_idx
  on public.flashcard_decks(user_id, created_at desc);
create index if not exists flashcards_owner_deck_idx
  on public.flashcards(user_id, deck_id);
create index if not exists flashcards_owner_due_idx
  on public.flashcards(user_id, next_review_date);

alter table public.flashcard_decks enable row level security;
alter table public.flashcards enable row level security;

drop policy if exists "Users can read own flashcard decks" on public.flashcard_decks;
create policy "Users can read own flashcard decks"
  on public.flashcard_decks for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own flashcard decks" on public.flashcard_decks;
create policy "Users can insert own flashcard decks"
  on public.flashcard_decks for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own flashcard decks" on public.flashcard_decks;
create policy "Users can update own flashcard decks"
  on public.flashcard_decks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own flashcard decks" on public.flashcard_decks;
create policy "Users can delete own flashcard decks"
  on public.flashcard_decks for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can read own flashcards" on public.flashcards;
create policy "Users can read own flashcards"
  on public.flashcards for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own flashcards" on public.flashcards;
create policy "Users can insert own flashcards"
  on public.flashcards for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own flashcards" on public.flashcards;
create policy "Users can update own flashcards"
  on public.flashcards for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own flashcards" on public.flashcards;
create policy "Users can delete own flashcards"
  on public.flashcards for delete
  using (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- >>> 20261021170000_core_feature_schema_repair.sql
-- ---------------------------------------------------------------------------
-- Additive fixes for tables and columns already used by shipped StudyBud flows.
-- This migration intentionally does not change RLS on existing tables. Those
-- policies are rolled out in 20261017130100_private_data_rls.sql.
--
-- Guarded so it replays on a project that has none of the legacy tables yet.
begin;

alter table if exists public.atoms add column if not exists notes text;
alter table if exists public.atoms add column if not exists time text;
alter table if exists public.logs add column if not exists mood text;
alter table if exists public.logs add column if not exists duration integer;
alter table if exists public.logs add column if not exists time text;

create table if not exists public.focus_sessions (
  id bigint generated by default as identity primary key,
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text,
  duration_seconds integer,
  mode text
);
alter table public.focus_sessions enable row level security;

drop policy if exists focus_sessions_select_owner on public.focus_sessions;
create policy focus_sessions_select_owner on public.focus_sessions
  for select using ((select auth.uid()) = user_id);
drop policy if exists focus_sessions_insert_owner on public.focus_sessions;
create policy focus_sessions_insert_owner on public.focus_sessions
  for insert with check ((select auth.uid()) = user_id);
drop policy if exists focus_sessions_update_owner on public.focus_sessions;
create policy focus_sessions_update_owner on public.focus_sessions
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists focus_sessions_delete_owner on public.focus_sessions;
create policy focus_sessions_delete_owner on public.focus_sessions
  for delete using ((select auth.uid()) = user_id);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  nickname text,
  age integer,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

drop policy if exists profiles_select_owner on public.profiles;
create policy profiles_select_owner on public.profiles
  for select using ((select auth.uid()) = id);
drop policy if exists profiles_insert_owner on public.profiles;
create policy profiles_insert_owner on public.profiles
  for insert with check ((select auth.uid()) = id);
drop policy if exists profiles_update_owner on public.profiles;
create policy profiles_update_owner on public.profiles
  for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
drop policy if exists profiles_delete_owner on public.profiles;
create policy profiles_delete_owner on public.profiles
  for delete using ((select auth.uid()) = id);

-- Indexes only make sense on tables that exist; skipping the rest keeps this
-- migration valid on a project that has never seen the legacy Vite schema.
do $$
declare
  index_spec record;
begin
  for index_spec in
    select * from (values
      ('atoms_user_created_idx', 'atoms', 'user_id, created_at desc'),
      ('logs_user_date_idx', 'logs', 'user_id, date_logged desc'),
      ('study_assignments_user_created_idx', 'study_assignments', 'user_id, created_at desc'),
      ('study_practice_logs_user_created_idx', 'study_practice_logs', 'user_id, created_at desc'),
      ('study_reviews_user_due_idx', 'study_reviews', 'user_id, next_review_date'),
      ('mind_logs_user_created_idx', 'mind_logs', 'user_id, created_at desc'),
      ('mind_offload_user_created_idx', 'mind_offload_items', 'user_id, created_at desc'),
      ('mind_wins_user_created_idx', 'mind_wins', 'user_id, created_at desc'),
      ('tasks_user_created_idx', 'tasks', 'user_id, created_at desc')
    ) as specs(index_name, table_name, columns)
  loop
    if to_regclass(format('public.%I', index_spec.table_name)) is null then
      continue;
    end if;

    execute format(
      'create index if not exists %I on public.%I (%s)',
      index_spec.index_name,
      index_spec.table_name,
      index_spec.columns
    );
  end loop;
end
$$;

commit;


-- ---------------------------------------------------------------------------
-- >>> 20261117090000_studybud_core_reconciliation.sql
-- ---------------------------------------------------------------------------
-- ============================================================================
-- StudyBud core schema for the Next.js App Router build.
--
-- Tables: profiles, habits, focus_sessions, study_materials, school_houses.
-- Security: owner-only RLS on every private table, public read on the house
-- leaderboard, and a SECURITY DEFINER point RPC that can only credit the
-- caller's own house.
--
-- Additive by design: the legacy Vite app already ships `profiles` and
-- `focus_sessions` with other columns, so those tables are extended in place
-- instead of being recreated. Safe to run more than once.
-- ============================================================================

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'studybud_tier') then
    create type public.studybud_tier as enum ('free', 'scholar', 'elite');
  end if;
end
$$;

-- --------------------------------------------------------------- school houses
create table if not exists public.school_houses (
  id uuid primary key default gen_random_uuid(),
  house_name text not null unique,
  total_points integer not null default 0 check (total_points >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.school_houses (house_name)
values ('Aurora'), ('Nova'), ('Vertex'), ('Zenith')
on conflict (house_name) do nothing;

-- -------------------------------------------------------------------- profiles
alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists grade_section text;
alter table public.profiles add column if not exists tier public.studybud_tier not null default 'free';
alter table public.profiles add column if not exists updated_at timestamptz not null default now();
alter table public.profiles
  add column if not exists school_house text
  references public.school_houses (house_name) on update cascade on delete set null;

update public.profiles
set username = coalesce(nullif(nickname, ''), nullif(first_name, ''), 'student')
where username is null or username = '';

alter table public.profiles alter column username set default 'student';
alter table public.profiles alter column username set not null;

-- ---------------------------------------------------------------------- habits
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  streak_count integer not null default 0 check (streak_count >= 0),
  completed_dates text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.habits add column if not exists streak_count integer not null default 0;
alter table public.habits add column if not exists completed_dates text[] not null default '{}';
alter table public.habits add column if not exists updated_at timestamptz not null default now();

-- -------------------------------------------------------------- focus sessions
alter table public.focus_sessions add column if not exists duration_minutes integer;
alter table public.focus_sessions add column if not exists mode text;
alter table public.focus_sessions add column if not exists category text;

update public.focus_sessions
set duration_minutes = greatest(1, round(duration_seconds / 60.0)::integer)
where duration_minutes is null
  and duration_seconds is not null
  and duration_seconds > 0;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'focus_sessions_duration_minutes_check'
  ) then
    alter table public.focus_sessions
      add constraint focus_sessions_duration_minutes_check
      check (duration_minutes is null or duration_minutes between 1 and 600);
  end if;
end
$$;

-- ------------------------------------------------------------- study materials
create table if not exists public.study_materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  content text not null,
  ai_summary jsonb,
  created_at timestamptz not null default now()
);

-- --------------------------------------------------------------------- indexes
create index if not exists habits_user_created_idx
  on public.habits (user_id, created_at desc);
create index if not exists focus_sessions_user_created_idx
  on public.focus_sessions (user_id, created_at desc);
create index if not exists study_materials_user_created_idx
  on public.study_materials (user_id, created_at desc);
create index if not exists school_houses_points_idx
  on public.school_houses (total_points desc);

-- ------------------------------------------------------------- updated_at hook
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists habits_set_updated_at on public.habits;
create trigger habits_set_updated_at
  before update on public.habits
  for each row execute function public.set_updated_at();

drop trigger if exists school_houses_set_updated_at on public.school_houses;
create trigger school_houses_set_updated_at
  before update on public.school_houses
  for each row execute function public.set_updated_at();

-- -------------------------------------------------------------- profile trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, school_house, grade_section)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'username', ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'student'
    ),
    nullif(new.raw_user_meta_data ->> 'school_house', ''),
    nullif(new.raw_user_meta_data ->> 'grade_section', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for accounts created before this trigger existed.
insert into public.profiles (id, username, school_house, grade_section)
select
  users.id,
  coalesce(
    nullif(users.raw_user_meta_data ->> 'username', ''),
    nullif(split_part(coalesce(users.email, ''), '@', 1), ''),
    'student'
  ),
  nullif(users.raw_user_meta_data ->> 'school_house', ''),
  nullif(users.raw_user_meta_data ->> 'grade_section', '')
from auth.users as users
left join public.profiles as existing on existing.id = users.id
where existing.id is null
on conflict (id) do nothing;

-- ------------------------------------------------------- house point awarding
/**
 * Credits points to the CALLER'S OWN house only. The house is read from the
 * caller's profile server-side, so a tampered client cannot boost a rival
 * house, and a single call is capped at 25 points.
 */
create or replace function public.award_house_points(p_points integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  caller uuid := (select auth.uid());
  caller_house text;
  new_total integer;
begin
  if caller is null then
    raise exception 'award_house_points requires an authenticated user';
  end if;

  if p_points is null or p_points < 1 or p_points > 25 then
    raise exception 'point awards must be between 1 and 25';
  end if;

  select school_house into caller_house
  from public.profiles
  where id = caller;

  if caller_house is null then
    return null;
  end if;

  update public.school_houses
  set total_points = total_points + p_points
  where house_name = caller_house
  returning total_points into new_total;

  return new_total;
end;
$$;

revoke execute on function public.award_house_points(integer) from public;
revoke execute on function public.award_house_points(integer) from anon;
grant execute on function public.award_house_points(integer) to authenticated;

-- ------------------------------------------------------------ row level security
alter table public.profiles enable row level security;
alter table public.habits enable row level security;
alter table public.focus_sessions enable row level security;
alter table public.study_materials enable row level security;
alter table public.school_houses enable row level security;

-- profiles: strictly owner-scoped.
drop policy if exists profiles_select_owner on public.profiles;
create policy profiles_select_owner on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists profiles_insert_owner on public.profiles;
create policy profiles_insert_owner on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists profiles_update_owner on public.profiles;
create policy profiles_update_owner on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists profiles_delete_owner on public.profiles;
create policy profiles_delete_owner on public.profiles
  for delete to authenticated
  using ((select auth.uid()) = id);

-- habits: strictly owner-scoped.
drop policy if exists habits_select_owner on public.habits;
create policy habits_select_owner on public.habits
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists habits_insert_owner on public.habits;
create policy habits_insert_owner on public.habits
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists habits_update_owner on public.habits;
create policy habits_update_owner on public.habits
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists habits_delete_owner on public.habits;
create policy habits_delete_owner on public.habits
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- focus sessions: strictly owner-scoped.
drop policy if exists focus_sessions_select_owner on public.focus_sessions;
create policy focus_sessions_select_owner on public.focus_sessions
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists focus_sessions_insert_owner on public.focus_sessions;
create policy focus_sessions_insert_owner on public.focus_sessions
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists focus_sessions_update_owner on public.focus_sessions;
create policy focus_sessions_update_owner on public.focus_sessions
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists focus_sessions_delete_owner on public.focus_sessions;
create policy focus_sessions_delete_owner on public.focus_sessions
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- study materials: strictly owner-scoped.
drop policy if exists study_materials_select_owner on public.study_materials;
create policy study_materials_select_owner on public.study_materials
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists study_materials_insert_owner on public.study_materials;
create policy study_materials_insert_owner on public.study_materials
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists study_materials_update_owner on public.study_materials;
create policy study_materials_update_owner on public.study_materials
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists study_materials_delete_owner on public.study_materials;
create policy study_materials_delete_owner on public.study_materials
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- school houses: public leaderboard read, writes only through the definer RPC.
drop policy if exists school_houses_public_read on public.school_houses;
create policy school_houses_public_read on public.school_houses
  for select to anon, authenticated
  using (true);

-- --------------------------------------------------------------------- realtime
alter table public.school_houses replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.school_houses;
exception
  when duplicate_object then null;
  when undefined_object then null;
end
$$;


-- ---------------------------------------------------------------------------
-- >>> 20261118090000_house_selection_guard.sql
-- ---------------------------------------------------------------------------
-- ============================================================================
-- StudyBud house selection guard.
--
-- House membership is competitive state, so it must be validated exactly once
-- and never rewritten from the browser:
--
--   1. Signup metadata is user-controlled. The profile trigger now only accepts
--      a house that actually exists in school_houses (canonical casing), and
--      stores NULL for anything else so the student can choose later from
--      /dashboard/profile.
--   2. Once a profile has a house, a BEFORE UPDATE trigger rejects any attempt
--      to change it — including a direct PostgREST call with the user's own JWT.
--
-- Service-role administrators who genuinely need to reassign a student can
-- disable the trigger for that statement:
--   alter table public.profiles disable trigger profiles_guard_house_assignment;
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_house text := nullif(new.raw_user_meta_data ->> 'school_house', '');
  valid_house text;
begin
  if requested_house is not null then
    select house_name
      into valid_house
    from public.school_houses
    where lower(house_name) = lower(requested_house)
    limit 1;
  end if;

  insert into public.profiles (id, username, school_house, grade_section)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'username', ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'student'
    ),
    valid_house,
    nullif(new.raw_user_meta_data ->> 'grade_section', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- ------------------------------------------------------------------- one-way lock
create or replace function public.guard_house_assignment()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.school_house is not null
     and new.school_house is distinct from old.school_house then
    raise exception 'House already assigned to %', old.school_house
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_guard_house_assignment on public.profiles;
create trigger profiles_guard_house_assignment
  before update of school_house on public.profiles
  for each row execute function public.guard_house_assignment();


-- ---------------------------------------------------------------------------
-- >>> 20261118120000_house_points_integrity.sql
-- ---------------------------------------------------------------------------
-- ============================================================================
-- StudyBud house-point integrity.
--
-- Until now points were credited by `award_house_points(p_points)`, which any
-- signed-in user could call directly through PostgREST with any amount they
-- liked. That is a forgeable leaderboard: the RPC capped a single call at 25,
-- but nothing stopped a loop.
--
-- Points are now credited by triggers attached to the rows that actually earn
-- them:
--
--   focus_sessions insert  → least(25, greatest(1, round(minutes / 5)))
--   habits update          → +1 per newly completed date
--
-- A caller can only insert their own focus sessions and update their own
-- habits (RLS), so the only way to earn points is to do the work. Points are
-- still credited only for the caller's own house, read from their profile.
--
-- Apply after 20261117090000_studybud_core_reconciliation.sql.
-- ============================================================================

begin;

-- --------------------------------------------------------------- core credit
-- SECURITY DEFINER so the trigger can update `school_houses`, which has no
-- write policy for students. Never granted to anon/authenticated directly.
create or replace function public.credit_house_points(p_user uuid, p_points integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  target_house text;
  new_total integer;
begin
  if p_user is null or p_points is null or p_points < 1 then
    return null;
  end if;

  select school_house into target_house
  from public.profiles
  where id = p_user;

  if target_house is null then
    return null;
  end if;

  update public.school_houses
  set total_points = total_points + least(p_points, 25)
  where house_name = target_house
  returning total_points into new_total;

  return new_total;
end;
$$;

revoke all on function public.credit_house_points(uuid, integer) from public;
revoke all on function public.credit_house_points(uuid, integer) from anon;
revoke all on function public.credit_house_points(uuid, integer) from authenticated;

-- ------------------------------------------------------------- focus sessions
create or replace function public.focus_sessions_award_points()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  session_minutes integer;
  points integer;
begin
  if new.user_id is null then
    return new;
  end if;

  session_minutes := coalesce(
    new.duration_minutes,
    case
      when new.duration_seconds is not null
        then round(new.duration_seconds / 60.0)::integer
    end
  );

  if session_minutes is null or session_minutes < 1 then
    return new;
  end if;

  -- Keep in sync with focusPoints() in lib/houses.ts.
  points := least(25, greatest(1, round(session_minutes / 5.0)::integer));

  perform public.credit_house_points(new.user_id, points);
  return new;
end;
$$;

drop trigger if exists focus_sessions_award_points on public.focus_sessions;
create trigger focus_sessions_award_points
  after insert on public.focus_sessions
  for each row execute function public.focus_sessions_award_points();

-- -------------------------------------------------------------------- habits
create or replace function public.habits_award_points()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  added_dates integer;
begin
  added_dates :=
    coalesce(array_length(new.completed_dates, 1), 0)
    - coalesce(array_length(old.completed_dates, 1), 0);

  -- Un-checking a day never subtracts or re-earns points.
  if added_dates > 0 then
    perform public.credit_house_points(new.user_id, least(added_dates, 7));
  end if;

  return new;
end;
$$;

drop trigger if exists habits_award_points on public.habits;
create trigger habits_award_points
  after update of completed_dates on public.habits
  for each row execute function public.habits_award_points();

-- ----------------------------------------------- close the old forging route
revoke execute on function public.award_house_points(integer) from public;
revoke execute on function public.award_house_points(integer) from anon;
revoke execute on function public.award_house_points(integer) from authenticated;

comment on function public.award_house_points(integer) is
  'Deprecated: revoked for students in 20261118120000. Points are credited by triggers.';

commit;


-- ---------------------------------------------------------------------------
-- >>> 20261121120000_public_table_grants.sql
-- ---------------------------------------------------------------------------
-- ---------------------------------------------------------------------------
-- Public schema privileges for the API roles.
--
-- Supabase normally hands anon/authenticated access to new public tables through
-- ALTER DEFAULT PRIVILEGES. Tables that were created outside that default (or
-- restored by hand) end up reachable only by their owner, which surfaces in the
-- app as `permission denied for table public.<name>` (42501) instead of an
-- empty result. Row level security still decides which rows a request may
-- touch, so restoring the standard grants does not widen access to any row.
--
-- Additive and idempotent: safe to run more than once.
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
grant all on all tables in schema public to service_role;

grant usage, select on all sequences in schema public to anon, authenticated, service_role;

-- Functions are deliberately not blanket-granted here: `award_house_points`
-- had its execute privilege revoked from students on purpose, and a wildcard
-- grant would hand it straight back.

alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant select on tables to anon;
alter default privileges in schema public
  grant all on tables to service_role;
alter default privileges in schema public
  grant usage, select on sequences to anon, authenticated, service_role;


