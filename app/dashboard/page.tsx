import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Brain, Flame, Timer, Trophy } from 'lucide-react'

import PageHeader from '@/components/dashboard/PageHeader'
import GlassCard from '@/components/ui/GlassCard'
import { SHOW_HOUSES } from '@/lib/features'
import {
  currentStreak,
  formatMinutes,
  lastSevenDays,
  startOfLocalDayIso,
  toDateKey,
  todayKey,
  weekdayLabel,
} from '@/lib/dates'
import { ensureProfile, requireUser } from '@/lib/session'
import type { SchoolHouseRow } from '@/types/database'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Overview',
}

interface FocusSlice {
  duration_minutes: number | null
  duration_seconds: number | null
  created_at: string
}

function sessionMinutes(row: FocusSlice): number {
  if (typeof row.duration_minutes === 'number') return row.duration_minutes
  return Math.round((row.duration_seconds ?? 0) / 60)
}

function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 5) return 'Still up'
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default async function DashboardOverviewPage() {
  const { supabase, user } = await requireUser()
  const profile = await ensureProfile(supabase, user)

  const weekStartIso = startOfLocalDayIso(6)
  const today = todayKey()

  const [habitsResult, focusResult, materialsResult, housesResult] = await Promise.all([
    supabase.from('habits').select('*').order('created_at', { ascending: false }),
    supabase
      .from('focus_sessions')
      .select('duration_minutes, duration_seconds, created_at')
      .gte('created_at', weekStartIso),
    supabase
      .from('study_materials')
      .select('id, title, ai_summary, created_at')
      .order('created_at', { ascending: false })
      .limit(3),
    // The house league is switched off for now: skip the query entirely so a
    // school without houses never pays for it (or fails on a missing table).
    SHOW_HOUSES
      ? supabase.from('school_houses').select('*').order('total_points', { ascending: false })
      : Promise.resolve({ data: [] as SchoolHouseRow[], error: null }),
  ])

  const habits = habitsResult.data ?? []
  const sessions = focusResult.data ?? []
  const materials = materialsResult.data ?? []
  const houses: SchoolHouseRow[] = housesResult.data ?? []

  const bestStreak = habits.reduce(
    (best, habit) => Math.max(best, currentStreak(habit.completed_dates ?? [], today)),
    0,
  )
  const completedToday = habits.filter((habit) => (habit.completed_dates ?? []).includes(today)).length

  const minutesByDay = new Map<string, number>()
  let weekMinutes = 0
  let todayMinutes = 0

  for (const session of sessions) {
    const minutes = sessionMinutes(session)
    const key = toDateKey(new Date(session.created_at))
    minutesByDay.set(key, (minutesByDay.get(key) ?? 0) + minutes)
    weekMinutes += minutes
    if (key === today) todayMinutes += minutes
  }

  const weekly = lastSevenDays([]).map((cell) => ({
    date: cell.date,
    label: cell.label,
    minutes: minutesByDay.get(cell.date) ?? 0,
  }))
  const weekPeak = Math.max(1, ...weekly.map((point) => point.minutes))

  const houseRank = profile.school_house
    ? houses.findIndex((house) => house.house_name === profile.school_house) + 1
    : 0
  const myHouse = houses.find((house) => house.house_name === profile.school_house) ?? null
  const topHousePoints = Math.max(1, ...houses.map((house) => house.total_points))

  const stats = [
    {
      label: 'Best streak',
      value: bestStreak === 0 ? '—' : `${bestStreak}`,
      unit: bestStreak === 1 ? 'day' : 'days',
      detail: `${completedToday} of ${habits.length} habits done today`,
      icon: Flame,
      tone: 'text-neon-emerald',
      accent: 'from-neon-emerald/20',
    },
    {
      label: 'Focus today',
      value: formatMinutes(todayMinutes),
      unit: '',
      detail: `${formatMinutes(weekMinutes)} in the last 7 days`,
      icon: Timer,
      tone: 'text-neon-indigo',
      accent: 'from-neon-indigo/20',
    },
    {
      label: 'Recall decks',
      value: String(materials.length),
      unit: materials.length === 1 ? 'deck' : 'decks',
      detail: materials.length > 0 ? `Latest: ${materials[0]?.title ?? '—'}` : 'No decks yet',
      icon: Brain,
      tone: 'text-neon-emerald',
      accent: 'from-neon-emerald/20',
    },
    ...(SHOW_HOUSES
      ? [
          {
            label: 'House standing',
            value: houseRank > 0 ? `#${houseRank}` : '—',
            unit: '',
            detail: myHouse
              ? `${myHouse.house_name} · ${myHouse.total_points} pts`
              : 'Join a house to compete',
            icon: Trophy,
            tone: 'text-neon-amber',
            accent: 'from-neon-amber/20',
          },
        ]
      : []),
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`${greeting()}, ${profile.username}`}
        title="Your study system at a glance"
        description="Every habit check and focus block lands in your record. Pick the pillar that needs you most today."
      />

      {SHOW_HOUSES && !profile.school_house && (
        <GlassCard specular glow="amber" className="border-neon-amber/25 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2 text-sm leading-relaxed text-ink-200">
              <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-neon-amber" aria-hidden />
              You have not joined a house yet, so the points you earn are not on the leaderboard.
            </p>
            <Link href="/dashboard/profile" className="btn-primary shrink-0">
              Choose your house
            </Link>
          </div>
        </GlassCard>
      )}

      <section
        className={`grid gap-3 sm:grid-cols-2 ${SHOW_HOUSES ? 'xl:grid-cols-4' : 'lg:grid-cols-3'}`}
        aria-label="Key statistics"
      >
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <GlassCard key={stat.label} specular className="group p-5">
              <div
                aria-hidden
                className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${stat.accent} to-transparent opacity-40 transition-opacity group-hover:opacity-70`}
              />
              <div className="relative flex items-center justify-between">
                <p className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-500">
                  {stat.label}
                </p>
                <Icon className={`h-4 w-4 ${stat.tone}`} aria-hidden />
              </div>
              <p className="relative mt-3 flex items-baseline gap-1.5">
                <span className="display text-[2rem] text-white">{stat.value}</span>
                {stat.unit && <span className="text-[11px] text-ink-500">{stat.unit}</span>}
              </p>
              <p className="relative mt-1 truncate text-[11.5px] text-ink-500">{stat.detail}</p>
            </GlassCard>
          )
        })}
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <GlassCard specular glow="indigo" className="animate-fade-up">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-white">Focus this week</h2>
              <p className="mt-1 text-xs text-ink-500">
                Completed sessions, starting {weekdayLabel(weekly[0]?.date ?? today)}
              </p>
            </div>
            <Link
              href="/dashboard/focus"
              className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-neon-indigo hover:underline"
            >
              Start a session
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>

          <div
            className="mt-6 flex h-40 items-end gap-2"
            role="img"
            aria-label="Focus minutes per day for the last seven days"
          >
            {weekly.map((point) => {
              const height = Math.round((point.minutes / weekPeak) * 100)
              const isToday = point.date === today
              return (
                <div key={point.date} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className={`w-full rounded-t-md border transition-all ${
                        isToday
                          ? 'border-neon-indigo/40 bg-gradient-to-t from-neon-indigo/25 to-neon-indigo/75'
                          : 'border-white/[0.07] bg-gradient-to-t from-white/[0.04] to-white/[0.14]'
                      }`}
                      style={{ height: `${Math.max(height, point.minutes > 0 ? 8 : 3)}%` }}
                      title={`${point.minutes} minutes`}
                    />
                  </div>
                  <span
                    className={`text-[10px] uppercase tracking-wide ${
                      isToday ? 'text-ink-200' : 'text-ink-500'
                    }`}
                  >
                    {point.label}
                  </span>
                </div>
              )
            })}
          </div>
        </GlassCard>

        <GlassCard specular glow="emerald" className="animate-fade-up">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Today&apos;s habits</h2>
            <Link
              href="/dashboard/habits"
              className="inline-flex items-center gap-1 text-xs font-medium text-neon-emerald hover:underline"
            >
              Open
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>

          {habits.length === 0 ? (
            <p className="mt-4 text-sm leading-relaxed text-ink-400">
              No habits yet. Start with one small daily commitment — it compounds.
            </p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {habits.slice(0, 5).map((habit) => {
                const done = (habit.completed_dates ?? []).includes(today)
                const streak = currentStreak(habit.completed_dates ?? [], today)

                return (
                  <li key={habit.id} className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] transition-shadow ${
                          done
                            ? 'border-neon-emerald/50 bg-neon-emerald/20 text-neon-emerald shadow-glow-emerald'
                            : 'border-white/[0.12] text-transparent'
                        }`}
                        aria-hidden
                      >
                        {done ? '✓' : ''}
                      </span>
                      <span
                        className={`truncate text-sm ${
                          done ? 'text-ink-500 line-through decoration-white/15' : 'text-ink-200'
                        }`}
                      >
                        {habit.title}
                      </span>
                    </div>
                    <span className="shrink-0 text-[11px] text-ink-500">
                      {streak > 0 ? `${streak}d` : 'New'}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </GlassCard>
      </div>

      <div className={`grid gap-4 ${SHOW_HOUSES ? 'lg:grid-cols-2' : ''}`}>
        <GlassCard specular>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Recent recall decks</h2>
            <Link
              href="/dashboard/study"
              className="inline-flex items-center gap-1 text-xs font-medium text-neon-emerald hover:underline"
            >
              Generate
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>

          {materials.length === 0 ? (
            <p className="mt-4 text-sm leading-relaxed text-ink-400">
              Paste your class notes and StudyBud will turn them into active-recall cards.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {materials.map((material) => (
                <li
                  key={material.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2.5"
                >
                  <span className="truncate text-sm text-ink-200">{material.title}</span>
                  <span className="shrink-0 text-[11px] text-ink-500">
                    {new Date(material.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>

        {SHOW_HOUSES && (
          <GlassCard specular glow="amber">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">House Clash</h2>
            <Link
              href="/dashboard/house-clash"
              className="inline-flex items-center gap-1 text-xs font-medium text-neon-amber hover:underline"
            >
              Leaderboard
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>

          {houses.length === 0 ? (
            <p className="mt-4 text-sm text-ink-400">The leaderboard opens once houses exist.</p>
          ) : (
            <ol className="mt-4 space-y-3">
              {houses.slice(0, 4).map((house, index) => {
                const isMine = house.house_name === profile.school_house
                return (
                  <li key={house.id}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-2.5">
                        <span
                          className={`w-4 shrink-0 font-mono text-[11px] ${
                            index === 0 ? 'text-neon-amber' : 'text-ink-500'
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span
                          className={`truncate text-sm ${
                            isMine ? 'font-semibold text-white' : 'text-ink-300'
                          }`}
                        >
                          {house.house_name}
                        </span>
                        {isMine && (
                          <span className="pill border-neon-amber/30 bg-neon-amber/10 px-1.5 py-0 text-[9px] text-neon-amber">
                            You
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 font-mono text-[11px] text-ink-400">
                        {house.total_points} pts
                      </span>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className={`h-full rounded-full ${
                          isMine ? 'bg-neon-amber' : 'bg-white/20'
                        }`}
                        style={{
                          width: `${Math.max(4, Math.round((house.total_points / topHousePoints) * 100))}%`,
                        }}
                      />
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
          </GlassCard>
        )}
      </div>
    </div>
  )
}
