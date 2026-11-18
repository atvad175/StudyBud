'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  Flame,
  Layers,
  Pause,
  Play,
  RotateCcw,
  Timer,
  Trophy,
} from 'lucide-react'

import { SHOW_HOUSES } from '@/lib/features'
import { cn } from '@/lib/utils'

/**
 * The live product window under the hero.
 *
 * This is a real UI, not a screenshot: the habit checkers toggle, the focus
 * ring counts down, and the flashcard flips. Nothing here writes to a database
 * — it is a demo surface that behaves like the app so visitors can feel it.
 */

interface DemoHabit {
  id: string
  title: string
  streak: number
  done: boolean
}

const SEED_HABITS: DemoHabit[] = [
  { id: 'chem', title: 'Chemistry — 20 minute revision', streak: 12, done: true },
  { id: 'math', title: 'Maths — past paper questions', streak: 6, done: true },
  { id: 'read', title: 'Read 10 pages before bed', streak: 3, done: false },
]

const NAV = [
  'Overview',
  'Habits',
  'Focus',
  'Study',
  ...(SHOW_HOUSES ? ['House Clash'] : []),
]

const METRICS = [
  { label: 'Focus', value: '1h 15m', tone: 'text-indigo-300', icon: Timer },
  { label: 'Streak', value: '12 days', tone: 'text-emerald-300', icon: Flame },
  SHOW_HOUSES
    ? { label: 'House', value: '4,820', tone: 'text-amber-300', icon: Trophy }
    : { label: 'Decks', value: '6', tone: 'text-indigo-300', icon: Layers },
]

const NEXT_UP = [
  { label: 'Habits', task: '2 of 3 checked off today', meta: 'Today' },
  { label: 'Focus', task: '1h 15m logged this week', meta: 'Tue' },
  { label: 'Recall', task: 'Cell biology · 18 cards', meta: 'Yesterday' },
]

function HabitCheckers() {
  const [habits, setHabits] = useState<DemoHabit[]>(SEED_HABITS)
  const done = habits.filter((habit) => habit.done).length

  function toggle(id: string) {
    setHabits((current) =>
      current.map((habit) =>
        habit.id === id ? { ...habit, done: !habit.done } : habit,
      ),
    )
  }

  return (
    <div className="min-w-0 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-medium text-white">Today&apos;s habits</h3>
        <span className="font-mono text-[11px] text-ink-500">
          {done}/{habits.length}
        </span>
      </div>

      <ul className="mt-3 space-y-1.5">
        {habits.map((habit) => (
          <li key={habit.id}>
            <button
              type="button"
              onClick={() => toggle(habit.id)}
              aria-pressed={habit.done}
              className="group flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-left transition-colors hover:bg-white/[0.04]"
            >
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-200',
                  habit.done
                    ? 'border-emerald-400/60 bg-[#10B981] text-[#04130D] shadow-[0_0_18px_-2px_rgba(16,185,129,0.65)]'
                    : 'border-white/20 text-transparent group-hover:border-emerald-400/50',
                )}
                aria-hidden
              >
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>

              <span
                className={cn(
                  'min-w-0 flex-1 truncate text-[12.5px] transition-colors',
                  habit.done ? 'text-ink-500 line-through decoration-white/20' : 'text-ink-200',
                )}
              >
                {habit.title}
              </span>

              <span className="flex shrink-0 items-center gap-1 text-[10.5px] text-ink-500">
                <Flame
                  className={cn('h-3 w-3', habit.streak >= 7 ? 'text-emerald-400' : 'text-ink-600')}
                  aria-hidden
                />
                {habit.streak}d
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

const TOTAL_SECONDS = 25 * 60
const RADIUS = 46
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function FocusRing() {
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    if (!isRunning) return
    const interval = window.setInterval(() => {
      setSecondsLeft((current) => (current <= 1 ? 0 : current - 1))
    }, 1000)
    return () => window.clearInterval(interval)
  }, [isRunning])

  useEffect(() => {
    if (secondsLeft === 0) setIsRunning(false)
  }, [secondsLeft])

  const elapsed = TOTAL_SECONDS - secondsLeft
  const progress = elapsed / TOTAL_SECONDS
  const clock = useMemo(() => {
    const minutes = Math.floor(secondsLeft / 60)
    const seconds = secondsLeft % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }, [secondsLeft])

  const finished = secondsLeft === 0

  return (
    <div className="min-w-0 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[13px] font-medium text-white">Focus block</h3>
        <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-ink-400">
          {finished ? 'Logged' : 'Running'}
        </span>
      </div>

      <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="relative flex h-[104px] w-[104px] shrink-0 items-center justify-center">
          <svg
            viewBox="0 0 120 120"
            className="h-full w-full -rotate-90"
            role="img"
            aria-label={`${Math.round(progress * 100)}% of the focus block elapsed`}
          >
            <circle
              cx="60"
              cy="60"
              r={RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="6"
            />
            <circle
              cx="60"
              cy="60"
              r={RADIUS}
              fill="none"
              stroke="#10B981"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
              className="transition-[stroke-dashoffset] duration-1000 ease-linear"
              style={{ filter: 'drop-shadow(0 0 6px rgba(16,185,129,0.45))' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-lg font-semibold tabular-nums tracking-tight text-white">
              {clock}
            </span>
            <span className="mt-0.5 text-[9px] uppercase tracking-[0.16em] text-ink-500">
              {finished ? 'done' : '25 min'}
            </span>
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-[11.5px] leading-relaxed text-ink-400">
            {finished
              ? 'Block complete. 25 minutes added to your week.'
              : 'One block, one subject. Breaks are built in.'}
          </p>
          <div className="mt-3 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                if (finished) {
                  setSecondsLeft(TOTAL_SECONDS)
                  setIsRunning(true)
                  return
                }
                setIsRunning((current) => !current)
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#0B0D11] transition-colors hover:bg-ink-200"
            >
              {isRunning ? (
                <Pause className="h-3 w-3" aria-hidden />
              ) : (
                <Play className="h-3 w-3" aria-hidden />
              )}
              {finished ? 'Again' : isRunning ? 'Pause' : 'Start'}
            </button>
            <button
              type="button"
              aria-label="Reset the focus block"
              onClick={() => {
                setSecondsLeft(TOTAL_SECONDS)
                setIsRunning(false)
              }}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-ink-400 transition-colors hover:border-white/20 hover:text-white"
            >
              <RotateCcw className="h-3 w-3" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function FlashcardFlip() {
  const [flipped, setFlipped] = useState(false)

  return (
    <div className="min-w-0 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-medium text-white">Recall card</h3>
        <span className="font-mono text-[10px] text-ink-500">3 / 18</span>
      </div>

      <div className="flip-scene mt-3 h-[124px] w-full">
        <div className="flip-inner" data-flipped={flipped}>
          <button
            type="button"
            onClick={() => setFlipped(true)}
            className="flip-face flex flex-col justify-between rounded-xl border border-white/[0.09] bg-gradient-to-br from-[#171B22] to-[#0D1015] p-3.5 text-left"
          >
            <span className="text-[9px] uppercase tracking-[0.16em] text-ink-500">
              Question · tap to flip
            </span>
            <span className="text-[12.5px] font-medium leading-relaxed text-ink-100">
              Why does a longer alkyl chain raise the boiling point of an alkane?
            </span>
            <span className="flex items-center gap-1 text-[10px] text-indigo-300">
              Show answer
              <ChevronRight className="h-3 w-3" aria-hidden />
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFlipped(false)}
            className="flip-face flip-face-back flex flex-col justify-between rounded-xl border border-emerald-400/25 bg-gradient-to-br from-emerald-500/[0.16] to-[#0B1512] p-3.5 text-left"
          >
            <span className="text-[9px] uppercase tracking-[0.16em] text-emerald-300/80">
              Answer
            </span>
            <span className="text-[12px] leading-relaxed text-emerald-100">
              More electrons means stronger London dispersion forces, so more energy is needed to
              separate the molecules.
            </span>
            <span className="text-[10px] text-emerald-300/80">Tap to flip back</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function HeroProductPreview() {
  return (
    <div id="product" className="relative mx-auto mt-12 w-full max-w-5xl sm:mt-16">
      <div
        aria-hidden
        className="absolute inset-x-8 -bottom-4 h-24 rounded-full bg-espresso/25 blur-2xl"
      />

      <div className="relative overflow-hidden rounded-2xl border border-black/50 bg-[#09090B] shadow-window ring-1 ring-white/[0.05]">
        {/* Window chrome */}
        <div className="flex items-center gap-3 border-b border-white/[0.06] bg-[#0B0D11] px-4 py-2.5">
          <div className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-[#3A3F4B]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#3A3F4B]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#3A3F4B]" />
          </div>
          <div className="mx-auto flex items-center gap-2 rounded-md border border-white/[0.06] bg-black/40 px-3 py-1 font-mono text-[10px] text-ink-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" aria-hidden />
            studybud.app/dashboard
          </div>
          <div className="w-10" aria-hidden />
        </div>

        <div className="flex">
          {/* Mini sidebar */}
          <aside className="hidden w-[168px] shrink-0 border-r border-white/[0.06] bg-[#0A0B0E] px-3 py-4 sm:block">
            <div className="flex items-center gap-2 px-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500/15 text-[11px] font-semibold text-indigo-300">
                S
              </span>
              <span className="text-[12px] font-semibold text-white">StudyBud</span>
            </div>

            <ul className="mt-4 space-y-0.5">
              {NAV.map((item, index) => (
                <li
                  key={item}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-2 py-1.5 text-[11.5px]',
                    index === 0 ? 'bg-white/[0.06] text-white' : 'text-ink-500',
                  )}
                >
                  <span
                    className={cn(
                      'h-1 w-1 rounded-full',
                      index === 0 ? 'bg-indigo-400' : 'bg-transparent',
                    )}
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>

            {SHOW_HOUSES && (
              <div className="mt-6 rounded-lg border border-white/[0.06] p-2.5">
                <p className="text-[10px] uppercase tracking-[0.12em] text-ink-500">House</p>
                <p className="mt-1 text-[11.5px] font-medium text-amber-300">Aurora House</p>
                <p className="mt-0.5 text-[10px] text-ink-500">2nd of 4 · 4,820 pts</p>
              </div>
            )}
          </aside>

          {/* Main pane */}
          <div className="min-w-0 flex-1 bg-[radial-gradient(52rem_26rem_at_15%_-12%,rgba(99,102,241,0.16),transparent_65%)] px-4 py-4 sm:px-5 sm:py-5">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-ink-500">Overview</p>
                <p className="mt-0.5 text-[15px] font-semibold text-white">Tonight&apos;s plan</p>
              </div>
              <p className="text-[10.5px] text-ink-500">Tuesday · 2 exams this week</p>
            </div>

            <div className="mt-3 grid min-w-0 grid-cols-3 gap-2">
              {METRICS.map((metric) => {
                const Icon = metric.icon
                return (
                  <div
                    key={metric.label}
                    className="min-w-0 rounded-lg border border-white/[0.07] bg-white/[0.02] px-2 py-2 sm:px-2.5"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-[8.5px] uppercase leading-tight tracking-[0.08em] text-ink-500 sm:text-[9px]">
                        {metric.label}
                      </p>
                      <Icon className={cn('h-3 w-3 shrink-0', metric.tone)} aria-hidden />
                    </div>
                    <p className={cn('mt-1 text-[15px] font-semibold tabular-nums', metric.tone)}>
                      {metric.value}
                    </p>
                  </div>
                )
              })}
            </div>

            <div className="mt-2 grid min-w-0 gap-2 lg:grid-cols-[1.1fr_1fr]">
              <HabitCheckers />
              <FocusRing />
            </div>

            <div className="mt-2 grid min-w-0 gap-2 lg:grid-cols-[1.1fr_1fr]">
              <FlashcardFlip />

              <div className="min-w-0 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                <h3 className="text-[13px] font-medium text-white">What&apos;s Next</h3>
                <ul className="mt-2.5 space-y-2">
                  {NEXT_UP.map((item) => (
                    <li key={item.label} className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-medium text-ink-100">
                          {item.label}
                        </p>
                        <p className="truncate text-[10.5px] text-ink-500">{item.task}</p>
                      </div>
                      <span className="shrink-0 text-[9.5px] text-ink-500">{item.meta}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2.5 flex items-center gap-1 border-t border-white/[0.06] pt-2 text-[10px] text-indigo-300">
                  Open your dashboard
                  <ArrowUpRight className="h-2.5 w-2.5" aria-hidden />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
