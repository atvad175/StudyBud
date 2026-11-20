# StudyBud

StudyBud is a student-first learning workspace for planning study sessions, practicing recall, reviewing flashcards, managing assignments, building habits, and reflecting on progress.

The app is a single **Next.js App Router** project (React 19, TypeScript, Tailwind CSS). There is no separate SPA build: every page, Server Action and API route lives under `app/`.

## Current product areas

- **Study Hub** — subject strategies, learning methods, assignment breakdowns, and AI-generated flashcard decks.
- **Focus** — timed focus sessions and saved session history.
- **Habits** — small recurring habits and daily completion logs.
- **House** — school-house membership and a house leaderboard.
- **Profile** — account details and one-time house selection.
- **Mind** — private reflections, cognitive offloading, gratitude, and the Bud companion.
- **Accounts** — Supabase authentication, onboarding, personal settings, and account-scoped data.

## Technology

- Next.js 15 (App Router) with React 19 and TypeScript
- Tailwind CSS
- Supabase Auth, Postgres, and Row Level Security (RLS), accessed through `@supabase/ssr`
- Google Gemini (`@google/generative-ai`) for AI flashcard generation, called from a Server Action only

## Project layout

```
app/                 App Router pages, layouts, Server Actions and route handlers
components/          React components (dashboard, auth, study, focus, habits, house, ui)
lib/                 Supabase clients, env helpers, AI client, shared utilities
types/               Shared TypeScript types (including generated database types)
supabase/migrations/ Ordered SQL migrations — the only authoritative schema source
supabase/functions/  Edge function used for scripted sign-up flows
```

## Environment variables

Copy the example file and fill in your own values:

```bash
cp .env.example .env.local
```

| Variable | Scope | Required | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | public | yes | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | yes | Supabase publishable/anon key. Never a service-role key. |
| `VITE_SUPABASE_URL` | public | fallback | Older name for `NEXT_PUBLIC_SUPABASE_URL`; used only when it is missing. |
| `VITE_SUPABASE_ANON_KEY` | public | fallback | Older name for `NEXT_PUBLIC_SUPABASE_ANON_KEY`; used only when it is missing. |
| `GEMINI_API_KEY` | server only | for AI | Enables AI flashcard generation. Never prefix with `NEXT_PUBLIC_`. |
| `NEXT_PUBLIC_SITE_URL` | public | optional | Absolute origin used for Supabase email-confirmation links when a request has no `Origin` header. |

Anything prefixed `NEXT_PUBLIC_` is shipped to the browser bundle. Server-only values must be set in the host's environment settings and are never read from a `NEXT_PUBLIC_` variable.

## Local development

Use Node.js 22 or another supported Node.js version.

```bash
npm ci
npm run dev
```

The app runs at <http://localhost:3000>. Server Actions that use `GEMINI_API_KEY` run in the Next.js server process, so `npm run dev` is enough to exercise AI features once the key is set; no separate serverless emulator is required.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Next.js dev server. |
| `npm run build` | Production build. |
| `npm start` | Serve the production build. |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run lint` | ESLint over the repository. |
| `npm test` | Node's built-in test runner, if tests are added. |

## Database setup and migrations

`supabase/migrations/` is the single source of truth for the schema. Apply the files **in filename order**; each filename starts with its UTC timestamp.

With the Supabase CLI:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

`db push` applies every migration in `supabase/migrations/` that is not already recorded in the project's migration history. To inspect what would run first:

```bash
npx supabase migration list
npx supabase db push --dry-run
```

Without the CLI, open the Supabase SQL editor and run each file in timestamp order.

Before applying migrations to a shared or production database:

1. Apply them to a separate Supabase test project first.
2. Confirm the `handle_new_user` trigger, the RLS policies on private tables, and the house-assignment trigger exist and behave as expected.
3. Sign up two test accounts and confirm neither can read or modify the other's private rows.
4. Back up existing data and review rows that lack a valid `user_id`.

Migration highlights:

- `20261017130000_onboarding_and_chat_history.sql` — onboarding profile fields and Bud chat history.
- `20261017130100_private_data_rls.sql` — owner-only policies for private tables.
- `20261017130200_flashcard_storage.sql` — account-owned flashcard decks and cards.
- `20261021170000_core_feature_schema_repair.sql` — repairs core feature tables.
- `20261117090000_studybud_core_reconciliation.sql` — reconciles the current schema against the app.
- `20261118090000_house_selection_guard.sql` — validates houses in `handle_new_user` and locks house assignment with a database trigger.

## Deployment

The repository deploys to Vercel with the default Next.js build detection — there is no custom rewrite or `vercel.json`, so every route is served by the App Router.

Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GEMINI_API_KEY` and `NEXT_PUBLIC_SITE_URL` in the Vercel project's environment settings for Production and Preview, and apply the migrations before the first deploy that depends on them. Projects that still carry `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` keep working without renaming, since `next.config.mjs` maps them onto the `NEXT_PUBLIC_` names at build time.

## Quality checks

```bash
npm ci
npm run typecheck
npm run build
```

CI runs the same type check and production build on every pull request.

## Delivery workflow

- Report user problems in plain language, with a screenshot or screen recording when available.
- Reproduce the problem and define the expected behavior.
- Fix one small, reviewable unit at a time on a branch.
- Require CI to pass and review a Vercel preview before merging.
- Test migrations against a non-production Supabase database before production rollout.
- Keep authentication, data isolation, and honest save/error feedback ahead of visual extras.

See [the product roadmap and release workflow](docs/PRODUCT_ROADMAP.md).
