# StudyBud account and data-integrity test runbook

## Safety rules

- Run the live integration suite only against a dedicated **staging Supabase project**.
- Use two disposable test accounts. Never use student, staff or production accounts.
- Never put a Supabase service-role key in the browser or in these test variables. The tests require only the project URL, anon key and two test-account credentials.
- The test writes one temporary flashcard deck and one temporary focus-session row under Account A. It deletes both in a `finally` block. If a process is forcibly stopped, remove any remaining rows with the `studybud-rls-test-` prefix from the staging project.

## Automated checks

The normal `npm test` suite covers pure account ownership guards, Focus-session storage isolation, migration ordering and static RLS policy coverage.

For real database enforcement, configure these environment variables in a local shell connected to staging:

- `SUPABASE_TEST_URL`
- `SUPABASE_TEST_ANON_KEY`
- `SUPABASE_TEST_USER_A_EMAIL`
- `SUPABASE_TEST_USER_A_PASSWORD`
- `SUPABASE_TEST_USER_B_EMAIL`
- `SUPABASE_TEST_USER_B_PASSWORD`

Then run:

```bash
npm run test:integration:accounts
```

The integration test proves that Account B cannot read, update or delete Account A's flashcard deck or Focus session, and that Account A still sees its own unchanged records. When the six variables are not configured, the test reports as skipped; that is not a pass of the live RLS check.

## Manual account-lifecycle smoke test

Use two fresh staging accounts, A and B, in the same browser profile.

1. Sign in as A, complete onboarding, create a habit, task, assignment, flashcard deck and one Focus session. Save a Mind reflection.
2. Sign out fully. Sign in as B without clearing browser storage.
3. Confirm B starts with B's own onboarding state and sees none of A's habits, tasks, assignments, flashcards, focus history or Mind entries.
4. Create one record in each area as B. Sign out and back in as A.
5. Confirm A sees A's original records only, and none of B's records.
6. Start an unfinished Focus timer as A, sign out, and sign in as B. Confirm B does not see A's timer or pending-save prompt. Sign back in as A and confirm A's timer/session is recoverable.
7. Refresh each account and confirm saved data remains present. Try an offline/failed save and confirm the UI does not claim that an unconfirmed write succeeded.
8. Repeat the account switch in two open tabs. Confirm an old tab cannot keep showing stale page-local data after the shared Supabase session changes.

## Current scope and limitations

The automated repository checks do not sign into the live Supabase project by default. A passing lint/build and skipped integration test do not prove the deployed project's RLS policies are correct. Run the two-account integration test and manual smoke test against the intended staging project before merging or applying migrations to production.
