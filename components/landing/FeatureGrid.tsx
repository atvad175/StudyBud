import Link from 'next/link'
import { ArrowUpRight, CalendarClock, Layers, Timer, TrendingUp } from 'lucide-react'

import { SHOW_HOUSES } from '@/lib/features'

const PILLARS = [
  {
    number: '01',
    title: "What's Next",
    body: 'Open the app and your day is already on the screen: the habits still unchecked, the focus minutes you have logged this week, and the decks you built last.',
    icon: CalendarClock,
  },
  {
    number: '02',
    title: 'Focus blocks that count',
    body: 'Pomodoro and deep-work blocks with short and long breaks built in. Every finished block is logged against your account, so your week is a record instead of a guess.',
    icon: Timer,
  },
  {
    number: '03',
    title: 'Flashcards from your notes',
    body: 'Paste your class notes and get six to twelve question-and-answer cards back in seconds. Flip to check yourself, keep the deck, and come back to it whenever you revise.',
    icon: Layers,
  },
  {
    number: '04',
    title: 'Streaks you can trust',
    body: 'Every streak is counted from the days you actually checked off — no streak repair, no invented history. Miss a day and it resets, so the number means something.',
    icon: TrendingUp,
  },
]

export default function FeatureGrid() {
  return (
    <section id="pillars" className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
      <div className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brass-500">
          The four pillars
        </p>
        <h2 className="display mt-4 text-[2.4rem] leading-[1.05] text-espresso sm:text-[3.1rem]">
          Everything a study session needs,{' '}
          <em className="italic text-brass-500">nothing it doesn&apos;t.</em>
        </h2>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-espresso-500">
          No feed to scroll, no coins to buy, no streak repair to purchase. Four tools that each
          make the next one easier.
        </p>
      </div>

      <ul className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {PILLARS.map((pillar) => {
          const Icon = pillar.icon
          return (
            <li
              key={pillar.title}
              className="group relative flex flex-col rounded-2xl border border-espresso/[0.09] bg-paper-50 p-6 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset] transition-all duration-300 hover:-translate-y-1 hover:border-brass-400/40 hover:shadow-paper"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-espresso/10 bg-paper text-espresso-700">
                  <Icon className="h-4 w-4" strokeWidth={1.6} aria-hidden />
                </span>
                <span className="font-mono text-[11px] text-espresso-400">{pillar.number}</span>
              </div>

              <h3 className="display mt-6 text-[1.55rem] leading-tight text-espresso">
                {pillar.title}
              </h3>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-espresso-500">{pillar.body}</p>

              <span className="mt-5 flex items-center gap-1 text-[12px] font-medium text-brass-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                See it in the app
                <ArrowUpRight className="h-3 w-3" aria-hidden />
              </span>
            </li>
          )
        })}
      </ul>

      {SHOW_HOUSES && (
        <div
          id="house"
          className="mt-6 rounded-2xl border border-espresso/10 bg-espresso px-6 py-8 text-paper-100 sm:px-10 sm:py-10"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brass-300">
                House Clash
              </p>
              <h3 className="display mt-3 text-[1.9rem] leading-tight text-paper-50 sm:text-[2.3rem]">
                Your house earns every point you do.
              </h3>
              <p className="mt-3 text-[13.5px] leading-relaxed text-paper-300">
                One point per habit checked, one per five focused minutes. Points are credited on the
                server against your own profile — nobody can buy them or type them in.
              </p>
            </div>

            <div className="flex gap-6 text-paper-50">
              {[
                { house: 'Nova', points: '5,140', place: '1st' },
                { house: 'Aurora', points: '4,820', place: '2nd' },
              ].map((row) => (
                <div key={row.house} className="min-w-[6.5rem] rounded-xl border border-white/10 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-paper-300/70">
                    {row.place}
                  </p>
                  <p className="mt-1 text-[15px] font-medium text-paper-50">{row.house}</p>
                  <p className="font-mono text-[12px] text-brass-300">{row.points} pts</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <p className="mt-6 text-center text-[12px] text-espresso-400">
        {SHOW_HOUSES ? (
          <>
            Already in a house?{' '}
            <Link
              href="/login"
              className="font-medium text-espresso underline decoration-brass-400/60 underline-offset-4"
            >
              Sign in and pick up where you left off.
            </Link>
          </>
        ) : (
          <>
            Everything you paste stays in your account.{' '}
            <Link
              href="/login?mode=signup"
              className="font-medium text-espresso underline decoration-brass-400/60 underline-offset-4"
            >
              Start with one subject.
            </Link>
          </>
        )}
      </p>
    </section>
  )
}
