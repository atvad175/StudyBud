import type { Metadata } from 'next'

import PageHeader from '@/components/dashboard/PageHeader'
import HabitTracker from '@/components/habits/HabitTracker'
import { requireUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Habits',
}

export default async function HabitsPage() {
  const { supabase } = await requireUser()

  const { data: habits, error } = await supabase
    .from('habits')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <PageHeader
        eyebrow="Pillar 01 · Consistency"
        title="Habit tracker"
        description="Check off the small things daily. Streaks are recalculated from your completion history, so they never lie — and each check is worth a house point."
      />

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-xl border border-neon-rose/30 bg-neon-rose/10 px-4 py-3 text-sm text-rose-200"
        >
          Could not load your habits: {error.message}
        </p>
      )}

      <HabitTracker habits={habits ?? []} />
    </div>
  )
}
