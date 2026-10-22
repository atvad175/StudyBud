-- Restore the access controls that private StudyBud features depend on.
-- A prior production migration disabled RLS across public tables, which made
-- existing owner policies ineffective. This migration re-enables RLS without
-- changing or deleting existing student records.
--
-- IMPORTANT: unowned legacy rows in public.tasks are deliberately not reassigned.
-- They remain hidden from authenticated clients until an explicit ownership
-- review can safely identify their owner.

begin;

-- Private data tables already have owner policies from the original migrations.
alter table public.atoms enable row level security;
alter table public.logs enable row level security;
alter table public.study_assignments enable row level security;
alter table public.study_practice_logs enable row level security;
alter table public.study_reviews enable row level security;
alter table public.mind_logs enable row level security;
alter table public.mind_offload_items enable row level security;
alter table public.mind_wins enable row level security;
alter table public.tasks enable row level security;

-- Subject and technique catalogues are shared reference data. They are readable
-- by students, but no browser client should be able to edit them.
alter table public.study_subjects enable row level security;
alter table public.study_techniques enable row level security;

drop policy if exists tasks_select_owner on public.tasks;
create policy tasks_select_owner on public.tasks
  for select using (auth.uid() = user_id);

drop policy if exists tasks_insert_owner on public.tasks;
create policy tasks_insert_owner on public.tasks
  for insert with check (auth.uid() = user_id);

drop policy if exists tasks_update_owner on public.tasks;
create policy tasks_update_owner on public.tasks
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists tasks_delete_owner on public.tasks;
create policy tasks_delete_owner on public.tasks
  for delete using (auth.uid() = user_id);

drop policy if exists study_subjects_public_read on public.study_subjects;
create policy study_subjects_public_read on public.study_subjects
  for select using (true);

drop policy if exists study_techniques_public_read on public.study_techniques;
create policy study_techniques_public_read on public.study_techniques
  for select using (true);

commit;
