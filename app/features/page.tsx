import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  Flame,
  Heart,
  Music2,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import MarketingFooter from '@/components/landing/MarketingFooter'
import SiteHeader from '@/components/landing/SiteHeader'

export const metadata: Metadata = {
  title: 'Features',
  description:
    'Five modules, one dashboard: Bud the AI coach, focus timer with beats, atomic habits and streaks, mind and mood tools, and skill mastery with flashcards.',
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
    id: 'ai',
    badge: 'Live now',
    live: true,
    icon: Brain,
    iconWrap: 'border-brass-400/30 bg-brass-400/10 text-brass-500',
    title: 'Bud — Your AI Life & Discipline Coach',
    tagline: 'Not Google. Not ChatGPT. Your personal mentor.',
    description:
      "Bud doesn't give you the answer. Bud asks you the right questions — so you actually grow. Ask for a habit breakdown, get a skill explained, or just vent when things get hard. Bud adapts to your mood: candid, ruthless, or warm.",
    bullets: [
      'Personalized to your skills & goals',
      'Three coaching modes: Candid, Ruthless, Warm',
      'Remembers your history & progress',
    ],
    visual: (
      <div className="space-y-3">
        <div className="flex items-end gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-brass-400/40 bg-brass-400/15 text-brass-500">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
          </span>
          <p className="max-w-[85%] rounded-2xl rounded-bl-sm border border-brass-400/25 bg-brass-400/10 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-espresso-700">
            Can you explain Newton&apos;s 3rd law in your own words — without looking it up?
          </p>
        </div>
        <div className="flex justify-end">
          <p className="max-w-[80%] rounded-2xl rounded-br-sm border border-espresso/10 bg-paper px-3.5 py-2.5 text-[12.5px] leading-relaxed text-espresso-700">
            For every action there&apos;s an equal and opposite reaction...
          </p>
        </div>
        <div className="flex gap-1.5 pl-2" aria-hidden>
          {[0, 1, 2].map((dot) => (
            <span key={dot} className="h-1.5 w-1.5 rounded-full bg-brass-400/70" />
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'focus',
    badge: 'Live now',
    live: true,
    icon: Zap,
    iconWrap: 'border-[#B4593F]/25 bg-[#B4593F]/10 text-[#B4593F]',
    title: 'Focus Timer + Sonic Landscapes',
    tagline: 'Deep work mode, beautifully designed.',
    description:
      'Start a Pomodoro or deep-work session with one tap. Pair it with your Beats playlist — lo-fi, classical, ambient, nature sounds, or jazz — all streaming from Spotify directly inside the app.',
    bullets: [
      '25/50/90 min Pomodoro or deep-work modes',
      '5 handpicked Spotify playlists',
      'Session history & streak tracking',
    ],
    visual: (
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-32 w-32">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" role="img" aria-label="A focus timer with 24 minutes 18 seconds remaining">
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
            <span className="text-[9px] uppercase tracking-[0.14em] text-espresso-400">remaining</span>
          </div>
        </div>
        <p className="flex items-center gap-2 text-[12px] text-espresso-500">
          <Music2 className="h-3.5 w-3.5 text-[#1DB954]" aria-hidden />
          Lo-fi Study Beats · playing
        </p>
      </div>
    ),
  },
  {
    id: 'habits',
    badge: 'Live now',
    live: true,
    icon: Flame,
    iconWrap: 'border-[#B4593F]/25 bg-[#B4593F]/10 text-[#B4593F]',
    title: 'Atomic Habits & Streak Engine',
    tagline: 'Small daily wins compound into identity change.',
    description:
      "Based on James Clear's Atomic Habits — pick one tiny habit, mark it done each day, and watch your streak build. The Fission feature breaks big goals into micro-habits you can actually start tomorrow.",
    bullets: [
      'Streak tracking with momentum visualization',
      'Fission: break goals into micro-habits',
      'AI coaching when you miss a day (no shame)',
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
                className={`w-2.5 rounded-sm ${
                  index === 6 ? 'bg-[#B4593F]/30' : 'bg-[#B4593F]'
                }`}
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
    id: 'mind',
    badge: 'Live now',
    live: true,
    icon: Heart,
    iconWrap: 'border-[#3F5F9B]/25 bg-[#3F5F9B]/10 text-[#3F5F9B]',
    title: 'Mind & Mood — The Mental Layer',
    tagline: "Studying is emotional. Let's treat it that way.",
    description:
      "Track your mood over time, offload anxious thoughts, do a guided breathing session, write reflections, and grow through positive psychology exercises. No therapy-speak — just a quiet corner when you need it.",
    bullets: [
      'Mood timeline with pattern insights',
      'Cognitive offload & brain dump tool',
      'Guided meditation + breathing sessions',
    ],
    visual: (
      <div>
        <svg viewBox="0 0 220 80" className="w-full overflow-visible" role="img" aria-label="A mood curve across six days">
          <defs>
            <linearGradient id="moodGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#B4593F" />
              <stop offset="50%" stopColor="#C2913F" />
              <stop offset="100%" stopColor="#3F5F9B" />
            </linearGradient>
          </defs>
          <path
            d="M0,60 Q20,50 40,45 T80,30 T120,40 T160,20 T220,25"
            fill="none"
            stroke="url(#moodGrad)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {[
            [0, 60],
            [40, 45],
            [80, 30],
            [120, 40],
            [160, 20],
            [220, 25],
          ].map(([cx, cy]) => (
            <circle key={`${cx}`} cx={cx} cy={cy} r="4.5" fill="url(#moodGrad)" />
          ))}
        </svg>
        <div className="mt-2 flex justify-between text-[10.5px] text-espresso-400">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'time',
    badge: 'Live now',
    live: true,
    icon: Clock,
    iconWrap: 'border-[#4C7A4C]/25 bg-[#4C7A4C]/10 text-[#4C7A4C]',
    title: 'Time & Energy Matching',
    tagline: 'Work with your biology, not against it.',
    description:
      'Not all hours are equal. StudyBud helps you discover your peak energy windows, then schedules hard cognitive work for those slots. Miss a deadline? The system adapts — no shame, just an adjusted plan.',
    bullets: [
      'Peak energy window discovery',
      'Smart task-to-energy matching',
      'Weekly review with reflection prompts',
    ],
    visual: (
      <div className="flex h-24 items-end gap-2">
        {[
          { height: 34, label: '6am', active: false },
          { height: 62, label: '9am', active: true },
          { height: 74, label: '11am', active: true },
          { height: 50, label: '2pm', active: false },
          { height: 38, label: '4pm', active: false },
          { height: 68, label: '8pm', active: true },
        ].map((bar) => (
          <div key={bar.label} className="flex flex-1 flex-col items-center gap-1.5">
            <span
              style={{ height: bar.height }}
              className={`w-full rounded-t-md rounded-b-sm ${
                bar.active
                  ? 'bg-gradient-to-b from-[#6E9E6E] to-[#3F6B3F]'
                  : 'bg-espresso/10'
              }`}
            />
            <span className="text-[10px] text-espresso-400">{bar.label}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'study',
    badge: 'Live now',
    live: true,
    icon: BookOpen,
    iconWrap: 'border-[#7A5A9B]/25 bg-[#7A5A9B]/10 text-[#7A5A9B]',
    title: 'Skill Mastery — Flashcards & Active Recall',
    tagline: 'Master what matters. Stop passive re-reading.',
    description:
      'Create flashcard decks, run AI-generated quizzes on any skill, break large goals into steps, and track macro progress. Real learning science, built in.',
    bullets: [
      'Spaced repetition flashcard engine',
      'AI quizzes on any topic in seconds',
      'Goal breakdown + progress tracking',
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
            Five modules. One dashboard. No app-switching. StudyBud integrates your habits, focus,
            time, mind, and skills into a single intelligent workspace.
          </p>

          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-y-6 rounded-2xl border border-espresso/10 bg-paper-50 px-6 py-7 shadow-paper sm:grid-cols-4">
            {[
              { value: '7', label: 'Core features' },
              { value: '5', label: 'Spotify playlists' },
              { value: '3', label: 'AI personas' },
              { value: '∞', label: 'Streaks possible' },
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
                        <li key={bullet} className="flex items-start gap-2.5 text-[13.5px] text-espresso-700">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brass-500" aria-hidden />
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
              Set up your profile in 2 minutes. No credit card. Free while we&apos;re in beta.
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
