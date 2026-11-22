import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import PageHeader from '@/components/dashboard/PageHeader'
import HouseLeaderboard from '@/components/house/HouseLeaderboard'
import { SHOW_HOUSES } from '@/lib/features'
import { ensureProfile, requireUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  // While the league is switched off this URL only ever renders the 404 page,
  // so its tab title must not advertise the hidden feature either.
  title: SHOW_HOUSES ? 'House Clash' : 'Page not found',
}

export default async function HouseClashPage() {
  // The league is switched off for now, so this URL must not answer at all
  // rather than render an empty leaderboard for students who have no house.
  if (!SHOW_HOUSES) notFound()

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
