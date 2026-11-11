-- Bring the existing onboarding and Bud history tables in line with current app upserts.
-- Existing account rows are preserved. The user_id uniqueness precondition is supplied
-- either by the original primary key or the unique index created in the legacy baseline.
begin;

alter table public.user_onboarding
  add column if not exists board text not null default '';
alter table public.user_onboarding
  add column if not exists grade text not null default '';
alter table public.user_onboarding
  alter column user_id set not null;

alter table public.chat_history
  alter column user_id set not null;

commit;
