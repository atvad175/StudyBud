import type { Metadata } from 'next'

import PageHeader from '@/components/dashboard/PageHeader'
import FocusTimer from '@/components/focus/FocusTimer'
import { lastSevenDays, startOfLocalDayIso, toDateKey, todayKey } from '@/lib/dates'
import { requireUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Focus',
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

export default async function FocusPage() {
  const { supabase } = await requireUser()

  const { data: sessions, error } = await supabase
    .from('focus_sessions')
    .select('duration_minutes, duration_seconds, created_at')
    .gte('created_at', startOfLocalDayIso(6))
    .order('created_at', { ascending: false })

  const today = todayKey()
  const minutesByDay = new Map<string, number>()
  let todayMinutes = 0
  let todaySessions = 0

  for (const session of sessions ?? []) {
    const minutes = sessionMinutes(session)
    const key = toDateKey(new Date(session.created_at))
    minutesByDay.set(key, (minutesByDay.get(key) ?? 0) + minutes)

    if (key === today) {
      todayMinutes += minutes
      todaySessions += 1
    }
  }

  const weekly = lastSevenDays([]).map((cell) => ({
    date: cell.date,
    label: cell.label,
    minutes: minutesByDay.get(cell.date) ?? 0,
  }))

  return (
    <div>
      <PageHeader
        eyebrow="Pillar 02 · Deep work"
        title="Focus timer"
        description="One timer, no feeds, no notifications. Completed blocks are logged to your record and earn house points at a rate of one point per five focused minutes."
      />

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-xl border border-neon-rose/30 bg-neon-rose/10 px-4 py-3 text-sm text-rose-200"
        >
          Could not load your focus history: {error.message}
        </p>
      )}

      <FocusTimer
        todayMinutes={todayMinutes}
        todaySessions={todaySessions}
        weekly={weekly}
        targetMinutes={120}
      />
    </div>
  )
}
