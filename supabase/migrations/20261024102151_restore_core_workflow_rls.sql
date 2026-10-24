-- Restore RLS after the legacy bypass_rls_all_tables migration.
-- Private rows with an unknown owner are preserved, not reassigned.
BEGIN;

ALTER TABLE public.atoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_practice_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mind_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mind_offload_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mind_wins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tasks_select_authenticated_owner ON public.tasks;
CREATE POLICY tasks_select_authenticated_owner ON public.tasks
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS tasks_insert_authenticated_owner ON public.tasks;
CREATE POLICY tasks_insert_authenticated_owner ON public.tasks
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS tasks_update_authenticated_owner ON public.tasks;
CREATE POLICY tasks_update_authenticated_owner ON public.tasks
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS tasks_delete_authenticated_owner ON public.tasks;
CREATE POLICY tasks_delete_authenticated_owner ON public.tasks
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = user_id);

-- The Mind UI supports deleting an offload item, but that policy was missing.
DROP POLICY IF EXISTS mind_offload_items_delete_authenticated_owner ON public.mind_offload_items;
CREATE POLICY mind_offload_items_delete_authenticated_owner ON public.mind_offload_items
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = user_id);

-- Shared reference content used by the Study library and public landing context.
ALTER TABLE public.study_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_techniques ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS study_subjects_public_read ON public.study_subjects;
CREATE POLICY study_subjects_public_read ON public.study_subjects
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS study_techniques_public_read ON public.study_techniques;
CREATE POLICY study_techniques_public_read ON public.study_techniques
  FOR SELECT TO anon, authenticated USING (true);

-- RLS does not govern TRUNCATE. Grants and policies both need to be restrictive.
REVOKE ALL PRIVILEGES ON TABLE
  public.atoms, public.logs, public.study_assignments, public.study_practice_logs,
  public.study_reviews, public.mind_logs, public.mind_offload_items, public.mind_wins,
  public.tasks, public.focus_sessions, public.profiles, public.user_onboarding,
  public.chat_history, public.flashcard_decks, public.flashcards
FROM anon, authenticated, PUBLIC;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.atoms, public.study_assignments, public.tasks, public.focus_sessions,
  public.profiles, public.user_onboarding, public.chat_history,
  public.flashcard_decks, public.flashcards, public.mind_offload_items
TO authenticated;

GRANT SELECT, INSERT, UPDATE ON TABLE public.logs, public.study_reviews TO authenticated;
GRANT SELECT, INSERT ON TABLE public.study_practice_logs, public.mind_logs, public.mind_wins TO authenticated;

REVOKE ALL PRIVILEGES ON TABLE public.study_subjects, public.study_techniques FROM anon, authenticated, PUBLIC;
GRANT SELECT ON TABLE public.study_subjects, public.study_techniques TO anon, authenticated;

-- Indexes for the owner-scoped query patterns used by app providers.
CREATE INDEX IF NOT EXISTS atoms_user_created_idx
  ON public.atoms (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS logs_user_date_idx
  ON public.logs (user_id, date_logged DESC);
CREATE INDEX IF NOT EXISTS tasks_user_status_created_idx
  ON public.tasks (user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS study_assignments_user_created_idx
  ON public.study_assignments (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS study_practice_logs_user_created_idx
  ON public.study_practice_logs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS study_reviews_user_due_idx
  ON public.study_reviews (user_id, next_review_date);
CREATE INDEX IF NOT EXISTS mind_logs_user_created_idx
  ON public.mind_logs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS mind_offload_user_created_idx
  ON public.mind_offload_items (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS mind_wins_user_created_idx
  ON public.mind_wins (user_id, created_at DESC);

COMMIT;
