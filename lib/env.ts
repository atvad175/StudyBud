export interface SupabaseEnv {
  url: string
  anonKey: string
}

/**
 * Reads the public Supabase connection values. Throwing a descriptive error
 * here beats every page failing later with an opaque fetch error.
 */
export function getSupabaseEnv(): SupabaseEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      'StudyBud is missing its Supabase configuration. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (or in your host\'s environment settings), then restart the server.',
    )
  }

  return { url, anonKey }
}
