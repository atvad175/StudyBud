/**
 * Next.js only inlines `NEXT_PUBLIC_*` values into the browser bundle, so a
 * deployment that still carries the original Vite-era names needs them mapped
 * across at build time. Values are only defined when one actually exists;
 * otherwise Next's normal handling applies.
 */
const publicSupabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
const publicSupabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''

const publicEnv = {
  ...(publicSupabaseUrl ? { NEXT_PUBLIC_SUPABASE_URL: publicSupabaseUrl } : {}),
  ...(publicSupabaseAnonKey ? { NEXT_PUBLIC_SUPABASE_ANON_KEY: publicSupabaseAnonKey } : {}),
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: publicEnv,
  eslint: {
    // Lint (`npm run lint`) and type check (`npm run typecheck`) run as their
    // own CI steps; the build only compiles the app.
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
