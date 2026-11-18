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
