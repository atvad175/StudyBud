import type { Metadata } from 'next'
import { ShieldCheck, Trophy, UserRound } from 'lucide-react'

import PageHeader from '@/components/dashboard/PageHeader'
import HousePicker from '@/components/profile/HousePicker'
import GlassCard from '@/components/ui/GlassCard'
import { ensureProfile, requireUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Profile',
}

const TIER_LABEL: Record<string, string> = {
  free: 'Free tier',
  scholar: 'Scholar',
  elite: 'Elite',
}

export default async function ProfilePage() {
  const { supabase, user } = await requireUser()
  const profile = await ensureProfile(supabase, user)

  const { data: houses } = await supabase
    .from('school_houses')
    .select('*')
    .order('house_name', { ascending: true })

  return (
    <div>
      <PageHeader
        eyebrow="Account"
        title="Your profile"
        description="Your name, section and house. Points you earn from habits and focus sessions are credited to the house below."
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.25fr]">
        <GlassCard glow="indigo">
          <div className="flex items-center gap-2">
            <UserRound className="h-4 w-4 text-neon-indigo" aria-hidden />
            <h2 className="text-sm font-semibold text-white">Identity</h2>
          </div>

          <dl className="mt-5 space-y-3.5">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-xs uppercase tracking-[0.12em] text-ink-500">Display name</dt>
              <dd className="truncate text-sm text-ink-100">{profile.username}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-xs uppercase tracking-[0.12em] text-ink-500">Email</dt>
              <dd className="truncate text-sm text-ink-300">{user.email ?? '—'}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-xs uppercase tracking-[0.12em] text-ink-500">Grade / section</dt>
              <dd className="truncate text-sm text-ink-300">{profile.grade_section ?? '—'}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-xs uppercase tracking-[0.12em] text-ink-500">Plan</dt>
              <dd className="truncate text-sm text-ink-300">
                {TIER_LABEL[profile.tier] ?? profile.tier}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-xs uppercase tracking-[0.12em] text-ink-500">House</dt>
              <dd className="flex items-center gap-1.5 truncate text-sm font-medium text-ink-100">
                {profile.school_house ? (
                  <>
                    <Trophy className="h-3.5 w-3.5 text-neon-amber" aria-hidden />
                    {profile.school_house}
                  </>
                ) : (
                  <span className="text-ink-500">Not assigned</span>
                )}
              </dd>
            </div>
          </dl>
        </GlassCard>

        <GlassCard glow={profile.school_house ? 'amber' : 'indigo'}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-neon-amber" aria-hidden />
              <h2 className="text-sm font-semibold text-white">
                {profile.school_house ? 'House membership' : 'Join a house'}
              </h2>
            </div>
            {profile.school_house && (
              <span className="pill border-neon-amber/30 bg-neon-amber/10 text-neon-amber">
                Locked
              </span>
            )}
          </div>

          <p className="mt-2 text-xs leading-relaxed text-ink-400">
            {profile.school_house
              ? 'Every habit check and focus block now adds points to your house on the live leaderboard.'
              : 'Without a house your habit and focus points are still saved, but they cannot count on the leaderboard. Choose carefully — houses lock once joined.'}
          </p>

          <div className="mt-5">
            {houses && houses.length > 0 ? (
              <HousePicker houses={houses} currentHouse={profile.school_house} />
            ) : (
              <p className="text-sm text-ink-400">
                No houses exist yet. Ask your school administrator to seed them, then reload this
                page.
              </p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
