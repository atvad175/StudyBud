import type { Metadata } from 'next'

import PageHeader from '@/components/dashboard/PageHeader'
import HouseLeaderboard from '@/components/house/HouseLeaderboard'
import { ensureProfile, requireUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'House Clash',
}

export default async function HouseClashPage() {
  const { supabase, user } = await requireUser()
  const profile = await ensureProfile(supabase, user)

  const { data: houses, error } = await supabase
    .from('school_houses')
    .select('*')
    .order('total_points', { ascending: false })

  return (
    <div>
      <PageHeader
        eyebrow="Pillar 04 · Competition"
        title="House Clash"
        description="Points are earned, never bought: one point per habit check, one point per five focused minutes. The leaderboard updates live as your school works."
      />

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-xl border border-neon-rose/30 bg-neon-rose/10 px-4 py-3 text-sm text-rose-200"
        >
          Could not load the leaderboard: {error.message}
        </p>
      )}

      <HouseLeaderboard
        houses={houses ?? []}
        myHouse={profile.school_house}
        username={profile.username}
      />
    </div>
  )
}
