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
- Fix the create-account → onboarding → dashboard sequence so there is one account-creation step.
- Remove password storage and handle email confirmation, failed requests and expired sessions honestly.
- Give each user's private rows a database-enforced owner policy.
- Isolate profile preferences, chat and locally stored learning data when accounts change.
- Verify all database migrations on a non-production Supabase project.

**Exit gate:** signup, confirmation, login, logout and onboarding work; two test accounts cannot access each other's records; failure states do not claim success.

### Phase 2 — Core Study experience
- Map the student journey from Study Hub → subject/topic → study action → saved progress → review.
- Fix broken writes and misleading success states before visual redesign.
- Make flashcard data persist under the signed-in account and survive another device/session.
- Make exam creation validate question structure, answer keys, scoring and timers.
- Persist completed AI exam scores and answer review into the signed-in student's study history, with duplicate-submit protection.
- Clearly distinguish AI-generated practice from verified curriculum or past-paper content.

**Exit gate:** a student can complete a study session, refresh, sign back in and find the correct saved state.

### Phase 3 — UX/UI quality
- Establish a shared design system: typography, colors, spacing, navigation, buttons, cards, empty states, alerts and loading states.
- Tighten the landing message to the main student benefit; remove excessive introductory copy.
- Reduce mandatory onboarding questions and ask optional questions when they become useful.
- Standardize back navigation, responsive behaviour, form validation and success/error feedback.
- Make reduced-motion preferences and keyboard navigation work properly.

**Exit gate:** a first-time student can explain what StudyBud does and reach a useful study action without help.

### Phase 4 — AI, speed and maintainability
- [x] Route Gemini requests through an authenticated Vercel serverless endpoint; provider keys are read from server-side environment variables only.
- [x] Validate operation types and input sizes, validate generated exam structure, and add a best-effort per-user rate limit.
- [ ] Replace the in-memory limiter with shared server-side rate limiting and add usage monitoring/timeouts before public launch.
- Use shared prompt/context logic and validate structured model output.
- Measure real loading/interaction timings; don't promise sub-100 ms for network operations.
- Add safe retry/rollback patterns, bounded database queries and tests for high-use flows.
- Add a service for error reporting and performance monitoring after privacy settings have been reviewed.

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
- [ ] `npm ci` succeeds
- [ ] `npm run lint` succeeds
- [ ] `npm run build` succeeds
- [ ] Automated flow tests pass when available
- [ ] SQL migration has been exercised on a test database

### Manual checks
- [ ] Sign up with a new email
- [ ] Test both confirmation-required and immediate-session signup settings
- [ ] Sign in with an existing account and sign out
- [ ] Complete onboarding and refresh
- [ ] Switch between two test accounts; private profile, tasks, habits, reflections and chats must not cross over
- [ ] Create, update, and delete a task/study record; simulate a failed request and check that the UI recovers
- [ ] Check Settings password update and data export
- [ ] Test core Study features at desktop and mobile widths
- [ ] Check empty, loading, offline/error, and success states
- [ ] Check the Vercel preview before any merge

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
