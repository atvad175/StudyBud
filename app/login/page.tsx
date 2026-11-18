import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Clock, Flame, Sparkles, Trophy } from 'lucide-react'

import AuthPanel from '@/components/auth/AuthPanel'
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
  searchParams: Promise<{ next?: string; mode?: string }>
}) {
  const params = await searchParams

  let houses: string[] = [...FALLBACK_HOUSES]
  try {
    const supabase = await createClient()
    houses = await fetchHouseNames(supabase)
  } catch {
    // The house list is context on this screen; never block auth on it.
  }

  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.02fr_1fr]">
      {/* Editorial half: paper, type, proof. Hidden on small screens. */}
      <section className="paper-surface relative hidden flex-col justify-between border-r border-espresso/10 p-12 lg:flex">
        <Link href="/" className="flex items-center gap-2.5" aria-label="StudyBud home">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-espresso text-[13px] font-semibold text-paper-50">
            S
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-espresso">StudyBud</span>
        </Link>

        <div className="max-w-md">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brass-500">
            Welcome back
          </p>
          <h1 className="display mt-4 text-[2.9rem] leading-[1.04] text-espresso">
            Your work,
            <br />
            <em className="italic text-brass-500">on the record.</em>
          </h1>
          <p className="mt-5 text-[14px] leading-relaxed text-espresso-500">
            {SHOW_HOUSES
              ? 'One account for your habits, focus minutes, recall decks and house points. Nothing you have done this term is lost.'
              : 'One account for your habits, focus minutes and recall decks. Nothing you have done this term is lost.'}
          </p>

          <ul className="mt-8 space-y-3.5">
            {PROOF.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.title} className="flex gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-espresso/10 bg-paper-50 text-espresso-700">
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.7} aria-hidden />
                  </span>
                  <span>
                    <span className="block text-[13px] font-medium text-espresso">{item.title}</span>
                    <span className="block text-[12px] text-espresso-400">{item.body}</span>
                  </span>
                </li>
              )
            })}
          </ul>
        </div>

        <p className="text-[11.5px] text-espresso-400">
          © {new Date().getFullYear()} StudyBud · Free to start, no card.
        </p>
      </section>

      {/* Auth half: the dark app. */}
      <section className="relative flex items-center justify-center overflow-hidden px-5 py-12 sm:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(40rem_26rem_at_50%_-10%,rgba(99,102,241,0.14),transparent_70%)]"
        />
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-xs text-ink-500 transition-colors hover:text-ink-200 lg:hidden"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.06] text-[10px] font-semibold text-ink-200">
              S
            </span>
            StudyBud
          </Link>

          <AuthPanel
            houses={houses}
            redirectTo={safeRedirect(params.next)}
            initialMode={params.mode === 'signup' ? 'signup' : 'signin'}
          />

          <p className="mt-8 flex items-center justify-center gap-1.5 text-[11.5px] text-ink-600">
            <ArrowUpRight className="h-3 w-3" aria-hidden />
            Not ready?{' '}
            <Link href="/" className="text-ink-400 underline decoration-white/20 underline-offset-4 hover:text-ink-100">
              Look around the landing page
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}
