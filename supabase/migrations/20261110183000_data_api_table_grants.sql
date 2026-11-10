-- Explicit Data API privileges for StudyBud application tables.
-- Supabase stopped automatically exposing newly created public tables on
-- 2026-10-30. These grants make the intended API access explicit.
--
-- Table grants and RLS are separate controls:
-- - public study reference data is read-only to anon and authenticated;
-- - private student data is available only to authenticated, with existing
--   owner-specific RLS policies still controlling every row.
-- - identity sequences are granted only for the app tables that need them.
--
-- This is additive and safe to re-run. Do not use broad grants to anon for
-- private student records.

begin;

grant select on table
  public.study_techniques,
  public.study_subjects
to anon, authenticated;

grant select, insert, update, delete on table
  public.user_onboarding,
  public.chat_history,
  public.atoms,
  public.logs,
  public.study_assignments,
  public.study_practice_logs,
  public.study_reviews,
  public.mind_logs,
  public.mind_offload_items,
  public.mind_wins,
  public.tasks,
  public.focus_sessions,
  public.profiles,
  public.flashcard_decks,
  public.flashcards
to authenticated;

do $$
declare
  target_table text;
  target_sequence text;
begin
  foreach target_table in array array[
    'atoms',
    'logs',
    'study_assignments',
    'study_practice_logs',
    'study_reviews',
    'mind_logs',
    'mind_offload_items',
    'mind_wins',
    'tasks',
    'focus_sessions',
    'flashcard_decks',
    'flashcards'
  ]
  loop
    target_sequence := pg_get_serial_sequence(
      format('public.%I', target_table),
      'id'
    );

    if target_sequence is not null then
      execute format(
        'grant usage, select on sequence %s to authenticated',
        target_sequence
      );
    end if;
  end loop;
end $$;

commit;
