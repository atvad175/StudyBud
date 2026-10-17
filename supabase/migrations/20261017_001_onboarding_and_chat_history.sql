-- StudyBud onboarding and chat history tables.
-- Apply this migration in the Supabase SQL editor before deploying this branch.
-- Private rows are scoped to the authenticated user; never disable RLS in production.

create table if not exists public.user_onboarding (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  role text not null default 'School student',
  board text not null default '',
  grade text not null default '',
  struggles jsonb not null default '[]'::jsonb,
  learning_style text not null default '',
  fav_topics jsonb not null default '[]'::jsonb,
  topic_type text not null default 'subjects',
  first_atom text,
  intention text not null default '',
  productive_time text not null default '',
  motivation text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.user_onboarding add column if not exists board text not null default '';
alter table public.user_onboarding add column if not exists grade text not null default '';
alter table public.user_onboarding enable row level security;

drop policy if exists "Users can read own onboarding" on public.user_onboarding;
create policy "Users can read own onboarding"
  on public.user_onboarding for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own onboarding" on public.user_onboarding;
create policy "Users can insert own onboarding"
  on public.user_onboarding for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own onboarding" on public.user_onboarding;
create policy "Users can update own onboarding"
  on public.user_onboarding for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own onboarding" on public.user_onboarding;
create policy "Users can delete own onboarding"
  on public.user_onboarding for delete
  using (auth.uid() = user_id);


create table if not exists public.chat_history (
  user_id uuid primary key references auth.users(id) on delete cascade,
  messages jsonb not null default '[]'::jsonb,
  bud_persona text not null default 'candid',
  updated_at timestamptz not null default now()
);

alter table public.chat_history enable row level security;

drop policy if exists "Users can read own chat history" on public.chat_history;
create policy "Users can read own chat history"
  on public.chat_history for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own chat history" on public.chat_history;
create policy "Users can insert own chat history"
  on public.chat_history for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own chat history" on public.chat_history;
create policy "Users can update own chat history"
  on public.chat_history for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own chat history" on public.chat_history;
create policy "Users can delete own chat history"
  on public.chat_history for delete
  using (auth.uid() = user_id);
