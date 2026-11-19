import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Bell, Clock, Globe, MessagesSquare, Sparkles, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import MarketingFooter from '@/components/landing/MarketingFooter'
import SiteHeader from '@/components/landing/SiteHeader'

export const metadata: Metadata = {
  title: 'Community',
  description:
    'Community is our next big venture: study rooms, shared wins and peer support. Virtual study rooms are live today.',
}

interface Panel {
  icon: LucideIcon
  title: string
  body: string
  live: boolean
}

const PANELS: Panel[] = [
  {
    icon: Users,
    title: 'Virtual Study Rooms',
    body: 'Join a room, start a focus session, and feel the quiet energy of others working alongside you. No pressure to chat — just shared momentum.',
    live: true,
  },
  {
    icon: MessagesSquare,
    title: 'Study Tips & Method Sharing',
    body: 'A space to swap proven techniques, flashcard strategies, and weekly plan breakdowns — peer wisdom at scale.',
    live: false,
  },
  {
    icon: Globe,
    title: 'Discord Community',
    body: 'A dedicated Discord server for announcements, accountability check-ins, study sprints, and friendly help.',
    live: false,
  },
  {
    icon: Sparkles,
    title: 'AI Group Sessions',
    body: 'Study alongside others with Bud acting as a shared tutor — group inquiry-based sessions, collaborative mock exams.',
    live: false,
  },
  {
    icon: Clock,
    title: 'StudyBud Calendar & Day Planner',
    body: 'A comprehensive calendar and day planner to help you map out your long-term goals and daily actions in one beautiful interface.',
    live: false,
  },
]

export default function CommunityPage() {
  return (
    <div className="paper-surface min-h-dvh">
      <SiteHeader />

      <main>
        <section className="mx-auto w-full max-w-3xl px-5 pb-12 pt-16 text-center sm:px-8 sm:pt-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-brass-400/40 bg-brass-400/10 px-4 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-brass-600">
            <span className="h-1.5 w-1.5 rounded-full bg-brass-500" aria-hidden />
            Under construction
            <Clock className="h-3 w-3" aria-hidden />
          </span>

          <span
            aria-hidden
            className="mx-auto mt-7 flex h-16 w-16 items-center justify-center rounded-full border border-brass-400/35 bg-gradient-to-br from-brass-400/20 to-transparent text-brass-500"
          >
            <Globe className="h-7 w-7" strokeWidth={1.6} />
          </span>

          <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.22em] text-brass-500">
            Community
          </p>
          <h1 className="display mt-4 text-[2.9rem] leading-[1.04] text-espresso sm:text-[4.2rem]">
            Coming shortly
            <span className="text-brass-500">...</span>
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-espresso-500">
            Community is our next big venture. We&apos;re building spaces where students can study
            together, share wins, and support each other. Watch this space.
          </p>

          <div
            role="status"
            className="mx-auto mt-8 flex max-w-xl items-start gap-3 rounded-2xl border border-espresso/10 bg-paper-50 px-5 py-4 text-left shadow-paper"
          >
            <Bell className="mt-0.5 h-4 w-4 shrink-0 text-brass-500" aria-hidden />
            <p className="text-[13px] leading-relaxed text-espresso-500">
              Launch notifications aren&apos;t open yet. We won&apos;t collect your email until we
              can actually send updates.
            </p>
          </div>

          <div className="mt-8">
            <Link href="/login?mode=signup" className="paper-btn">
              Get started with StudyBud
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>

        <section className="border-t border-espresso/10">
          <div className="mx-auto grid w-full max-w-5xl gap-4 px-5 py-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
            {PANELS.map((panel) => {
              const Icon = panel.icon
              return (
                <article
                  key={panel.title}
                  className={`relative overflow-hidden rounded-2xl border border-espresso/10 p-7 ${
                    panel.live ? 'bg-paper-50 shadow-paper' : 'bg-paper-100/60'
                  }`}
                >
                  {!panel.live && (
                    <span className="absolute right-5 top-5 rounded-full border border-brass-400/40 bg-paper px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-[0.12em] text-brass-600">
                      Coming soon
                    </span>
                  )}

                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
                      panel.live
                        ? 'border-brass-400/35 bg-brass-400/10 text-brass-500'
                        : 'border-espresso/10 bg-paper text-espresso-400'
                    }`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.6} aria-hidden />
                  </span>

                  <h2
                    className={`display mt-5 text-[1.4rem] leading-tight ${
                      panel.live ? 'text-espresso' : 'text-espresso-500'
                    }`}
                  >
                    {panel.title}
                  </h2>
                  <p
                    className={`mt-2.5 text-[13px] leading-relaxed ${
                      panel.live ? 'text-espresso-500' : 'text-espresso-400'
                    }`}
                  >
                    {panel.body}
                  </p>

                  {panel.live && (
                    <Link
                      href="/dashboard/focus"
                      className="mt-5 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-brass-600 transition-colors hover:text-espresso"
                    >
                      Try in app
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  )}
                </article>
              )
            })}
          </div>
        </section>
      </main>

      <MarketingFooter note="Thank you for being early — your feedback shapes every feature we build next." />
    </div>
  )
}
