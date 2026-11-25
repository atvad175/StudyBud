-- The Time task form submits priority; the column was missing from production.
-- Preserve existing tasks and leave historical priorities nullable.
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS priority text;

CREATE INDEX IF NOT EXISTS tasks_user_priority_due_idx
  ON public.tasks (user_id, priority, due_date)
  WHERE status = 'Planned';
