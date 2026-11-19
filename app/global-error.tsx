'use client'

/**
 * Replaces the root layout when it itself fails, so styles are inlined rather
 * than relying on Tailwind being loaded.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#09090b',
          color: '#f4f4f6',
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '30rem' }}>
          <h1 style={{ fontSize: '1.6rem', margin: '0 0 0.75rem' }}>StudyBud hit a snag</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
            The app could not start this page. Your saved work is untouched.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              borderRadius: '0.75rem',
              border: '1px solid rgba(255,255,255,0.14)',
              background: '#f4f4f6',
              color: '#09090b',
              padding: '0.6rem 1.15rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
          {error.digest && (
            <p style={{ marginTop: '1.5rem', fontSize: '0.7rem', color: '#7c8593' }}>
              Reference: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  )
}
