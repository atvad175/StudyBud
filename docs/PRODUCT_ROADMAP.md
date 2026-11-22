# StudyBud Product Roadmap & Release Workflow

Single source of truth for what ships, what is switched off, and how a change is allowed to reach
students.

## Operating rules

1. **Do not ship straight to `main`.** Work in a short-lived branch and open a pull request.
2. **One issue, one outcome.** Each change describes a user problem, the expected behaviour and any
   data or security impact.
3. **Preview before release.** Every pull request gets a Vercel preview; check it on a desktop and a
   mobile viewport before merging.
4. **Database changes are migrations.** Test them on a separate Supabase project first, then apply.
5. **Never put secrets in Git or browser code.** No `.env` files, no private keys in
   `NEXT_PUBLIC_` variables, no credentials in issues, screenshots or logs.
6. **Security is tested at the database.** A student must not be able to read or change another
   student's rows by calling Supabase directly.
7. **Marketing copy describes shipped behaviour.** If it is not in the app, it is not on the site.

## What ships today

- Email + password accounts, password reset by email, password change from the profile page.
- Habits with streaks counted from real completion dates.
- Focus timer (Pomodoro, deep work, breaks) with logged sessions and a seven-day record.
- AI flashcards generated from pasted notes, saved to the account, 10 decks per rolling 24 hours.
- Overview dashboard and profile (display name, email, plan, grade/section).
- Public marketing pages plus privacy and terms.
- Unit tests for the date/streak and flashcard helpers.

## Switched off

- **House league** — tables, triggers, actions and pages all exist; the UI is hidden by
  `SHOW_HOUSES` in `lib/features.ts`. Turning it on requires no schema change.

## Not built

AI coach chat, mood/mind tracking, energy scheduling, Spotify playback, exam practice, community
rooms, teacher dashboards, mobile apps. None of these are advertised.

## Next, in order

1. Self-serve data export and account deletion (both need a server-side admin path, so they are
   manual today).
2. Server-side rate limiting on auth actions, in addition to Supabase's own limits.
3. A browser pass of every signed-in flow on a small screen, then screenshots in the README.
4. Decide the house league's future: ship it, or delete the dead code path.

## Priority definitions

- **P0 — Stop-ship:** credential exposure, cross-user data exposure, login/signup failure, data loss,
  broken production deployment.
- **P1 — Core workflow:** a main student task cannot be completed reliably, or data does not persist.
- **P2 — UX and quality:** confusing flows, inconsistent design, poor mobile layout, unclear feedback.
- **P3 — Enhancement:** optional polish.

Security, authentication and reliable saving outrank new features.

## Release checklist

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] Vercel preview: sign in, check habits, focus and study on desktop and mobile
- [ ] Signed out: marketing pages, `/login`, and `/dashboard` redirecting to `/login`
- [ ] No new claims on any marketing page that the app does not do
