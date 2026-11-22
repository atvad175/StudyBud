import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, ShieldCheck } from 'lucide-react'

import NewPasswordForm from '@/components/auth/NewPasswordForm'
import { hasSupabaseEnv } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Choose a new password',
  robots: { index: false, follow: false },
}

export default async function ResetPasswordPage() {
  let signedIn = false

  if (hasSupabaseEnv()) {
    try {
      const supabase = await createClient()
      const { data } = await supabase.auth.getUser()
      signedIn = Boolean(data.user)
    } catch {
      signedIn = false
    }
  }

  return (
    <main className="paper-surface relative min-h-dvh">
      <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-5 py-8 sm:px-8 lg:py-12">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5" aria-label="StudyBud home">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-espresso text-[13px] font-semibold text-paper-50">
              S
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-espresso">StudyBud</span>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-espresso-500 transition-colors hover:text-espresso"
          >
            Back to sign in
            <ArrowUpRight className="h-3 w-3" aria-hidden />
          </Link>
        </header>

        <div className="flex flex-1 items-center py-10">
          <section className="w-full">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brass-500">
              Password reset
            </p>
            <h1 className="display mt-3 text-[2.4rem] leading-tight text-espresso">
              Choose a new password
            </h1>

            <div className="mt-6 rounded-[1.6rem] border border-espresso/10 bg-paper-50 p-6 shadow-paper sm:p-7">
              {signedIn ? (
                <NewPasswordForm />
              ) : (
                <div className="space-y-4">
                  <p className="flex items-start gap-2 text-[13px] leading-relaxed text-espresso-600">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brass-500" aria-hidden />
                    This reset link has expired or was already used. Request a fresh one and open it
                    on this device — the link signs you in just long enough to set a new password.
                  </p>
                  <Link href="/login" className="paper-btn">
                    Request a new link
                  </Link>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
