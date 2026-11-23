/* global process */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The browser build needs the Supabase connection values.
//
// The original VITE_* pair in this Vercel project points at a Supabase project
// that no longer resolves, so the newer NEXT_PUBLIC_* names are preferred and
// the VITE_* names stay as a fallback for anyone running an older .env.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
  },
  server: {
    allowedHosts: true,
  },
})
