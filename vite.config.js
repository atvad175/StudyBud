import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The app reads VITE_SUPABASE_*. This deployment has also carried the newer
// NEXT_PUBLIC_ names, so fall back to those at build time instead of shipping a
// client with no connection details.
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey =
  process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

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
