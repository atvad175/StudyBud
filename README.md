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

The current draft pull request adds migrations for onboarding/chat history, owner-only private data policies, and account-owned flashcards. One migration replaces existing policies on selected private tables. Do not apply it to production without verifying the project's actual schema and policy requirements.

## Quality checks

Run the same core checks locally:

```bash
npm ci
node --check api/ai.js
npm run lint
npm run build
```

The pull-request workflow requires serverless syntax, targeted lint, the full-repository ESLint suite, and a production build. It also scans the compiled browser bundle for Gemini SDK/key markers. Full lint currently passes; automated browser-flow and cross-account RLS regression tests are still on the roadmap.

## Delivery workflow

- Report user problems in plain language, with a screenshot or screen recording when available.
- Reproduce the problem and define the expected behavior.
- Fix one small, reviewable unit at a time on a branch.
- Require CI to pass and review a Vercel Preview before merging.
- Test migrations against a non-production Supabase database before production rollout.
- Keep authentication, data isolation, and honest save/error feedback ahead of visual extras.

See [the product roadmap and release workflow](docs/PRODUCT_ROADMAP.md).

## Draft implementation work

The current implementation branch is reviewed through a draft pull request:

[StudyBud hardening pull request](https://github.com/atvad175/StudyBud/pull/1)

That PR is not a production release. Vercel environment configuration, safe Supabase migration/testing, and a real end-to-end preview check remain necessary before deployment.
