'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Check, Loader2, ShieldCheck, Trophy } from 'lucide-react'

import { joinHouse } from '@/app/actions/profile'
import { cn } from '@/lib/utils'
import type { SchoolHouseRow } from '@/types/database'

interface HousePickerProps {
  houses: SchoolHouseRow[]
  currentHouse: string | null
}

const HOUSE_INITIAL: Record<string, string> = {
  Aurora: 'A',
  Nova: 'N',
  Vertex: 'V',
  Zenith: 'Z',
}

export default function HousePicker({ houses, currentHouse }: HousePickerProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const locked = Boolean(currentHouse)

  function handleJoin() {
    if (!selected) {
      setError('Pick a house to join first.')
      return
    }

    setError(null)
    setNotice(null)

    startTransition(async () => {
      const result = await joinHouse({ house: selected })

      if (!result.ok) {
        setError(result.error)
        return
      }

      setNotice(`You are in ${result.data.house} House. Your next points count for them.`)
      setSelected(null)
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <ul className="grid gap-2.5 sm:grid-cols-2">
        {houses.map((house) => {
          const isMine = house.house_name === currentHouse
          const isSelected = house.house_name === selected

          return (
            <li key={house.id}>
              <button
                type="button"
                onClick={() => {
                  if (locked) return
                  setSelected(house.house_name)
                  setError(null)
                }}
                disabled={locked || isPending}
                aria-pressed={isMine || isSelected}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors',
                  isMine
                    ? 'border-neon-amber/40 bg-neon-amber/[0.08]'
                    : isSelected
                      ? 'border-neon-indigo/50 bg-neon-indigo/[0.12]'
                      : 'border-white/[0.08] bg-surface/60',
                  !locked && !isSelected && 'hover:border-white/[0.16] hover:bg-surface-graphite/70',
                  locked && !isMine && 'opacity-45',
                )}
              >
                <span
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border font-mono text-sm',
                    isMine
                      ? 'border-neon-amber/40 bg-neon-amber/10 text-neon-amber'
                      : isSelected
                        ? 'border-neon-indigo/40 bg-neon-indigo/15 text-neon-indigo'
                        : 'border-white/10 bg-ink-900/60 text-ink-300',
                  )}
                  aria-hidden
                >
                  {HOUSE_INITIAL[house.house_name] ?? house.house_name.slice(0, 1)}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink-100">
                    {house.house_name}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-ink-500">
                    {house.total_points.toLocaleString()} points
                  </span>
                </span>

                {isMine ? (
                  <span className="pill border-neon-amber/30 bg-neon-amber/10 text-neon-amber">
                    <Check className="h-3 w-3" aria-hidden />
                    Yours
                  </span>
                ) : isSelected ? (
                  <span className="pill border-neon-indigo/30 bg-neon-indigo/10 text-neon-indigo">
                    Selected
                  </span>
                ) : null}
              </button>
            </li>
          )
        })}
      </ul>

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-neon-coral/30 bg-neon-coral/10 px-3 py-2 text-xs leading-relaxed text-rose-200"
        >
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      {notice && (
        <p
          role="status"
          className="flex items-start gap-2 rounded-lg border border-neon-emerald/30 bg-neon-emerald/10 px-3 py-2 text-xs leading-relaxed text-emerald-200"
        >
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          {notice}
        </p>
      )}

      {locked ? (
        <p className="flex items-start gap-2 text-xs leading-relaxed text-ink-500">
          <Trophy className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neon-amber" aria-hidden />
          Houses lock when you join so the leaderboard stays honest. Ask a teacher if yours was
          assigned by mistake.
        </p>
      ) : (
        <button
          type="button"
          onClick={handleJoin}
          disabled={isPending || !selected}
          className="btn-primary"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <ShieldCheck className="h-4 w-4" aria-hidden />
          )}
          {selected ? `Join ${selected} House` : 'Choose a house'}
        </button>
      )}
    </div>
  )
}
