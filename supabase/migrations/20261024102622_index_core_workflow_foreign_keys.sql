-- Cover the ownership foreign key on Focus sessions and the composite deck
-- ownership foreign key on flashcards, as identified by Supabase advisors.
CREATE INDEX IF NOT EXISTS focus_sessions_user_created_idx
  ON public.focus_sessions (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS flashcards_deck_user_fk_idx
  ON public.flashcards (deck_id, user_id);
