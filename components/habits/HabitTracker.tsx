'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Flame, Loader2, Plus } from 'lucide-react'

import { createHabit, toggleHabit } from '@/app/actions/studybud'
import GlassCard from '@/components/ui/GlassCard'
import { currentStreak, lastSevenDays, todayKey } from '@/lib/dates'
import { cn } from '@/lib/utils'
import type { HabitRow } from '@/types/database'

interface HabitTrackerProps {
  habits: HabitRow[]
}

export default function HabitTracker({ habits }: HabitTrackerProps) {
  const router = useRouter()
  const [items, setItems] = useState<HabitRow[]>(habits)
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [isCreating, startCreating] = useTransition()
  const [isToggling, startToggling] = useTransition()

  const today = useMemo(() => todayKey(), [])

  // Server data is the source of truth after every revalidation.
  useEffect(() => {
    setItems(habits)
  }, [habits])

  const completedToday = items.filter((habit) =>
    (habit.completed_dates ?? []).includes(today),
  ).length

  function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setFeedback(null)

    const trimmed = title.trim()
    if (!trimmed) {
      setError('Give the habit a name first.')
      return
    }

    startCreating(async () => {
      const result = await createHabit({ title: trimmed })

      if (!result.ok) {
        setError(result.error)
        return
      }

      setTitle('')
      setFeedback(`“${result.data.title}” added. Keep the first streak alive today.`)
      router.refresh()
    })
  }

  function handleToggle(habit: HabitRow) {
    setError(null)
    setFeedback(null)
    setPendingId(habit.id)

    const before = habit.completed_dates ?? []
    const wasCompleted = before.includes(today)
    const nextDates = wasCompleted
      ? before.filter((date) => date !== today)
      : [...before, today].sort()

    // Optimistic update — reconciled from the server response below.
    setItems((current) =>
      current.map((item) =>
        item.id === habit.id
          ? { ...item, completed_dates: nextDates, streak_count: currentStreak(nextDates, today) }
          : item,
      ),
    )

    startToggling(async () => {
      const result = await toggleHabit({ habitId: habit.id })

      if (!result.ok) {
        setItems((current) =>
          current.map((item) => (item.id === habit.id ? habit : item)),
        )
        setError(result.error)
        setPendingId(null)
        return
      }

      setItems((current) =>
        current.map((item) => (item.id === habit.id ? result.data.habit : item)),
      )

      if (result.data.completedToday) {
        setFeedback(
          result.data.housePoints !== null
            ? `Checked off. +1 house point — ${habit.title}.`
            : `Checked off. ${habit.title} is done for today.`,
        )
      }

      setPendingId(null)
      router.refresh()
    })
  }

  return (
    <div className="space-y-5">
      <GlassCard glow="emerald" specular>
        <form onSubmit={handleCreate} className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <label htmlFor="habit-title" className="field-label">
              New habit
            </label>
            <input
              id="habit-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. 20 minutes of chemistry revision"
              maxLength={120}
              className="glass-input"
              disabled={isCreating}
            />
          </div>
          <button type="submit" disabled={isCreating} className="btn-primary sm:mt-[1.4rem]">
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Plus className="h-4 w-4" aria-hidden />
            )}
            Add habit
          </button>
        </form>

        {error && (
          <p role="alert" className="mt-3 text-xs text-rose-300">
            {error}
          </p>
        )}
        {feedback && (
          <p role="status" className="mt-3 text-xs text-neon-emerald">
            {feedback}
          </p>
        )}
      </GlassCard>

      <div className="flex items-center justify-between px-1">
        <p className="text-xs uppercase tracking-[0.14em] text-ink-500">
          {items.length} habit{items.length === 1 ? '' : 's'}
        </p>
        <p className="text-xs text-ink-400">
          <span className="font-semibold text-neon-emerald">{completedToday}</span> done today
        </p>
      </div>

      {items.length === 0 ? (
        <GlassCard className="py-12 text-center">
          <Flame className="mx-auto h-8 w-8 text-ink-600" aria-hidden />
          <p className="mt-4 text-sm font-medium text-ink-200">No habits yet</p>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-ink-500">
            Pick something you can do in under ten minutes. Consistency beats intensity when
            you&apos;re building a system.
          </p>
        </GlassCard>
      ) : (
        <ul className="space-y-3">
          {items.map((habit) => {
            const dates = habit.completed_dates ?? []
            const doneToday = dates.includes(today)
            const streak = currentStreak(dates, today)
            const week = lastSevenDays(dates, today)
            const isBusy = isToggling && pendingId === habit.id

            return (
              <GlassCard
                as="li"
                key={habit.id}
                interactive
                glow={doneToday ? 'emerald' : 'none'}
                className="p-4 hover:!translate-y-0 sm:p-5"
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggle(habit)}
                    disabled={isBusy}
                    aria-pressed={doneToday}
                    aria-label={
                      doneToday
                        ? `Mark ${habit.title} as not done today`
                        : `Mark ${habit.title} as done today`
                    }
                    className={cn(
                      'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-200 active:scale-95',
                      doneToday
                        ? 'border-neon-emerald/70 bg-neon-emerald-deep text-ink-950 shadow-[0_0_22px_-2px_rgba(16,185,129,0.75)]'
                        : 'border-white/[0.16] bg-ink-900/60 text-transparent hover:border-neon-emerald/60 hover:text-neon-emerald/40',
                    )}
                  >
                    {isBusy ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-ink-300" aria-hidden />
                    ) : (
                      <Check className="h-4 w-4" aria-hidden />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p
                        className={cn(
                          'text-sm font-medium transition-colors',
                          doneToday ? 'text-ink-300 line-through decoration-ink-600' : 'text-ink-100',
                        )}
                      >
                        {habit.title}
                      </p>
                      {streak > 0 && (
                        <span className="pill border-neon-emerald/30 bg-neon-emerald/10 text-neon-emerald">
                          <Flame className="h-3 w-3" aria-hidden />
                          {streak}d
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-1.5">
                      {week.map((day) => (
                        <span
                          key={day.date}
                          title={`${day.date}${day.completed ? ' · completed' : ''}`}
                          className={cn(
                            'flex h-6 w-6 items-center justify-center rounded-md border text-[10px] font-medium uppercase',
                            day.completed
                              ? 'border-neon-emerald/40 bg-neon-emerald/20 text-neon-emerald'
                              : 'border-ink-600/50 bg-ink-900/40 text-ink-600',
                            day.isToday && 'ring-1 ring-inset ring-ink-400/40',
                          )}
                        >
                          {day.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <span className="hidden shrink-0 text-xs text-ink-500 sm:block">
                    {dates.length} total
                  </span>
                </div>
              </GlassCard>
            )
          })}
        </ul>
      )}
    </div>
  )
}
