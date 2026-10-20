# StudyBud Product Audit & Rebuild Backlog

**Status:** First-pass code audit; runtime verification is still required for every marked workflow.
**Branch:** `fix/auth-onboarding-security`
**Principle:** Upgrade real user outcomes, not feature count. Do not describe a feature as working until its main workflow and failure states have been tested.

## Product north star

StudyBud should help a learner go from **"I don't know what to do"** to a manageable next action, then help them execute it, learn from the result, and return to the next useful action.

The product is organized around six capabilities:
1. **Habits** — build repeatable routines without shame-based streak mechanics.
2. **Focus** — help a student begin and finish a realistic work session.
3. **Time management** — turn deadlines and tasks into an achievable plan.
4. **Mind** — reflection and non-clinical wellbeing support, with clear limits.
5. **Study** — subject learning, active recall, practice, feedback, and revision.
6. **Personal skills** — deliberate practice toward a skill goal, with observable evidence of progress.

**Bud is the intelligence layer connecting these capabilities**, not a seventh disconnected destination.

## First-pass inventory

These are findings from repository inspection, not claims of full live testing.

| Area | Present in code | Evidence-based assessment | Next work |
|---|---|---|---|
| Authentication and onboarding | Supabase auth, onboarding screen, profile persistence and route gating | Core paths exist; signup recently needed a server-side endpoint. Fresh signup, existing login, refresh, logout, and account-switch flows still need end-to-end regression coverage. | Test the full journey and ensure useful errors; do not add new auth features until stable. |
| Bud / AI companion | Gemini-backed Vercel API, three personas, local and account chat history, welcome prompt | A genuine model call exists. Chat returns a complete response, not a streamed response. Provider failover previously only handled quota errors. A reply appearing in the UI does not prove it is useful or reliable. | Harden model failover/timeouts; test all AI operations; then design structured plans and approved actions. |
| Study Hub | Searchable subject area, board/grade context, strategies and navigation to study tools | A foundation exists, but some subject advice is generic rather than verified syllabus content. | Audit subject accuracy; label verified curriculum material versus general advice; connect study → practice → review. |
| Exam simulator | Timed exam flow, generated MCQs, score calculation, answer review and saved practice records | Schema validation exists. Generated material is practice content, not proof of official syllabus alignment. End-to-end correctness and save/reload behavior remain to be tested. | Test question validity, marking, unanswered questions, timer behavior, result persistence and error recovery. |
| Flashcards | Dedicated flashcard experience and account-owned storage path | Substantial UI/logic exists; functionality and recall scheduling need observed testing. | Test create/edit/delete, account isolation, import/migration, review flow and persistence. Design spaced review from observed student needs. |
| Dashboard | Five destination cards: Habits, Focus, Time, Mind and Study | Primarily a navigation screen, not yet the student's daily operating plan. | Build a useful "What should I do next?" view from saved goals, tasks, deadlines, weak topics and available time. |
| Habits | Habit creation, tracking, streak board and related flows | Feature area exists. Tracking should support recovery after a missed day rather than make streak preservation the product goal. | Test duplicate prevention, daily completion logic, history, account switching and failed saves. |
| Focus | Timer, session flows, music/ambience, study rooms, and saved session history | Removed hard-coded dashboard claims (including a fabricated weekly percentage); the dashboard now summarizes saved sessions for today and the rolling last 7 days, with loading/error/empty states and clear disclosure that it uses up to the 50 most recent records. Five isolated unit tests cover the summary calculations. Timer behavior and end-to-end persistence still need runtime verification. | Test pause/resume, tab/background behavior, completion, interruption, real Supabase session persistence, account isolation, and mobile controls. |
| Time management | Tasks, energy matching, reflection and weekly review | Several screens exist, but they need to become one planning workflow rather than separate utilities. | Test task CRUD and failure recovery; build deadlines → prioritized plan → session → review. |
| Mind / wellbeing | Reflection, mood timeline, cognitive offload, meditation and positive-affect screens | The component breadth is high. Keep it non-clinical, private, and optional; don't treat wellbeing data as a school-performance score. | Test persistence, privacy expectations, data deletion/export behavior and calm failure states. |
| Community / growth | Community landing page | Notification signup was removed because it stored email addresses only in the visitor's own browser; the page now says launch notifications are not open until a real service can deliver them. | If launch notifications are needed, build a consented backend waitlist with abuse controls, data retention/deletion rules, and a verified send flow. |
| Personal skills | No dedicated end-to-end skill-development workflow identified in this pass | A strategic capability, not yet a clearly implemented product journey. | Define goal → deliberate practice → artifact/evidence → feedback → review before building a new module. |

## Priority order

### P1 — Make the core product trustworthy and useful

1. **Bud reliability and quality**
   - [x] Add a bounded fallback policy for quota, overload, unavailable-model and transient network/service errors.
   - [x] Add deterministic Node tests for fallback decisions.
   - [ ] Verify the CI run and exercise every AI operation against a Vercel preview.
   - [ ] Add measured request duration, clear cancellation/timeouts, and useful user-facing recovery.
   - [ ] Migrate the legacy Gemini SDK in a separate reviewed dependency change.
   - [ ] Implement real streaming only after cancellation, partial output and retry behavior are tested.
   - [ ] Add an action-oriented study-plan preview; never write tasks until the student explicitly approves them.

2. **Study learning loop**
   - [ ] Write acceptance tests for exam generation, answer validation, scoring, review and persistent results.
   - [ ] Build a mistake record that captures the question, chosen answer, correct answer, explanation and topic.
   - [ ] Recommend re-practice based on demonstrated gaps, not generic motivation.
   - [ ] Distinguish AI-generated practice from verified curriculum or official past-paper material.

3. **Daily planning**
   - [ ] Define the smallest daily-plan data model from existing task, focus, study and onboarding state.
   - [ ] Present one prioritized next action and a realistic estimate.
   - [ ] Support start, pause, complete, reschedule and review, including failed-save recovery.
   - [ ] Do not create duplicate tasks when Bud's plan is retried.

### P2 — Reduce friction and make the product coherent

4. Simplify onboarding around essential setup, with optional personalization deferred until useful.
5. Make the first useful action reachable immediately after signup.
6. Unify navigation, terminology, component behavior and responsive layouts.
7. Replace inaccurate claims and nonfunctional placeholder actions with actual capability or an honest "not available yet" state.
8. Make each productivity pillar feed the same daily workflow where appropriate.

### P3 — Differentiation and adoption

9. Add a skill-development journey only after its user outcome and evidence of progress are defined.
10. Test a few cohesive visual directions with students before committing to a full theme rewrite.
11. Pilot with a small group and measure first useful action, repeat sessions, task completion, exam-practice completion, retention and reported errors.

## Acceptance standard for every feature

A feature is complete only when:
- the main user workflow succeeds;
- loading, empty, offline, API error and success states are intentional;
- saved data survives refresh and a new session where cloud persistence is promised;
- a failure does not silently lose work or claim success;
- keyboard and mobile use are practical;
- tests cover the logic and the actual flow is exercised in a preview;
- any AI-generated academic content is honestly labeled and its quality has been checked.

## First implementation in progress

**AI model fallback reliability** is the first contained engineering task. The code previously fell back to the second configured model only on quota errors; transient overload, service/network failures, or an unavailable first model could stop Bud immediately. A shared classifier and built-in Node tests have been added. The tests pass locally; GitHub CI and preview checks must still be verified before promotion.

## Release gates

- Do not merge the large, diverged feature branch into `main` blindly.
- Keep changes small and reviewable, and prefer a pull request with a preview.
- Never put AI secrets in browser bundles.
- Do not apply broad database policy changes without table-specific owner policies and cross-account tests.
- Before a wider school rollout, resolve the known Row Level Security gaps and test that two accounts cannot access one another's records.
- Never claim performance, learning gains, successful signup, or feature completion without verification.
