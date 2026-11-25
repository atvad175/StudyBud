-- The Time task form already submits due_date. Add the missing column
-- without changing or deleting any existing task records.
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS due_date date;

CREATE INDEX IF NOT EXISTS tasks_user_due_date_idx
  ON public.tasks (user_id, due_date)
  WHERE due_date IS NOT NULL;
