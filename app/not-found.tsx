import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Page not found',
}

export default function NotFound() {
  return (
    <main className="paper-surface flex min-h-dvh items-center justify-center px-5 py-16">
      <div className="w-full max-w-lg text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brass-500">404</p>
        <h1 className="display mt-3 text-[2.6rem] leading-tight text-espresso sm:text-[3rem]">
          This page does not exist.
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-[14px] leading-relaxed text-espresso-500">
          The link may be out of date, or the page may have moved. Nothing you have recorded is
          affected.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/dashboard" className="paper-btn">
            Go to your dashboard
          </Link>
          <Link href="/" className="paper-btn-ghost">
            Back to StudyBud
          </Link>
        </div>
      </div>
    </main>
  )
}
