'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Flame,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Sparkles,
  Timer,
  Trophy,
  UserRound,
  type LucideIcon,
} from 'lucide-react'

import { signOut } from '@/app/actions/auth'
import { cn } from '@/lib/utils'
import type { StudyBudTier } from '@/types/database'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  hint: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, hint: 'Today' },
  { href: '/dashboard/habits', label: 'Habits', icon: Flame, hint: 'Daily' },
  { href: '/dashboard/focus', label: 'Focus', icon: Timer, hint: 'Timer' },
  { href: '/dashboard/study', label: 'Study', icon: Sparkles, hint: 'Recall' },
  { href: '/dashboard/house-clash', label: 'House Clash', icon: Trophy, hint: 'League' },
  { href: '/dashboard/profile', label: 'Profile', icon: UserRound, hint: 'You' },
]

const TIER_LABEL: Record<StudyBudTier, string> = {
  free: 'Free tier',
  scholar: 'Scholar',
  elite: 'Elite',
}

interface SidebarProps {
  username: string
  house: string | null
  gradeSection: string | null
  tier: StudyBudTier
}

function isActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard'
  return pathname === href || pathname.startsWith(`${href}/`)
}

function Wordmark() {
  return (
    <Link href="/dashboard" className="group flex items-center gap-2.5 px-1" aria-label="StudyBud dashboard">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-neon-indigo/25 bg-neon-indigo/10 text-neon-indigo transition-transform group-hover:-rotate-6">
        <Sparkles className="h-4 w-4" aria-hidden />
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-white">StudyBud</span>
    </Link>
  )
}

function NavLinks({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="StudyBud pillars" className="flex flex-col gap-0.5">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const active = isActive(pathname, item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'bg-white/[0.055] text-white'
                : 'text-ink-400 hover:bg-white/[0.03] hover:text-ink-100',
            )}
          >
            <span
              aria-hidden
              className={cn(
                'absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full transition-opacity',
                active ? 'bg-neon-indigo opacity-100' : 'opacity-0',
              )}
            />
            <Icon
              className={cn(
                'h-4 w-4 shrink-0 transition-colors',
                active ? 'text-neon-indigo' : 'text-ink-500 group-hover:text-ink-300',
              )}
              aria-hidden
            />
            <span className="flex-1">{item.label}</span>
            <span className="text-[10px] uppercase tracking-[0.12em] text-ink-600 transition-colors group-hover:text-ink-500">
              {item.hint}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

export default function Sidebar({ username, house, gradeSection, tier }: SidebarProps) {
  const pathname = usePathname() ?? '/dashboard'
  const initials = username.slice(0, 2).toUpperCase()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-[17rem] shrink-0 flex-col border-r border-white/[0.07] bg-canvas/60 px-4 py-6 backdrop-blur-xl lg:flex">
        <div className="mb-8">
          <Wordmark />
        </div>

        <NavLinks pathname={pathname} />

        <div className="mt-auto space-y-3">
          <div className="glass-panel p-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-ink-700 to-ink-850 text-xs font-semibold text-ink-200">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink-100">{username}</p>
                {house ? (
                  <p className="truncate text-xs text-ink-500">
                    {house} House{gradeSection ? ` · ${gradeSection}` : ''}
                  </p>
                ) : (
                  <Link
                    href="/dashboard/profile"
                    className="block truncate text-xs font-medium text-neon-amber hover:underline"
                  >
                    Choose your house
                  </Link>
                )}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-white/[0.07] pt-3">
              <span className="pill">
                <ShieldCheck className="h-3 w-3" aria-hidden />
                {TIER_LABEL[tier]}
              </span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-ink-400 transition-colors hover:bg-white/[0.05] hover:text-ink-100"
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden />
                  Sign out
                </button>
              </form>
            </div>
          </div>

          <Link
            href="/"
            className="block px-1 text-[11px] text-ink-600 transition-colors hover:text-ink-400"
          >
            ← Back to the landing page
          </Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 border-b border-white/[0.07] bg-canvas/85 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Wordmark />
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-ink-400 transition-colors hover:text-ink-100"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              Sign out
            </button>
          </form>
        </div>

        <nav aria-label="StudyBud pillars" className="flex gap-1 overflow-x-auto px-3 pb-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = isActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                  active
                    ? 'border-neon-indigo/25 bg-neon-indigo/[0.12] text-white'
                    : 'border-white/[0.07] text-ink-400 hover:text-ink-100',
                )}
              >
                <Icon className={cn('h-3.5 w-3.5', active && 'text-neon-indigo')} aria-hidden />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
