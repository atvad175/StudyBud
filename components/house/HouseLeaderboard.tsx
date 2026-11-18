'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Crown, Radio, ShieldQuestion, Trophy, UserPlus } from 'lucide-react'

import GlassCard from '@/components/ui/GlassCard'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { SchoolHouseRow } from '@/types/database'

interface HouseLeaderboardProps {
  houses: SchoolHouseRow[]
  myHouse: string | null
  username: string
}

function sortHouses(houses: SchoolHouseRow[]): SchoolHouseRow[] {
  return [...houses].sort((a, b) => b.total_points - a.total_points)
}

export default function HouseLeaderboard({ houses, myHouse, username }: HouseLeaderboardProps) {
  const [liveHouses, setLiveHouses] = useState<SchoolHouseRow[]>(() => sortHouses(houses))
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    setLiveHouses(sortHouses(houses))
  }, [houses])

  useEffect(() => {
    let supabase: ReturnType<typeof createClient>
    try {
      supabase = createClient()
    } catch {
      // Missing env is already surfaced by the page; the static board still works.
      return
    }

    const channel = supabase
      .channel('studybud-house-clash')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'school_houses' },
        (payload) => {
          const next = payload.new as Partial<SchoolHouseRow> | null
          if (!next || typeof next.id !== 'string' || typeof next.total_points !== 'number') {
            return
          }
          const updated = next as SchoolHouseRow

          setLiveHouses((current) => {
            const exists = current.some((house) => house.id === updated.id)
            const merged = exists
              ? current.map((house) => (house.id === updated.id ? { ...house, ...updated } : house))
              : [...current, updated]
            return sortHouses(merged)
          })
        },
      )
      .subscribe((status) => {
        setIsLive(status === 'SUBSCRIBED')
      })

    // Safety net: realtime can be disabled per project, so refresh periodically.
    const refresh = async () => {
      const { data } = await supabase
        .from('school_houses')
        .select('*')
        .order('total_points', { ascending: false })
      if (data) setLiveHouses(sortHouses(data))
    }
    const interval = window.setInterval(() => {
      void refresh()
    }, 20000)

    return () => {
      window.clearInterval(interval)
      void supabase.removeChannel(channel)
    }
  }, [])

  const topPoints = Math.max(1, ...liveHouses.map((house) => house.total_points))
  const totalPoints = liveHouses.reduce((sum, house) => sum + house.total_points, 0)
  const myRank = useMemo(() => {
    if (!myHouse) return 0
    return liveHouses.findIndex((house) => house.house_name === myHouse) + 1
  }, [liveHouses, myHouse])

  if (liveHouses.length === 0) {
    return (
      <GlassCard className="py-14 text-center">
        <Trophy className="mx-auto h-8 w-8 text-ink-600" aria-hidden />
        <p className="mt-4 text-sm font-medium text-ink-200">No houses on the board yet</p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-ink-500">
          An administrator needs to add school houses before the clash can begin. Ask them to seed
          the houses, then refresh this page.
        </p>
      </GlassCard>
    )
  }

  return (
    <div className="space-y-4">
      {!myHouse && (
        <GlassCard glow="amber" className="border-neon-amber/25 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2 text-sm leading-relaxed text-ink-200">
              <UserPlus className="mt-0.5 h-4 w-4 shrink-0 text-neon-amber" aria-hidden />
              You are spectating: without a house, habit and focus points never reach the
              leaderboard.
            </p>
            <Link href="/dashboard/profile" className="btn-primary shrink-0">
              Choose your house
            </Link>
          </div>
        </GlassCard>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <GlassCard className="p-4" specular>
          <p className="text-xs uppercase tracking-[0.12em] text-ink-500">Your house</p>
          <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
            {myHouse ?? 'Unassigned'}
            {myRank === 1 && <Crown className="h-4 w-4 text-neon-amber" aria-hidden />}
          </p>
          <p className="mt-1 text-xs text-ink-500">
            {myHouse
              ? `Rank #${myRank} · ${liveHouses.find((h) => h.house_name === myHouse)?.total_points ?? 0} pts`
              : 'Join a house from your profile to compete.'}
          </p>
        </GlassCard>

        <GlassCard className="p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-ink-500">School total</p>
          <p className="mt-2 text-lg font-semibold text-white">{totalPoints.toLocaleString()} pts</p>
          <p className="mt-1 text-xs text-ink-500">Across {liveHouses.length} houses</p>
        </GlassCard>

        <GlassCard className="p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-ink-500">Feed</p>
          <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
            <Radio
              className={cn('h-4 w-4', isLive ? 'text-neon-emerald' : 'text-ink-500')}
              aria-hidden
            />
            {isLive ? 'Live' : 'Syncing'}
          </p>
          <p className="mt-1 text-xs text-ink-500">
            {isLive ? 'Updates as points land' : 'Polls every 20 seconds'}
          </p>
        </GlassCard>
      </div>

      <GlassCard glow="amber" specular>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Leaderboard</h2>
          <span className="text-[11px] text-ink-500">{username} · house points count for everyone</span>
        </div>

        <ol className="space-y-3">
          {liveHouses.map((house, index) => {
            const isMine = house.house_name === myHouse
            const width = Math.max(4, Math.round((house.total_points / topPoints) * 100))

            return (
              <li
                key={house.id}
                className={cn(
                  'rounded-xl border px-3 py-3 transition-colors',
                  isMine
                    ? 'border-neon-amber/40 bg-neon-amber/[0.07]'
                    : 'border-white/[0.07] bg-canvas/30',
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border font-mono text-xs',
                        index === 0
                          ? 'border-neon-amber/40 bg-neon-amber/10 text-neon-amber'
                          : 'border-white/[0.09] text-ink-500',
                      )}
                    >
                      {index + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 truncate text-sm font-medium text-white">
                        {house.house_name}
                        {isMine && (
                          <span className="pill border-neon-amber/30 bg-neon-amber/10 px-1.5 py-0 text-[9px] text-neon-amber">
                            You
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-ink-500">
                        {house.total_points.toLocaleString()} points
                      </span>
                    </span>
                  </div>

                  {index === 0 && <Crown className="h-4 w-4 shrink-0 text-neon-amber" aria-hidden />}
                </div>

                <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-700',
                      isMine
                        ? 'bg-gradient-to-r from-neon-amber/60 to-neon-amber'
                        : index === 0
                          ? 'bg-gradient-to-r from-neon-amber/45 to-neon-amber/75'
                          : 'bg-gradient-to-r from-white/[0.12] to-white/[0.22]',
                    )}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ol>
      </GlassCard>

      <GlassCard className="p-4">
        <div className="flex items-start gap-3">
          <ShieldQuestion className="mt-0.5 h-4 w-4 shrink-0 text-ink-500" aria-hidden />
          <p className="text-xs leading-relaxed text-ink-400">
            Points are credited server-side to the house on your profile — the browser can never
            choose a house or an amount. Unchecking a habit never removes points already earned.
          </p>
        </div>
      </GlassCard>
    </div>
  )
}
