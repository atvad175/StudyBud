import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { getSupabaseEnv } from '@/lib/env'
import type { Database } from '@/types/database'

/**
 * Refreshes the Supabase session cookie on every matched request and gates
 * `/dashboard/*`. Unauthenticated visitors are bounced to `/login` with a
 * return path; signed-in users skip the login screen.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  let env: ReturnType<typeof getSupabaseEnv>
  try {
    env = getSupabaseEnv()
  } catch {
    // Missing configuration surfaces as a clear error inside the page, and the
    // middleware must not 500 the whole site.
    return response
  }

  const supabase = createServerClient<Database>(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value)
        }
        response = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options)
        }
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname, search } = request.nextUrl

  if (!user && pathname.startsWith('/dashboard')) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.search = `next=${encodeURIComponent(`${pathname}${search}`)}`
    return NextResponse.redirect(redirectUrl)
  }

  if (user && pathname === '/login') {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    redirectUrl.search = ''
    return NextResponse.redirect(redirectUrl)
  }

  return response
}
