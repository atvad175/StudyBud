/**
 * Shown while a dashboard route fetches its data, so a slow connection reads as
 * "loading" rather than a blank screen.
 */
export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true">
      <span className="sr-only" role="status">
        Loading your dashboard
      </span>

      <div className="space-y-3">
        <div className="h-3 w-32 rounded-full bg-white/[0.08]" />
        <div className="h-9 w-2/3 max-w-md rounded-lg bg-white/[0.07]" />
        <div className="h-3 w-full max-w-xl rounded-full bg-white/[0.05]" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <div key={index} className="glass-card h-32 p-5">
            <div className="h-2.5 w-24 rounded-full bg-white/[0.07]" />
            <div className="mt-5 h-7 w-16 rounded-md bg-white/[0.09]" />
            <div className="mt-3 h-2.5 w-32 rounded-full bg-white/[0.05]" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {[0, 1].map((index) => (
          <div key={index} className="glass-card h-56 p-6">
            <div className="h-3 w-32 rounded-full bg-white/[0.07]" />
            <div className="mt-6 space-y-3">
              <div className="h-2.5 w-full rounded-full bg-white/[0.05]" />
              <div className="h-2.5 w-5/6 rounded-full bg-white/[0.05]" />
              <div className="h-2.5 w-2/3 rounded-full bg-white/[0.05]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
