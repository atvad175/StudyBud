import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { getSupabaseEnv } from '@/lib/env'
import type { Database } from '@/types/database'

/**
 * Request-scoped server client. Always call `createClient()` per request; never
 * cache the instance across requests or users.
 */
export async function createClient() {
  const { url, anonKey } = getSupabaseEnv()
  const cookieStore = await cookies()

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // Server Components cannot mutate cookies. The middleware refresh
          // already rotated the session; Server Actions can still write.
        }
      },
    },
  })
}
