export interface SupabaseEnv {
  url: string
  anonKey: string
}

/** The preferred public values StudyBud needs before any auth or data call works. */
export const SUPABASE_ENV_KEYS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const

/**
 * Names from the project's earlier Vite build. They are still accepted so a
 * Vercel project that already carries them does not need to be renamed.
 */
export const SUPABASE_LEGACY_ENV_KEYS = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'] as const

/** Operator-facing explanation, safe to show in the UI. */
export const SUPABASE_SETUP_HINT =
  'StudyBud is not connected to Supabase on this deployment yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or the older VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY names) in the project environment (Vercel → Settings → Environment Variables), then redeploy.'

export class SupabaseConfigError extends Error {
  constructor(message: string = SUPABASE_SETUP_HINT) {
    super(message)
    this.name = 'SupabaseConfigError'
  }
}

/**
 * Reads the public connection values, preferring the standard Next.js names
 * and falling back to the original Vite-era ones.
 *
 * The lookups are written out one by one rather than through a loop so
 * Next.js can still inline them into the browser bundle.
 */
function readSupabaseEnv(): SupabaseEnv {
  return {
    url:
      process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
      process.env.VITE_SUPABASE_URL?.trim() ||
      '',
    anonKey:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
      process.env.VITE_SUPABASE_ANON_KEY?.trim() ||
      '',
  }
}

/**
 * True when both public connection values exist under either naming scheme.
 * Server components use this to render a clear setup screen instead of
 * throwing a 500 when the deployment has not been wired up yet.
 */
export function hasSupabaseEnv(): boolean {
  const { url, anonKey } = readSupabaseEnv()
  return Boolean(url && anonKey)
}

/**
 * Reads the public Supabase connection values. Throwing a descriptive error
 * here beats every page failing later with an opaque fetch error.
 */
export function getSupabaseEnv(): SupabaseEnv {
  const { url, anonKey } = readSupabaseEnv()

  if (!url || !anonKey) {
    throw new SupabaseConfigError()
  }

  return { url, anonKey }
}
