import type { Metadata } from 'next'
import { KeyRound, ShieldCheck, Trophy, UserRound } from 'lucide-react'

import PageHeader from '@/components/dashboard/PageHeader'
import PasswordForm from '@/components/profile/PasswordForm'
import HousePicker from '@/components/profile/HousePicker'
import { updateGradeSection } from '@/app/actions/profile'
import GlassCard from '@/components/ui/GlassCard'
import { SHOW_HOUSES } from '@/lib/features'
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

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ grade?: string }>
}) {
  const params = await searchParams
  const { supabase, user } = await requireUser()
  const profile = await ensureProfile(supabase, user)

  const houses = SHOW_HOUSES
    ? (
        await supabase
          .from('school_houses')
          .select('*')
          .order('house_name', { ascending: true })
      ).data
    : null

  return (
    <div>
      <PageHeader
        eyebrow="Account"
        title="Your profile"
        description="Your name, grade or section, and plan. Everything you record stays tied to this account."
      />

      {params.grade === 'saved' && (
        <p
          role="status"
          className="mb-4 rounded-xl border border-neon-emerald/30 bg-neon-emerald/10 px-4 py-3 text-sm text-emerald-200"
        >
          Grade / section saved.
        </p>
      )}
      {params.grade === 'invalid' && (
        <p
          role="alert"
          className="mb-4 rounded-xl border border-neon-rose/30 bg-neon-rose/10 px-4 py-3 text-sm text-rose-200"
        >
          Keep the grade or section under 60 characters.
        </p>
      )}
      {params.grade === 'failed' && (
        <p
          role="alert"
          className="mb-4 rounded-xl border border-neon-rose/30 bg-neon-rose/10 px-4 py-3 text-sm text-rose-200"
        >
          That change did not save. Try again in a moment.
        </p>
      )}

      <div className={`grid gap-4 ${SHOW_HOUSES ? 'lg:grid-cols-[1fr_1.25fr]' : ''}`}>
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
              <dt className="text-xs uppercase tracking-[0.12em] text-ink-500">Plan</dt>
              <dd className="truncate text-sm text-ink-300">
                {TIER_LABEL[profile.tier] ?? profile.tier}
              </dd>
            </div>
            {SHOW_HOUSES && (
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
            )}
          </dl>

          <form action={updateGradeSection} className="mt-5 border-t border-white/[0.07] pt-4">
            <label htmlFor="grade_section" className="field-label">
              Grade or section
            </label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                id="grade_section"
                name="grade_section"
                type="text"
                defaultValue={profile.grade_section ?? ''}
                maxLength={60}
                placeholder="Grade 11 · B"
                className="glass-input flex-1"
                autoComplete="off"
              />
              <button type="submit" className="btn-ghost">
                Save
              </button>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-ink-500">
              Use whatever your school calls it — grade, year, class or section. Leave it blank if
              you would rather not say.
            </p>
          </form>
        </GlassCard>

        <GlassCard glow="emerald">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-neon-emerald" aria-hidden />
            <h2 className="text-sm font-semibold text-white">Password</h2>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-ink-400">
            Change the password for this account. Your current one is required, so a shared device
            cannot lock you out.
          </p>
          <div className="mt-4">
            <PasswordForm />
          </div>
        </GlassCard>

        {SHOW_HOUSES && (
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
        )}
      </div>
    </div>
  )
}
