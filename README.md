# StudyBud

A calm study workspace built with the Next.js App Router: a focus timer that logs every block,
habits with honest streaks, flashcards generated from your own notes, and one overview of the week.

Live at <https://studybud-five-puce.vercel.app>.

## What actually ships

| Area | Route | What it does |
| --- | --- | --- |
| Marketing | `/`, `/features`, `/mission`, `/about`, `/community` | Public pages that describe the shipped product. `/community` is explicitly under construction. |
| Accounts | `/login`, `/reset-password`, `/auth/callback` | Email + password sign-up and sign-in, password reset by email, password change on the profile page. |
| Overview | `/dashboard` | Today's habits, current streak, weekly focus minutes, latest decks. |
| Habits | `/dashboard/habits` | Create habits, check them off, streaks counted from real completion dates. |
| Focus | `/dashboard/focus` | Pomodoro / deep-work timer with breaks, logs completed and partially logged sessions. |
| Study | `/dashboard/study` | Paste notes, generate 6–12 flashcards with Gemini, review saved decks. |
| Profile | `/dashboard/profile` | Display name, email, plan, grade/section, password change. |

The House league (houses, points, `/dashboard/house-clash`) is fully built but switched off in the
UI by `SHOW_HOUSES` in `lib/features.ts`. The tables, triggers and actions stay in place so it can be
turned back on without a rebuild.

Not shipped, and not advertised anywhere: chat with an AI coach, mood/mind tracking, energy
scheduling, Spotify playback, exam practice, community rooms, mobile apps.

## Technology

- Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- Supabase Auth + Postgres with Row Level Security, via `@supabase/ssr`
- Google Gemini (`@google/genai`) for flashcard generation, called from a Server Action only

## Project layout

```
app/                 pages, layouts, Server Actions, route handlers, sitemap/robots
components/         React components (landing, auth, dashboard, focus, habits, study, profile, ui)
lib/                 Supabase clients, env helpers, AI client, date/streak and flashcard helpers
types/               shared TypeScript types, including database row types
supabase/migrations/ ordered SQL migrations — the only authoritative schema source
tests/               unit tests run by `npm test` (node:test, TypeScript stripped by Node)
```

## Environment variables

```bash
cp .env.example .env.local
```

| Variable | Scope | Required | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | public | yes | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | yes | Supabase publishable/anon key. Never a service-role key. |
| `VITE_SUPABASE_URL` | public | fallback | Older name, read only when the `NEXT_PUBLIC_` one is missing. |
| `VITE_SUPABASE_ANON_KEY` | public | fallback | Older name, same rule. |
| `GEMINI_API_KEY` | server only | for AI | Enables flashcard generation. Never prefix with `NEXT_PUBLIC_`. |
| `NEXT_PUBLIC_SITE_URL` | public | optional | Absolute origin for email links and the sitemap. Defaults to the production URL. |

Anything prefixed `NEXT_PUBLIC_` is shipped to the browser bundle. The AI key is read only on the
server.

## Local development

```bash
npm ci
npm run dev
```

The app runs at <http://localhost:3000>. AI generation runs inside the Next.js server process, so
`npm run dev` is enough once `GEMINI_API_KEY` is set.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server. |
| `npm run build` | Production build. |
| `npm start` | Serve the production build. |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run lint` | ESLint over the repository. |
| `npm test` | Unit tests for the date/streak and flashcard helpers. |

## Database

`supabase/migrations/` is the single source of truth, applied in filename order.

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

Without the CLI, run each file in the Supabase SQL editor in timestamp order.

Before applying to a shared database: apply to a test project first, confirm the `handle_new_user`
trigger and the RLS policies exist, then sign up two accounts and confirm neither can read the
other's rows. `artifacts/apply_all_migrations.sql` is a generated concatenation of every migration
for convenience; regenerate it if the migrations change.

Migration highlights:

- `20261017130000_onboarding_and_chat_history.sql` — onboarding profile fields and (legacy) chat history.
- `20261017130100_private_data_rls.sql` — owner-only policies for private tables.
- `20261017130200_flashcard_storage.sql` — account-owned flashcard decks and cards.
- `20261117090000_studybud_core_reconciliation.sql` — reconciles the schema with the app.
- `20261118090000_house_selection_guard.sql` — validates houses and locks house assignment.
- `20261121120000_public_table_grants.sql` — standard API grants so signed-in queries work.

## AI cost control

`generateAIFlashcards` refuses after 10 saved decks per account in a rolling 24 hours. The count is
based on saved decks, so a failed generation does not use up an allowance.

## Deployment

Vercel builds with the default Next.js detection. Set the environment variables above for Production
and Preview, then redeploy: changing a value in the Vercel dashboard does not affect an existing
deployment until a new one is built.

## Quality checks

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```

CI (`.github/workflows/quality.yml`) runs lint, typecheck and the production build on pull requests
with placeholder Supabase values.

## Delivery workflow

- One small, reviewable change at a time on a branch.
- CI passes and the Vercel preview is checked before merging.
- Database changes are migrations, tested somewhere other than production first.
- Authentication, data isolation and honest save/error feedback come before visual extras.
