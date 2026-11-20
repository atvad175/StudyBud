'use client'

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2, Pause, Play, RotateCcw, ShieldAlert, Timer } from 'lucide-react'

import { logFocusSession } from '@/app/actions/studybud'
import GlassCard from '@/components/ui/GlassCard'
import { formatMinutes } from '@/lib/dates'
import { cn } from '@/lib/utils'
import type { WeeklyFocusPoint } from '@/lib/types'

interface TimerMode {
  id: 'pomodoro' | 'short' | 'long' | 'deep'
  label: string
  minutes: number
  hint: string
  logs: boolean
}

const MODES: TimerMode[] = [
  {
    id: 'pomodoro',
    label: 'Pomodoro',
    minutes: 25,
    hint: 'Classic 25-minute block. Logs focus time.',
    logs: true,
  },
  {
    id: 'short',
    label: 'Short break',
    minutes: 5,
    hint: 'Five minutes away from the desk.',
    logs: false,
  },
  {
    id: 'long',
    label: 'Long break',
    minutes: 15,
    hint: 'Reset properly between deep blocks.',
    logs: false,
  },
  {
    id: 'deep',
    label: 'Deep work',
    minutes: 50,
    hint: 'A full 50-minute stretch for hard problems.',
    logs: true,
  },
]

const RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

interface FocusTimerProps {
  todayMinutes: number
  todaySessions: number
  weekly: WeeklyFocusPoint[]
  targetMinutes: number
}

export default function FocusTimer({
  todayMinutes,
  todaySessions,
  weekly,
  targetMinutes,
}: FocusTimerProps) {
  const router = useRouter()
  const [mode, setMode] = useState<TimerMode>(MODES[0] as TimerMode)
  const [secondsLeft, setSecondsLeft] = useState((MODES[0] as TimerMode).minutes * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [status, setStatus] = useState<{ tone: 'success' | 'error'; message: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const completedRef = useRef(false)
  const totalSeconds = mode.minutes * 60
  const elapsedSeconds = Math.max(0, totalSeconds - secondsLeft)
  const progress = totalSeconds === 0 ? 0 : Math.min(1, elapsedSeconds / totalSeconds)

  const weekPeak = useMemo(
    () => Math.max(1, ...weekly.map((point) => point.minutes)),
    [weekly],
  )

  const persist = useCallback(
    (minutes: number) => {
      startTransition(async () => {
        const result = await logFocusSession({
          minutes,
          mode: mode.id === 'deep' ? 'deep' : 'pomodoro',
        })

        if (!result.ok) {
          setStatus({ tone: 'error', message: result.error })
          return
        }

        setStatus({
          tone: 'success',
          message: `Logged ${formatMinutes(minutes)} of focus time.`,
        })
        router.refresh()
      })
    },
    [mode.id, router],
  )

  // Ticking clock.
  useEffect(() => {
    if (!isRunning) return

    const interval = window.setInterval(() => {
      setSecondsLeft((current) => (current <= 1 ? 0 : current - 1))
    }, 1000)

    return () => window.clearInterval(interval)
  }, [isRunning])

  // Completion: fires exactly once per run.
  useEffect(() => {
    if (secondsLeft > 0) {
      completedRef.current = false
      return
    }
    if (!isRunning || completedRef.current) return

    completedRef.current = true
    setIsRunning(false)

    if (mode.logs) {
      persist(mode.minutes)
    } else {
      setStatus({ tone: 'success', message: 'Break complete. The next block is waiting.' })
    }
  }, [secondsLeft, isRunning, mode, persist])

  function selectMode(next: TimerMode) {
    setMode(next)
    setSecondsLeft(next.minutes * 60)
    setIsRunning(false)
    completedRef.current = false
    setStatus(null)
  }

  function resetTimer() {
    setSecondsLeft(totalSeconds)
    setIsRunning(false)
    completedRef.current = false
    setStatus(null)
  }

  function logElapsed() {
    setStatus(null)

    if (!mode.logs) {
      setStatus({
        tone: 'error',
        message: 'Breaks are not logged as focus time — switch to Pomodoro or Deep work.',
      })
      return
    }

    const minutes = Math.floor(elapsedSeconds / 60)
    if (minutes < 1) {
      setStatus({
        tone: 'error',
        message: 'Focus for at least a minute before logging this session.',
      })
      return
    }

    persist(minutes)
    setSecondsLeft(totalSeconds)
    setIsRunning(false)
    completedRef.current = false
  }

  const goalPercent = targetMinutes > 0 ? Math.min(100, Math.round((todayMinutes / targetMinutes) * 100)) : 0

  return (
    <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
      <GlassCard glow="indigo" specular className="animate-fade-up">
        <div className="flex flex-wrap gap-1.5">
          {MODES.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => selectMode(option)}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                mode.id === option.id
                  ? 'border-neon-indigo/45 bg-neon-indigo/15 text-white shadow-glow-indigo'
                  : 'border-white/[0.09] text-ink-400 hover:border-white/[0.18] hover:text-ink-200',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="relative mx-auto mt-8 flex h-64 w-64 items-center justify-center">
          <div
            aria-hidden
            className="absolute inset-10 rounded-full bg-neon-indigo/10 blur-2xl"
          />
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" role="img" aria-label={`${Math.round(progress * 100)}% of the block elapsed`}>
            <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="5" />
            <circle
              cx="60"
              cy="60"
              r={RADIUS}
              fill="none"
              stroke={mode.id === 'deep' || mode.id === 'pomodoro' ? '#818CF8' : '#34D399'}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
              className="transition-[stroke-dashoffset] duration-1000 ease-linear"
              style={{
                filter:
                  mode.id === 'deep' || mode.id === 'pomodoro'
                    ? 'drop-shadow(0 0 6px rgba(129,140,248,0.5))'
                    : 'drop-shadow(0 0 6px rgba(52,211,153,0.5))',
              }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-5xl font-semibold tracking-tight text-white tabular-nums">
              {formatClock(secondsLeft)}
            </span>
            <span className="mt-2 text-xs uppercase tracking-[0.14em] text-ink-500">
              {mode.label} · {mode.minutes} min
            </span>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-ink-500">{mode.hint}</p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setIsRunning((current) => !current)}
            disabled={isPending || secondsLeft === 0}
            className="btn-primary min-w-28"
          >
            {isRunning ? (
              <Pause className="h-4 w-4" aria-hidden />
            ) : (
              <Play className="h-4 w-4" aria-hidden />
            )}
            {isRunning ? 'Pause' : 'Start'}
          </button>

          <button type="button" onClick={resetTimer} className="btn-ghost" disabled={isPending}>
            <RotateCcw className="h-4 w-4" aria-hidden />
            Reset
          </button>

          <button
            type="button"
            onClick={logElapsed}
            disabled={isPending || elapsedSeconds < 60}
            className="btn-ghost"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Timer className="h-4 w-4" aria-hidden />
            )}
            Log elapsed
          </button>
        </div>

        {status && (
          <p
            role={status.tone === 'error' ? 'alert' : 'status'}
            className={cn(
              'mt-4 flex items-start gap-2 rounded-lg border px-3 py-2 text-xs leading-relaxed',
              status.tone === 'error'
                ? 'border-neon-coral/30 bg-neon-coral/10 text-rose-200'
                : 'border-neon-emerald/30 bg-neon-emerald/10 text-emerald-200',
            )}
          >
            {status.tone === 'error' ? (
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            ) : (
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            )}
            {status.message}
          </p>
        )}
      </GlassCard>

      <div className="space-y-4">
        <GlassCard specular>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Today</h2>
            <span className="pill">{todaySessions} session{todaySessions === 1 ? '' : 's'}</span>
          </div>

          <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
            {formatMinutes(todayMinutes)}
          </p>
          <p className="mt-1 text-xs text-ink-500">of a {formatMinutes(targetMinutes)} daily target</p>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.07]" role="progressbar" aria-valuenow={goalPercent} aria-valuemin={0} aria-valuemax={100} aria-label="Daily focus goal">
            <div
              className="h-full rounded-full bg-gradient-to-r from-neon-emerald/70 to-neon-emerald transition-all"
              style={{ width: `${goalPercent}%` }}
            />
          </div>
          <p className="mt-2 text-right text-[11px] text-ink-500">{goalPercent}%</p>
        </GlassCard>

        <GlassCard>
          <h2 className="text-sm font-semibold text-white">Last 7 days</h2>
          <div className="mt-5 flex h-32 items-end gap-2">
            {weekly.map((point) => {
              const height = Math.round((point.minutes / weekPeak) * 100)
              return (
                <div key={point.date} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t-md border border-neon-indigo/25 bg-gradient-to-t from-neon-indigo/15 to-neon-indigo/50"
                      style={{ height: `${Math.max(height, point.minutes > 0 ? 8 : 3)}%` }}
                      title={`${point.minutes} minutes`}
                    />
                  </div>
                  <span className="text-[10px] uppercase text-ink-500">{point.label}</span>
                </div>
              )
            })}
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-ink-500">
            Sessions are written to your Supabase account the moment they finish, so the record
            survives refreshes and new devices.
          </p>
        </GlassCard>
      </div>
    </div>
  )
}
