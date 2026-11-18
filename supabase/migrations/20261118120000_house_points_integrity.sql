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
