import type { SupabaseServerClient } from '@/lib/session'

/**
 * House points for one focus session.
 *
 * Must stay identical to `public.credit_house_points`' caller in
 * supabase/migrations/20261118120000_house_points_integrity.sql: the database
 * trigger credits `least(25, greatest(1, round(minutes / 5)))` per session.
 */
export function focusPoints(minutes: number): number {
  return Math.min(25, Math.max(1, Math.round(minutes / 5)))
}

/** Seed values from the core migration; used only if the table cannot be read. */
export const FALLBACK_HOUSES = ['Aurora', 'Nova', 'Vertex', 'Zenith'] as const

/**
 * Reads the canonical house names from the database so the UI never offers a
 * house that the profile FK would reject. Falls back to the seeded four when
 * the leaderboard table is unreachable or not migrated yet.
 */
export async function fetchHouseNames(supabase: SupabaseServerClient): Promise<string[]> {
  try {
    const { data } = await supabase
      .from('school_houses')
      .select('house_name')
      .order('house_name', { ascending: true })

    if (data && data.length > 0) {
      return data.map((house) => house.house_name)
    }
  } catch {
    // House lists are context, never a reason to block a page from rendering.
  }

  return [...FALLBACK_HOUSES]
}
