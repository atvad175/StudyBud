'use client'

import { createBrowserClient } from '@supabase/ssr'

import { getSupabaseEnv } from '@/lib/env'
import type { Database } from '@/types/database'

/**
 * Cookie-backed browser client. Sessions are stored in cookies (not
 * local storage) so server components and server actions see the same user.
 */
export function createClient() {
  const { url, anonKey } = getSupabaseEnv()

  return createBrowserClient<Database>(url, anonKey, {
    isSingleton: true,
  })
}
