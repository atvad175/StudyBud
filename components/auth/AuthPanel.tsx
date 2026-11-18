'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2, Loader2, Lock, Mail, User } from 'lucide-react'

import { signIn, signUp } from '@/app/actions/auth'
import { cn } from '@/lib/utils'

type Mode = 'signin' | 'signup'

interface AuthPanelProps {
  houses: string[]
  redirectTo: string
  initialMode: Mode
}

export default function AuthPanel({ houses, redirectTo, initialMode }: AuthPanelProps) {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [schoolHouse, setSchoolHouse] = useState('')
  const [gradeSection, setGradeSection] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
    setNotice(null)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setNotice(null)

    startTransition(async () => {
      const result =
        mode === 'signin'
          ? await signIn({ email, password })
          : await signUp({
              email,
              password,
              username,
              schoolHouse: schoolHouse || undefined,
              gradeSection: gradeSection || undefined,
            })

      if (!result.ok) {
        setError(result.error)
        return
      }

      if (result.data.requiresConfirmation) {
        setNotice(
          mode === 'signin'
            ? 'Confirm your email address, then sign in again.'
            : 'Account created. Check your inbox to confirm your email before signing in.',
        )
        return
      }

      router.replace(redirectTo)
      router.refresh()
    })
  }

  return (
    <div className="w-full animate-fade-up">
      <div className="mb-7">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-neon-indigo/80">
          {mode === 'signin' ? 'Your account' : 'New account'}
        </p>
        <h1 className="display mt-2 text-[2.15rem] leading-tight text-white">
          {mode === 'signin' ? 'Welcome back' : 'Build your study system'}
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-400">
          {mode === 'signin'
            ? 'Your streaks, sessions and decks are exactly where you left them.'
            : 'One account for habits, focus, recall and house points.'}
        </p>
      </div>

      <div className="glass-card specular p-6 sm:p-7">
        <div
          role="tablist"
          aria-label="Authentication mode"
          className="mb-6 grid grid-cols-2 gap-1 rounded-xl border border-white/[0.07] bg-black/30 p-1"
        >
          {(['signin', 'signup'] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={mode === value}
              onClick={() => switchMode(value)}
              className={cn(
                'rounded-lg px-3 py-2 text-[13px] font-medium transition-colors',
                mode === value
                  ? 'bg-ink-800/90 text-white shadow-inner-glass'
                  : 'text-ink-400 hover:text-ink-200',
              )}
            >
              {value === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {mode === 'signup' && (
            <>
              <div>
                <label htmlFor="username" className="field-label">
                  Display name
                </label>
                <div className="relative">
                  <User
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500"
                    aria-hidden
                  />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="nickname"
                    required
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="glass-input pl-9"
                    placeholder="Aarav"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="school-house" className="field-label">
                    School house
                  </label>
                  <select
                    id="school-house"
                    name="school_house"
                    value={schoolHouse}
                    onChange={(event) => setSchoolHouse(event.target.value)}
                    className="glass-input appearance-none"
                  >
                    <option value="">Not assigned</option>
                    {houses.map((house) => (
                      <option key={house} value={house}>
                        {house}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="grade-section" className="field-label">
                    Grade / section
                  </label>
                  <input
                    id="grade-section"
                    name="grade_section"
                    type="text"
                    value={gradeSection}
                    onChange={(event) => setGradeSection(event.target.value)}
                    className="glass-input"
                    placeholder="Grade 11 · B"
                    maxLength={60}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label htmlFor="email" className="field-label">
              Email
            </label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500"
                aria-hidden
              />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="glass-input pl-9"
                placeholder="you@school.edu"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="field-label">
              Password
            </label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500"
                aria-hidden
              />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="glass-input pl-9"
                placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
              />
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-neon-coral/30 bg-neon-coral/10 px-3 py-2.5 text-xs leading-relaxed text-rose-200"
            >
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              {error}
            </p>
          )}

          {notice && (
            <p
              role="status"
              className="flex items-start gap-2 rounded-xl border border-neon-emerald/30 bg-neon-emerald/10 px-3 py-2.5 text-xs leading-relaxed text-emerald-200"
            >
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              {notice}
            </p>
          )}

          <button type="submit" disabled={isPending} className="btn-primary w-full">
            {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-xs text-ink-500">
        {mode === 'signin' ? (
          <>
            New to StudyBud?{' '}
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className="font-medium text-neon-indigo hover:underline"
            >
              Create an account
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className="font-medium text-neon-indigo hover:underline"
            >
              Sign in
            </button>
          </>
        )}
      </p>

      <p className="mt-2 text-center text-[11px] text-ink-600">
        <Link href="/" className="transition-colors hover:text-ink-400">
          Back to StudyBud
        </Link>
      </p>
    </div>
  )
}
