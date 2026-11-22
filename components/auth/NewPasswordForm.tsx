'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2, Loader2, Lock } from 'lucide-react'

import { setNewPassword } from '@/app/actions/auth'

export default function NewPasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (password !== confirmation) {
      setError('Both passwords must match.')
      return
    }

    startTransition(async () => {
      const result = await setNewPassword({ password })

      if (!result.ok) {
        setError(result.error)
        return
      }

      router.replace('/dashboard')
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="new-password" className="paper-label">
          New password
        </label>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-400"
            aria-hidden
          />
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="paper-input pl-9"
            placeholder="At least 8 characters"
          />
        </div>
      </div>

      <div>
        <label htmlFor="confirm-password" className="paper-label">
          Confirm new password
        </label>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-400"
            aria-hidden
          />
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            className="paper-input pl-9"
            placeholder="Type it again"
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

      <button type="submit" disabled={isPending} className="paper-submit">
        {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        Save new password
      </button>

      <p className="flex items-start gap-2 text-[11.5px] leading-relaxed text-espresso-400">
        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        You stay signed in on this device after saving. Other devices will need the new password
        next time.
      </p>
    </form>
  )
}
