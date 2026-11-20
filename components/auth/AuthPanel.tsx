'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2, Loader2, Lock, Mail, User } from 'lucide-react'

import { signIn, signUp } from '@/app/actions/auth'
import { SHOW_HOUSES } from '@/lib/features'
import { cn } from '@/lib/utils'

type Mode = 'signin' | 'signup'

interface AuthPanelProps {
  houses: string[]
  redirectTo: string
  initialMode: Mode
  initialError?: string | null
}

export default function AuthPanel({
  houses,
  redirectTo,
  initialMode,
  initialError = null,
}: AuthPanelProps) {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [schoolHouse, setSchoolHouse] = useState('')
  const [gradeSection, setGradeSection] = useState('')
  const [error, setError] = useState<string | null>(initialError)
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
      try {
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
      } catch {
        setError('We could not reach the server just now. Check your connection and try again.')
      }
    })
  }

  return (
    <div className="w-full animate-fade-up">
      <div className="mb-6">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-brass-500">
          {mode === 'signin' ? 'Your account' : 'New account'}
        </p>
        <h2 className="display mt-2 hidden text-[2.1rem] leading-tight text-espresso lg:block">
          {mode === 'signin' ? 'Sign in to StudyBud' : 'Build your study system'}
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-espresso-500">
          {mode === 'signin'
            ? 'Your streaks, sessions and decks are exactly where you left them.'
            : 'One account for habits, focus and recall — ready in under a minute.'}
        </p>
      </div>

      <div className="rounded-[1.6rem] border border-espresso/10 bg-paper-50 p-6 shadow-paper sm:p-7">
        <div
          role="tablist"
          aria-label="Authentication mode"
          className="mb-6 grid grid-cols-2 gap-1 rounded-full border border-espresso/10 bg-paper-200/60 p-1"
        >
          {(['signin', 'signup'] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={mode === value}
              onClick={() => switchMode(value)}
              className={cn(
                'rounded-full px-3 py-2 text-[13px] font-medium transition-colors',
                mode === value
                  ? 'bg-espresso text-paper-50 shadow-paper'
                  : 'text-espresso-500 hover:text-espresso',
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
                <label htmlFor="username" className="paper-label">
                  Display name
                </label>
                <div className="relative">
                  <User
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-400"
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
                    className="paper-input pl-9"
                    placeholder="Aarav"
                  />
                </div>
              </div>

              <div className={SHOW_HOUSES ? 'grid gap-4 sm:grid-cols-2' : 'grid gap-4'}>
                {SHOW_HOUSES && (
                  <div>
                    <label htmlFor="school-house" className="paper-label">
                      School house
                    </label>
                    <select
                      id="school-house"
                      name="school_house"
                      value={schoolHouse}
                      onChange={(event) => setSchoolHouse(event.target.value)}
                      className="paper-input appearance-none pr-8"
                    >
                      <option value="">Not assigned</option>
                      {houses.map((house) => (
                        <option key={house} value={house}>
                          {house}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label htmlFor="grade-section" className="paper-label">
                    Grade / section
                  </label>
                  <input
                    id="grade-section"
                    name="grade_section"
                    type="text"
                    value={gradeSection}
                    onChange={(event) => setGradeSection(event.target.value)}
                    className="paper-input"
                    placeholder="Grade 11 · B"
                    maxLength={60}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label htmlFor="email" className="paper-label">
              Email
            </label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-400"
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
                className="paper-input pl-9"
                placeholder="you@school.edu"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="paper-label">
              Password
            </label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-400"
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
                className="paper-input pl-9"
                placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
              />
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-rose-300/70 bg-rose-50 px-3 py-2.5 text-xs leading-relaxed text-rose-800"
            >
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              {error}
            </p>
          )}

          {notice && (
            <p
              role="status"
              className="flex items-start gap-2 rounded-xl border border-emerald-300/70 bg-emerald-50 px-3 py-2.5 text-xs leading-relaxed text-emerald-800"
            >
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              {notice}
            </p>
          )}

          <button type="submit" disabled={isPending} className="paper-submit">
            {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>

      <p className="mt-5 text-center text-xs text-espresso-500">
        {mode === 'signin' ? (
          <>
            New to StudyBud?{' '}
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className="font-medium text-brass-600 hover:underline"
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
              className="font-medium text-brass-600 hover:underline"
            >
              Sign in
            </button>
          </>
        )}
      </p>

      <p className="mt-2 text-center text-[11px] text-espresso-400">
        <Link href="/" className="transition-colors hover:text-espresso-700">
          Back to StudyBud
        </Link>
      </p>
    </div>
  )
}
