import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Flame,
  LayoutDashboard,
  Timer,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import MarketingFooter from '@/components/landing/MarketingFooter'
import SiteHeader from '@/components/landing/SiteHeader'

export const metadata: Metadata = {
  title: 'Features',
  description:
    'Four tools in one calm workspace: a focus timer that logs every block, habits with honest streaks, flashcards generated from your own notes, and an overview that shows the whole week.',
}

interface Feature {
  id: string
  badge: string
  live: boolean
  icon: LucideIcon
  iconWrap: string
  title: string
  tagline: string
  description: string
  bullets: string[]
  visual: ReactNode
}

const FEATURES: Feature[] = [
  {
    id: 'focus',
    badge: 'Live now',
    live: true,
    icon: Timer,
    iconWrap: 'border-brass-400/30 bg-brass-400/10 text-brass-500',
    title: 'Focus timer that counts',
    tagline: 'One timer. No feeds. No notifications.',
    description:
      'Start a 25-minute Pomodoro or a 50-minute deep-work block, with short and long breaks built in. Each finished block is written to your account, so your focus minutes are a record instead of a guess.',
    bullets: [
      'Pomodoro and deep-work blocks with breaks',
      'Log elapsed time without waiting for the full block',
      'Today’s total and the last seven days, always accurate',
    ],
    visual: (
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-32 w-32">
          <svg
            viewBox="0 0 100 100"
            className="h-full w-full -rotate-90"
            role="img"
            aria-label="A focus timer with 24 minutes 18 seconds remaining"
          >
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(26,23,18,0.08)" strokeWidth="6" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#B4593F"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 42}
              strokeDashoffset={2 * Math.PI * 42 * 0.28}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-xl font-semibold tabular-nums text-espresso">24:18</span>
            <span className="text-[9px] uppercase tracking-[0.14em] text-espresso-400">
              remaining
            </span>
          </div>
        </div>
        <p className="text-[12px] text-espresso-500">25 min · Pomodoro</p>
      </div>
    ),
  },
  {
    id: 'habits',
    badge: 'Live now',
    live: true,
    icon: Flame,
    iconWrap: 'border-[#B4593F]/25 bg-[#B4593F]/10 text-[#B4593F]',
    title: 'Habits with honest streaks',
    tagline: 'Small daily wins compound into identity change.',
    description:
      'Pick one tiny habit, check it off each day, and watch the streak build. Streaks are counted from the days you actually completed — no repairs, no invented history — so the number means something.',
    bullets: [
      'One tap to check off a habit for today',
      'Streaks counted from real completion dates',
      'Last seven days visible on every habit',
    ],
    visual: (
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-end gap-3">
          <span className="display text-[2.6rem] leading-none text-[#B4593F]">
            42<span className="ml-1 font-sans text-[0.9rem] font-medium">days</span>
          </span>
          <div className="flex items-end gap-1" aria-hidden>
            {[12, 20, 14, 22, 18, 20, 24].map((height, index) => (
              <span
                key={index}
                style={{ height }}
                className={`w-2.5 rounded-sm ${index === 6 ? 'bg-[#B4593F]/30' : 'bg-[#B4593F]'}`}
              />
            ))}
          </div>
        </div>
        <div className="flex max-w-[15rem] flex-wrap justify-center gap-1.5" aria-hidden>
          {Array.from({ length: 21 }).map((_, index) => (
            <span
              key={index}
              className={`h-2.5 w-2.5 rounded-sm ${
                index < 18 ? 'bg-[#B4593F]' : 'bg-[#B4593F]/20'
              }`}
            />
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'study',
    badge: 'Live now',
    live: true,
    icon: BookOpen,
    iconWrap: 'border-[#7A5A9B]/25 bg-[#7A5A9B]/10 text-[#7A5A9B]',
    title: 'Flashcards from your own notes',
    tagline: 'Master what matters. Stop passive re-reading.',
    description:
      'Paste a page of class notes and get six to twelve question-and-answer cards back, written from that material only. Flip to check yourself, then keep the deck on your account for the next revision session.',
    bullets: [
      'Six to twelve cards per deck, straight from your notes',
      'Tap to reveal the answer, one card at a time',
      'Every deck saved to your account and reopenable',
    ],
    visual: (
      <div className="rounded-2xl border border-[#7A5A9B]/30 bg-[#7A5A9B]/10 p-5 shadow-paper">
        <p className="text-[10px] uppercase tracking-[0.14em] text-espresso-400">
          Flashcard · Biochemistry
        </p>
        <p className="mt-3 text-[14px] font-medium leading-relaxed text-espresso">
          What enzyme catalyzes the phosphorylation of glucose in glycolysis?
        </p>
        <p className="mt-4 border-t border-espresso/10 pt-3 text-[12.5px] italic text-[#7A5A9B]">
          Hexokinase (Glucokinase in liver)
        </p>
      </div>
    ),
  },
  {
    id: 'overview',
    badge: 'Live now',
    live: true,
    icon: LayoutDashboard,
    iconWrap: 'border-[#3F5F9B]/25 bg-[#3F5F9B]/10 text-[#3F5F9B]',
    title: 'One overview of your week',
    tagline: 'Open the app and know where you stand.',
    description:
      'The dashboard shows the habits still unchecked today, the minutes you have actually focused this week, and the decks you built most recently. No separate planner to keep in sync.',
    bullets: [
      'Today’s habits and current streak at a glance',
      'Weekly focus minutes from logged sessions',
      'Your latest recall decks, one tap away',
    ],
    visual: (
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: 'Focus', value: '1h 15m' },
          { label: 'Streak', value: '12 days' },
          { label: 'Decks', value: '6' },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl border border-[#3F5F9B]/20 bg-[#3F5F9B]/5 px-3 py-3"
          >
            <p className="text-[9.5px] uppercase tracking-[0.12em] text-espresso-400">
              {metric.label}
            </p>
            <p className="mt-1.5 text-[15px] font-semibold tabular-nums text-[#3F5F9B]">
              {metric.value}
            </p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'community',
    badge: 'Coming soon',
    live: false,
    icon: Users,
    iconWrap: 'border-[#4C7A4C]/25 bg-[#4C7A4C]/10 text-[#4C7A4C]',
    title: 'Community — The Campus',
    tagline: 'Same energy as an elite workspace. No chat noise.',
    description:
      'Virtual rooms where you can sit alongside others who are building their future. See their timer running, feel the collective momentum. No pressure to talk — just the quiet company of driven peers.',
    bullets: [
      'Virtual focus zones (silent mode)',
      'Shared streaks & accountability',
      'Community tips & life hacks — coming next',
    ],
    visual: (
      <div className="flex flex-wrap justify-center gap-2">
        {['📚', '✏️', '🎯', '💡', '🔬', '📝', '🎓', '💻', '🧪'].map((emoji, index) => (
          <span
            key={emoji}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#4C7A4C]/25 bg-[#4C7A4C]/10 text-[0.95rem]"
            style={{ opacity: 0.65 + (index % 3) * 0.12 }}
            aria-hidden
          >
            {emoji}
          </span>
        ))}
      </div>
    ),
  },
]

export default function FeaturesPage() {
  return (
    <div className="paper-surface min-h-dvh">
      <SiteHeader />

      <main>
        <section className="mx-auto w-full max-w-4xl px-5 pb-12 pt-16 text-center sm:px-8 sm:pt-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brass-500">
            Features
          </p>
          <h1 className="display mt-4 text-[2.9rem] leading-[1.04] text-espresso sm:text-[4.3rem]">
            Everything you need
            <br />
            <em className="italic text-brass-500">in one calm space.</em>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-espresso-500 sm:text-[16px]">
            Four tools. One dashboard. No app-switching. StudyBud puts your habits, your focus
            blocks, your recall decks and your week in one place.
          </p>

          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-y-6 rounded-2xl border border-espresso/10 bg-paper-50 px-6 py-7 shadow-paper sm:grid-cols-4">
            {[
              { value: '4', label: 'Tools in one app' },
              { value: '6–12', label: 'Cards per deck' },
              { value: '7', label: 'Days of focus history' },
              { value: 'β', label: 'Free while in beta' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="display text-[2rem] leading-none text-brass-500">{stat.value}</p>
                <p className="mt-1.5 text-[10px] uppercase tracking-[0.14em] text-espresso-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon
            return (
              <section
                key={feature.id}
                id={feature.id}
                className="border-t border-espresso/10 py-14 sm:py-16"
              >
                <div className="grid items-center gap-10 lg:grid-cols-2">
                  <div className={index % 2 === 1 ? 'lg:order-2' : undefined}>
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-12 w-12 items-center justify-center rounded-xl border ${feature.iconWrap}`}
                      >
                        <Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden />
                      </span>
                      <span
                        className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                          feature.live
                            ? 'border-[#3F6B3F]/30 bg-[#3F6B3F]/10 text-[#3F6B3F]'
                            : 'border-brass-400/40 bg-brass-400/10 text-brass-600'
                        }`}
                      >
                        {feature.badge}
                      </span>
                    </div>

                    <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.14em] text-brass-500">
                      {feature.tagline}
                    </p>
                    <h2 className="display mt-3 text-[2rem] leading-tight text-espresso sm:text-[2.5rem]">
                      {feature.title}
                    </h2>
                    <p className="mt-4 text-[14.5px] leading-relaxed text-espresso-500 sm:text-[15px]">
                      {feature.description}
                    </p>

                    <ul className="mt-6 space-y-2.5">
                      {feature.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex items-start gap-2.5 text-[13.5px] text-espresso-700"
                        >
                          <CheckCircle2
                            className="mt-0.5 h-4 w-4 shrink-0 text-brass-500"
                            aria-hidden
                          />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div
                    className={`flex min-h-[15rem] items-center justify-center rounded-2xl border border-espresso/10 bg-paper-50 p-7 shadow-paper sm:p-9 ${
                      index % 2 === 1 ? 'lg:order-1' : ''
                    }`}
                  >
                    <div className="w-full max-w-sm">{feature.visual}</div>
                  </div>
                </div>
              </section>
            )
          })}
        </div>

        <section className="border-t border-espresso/10">
          <div className="mx-auto w-full max-w-3xl px-5 py-20 text-center sm:px-8 sm:py-24">
            <h2 className="display text-[2.5rem] leading-[1.05] text-espresso sm:text-[3.1rem]">
              Ready to <em className="italic text-brass-500">start?</em>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-espresso-500">
              Create an account in a couple of minutes. No credit card. Free while we&apos;re in
              beta.
            </p>
            <div className="mt-8">
              <Link href="/login?mode=signup" className="paper-btn">
                Create your free account
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}
