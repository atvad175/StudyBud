-- ---------------------------------------------------------------------------
-- Public schema privileges for the API roles.
--
-- Supabase normally hands anon/authenticated access to new public tables through
-- ALTER DEFAULT PRIVILEGES. Tables that were created outside that default (or
-- restored by hand) end up reachable only by their owner, which surfaces in the
-- app as `permission denied for table public.<name>` (42501) instead of an
-- empty result. Row level security still decides which rows a request may
-- touch, so restoring the standard grants does not widen access to any row.
--
-- Additive and idempotent: safe to run more than once.
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
grant all on all tables in schema public to service_role;

grant usage, select on all sequences in schema public to anon, authenticated, service_role;

-- Functions are deliberately not blanket-granted here: `award_house_points`
-- had its execute privilege revoked from students on purpose, and a wildcard
-- grant would hand it straight back.

alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant select on tables to anon;
alter default privileges in schema public
  grant all on tables to service_role;
alter default privileges in schema public
  grant usage, select on sequences to anon, authenticated, service_role;
