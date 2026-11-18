import type { ElementType, ReactNode } from 'react'

import { cn } from '@/lib/utils'

/**
 * Glow tones are semantic, not decorative:
 *   indigo  → focus / primary attention
 *   emerald → completion / earned win
 *   amber   → competitive status (leaderboard, house rank)
 */
type GlowTone = 'none' | 'indigo' | 'emerald' | 'amber'

export interface GlassCardProps {
  children: ReactNode
  className?: string
  /** Adds a hover lift/tint; use for anything clickable. */
  interactive?: boolean
  /** Colored hover glow. Defaults to a neutral effect. */
  glow?: GlowTone
  /**
   * Adds the top-left specular wash plus a stronger hover lift, for cards that
   * should read as physical glass rather than an outlined box.
   */
  specular?: boolean
  as?: Extract<ElementType, 'div' | 'section' | 'article' | 'aside' | 'li'>
}

const glowClasses: Record<GlowTone, string> = {
  none: 'hover:shadow-panel',
  indigo: 'hover:glow-indigo hover:border-neon-indigo/40',
  emerald: 'hover:glow-emerald hover:border-neon-emerald/40',
  amber: 'hover:glow-amber hover:border-neon-amber/40',
}

export default function GlassCard({
  children,
  className,
  interactive = false,
  glow = 'none',
  specular = false,
  as: Tag = 'div',
}: GlassCardProps) {
  return (
    <Tag
      className={cn(
        'glass-card relative overflow-hidden p-5 sm:p-6',
        interactive && 'glass-card-interactive cursor-pointer',
        specular && 'specular',
        glowClasses[glow],
        className,
      )}
    >
      {children}
    </Tag>
  )
}
