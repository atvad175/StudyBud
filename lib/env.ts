export interface SupabaseEnv {
  url: string
  anonKey: string
}

/** The two public values StudyBud needs before any auth or data call works. */
export const SUPABASE_ENV_KEYS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const

/** Operator-facing explanation, safe to show in the UI. */
export const SUPABASE_SETUP_HINT =
  'StudyBud is not connected to Supabase on this deployment yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in the project environment (Vercel → Settings → Environment Variables), then redeploy.'

export class SupabaseConfigError extends Error {
  constructor(message: string = SUPABASE_SETUP_HINT) {
    super(message)
    this.name = 'SupabaseConfigError'
  }
}

/**
 * True when both public connection values exist. Server components use this to
 * render a clear setup screen instead of throwing a 500 when the deployment has
 * not been wired up yet.
 */
export function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
  )
}

/**
 * Reads the public Supabase connection values. Throwing a descriptive error
 * here beats every page failing later with an opaque fetch error.
 */
export function getSupabaseEnv(): SupabaseEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

  if (!url || !anonKey) {
    throw new SupabaseConfigError()
  }

  return { url, anonKey }
}
