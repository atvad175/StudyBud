import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import ClosingCta from '@/components/landing/ClosingCta'
import FeatureGrid from '@/components/landing/FeatureGrid'
import HeroProductPreview from '@/components/landing/HeroProductPreview'
import SiteHeader from '@/components/landing/SiteHeader'

export const metadata: Metadata = {
  title: 'StudyBud — Build discipline. Excel in your studies.',
  description:
    'StudyBud turns your notes into recall cards and keeps your habits, focus blocks and streaks on the record — in one quiet workspace.',
}

const METRICS = [
  { value: '25 min', label: 'Focus blocks' },
  { value: '6–12', label: 'Recall cards per paste' },
  { value: '50 min', label: 'Deep work blocks' },
  { value: '0', label: 'Feeds to scroll' },
]

export default function LandingPage() {
  return (
    <div className="paper-surface min-h-dvh">
      <SiteHeader />

      <main>
        <section className="relative mx-auto w-full max-w-6xl px-5 pb-16 pt-14 text-center sm:px-8 sm:pt-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(38rem_20rem_at_50%_0%,rgba(194,145,63,0.12),transparent_70%)]"
          />

          <p className="inline-flex items-center gap-2 rounded-full border border-espresso/12 bg-paper-50/80 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-espresso-500">
            <span className="h-1.5 w-1.5 rounded-full bg-brass-400" aria-hidden />
            Built for students, not for admin dashboards
          </p>

          <h1 className="display mx-auto mt-7 max-w-4xl text-[2.9rem] leading-[1.02] text-espresso sm:text-[4.2rem] lg:text-[4.9rem]">
            Build discipline.
            <br />
            Excel in your studies.
            <br />
            <em className="italic text-brass-500">Design your dream life.</em>
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-[15px] leading-relaxed text-espresso-500 sm:text-[16px]">
            Streaks, focus sessions and recall cards in one workspace — the habit you owe today,
            the timer for it, and the deck you built from your notes. No feeds. No noise.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/login?mode=signup" className="paper-btn">
              Start studying free
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <a href="#product" className="paper-btn-ghost">
              See it working
            </a>
          </div>

          <p className="mt-4 text-[12px] text-espresso-400">
            Free to start · No card · Your notes stay yours
          </p>

          <HeroProductPreview />
        </section>

        <section aria-label="StudyBud by the numbers" className="border-y border-espresso/10">
          <dl className="mx-auto grid w-full max-w-6xl grid-cols-2 divide-espresso/10 px-5 sm:grid-cols-4 sm:divide-x sm:px-8">
            {METRICS.map((metric) => (
              <div key={metric.label} className="px-2 py-7 text-center">
                <dd className="display text-[1.9rem] text-espresso sm:text-[2.2rem]">
                  {metric.value}
                </dd>
                <dt className="mt-1 text-[10.5px] uppercase tracking-[0.16em] text-espresso-400">
                  {metric.label}
                </dt>
              </div>
            ))}
          </dl>
        </section>

        <FeatureGrid />
        <ClosingCta />
      </main>

      <footer className="border-t border-espresso/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-3 px-5 py-7 text-[12px] text-espresso-400 sm:flex-row sm:items-center sm:px-8">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-espresso text-[9px] font-semibold text-paper-50">
              S
            </span>
            <span>© {new Date().getFullYear()} StudyBud</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/login" className="transition-colors hover:text-espresso">
              Sign in
            </Link>
            <Link href="/login?mode=signup" className="transition-colors hover:text-espresso">
              Start free
            </Link>
            <span className="hidden sm:inline">Built for students who are done guessing.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
