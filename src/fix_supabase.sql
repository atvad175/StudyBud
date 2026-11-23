-- Run this in your Supabase SQL Editor to fix the "not saving" issue.

-- 1. Disable Row Level Security (so you don't need to be logged in)
alter table atoms disable row level security;
alter table logs disable row level security;

-- 2. Allow user_id to be empty (since we don't have a login screen yet)
alter table atoms alter column user_id drop not null;
alter table logs alter column user_id drop not null;

-- 3. (Optional) Clean up invalid data if any
-- delete from atoms where user_id is null; 
