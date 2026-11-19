import { NextResponse, type NextRequest } from 'next/server'

import { hasSupabaseEnv } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'

/**
 * Handles the email-confirmation and OAuth callback: exchanges the one-time code
 * for a cookie session, then forwards the student into the dashboard.
 *
 * Every failure redirects back to `/login` with a reason instead of throwing, so
 * an expired link or an unconfigured deployment never lands on an error page.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const requestedNext = searchParams.get('next') ?? '/dashboard'

  const next =
    requestedNext.startsWith('/') && !requestedNext.startsWith('//')
      ? requestedNext
      : '/dashboard'

  if (!hasSupabaseEnv()) {
    return NextResponse.redirect(`${origin}/login?error=unconfigured`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return NextResponse.redirect(`${origin}/login?error=callback_failed`)
    }
  } catch {
    return NextResponse.redirect(`${origin}/login?error=callback_failed`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
