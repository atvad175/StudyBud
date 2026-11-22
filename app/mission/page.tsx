import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  Heart,
  Lightbulb,
  Rocket,
  Shield,
  Star,
  Trophy,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import MarketingFooter from '@/components/landing/MarketingFooter'
import SiteHeader from '@/components/landing/SiteHeader'

export const metadata: Metadata = {
  title: 'Our Mission',
  description:
    'StudyBud exists to make learning feel human again: one calm workspace for habits, focus and active recall, with an honest record of the work you actually did.',
}

interface Section {
  id: string
  eyebrow: string
  icon: LucideIcon
  iconWrap: string
  title: string
  body?: string[]
  highlight?: string
  highlightClass?: string
  cards?: { vs: string; us: string }[]
  bullets?: string[]
  roadmap?: { label: string; items: string[]; current?: boolean }[]
}

const SECTIONS: Section[] = [
  {
    id: 'problem',
    eyebrow: 'The Problem',
    icon: AlertTriangle,
    iconWrap: 'border-[#B4593F]/25 bg-[#B4593F]/10 text-[#B4593F]',
    title: 'People are distracted. We are handing them more noise.',
    body: [
      'The average person uses 6–10 different apps to manage their life. A to-do list here. A timer there. Notes on one platform, and maybe a meditation app for the anxiety in between.',
      'The result? Cognitive overload before the deep work even begins. App-switching eats focus. Disconnected tools never give you the full picture. And the moment life gets hard, the system collapses.',
      'Meanwhile, AI tools are making it worse — flooding us with shortcuts instead of building discipline. Copy-paste living creates the illusion of progress without the substance.',
    ],
    highlight: '73% of students report feeling overwhelmed by technology, not helped by it.',
    highlightClass: 'text-[#B4593F] border-[#B4593F]',
  },
  {
    id: 'solution',
    eyebrow: 'Our Solution',
    icon: Lightbulb,
    iconWrap: 'border-brass-400/35 bg-brass-400/10 text-brass-500',
    title: 'One calm, intelligent workspace to forge an extraordinary life.',
    body: [
      'StudyBud puts the pieces that actually move your work into one dashboard. Habits you can check off. Focus blocks that are timed and logged. Recall decks built from your own notes. A weekly view that tells you the truth about how the term is going.',
      'Nothing is awarded for showing up in a feed. Streaks come from days you completed. Focus minutes come from sessions you finished. Decks come from material you pasted in. If a number is on your dashboard, it happened.',
      'And because studying is not only a scheduling problem, the tools stay quiet: no notifications fighting for attention, no coins, no streak repairs to buy. Just the next useful action.',
    ],
    highlight: 'One calm app. One honest record.',
    highlightClass: 'text-brass-500 border-brass-400',
  },
  {
    id: 'better',
    eyebrow: "Why We're Different",
    icon: Trophy,
    iconWrap: 'border-[#3F5F9B]/25 bg-[#3F5F9B]/10 text-[#3F5F9B]',
    title: 'We compete on depth, not dopamine.',
    cards: [
      {
        vs: 'Notion / To-do lists',
        us: 'We combine habits, a working focus timer and active recall — not just task lists.',
      },
      {
        vs: 'Chatbots that write your essay',
        us: 'Our AI reads your own notes and turns them into questions you answer yourself.',
      },
      {
        vs: 'Separate timer and flashcard apps',
        us: 'Recall decks sit next to the focus timer that logged the session, in one account.',
      },
      {
        vs: 'Duolingo / gamification',
        us: 'Meaningful streaks tied to habit science, not artificial reward loops.',
      },
      {
        vs: 'Planners you stop opening',
        us: 'One screen shows today and the last seven days — no second system to maintain.',
      },
    ],
  },
  {
    id: 'why',
    eyebrow: 'Why Use StudyBud',
    icon: Heart,
    iconWrap: 'border-[#4C7A4C]/25 bg-[#4C7A4C]/10 text-[#4C7A4C]',
    title: 'Built for the ambitious. Privacy first. Free first.',
    body: [
      'StudyBud was born from the desire to break out of mediocrity, and the desperate search for a system that forged real discipline. We got tired of switching tools every week and making no progress.',
      'So we built what we wished existed: a life-design workspace that respects your intelligence, challenges your focus, and doesn’t sell your data.',
    ],
    bullets: [
      'Free during the entire beta — no credit card required',
      'Your notes, habits and decks belong to your account, not to us',
      'Honest numbers: streaks and focus minutes are never repaired or invented',
      'No gamification gimmicks — just genuine learning science',
      'Continuously improved based on real student feedback',
    ],
  },
  {
    id: 'vision',
    eyebrow: 'Our Future Vision',
    icon: Rocket,
    iconWrap: 'border-[#7A5A9B]/25 bg-[#7A5A9B]/10 text-[#7A5A9B]',
    title: 'The OS for lifelong learning.',
    body: [
      'StudyBud is just getting started. We’re building toward a world where every ambitious person has a personalized AI life coach that understands them as deeply as the best human mentor, keeping them on the path to their dream life.',
    ],
    roadmap: [
      {
        label: 'Now',
        current: true,
        items: [
          'Habits with honest streaks',
          'Focus timer with a logged weekly record',
          'Flashcards generated from your own notes',
          'Overview dashboard tied to one account',
        ],
      },
      {
        label: 'Next',
        items: [
          'Community study rooms',
          'Shared learning challenges',
          'Data export and account deletion',
        ],
      },
      {
        label: 'Future',
        items: [
          'Mobile app (iOS + Android)',
          'AI tutor specializations',
          'Teacher & institution dashboards',
          'Study group AI facilitation',
        ],
      },
    ],
  },
]

const CTA_ICONS: { icon: LucideIcon; label: string }[] = [
  { icon: Brain, label: 'Built for how you learn' },
  { icon: Users, label: 'Made with students' },
  { icon: Shield, label: 'Privacy first' },
]

function SectionBody({ section }: { section: Section }): ReactNode {
  return (
    <div className="space-y-6">
      {section.body && (
        <div className="space-y-4">
          {section.body.map((paragraph) => (
            <p key={paragraph} className="text-[14.5px] leading-relaxed text-espresso-500">
              {paragraph}
            </p>
          ))}
        </div>
      )}

      {section.highlight && (
        <blockquote
          className={`border-l-2 pl-5 text-[15px] font-medium italic leading-relaxed ${section.highlightClass}`}
        >
          “{section.highlight}”
        </blockquote>
      )}

      {section.cards && (
        <ul className="space-y-2.5">
          {section.cards.map((card) => (
            <li
              key={card.vs}
              className="grid items-center gap-3 rounded-xl border border-espresso/10 bg-paper px-4 py-3 sm:grid-cols-[1fr_auto_1fr]"
            >
              <span className="text-[12.5px] text-espresso-400 line-through">{card.vs}</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#3F5F9B]/30 bg-[#3F5F9B]/10">
                <Star className="h-3 w-3 fill-[#3F5F9B] text-[#3F5F9B]" aria-hidden />
              </span>
              <span className="text-[12.5px] leading-relaxed text-espresso-700">{card.us}</span>
            </li>
          ))}
        </ul>
      )}

      {section.bullets && (
        <ul className="space-y-2.5">
          {section.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2.5 text-[13.5px] text-espresso-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#4C7A4C]" aria-hidden />
              {bullet}
            </li>
          ))}
        </ul>
      )}

      {section.roadmap && (
        <div className="grid gap-3 sm:grid-cols-3">
          {section.roadmap.map((phase) => (
            <div
              key={phase.label}
              className={`rounded-xl border p-4 ${
                phase.current
                  ? 'border-brass-400/40 bg-brass-400/10'
                  : 'border-espresso/10 bg-paper'
              }`}
            >
              <p
                className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${
                  phase.current ? 'text-brass-600' : 'text-espresso-400'
                }`}
              >
                {phase.label}
              </p>
              <ul className="mt-3 space-y-1.5">
                {phase.items.map((item) => (
                  <li
                    key={item}
                    className={`flex items-start gap-2 text-[12px] leading-relaxed ${
                      phase.current ? 'text-espresso-700' : 'text-espresso-400'
                    }`}
                  >
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                        phase.current ? 'bg-brass-500' : 'bg-espresso/20'
                      }`}
                      aria-hidden
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function MissionPage() {
  return (
    <div className="paper-surface min-h-dvh">
      <SiteHeader />

      <main>
        <section className="mx-auto w-full max-w-4xl px-5 pb-12 pt-16 text-center sm:px-8 sm:pt-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brass-500">
            Our Mission
          </p>
          <h1 className="display mt-4 text-[2.9rem] leading-[1.04] text-espresso sm:text-[4.3rem]">
            Make learning feel
            <br />
            <em className="italic text-brass-500">human again.</em>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-espresso-500 sm:text-[16px]">
            Education is the greatest equalizer — but the tools have gotten in the way. We&apos;re
            here to fix that.
          </p>
        </section>

        <div className="mx-auto w-full max-w-4xl px-5 pb-6 sm:px-8">
          {SECTIONS.map((section) => {
            const Icon = section.icon
            return (
              <section key={section.id} id={section.id} className="pb-5">
                <div className="rounded-2xl border border-espresso/10 bg-paper-50 p-7 shadow-paper sm:p-9">
                  <div className="flex items-start gap-4">
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${section.iconWrap}`}
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden />
                    </span>
                    <div>
                      <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-brass-500">
                        {section.eyebrow}
                      </p>
                      <h2 className="display mt-1.5 text-[1.7rem] leading-tight text-espresso sm:text-[2.1rem]">
                        {section.title}
                      </h2>
                    </div>
                  </div>

                  <div className="mt-7">
                    <SectionBody section={section} />
                  </div>
                </div>
              </section>
            )
          })}
        </div>

        <section className="border-t border-espresso/10">
          <div className="mx-auto w-full max-w-3xl px-5 py-20 text-center sm:px-8 sm:py-24">
            <div className="flex justify-center gap-3">
              {CTA_ICONS.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  title={label}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-brass-400/30 bg-brass-400/10 text-brass-500"
                >
                  <Icon className="h-5 w-5" strokeWidth={1.6} aria-hidden />
                  <span className="sr-only">{label}</span>
                </span>
              ))}
            </div>

            <h2 className="display mt-7 text-[2.5rem] leading-[1.05] text-espresso sm:text-[3.1rem]">
              Be part of <em className="italic text-brass-500">the mission.</em>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-espresso-500">
              Every user who signs up shapes the product. Free during beta. Your feedback builds
              what comes next.
            </p>
            <div className="mt-8">
              <Link href="/login?mode=signup" className="paper-btn">
                Get started free
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter note="StudyBud — built with conviction, shipped with care." />
    </div>
  )
}
