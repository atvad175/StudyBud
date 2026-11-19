import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Clock, Flame, Sparkles, Trophy } from 'lucide-react'

import AuthPanel from '@/components/auth/AuthPanel'
import SetupNotice from '@/components/auth/SetupNotice'
import { hasSupabaseEnv } from '@/lib/env'
import { SHOW_HOUSES } from '@/lib/features'
import { FALLBACK_HOUSES, fetchHouseNames } from '@/lib/houses'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Sign in',
}

export const dynamic = 'force-dynamic'

function safeRedirect(value: string | undefined): string {
  if (!value) return '/dashboard'
  // Only same-origin absolute paths; `//evil.com` is rejected by the leading check.
  if (!value.startsWith('/') || value.startsWith('//')) return '/dashboard'
  return value
}

/** Reasons the callback route can bounce someone back here. */
const AUTH_ERRORS: Record<string, string> = {
  unconfigured:
    'This deployment is not connected to Supabase yet, so sign-in is paused. The setup below takes one minute.',
  missing_code: 'That confirmation link was incomplete. Request a new email and try again.',
  callback_failed:
    'We could not finish that sign-in. Confirmation links expire quickly — sign in again to get a fresh one.',
}

const PROOF = [
  { icon: Flame, title: 'Streaks you can trust', body: 'Counted from the days you actually checked off.' },
  { icon: Clock, title: 'Focus blocks that count', body: 'Every finished block lands in your record.' },
  { icon: Sparkles, title: 'Flashcards from your notes', body: 'Paste notes, get cards that test you.' },
  ...(SHOW_HOUSES
    ? [{ icon: Trophy, title: 'Points your house can trust', body: 'Earned server-side, never typed in.' }]
    : []),
]

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; mode?: string; error?: string }>
}) {
  const params = await searchParams
  const configured = hasSupabaseEnv()
  const initialError = params.error
    ? (AUTH_ERRORS[params.error] ?? 'We could not finish that sign-in. Please try again.')
    : null

  let houses: string[] = [...FALLBACK_HOUSES]
  if (configured) {
    try {
      const supabase = await createClient()
      houses = await fetchHouseNames(supabase)
    } catch {
      // The house list is context on this screen; never block auth on it.
    }
  }

  return (
    <main className="paper-surface relative min-h-dvh">
      <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-5 py-8 sm:px-8 lg:py-10">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5" aria-label="StudyBud home">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-espresso text-[13px] font-semibold text-paper-50">
              S
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-espresso">StudyBud</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-espresso-500 transition-colors hover:text-espresso"
          >
            Back to the landing page
            <ArrowUpRight className="h-3 w-3" aria-hidden />
          </Link>
        </header>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.05fr_minmax(0,27rem)] lg:gap-16 lg:py-12">
          {/* Editorial half: cream, serif, proof. Hidden on small screens. */}
          <section className="hidden lg:block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brass-500">
              Welcome back
            </p>
            <h1 className="display mt-4 text-[3.1rem] leading-[1.03] text-espresso">
              Your work,
              <br />
              <em className="italic text-brass-500">on the record.</em>
            </h1>
            <p className="mt-5 max-w-md text-[14px] leading-relaxed text-espresso-500">
              {SHOW_HOUSES
                ? 'One account for your habits, focus minutes, recall decks and house points. Nothing you have done this term is lost.'
                : 'One account for your habits, focus minutes and recall decks. Nothing you have done this term is lost.'}
            </p>

            <ul className="mt-9 grid max-w-md gap-4 sm:grid-cols-2">
              {PROOF.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.title} className="flex gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-brass-400/25 bg-brass-200/35 text-brass-600">
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.7} aria-hidden />
                    </span>
                    <span>
                      <span className="block text-[12.5px] font-medium text-espresso">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-[11.5px] leading-relaxed text-espresso-400">
                        {item.body}
                      </span>
                    </span>
                  </li>
                )
              })}
            </ul>
          </section>

          {/* Auth half: same warm paper, so the page reads as one surface. */}
          <section className="w-full">
            <h1 className="display mb-5 text-[2.1rem] leading-tight text-espresso lg:hidden">
              {params.mode === 'signup' ? 'Build your study system' : 'Welcome back'}
            </h1>

            {configured ? (
              <AuthPanel
                houses={houses}
                redirectTo={safeRedirect(params.next)}
                initialMode={params.mode === 'signup' ? 'signup' : 'signin'}
                initialError={initialError}
              />
            ) : (
              <SetupNotice />
            )}

            <p className="mt-6 text-center text-[11.5px] leading-relaxed text-espresso-400">
              Free to start, no card. Prefer to look around first?{' '}
              <Link
                href="/"
                className="text-espresso-500 underline decoration-espresso/20 underline-offset-4 hover:text-espresso"
              >
                Open the landing page
              </Link>
            </p>
          </section>
        </div>

        <footer className="border-t border-espresso/10 pt-5 text-[11.5px] text-espresso-400">
          © {new Date().getFullYear()} StudyBud · Built for students who want their effort to count.
        </footer>
      </div>
    </main>
  )
}
