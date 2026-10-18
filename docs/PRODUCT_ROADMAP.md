# StudyBud Product Roadmap & Release Workflow

This document is the single source of truth for what we are fixing, why we are fixing it, and how a change is allowed to reach students. The founder can report problems in plain language; engineering translates those reports into implementation and tests.

## Operating rules

1. **Do not ship straight to `main`.** Work in a short-lived branch and open a pull request. The production site must not receive unreviewed database or authentication changes.
2. **One issue, one outcome.** Each task should describe a user problem, expected behaviour, acceptance checks, and any data/security impact.
3. **Preview before release.** Every pull request should have a Vercel preview. Test the actual student flow in that preview, on a desktop-sized and mobile-sized viewport.
4. **Database changes are migrations.** Apply migrations to a separate Supabase test project first. Inspect the existing schema, policies and data before applying them to production. Take a backup first.
5. **Never put secrets in Git or browser code.** Do not commit `.env` files or use `VITE_` variables for private AI keys. Do not paste credentials into ChatGPT, GitHub issues, screenshots or logs.
6. **Security decisions are tested at the database.** A student must not be able to read or change another student's private records by calling Supabase directly.
7. **Do not merge on appearance alone.** CI must pass, the preview must pass the checklist, and failures must have an owner and a tracked issue.

## Priority definitions

- **P0 — Stop-ship:** credential exposure, cross-user data exposure, account creation/login failure, data loss or a broken production deployment.
- **P1 — Core workflow:** a major student task cannot be completed reliably, or data does not persist correctly.
- **P2 — UX and quality:** confusing onboarding, inconsistent design, poor mobile layout, unclear feedback, or slow flows.
- **P3 — Enhancement:** optional animation, decorative details or nice-to-have features.

Security, authentication and reliable saving take priority over new features.

## Execution phases

### Phase 1 — Trust and account safety
- [x] Fix the create-account → onboarding → dashboard sequence so there is one account-creation step.
- [x] Remove new browser password storage and handle signup responses/email-confirmation-required states honestly.
- [x] Add owner-only policy definitions for private tables and reset in-memory providers when accounts change.
- [x] Isolate profile preferences, Bud chat, and flashcard state across account changes.
- [ ] Verify/apply the drafted migrations in a non-production Supabase project and test cross-account access before production.

**Exit gate:** signup, confirmation, login, logout and onboarding work; two test accounts cannot access each other's records; failure states do not claim success.

### Phase 2 — Core Study experience
- [x] Redesign the Study Hub around clear primary actions, searchable subjects, curriculum filters, responsive cards, and useful progress counts.
- [x] Surface the existing ICSE, IGCSE, CBSE, IB and ISC study-approach cards when a curriculum is selected.
- [x] Revise overconfident study guidance and clearly distinguish general strategy advice from official syllabus/mark-scheme details.
- [x] Fix core save/error feedback and roll back optimistic task, assignment, and practice writes when they fail.
- [x] Move flashcards to account-owned Supabase tables with an explicit import path for older browser-only cards.
- [x] Validate AI exam question count, options and answer keys; replace fake placeholder exams with actual practice generation.
- [x] Pass allowlisted board/grade context to AI exam generation as a difficulty hint, without claiming official syllabus alignment.
- [x] Persist exam score/answer review and Feynman mastery sessions in the signed-in student's Study history.
- [x] Pass the selected subject from the Study Hub into exam setup and distinguish AI-generated practice from verified past papers.
- [ ] Add browser and RLS regression tests for at least one ICSE and one IGCSE workflow.

**Exit gate:** a student can complete a study session, refresh, sign back in and find the correct saved state.

### Phase 3 — UX/UI quality
- [x] Refine landing-page copy and unify key landing/auth typography with shared font tokens.
- [x] Reduce onboarding to four short steps, with optional personalization instead of eight mandatory preference screens.
- [x] Add responsive Study Hub actions, curriculum approach cards, loading/error states, keyboard-focus styling and an explicit note about general versus official syllabus guidance.
- [x] Add low-noise transparency notices for Bud chat data/AI use and Feynman AI assessment.
- [x] Make Settings profile edits save to the account record with loading/success/error feedback, including verification that a row was actually updated.
- [x] Preserve local profile data and show a retry screen if a saved onboarding profile cannot be verified because of a query failure.
- [x] Make the Settings cache-reset control explicit that it clears local data and signs out this device, but does not delete cloud records.
- [ ] Conduct desktop/mobile usability testing and accessibility review; fix remaining page-to-page inconsistencies.

**Exit gate:** a first-time student can explain what StudyBud does and reach a useful study action without help.

### Phase 4 — AI, speed and maintainability
- [x] Route Gemini requests through an authenticated Vercel serverless endpoint; provider keys are read from server-side environment variables only.
- [x] Validate operation types and input sizes, validate generated exam structure, and add a best-effort per-user rate limit.
- [ ] Replace the in-memory limiter with shared server-side rate limiting and add usage monitoring/timeouts before public launch.
- [x] Use the shared authenticated AI endpoint for the main chat and Bud Companion; apply context/persona instructions consistently.
- [x] Validate structured exam output and bound input sizes; prevent remote chat history from being overwritten after failed reads.
- [ ] Migrate the legacy `@google/generative-ai` SDK to Google's maintained `@google/genai` SDK ([issue #8](https://github.com/atvad175/StudyBud/issues/8)).
- [ ] Build an action-oriented Bud plan flow with explicit student approval before task creation or other write actions ([issue #9](https://github.com/atvad175/StudyBud/issues/9)).
- [ ] Replace the per-instance in-memory limiter with shared server-side rate limiting and add usage monitoring/timeouts before public launch.
- [ ] Measure real loading/interaction timings; add error reporting and high-use flow tests after privacy settings are reviewed.

**Exit gate:** AI keys are not present in browser bundles; model failures have safe user-facing messages; shared rate limiting/usage monitoring are enabled; study data remains correct when requests fail.

### Phase 5 — School pilot and growth
- Pilot with a small, school-approved group before opening wider access.
- Define student, teacher and admin permissions explicitly.
- Collect only necessary analytics; avoid making private study or wellbeing data visible to school staff by default.
- Measure activation, first useful action, repeat use, seven-day retention, and reported errors.
- Grow through useful study workflows and voluntary sharing—not pressure or misleading claims.

**Exit gate:** the product is reliable, privacy reviewed, supportable and shows repeat usage before scaling.

## Pull-request release checklist

### Automated checks
- [x] `npm ci` succeeds in GitHub Actions.
- [x] Strict targeted ESLint passes on the critical edited AI/auth/Study/Settings screens.
- [x] `npm run build` succeeds in GitHub Actions.
- [x] The compiled browser bundle passes the Gemini-key/SDK marker scan.
- [ ] Full-repository `npm run lint` is still non-blocking and reports 51 legacy errors; tracked in [issue #7](https://github.com/atvad175/StudyBud/issues/7).
- [ ] Browser flow tests and RLS access tests are added.
- [ ] SQL migrations are exercised against a separate test database.

### Manual checks
- [ ] Sign up with a new email
- [ ] Test both confirmation-required and immediate-session signup settings
- [ ] Sign in with an existing account and sign out
- [ ] Complete onboarding and refresh
- [ ] Switch between two test accounts; private profile, tasks, habits, reflections and chats must not cross over
- [ ] Create, update, and delete a task/study record; simulate a failed request and check that the UI recovers
- [ ] Verify Settings profile/password updates, local-only export, and local-cache reset behavior.
- [ ] Test exam scoring/saves, Feynman history, flashcards, and subject-to-exam prefill at desktop and mobile widths.
- [ ] Test Bud chat restore on a new device and simulate failed history reads.
- [ ] Check empty, loading, offline/error, and success states.
- [ ] Verify cross-account privacy and the Vercel preview before any merge.

## How the founder reports a problem

No technical language is required. Send any of these:
- a screenshot or short screen recording;
- what you clicked;
- what you expected;
- what actually happened;
- whether it happened once or every time.

If only the feeling is clear ("the Study section feels dead", "signup feels clunky", "this page isn't cool"), report that too. We turn it into a testable problem, reproduce it, rank it, implement a small change, and verify it. Do not attempt to edit code or database policies yourself.

## Current working branch

Draft PR: https://github.com/atvad175/StudyBud/pull/1

This PR is not a production release. Do not merge it until CI is green and its Supabase migrations have been tested safely.
