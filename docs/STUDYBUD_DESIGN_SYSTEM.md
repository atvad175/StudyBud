# StudyBud app design system — Phase 2

This system applies only to the authenticated StudyBud workspace. Public landing, about, features, community and mission pages intentionally remain outside `.studybud-shell`.

## Product feel

- Playful and confident, not childish: compact rounded shapes, clear hierarchy, bright accents used deliberately.
- Matte surfaces with restrained blur on navigation and floating overlays. Avoid full-screen gradients, gold/obsidian palettes, and decorative effects that compete with student work.
- Geist is the preferred UI typeface with Inter/system fallbacks.
- Prefer one strong next action, informative empty states, and real student data over decorative productivity scores.

## Tokens

The source of truth is `src/styles/appDesignSystem.css`.

- `--sb-bg`, `--sb-surface`, `--sb-surface-solid`, `--sb-surface-muted`: app canvas and surface hierarchy.
- `--sb-border`, `--sb-text`, `--sb-text-muted`: structure and readable contrast.
- `--sb-accent`, `--sb-accent-hover`, `--sb-accent-soft`: primary actions and selected states.
- `--sb-violet`, `--sb-coral`, `--sb-mint`, `--sb-lime`, `--sb-sky`: secondary House-ready electric accents; these do not implement House Membership or award scores.
- `--sb-shadow`, `--sb-shadow-hover`, `--sb-radius-xl`, `--sb-radius-lg`, `--sb-radius-md`: elevation and shape.

Existing module variables such as `--color-gold` and `--study-accent` are compatibility aliases. New components should use `--sb-*` directly.

## Appearance

Light/dark preference is stored per authenticated user by the app shell and exposed through desktop sidebar and mobile bottom navigation. Use `data-theme="dark"` tokens; never infer the account from an unscoped shared preference. Maintain readable controls and focus indicators in both modes.

## Navigation and responsive behaviour

- Desktop/tablet: persistent glass sidebar with grouped navigation, active-route indicators and appearance switch.
- Small screens (760px and below): six main destinations plus the appearance switch in a fixed bottom bar; reserve safe-area space so page content and Buddy do not overlap it.
- Keep focus order logical, use visible focus rings and provide text labels for icon-only controls through accessible names.

## Buddy interaction contract

Buddy uses the authenticated `/api/ai` service. Quick actions are generated from `src/components/AICompanion/buddyActions.js` and the signed-in student's saved subject/board/grade plus current workspace.

Current first-release actions:
- Explain simply: one foundational concept, an everyday analogy, and a short check-for-understanding.
- Quiz me: exactly one active-recall question at a time; wait for the learner's answer and do not reveal the answer in the question turn.
- Make a mnemonic: a memorable but accurate memory hook, with the mapping explained and misconceptions flagged.

When no subject is available, Buddy asks for one instead of guessing. It must never claim to have read notes or files that were not supplied. Typed chat stays available for specific requests.

## Component rules for future batches

1. Use shared tokens; avoid new hard-coded palettes or local serif/font systems.
2. Prefer semantic HTML and labelled controls. Do not use colour as the only status indicator.
3. Keep movement short and optional; respect `prefers-reduced-motion`.
4. Make mobile controls touch-friendly and avoid floating overlays covering primary actions.
5. Use actual saved measurements and records. Do not invent streaks, scores, or AI certainty.
6. Keep House Membership, House selection and House Clash scoring out of this phase until product rules are explicitly designed.
