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
