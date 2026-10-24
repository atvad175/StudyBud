-- Replace legacy private-table policies that targeted PUBLIC and called
-- auth.uid() once per row. Keep the same ownership predicates, but make
-- authenticated-only access explicit and prevent owner reassignment on UPDATE.
BEGIN;

DROP POLICY IF EXISTS "Users can delete their own atoms" ON public.atoms;
CREATE POLICY "Users can delete their own atoms" ON public.atoms
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can insert their own atoms" ON public.atoms;
CREATE POLICY "Users can insert their own atoms" ON public.atoms
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can update their own atoms" ON public.atoms;
CREATE POLICY "Users can update their own atoms" ON public.atoms
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can view their own atoms" ON public.atoms;
CREATE POLICY "Users can view their own atoms" ON public.atoms
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own chat history" ON public.chat_history;
CREATE POLICY "Users can delete own chat history" ON public.chat_history
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can insert own chat history" ON public.chat_history;
CREATE POLICY "Users can insert own chat history" ON public.chat_history
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can read own chat history" ON public.chat_history;
CREATE POLICY "Users can read own chat history" ON public.chat_history
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can update own chat history" ON public.chat_history;
CREATE POLICY "Users can update own chat history" ON public.chat_history
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own logs" ON public.logs;
CREATE POLICY "Users can insert their own logs" ON public.logs
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can update their own logs" ON public.logs;
CREATE POLICY "Users can update their own logs" ON public.logs
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can view their own logs" ON public.logs;
CREATE POLICY "Users can view their own logs" ON public.logs
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own mind logs" ON public.mind_logs;
CREATE POLICY "Users can insert their own mind logs" ON public.mind_logs
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can view their own mind logs" ON public.mind_logs;
CREATE POLICY "Users can view their own mind logs" ON public.mind_logs
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own offload items" ON public.mind_offload_items;
CREATE POLICY "Users can insert their own offload items" ON public.mind_offload_items
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can update their own offload items" ON public.mind_offload_items;
CREATE POLICY "Users can update their own offload items" ON public.mind_offload_items
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can view their own offload items" ON public.mind_offload_items;
CREATE POLICY "Users can view their own offload items" ON public.mind_offload_items
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own wins" ON public.mind_wins;
CREATE POLICY "Users can insert their own wins" ON public.mind_wins
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can view their own wins" ON public.mind_wins;
CREATE POLICY "Users can view their own wins" ON public.mind_wins
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own assignments" ON public.study_assignments;
CREATE POLICY "Users can delete their own assignments" ON public.study_assignments
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can insert their own assignments" ON public.study_assignments;
CREATE POLICY "Users can insert their own assignments" ON public.study_assignments
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can update their own assignments" ON public.study_assignments;
CREATE POLICY "Users can update their own assignments" ON public.study_assignments
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can view their own assignments" ON public.study_assignments;
CREATE POLICY "Users can view their own assignments" ON public.study_assignments
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own practice logs" ON public.study_practice_logs;
CREATE POLICY "Users can insert their own practice logs" ON public.study_practice_logs
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can view their own practice logs" ON public.study_practice_logs;
CREATE POLICY "Users can view their own practice logs" ON public.study_practice_logs
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own reviews" ON public.study_reviews;
CREATE POLICY "Users can insert their own reviews" ON public.study_reviews
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.study_reviews;
CREATE POLICY "Users can update their own reviews" ON public.study_reviews
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can view their own reviews" ON public.study_reviews;
CREATE POLICY "Users can view their own reviews" ON public.study_reviews
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own onboarding" ON public.user_onboarding;
CREATE POLICY "Users can delete own onboarding" ON public.user_onboarding
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can insert own onboarding" ON public.user_onboarding;
CREATE POLICY "Users can insert own onboarding" ON public.user_onboarding
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can read own onboarding" ON public.user_onboarding;
CREATE POLICY "Users can read own onboarding" ON public.user_onboarding
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can update own onboarding" ON public.user_onboarding;
CREATE POLICY "Users can update own onboarding" ON public.user_onboarding
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

COMMIT;
