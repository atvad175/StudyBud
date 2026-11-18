import Sidebar from '@/components/dashboard/Sidebar'
import { ensureProfile, requireUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireUser()
  const profile = await ensureProfile(supabase, user)

  return (
    <div className="lg:flex">
      <Sidebar
        username={profile.username}
        house={profile.school_house}
        gradeSection={profile.grade_section}
        tier={profile.tier}
      />

      <div className="min-w-0 flex-1">
        <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-6 sm:px-8 lg:pt-12">
          {children}
        </main>
      </div>
    </div>
  )
}
