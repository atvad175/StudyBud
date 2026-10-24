# StudyBud

StudyBud is a student-first learning workspace for planning study sessions, practicing recall, reviewing flashcards, managing assignments, building habits, and reflecting on progress.

This repository contains the React web app and a Vercel serverless endpoint for AI features.

## Current product areas

- **Study Hub** — subject strategies, learning methods, assignment breakdowns, Feynman explanations, AI practice exams, and flashcards.
- **Focus** — timed focus sessions and saved session history.
- **Habits** — small recurring habits and daily completion logs.
- **Time** — tasks, energy-aware planning, and weekly reflection.
- **Mind** — private reflections, cognitive offloading, gratitude, and the Bud companion.
- **Accounts** — Supabase authentication, onboarding, personal settings, and account-scoped data.

## Technology

- React 19 and Vite
- React Router
- Supabase Auth, Postgres, and Row Level Security (RLS)
- Vercel for hosting and the `/api/ai` serverless endpoint
- Google Gemini API for AI-supported study and companion features

## Local development

Use Node.js 22 or a compatible supported Node.js version.

```bash
npm ci
```

Create a local environment file from the example:

```bash
cp .env.example .env.local
```

Fill in the appropriate Supabase URL and publishable/anon key for a **development or test project**. Add the server-side Gemini key only to local serverless configuration; never put it in a browser variable.

Run the frontend only:

```bash
npm run dev
```

The Vite dev server does **not** execute the Vercel `/api/ai` function. To test the full app, including AI, use the Vercel CLI:

```bash
npx vercel dev
```

Configure the server-side variables in the local environment used by the Vercel function:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`

The browser build uses:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Any variable prefixed with `VITE_` is public in the client bundle. **Never** use `VITE_GEMINI_API_KEY` or put service-role keys in frontend environment variables.

## Database setup and migrations

Database setup is a critical deployment gate. The repository has legacy SQL bootstrap files under `src/*.sql` and incremental migrations under `supabase/migrations/`. These are not interchangeable, and not every file in `src/` is a safe, authoritative schema.

Before applying changes to any shared database:

1. Identify the current Supabase project and inspect its tables, RLS policies, migration history, and data.
2. Choose and verify one baseline schema for the project.
3. Apply the incremental migrations to a separate test database first.
4. Test two authenticated users and confirm they cannot read or modify each other's private rows.
5. Back up existing data and review records without a valid `user_id` before considering production changes.

The stabilization pull request (#14) adds a migration to re-enable owner-level row security, protect the task table, and preserve the shared read-only study catalogues. It also adds task deadline/priority columns required by the existing Time dashboard, and tests that guard these migration files. The SQL has not been applied to production; validate both migrations on a separate test database and verify two-account isolation first.

## Quality checks

Run the same core checks locally:

```bash
npm ci
node --check api/ai.js
npm run lint
npm run build
```

The pull-request workflow checks API syntax, runs the Node regression suite, performs focused and full ESLint checks, builds the production bundle, and scans that bundle for Gemini SDK/key markers. The suite includes deterministic timer, focus analytics, habit-streak, and migration guardrail tests. These tests do not replace signed-in browser testing or live cross-account RLS verification.

## Delivery workflow

- Report user problems in plain language, with a screenshot or screen recording when available.
- Reproduce the problem and define the expected behavior.
- Fix one small, reviewable unit at a time on a branch.
- Require CI to pass and review a Vercel Preview before merging.
- Test migrations against a non-production Supabase database before production rollout.
- Keep authentication, data isolation, and honest save/error feedback ahead of visual extras.

See [the product roadmap and release workflow](docs/PRODUCT_ROADMAP.md).

## Current stabilization work

The current work is tracked in [StudyBud stabilization pull request #14](https://github.com/atvad175/StudyBud/pull/14).

That PR is not a production release. Before merging, test the migrations against a non-production Supabase database, verify that two authenticated users cannot access each other's private rows, and exercise the core student flows in a Vercel Preview. Production has not been updated with this stabilization batch.
