'use client'

import { useState, useTransition } from 'react'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

import { changePassword } from '@/app/actions/auth'

export default function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSaved(false)

    if (newPassword !== confirmation) {
      setError('Both new passwords must match.')
      return
    }

    startTransition(async () => {
      const result = await changePassword({ currentPassword, newPassword })

      if (!result.ok) {
        setError(result.error)
        return
      }

      setSaved(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmation('')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <div>
        <label htmlFor="current-password" className="field-label">
          Current password
        </label>
        <input
          id="current-password"
          type="password"
          autoComplete="current-password"
          required
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          className="glass-input mt-1.5"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="profile-new-password" className="field-label">
            New password
          </label>
          <input
            id="profile-new-password"
            type="password"
            autoComplete="new-password"
            required
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="glass-input mt-1.5"
            placeholder="At least 8 characters"
          />
        </div>
        <div>
          <label htmlFor="profile-confirm-password" className="field-label">
            Confirm new password
          </label>
          <input
            id="profile-confirm-password"
            type="password"
            autoComplete="new-password"
            required
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            className="glass-input mt-1.5"
          />
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-neon-rose/30 bg-neon-rose/10 px-3 py-2 text-xs leading-relaxed text-rose-200"
        >
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      {saved && (
        <p
          role="status"
          className="flex items-start gap-2 rounded-lg border border-neon-emerald/30 bg-neon-emerald/10 px-3 py-2 text-xs leading-relaxed text-emerald-200"
        >
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          Password updated. Use it the next time you sign in on another device.
        </p>
      )}

      <button type="submit" disabled={isPending} className="btn-ghost">
        {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
        Update password
      </button>
    </form>
  )
}
