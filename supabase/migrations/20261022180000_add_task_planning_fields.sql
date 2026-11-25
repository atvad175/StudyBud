-- Complete the task-planning data contract used by TimeDashboard.
-- Existing rows remain valid: deadlines and priority are optional for legacy tasks.

begin;

alter table public.tasks add column if not exists due_date date;
alter table public.tasks add column if not exists priority text;

commit;
