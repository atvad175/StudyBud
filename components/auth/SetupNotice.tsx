import Link from 'next/link'
import { ArrowUpRight, ServerCrash } from 'lucide-react'

import { SUPABASE_ENV_KEYS } from '@/lib/env'

/**
 * Shown instead of the auth form when the deployment is missing its Supabase
 * connection values. Rendering this keeps `/login` and `/dashboard` from
 * throwing a server-side exception on an unconfigured deployment.
 */
export default function SetupNotice() {
  return (
    <div className="w-full animate-fade-up rounded-[1.6rem] border border-espresso/10 bg-paper-50 p-6 shadow-paper sm:p-8">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-brass-400/30 bg-brass-200/40 text-brass-600">
        <ServerCrash className="h-4 w-4" strokeWidth={1.8} aria-hidden />
      </span>

      <h2 className="display mt-5 text-[1.7rem] leading-tight text-espresso">One step left</h2>
      <p className="mt-2 text-[13px] leading-relaxed text-espresso-500">
        Accounts are paused because this deployment has no database connection yet. Add these two
        environment variables in your hosting project, then redeploy:
      </p>

      <ul className="mt-4 space-y-2">
        {SUPABASE_ENV_KEYS.map((key) => (
          <li
            key={key}
            className="rounded-lg border border-espresso/10 bg-paper-100 px-3 py-2 font-mono text-[12px] text-espresso-700"
          >
            {key}
          </li>
        ))}
      </ul>

      <p className="mt-4 text-[12px] leading-relaxed text-espresso-400">
        Both values come from your Supabase project under Project Settings → API. The anon /
        publishable key is safe in the browser; never use the service-role key here. If this project
        still uses the older Vite names, <code className="font-mono">VITE_SUPABASE_URL</code> and{' '}
        <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> work too.
      </p>

      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-brass-600 transition-colors hover:text-brass-500"
      >
        Back to the landing page
        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </div>
  )
}
