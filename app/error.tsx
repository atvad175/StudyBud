'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { RotateCcw } from 'lucide-react'

/**
 * Last line of defence: any unexpected server exception inside a route renders
 * this instead of the bare "Application error" page.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[studybud] Route error:', error)
  }, [error])

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-neon-coral">
        Something went wrong
      </p>
      <h1 className="display mt-4 text-[2.2rem] leading-tight text-white">
        That page could not load.
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-400">
        Your saved work is untouched. Try the page again — if it keeps failing, head back to the
        dashboard overview.
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={reset} className="btn-primary">
          <RotateCcw className="h-4 w-4" aria-hidden />
          Try again
        </button>
        <Link href="/dashboard" className="btn-ghost">
          Dashboard
        </Link>
        <Link href="/" className="btn-ghost">
          Home
        </Link>
      </div>

      {error.digest && (
        <p className="mt-6 font-mono text-[11px] text-ink-600">Reference: {error.digest}</p>
      )}
    </main>
  )
}
