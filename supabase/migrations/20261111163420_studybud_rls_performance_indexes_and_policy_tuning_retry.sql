-- Remove duplicate unique indexes and add remaining covering indexes.
-- Tune account-owned policies to avoid per-row auth.uid() evaluation.
begin;

drop index if exists public.chat_history_user_id_uidx;
drop index if exists public.user_onboarding_user_id_uidx;

create index if not exists focus_sessions_user_created_idx
  on public.focus_sessions(user_id, created_at desc);
create index if not exists flashcards_deck_owner_fk_idx
  on public.flashcards(deck_id, user_id);

drop policy if exists "Users own their onboarding" on public.user_onboarding;
create policy "Users own their onboarding"
  on public.user_onboarding for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users own their chat history" on public.chat_history;
create policy "Users own their chat history"
  on public.chat_history for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

do $$
declare p record;
begin
  for p in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname='public'
      and tablename in ('flashcard_decks','flashcards')
  loop
    execute format('drop policy if exists %I on %I.%I',p.policyname,p.schemaname,p.tablename);
  end loop;
end $$;

create policy flashcard_decks_select_owner on public.flashcard_decks
  for select using ((select auth.uid()) = user_id);
create policy flashcard_decks_insert_owner on public.flashcard_decks
  for insert with check ((select auth.uid()) = user_id);
create policy flashcard_decks_update_owner on public.flashcard_decks
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy flashcard_decks_delete_owner on public.flashcard_decks
  for delete using ((select auth.uid()) = user_id);

create policy flashcards_select_owner on public.flashcards
  for select using ((select auth.uid()) = user_id);
create policy flashcards_insert_owner on public.flashcards
  for insert with check ((select auth.uid()) = user_id);
create policy flashcards_update_owner on public.flashcards
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy flashcards_delete_owner on public.flashcards
  for delete using ((select auth.uid()) = user_id);

commit;
