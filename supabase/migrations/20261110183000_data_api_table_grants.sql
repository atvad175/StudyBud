-- Explicit Supabase Data API privileges for StudyBud application tables.
-- Revoke anonymous access to private student records. RLS remains the row-level
-- security boundary for authenticated users. The legacy tasks table is deliberately
-- excluded until its unowned row has a confirmed owner and owner-only RLS is enabled.

begin;

revoke all privileges on table
  public.study_techniques,
  public.study_subjects
from anon, authenticated;

grant select on table
  public.study_techniques,
  public.study_subjects
to anon, authenticated;

revoke all privileges on table
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
  public.focus_sessions,
  public.profiles,
  public.flashcard_decks,
  public.flashcards
from anon;

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
      execute format('revoke all privileges on sequence %s from anon', target_sequence);
      execute format(
        'grant usage, select on sequence %s to authenticated',
        target_sequence
      );
    end if;
  end loop;
end $$;

commit;
