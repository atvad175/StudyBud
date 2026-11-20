'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { hasSupabaseEnv, SUPABASE_SETUP_HINT } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'
import { ensureProfile } from '@/lib/session'
import type { ActionResult } from '@/lib/types'

const gradeSectionSchema = z.object({
  gradeSection: z.string().trim().max(60, 'Keep this under 60 characters.'),
})

const joinHouseSchema = z.object({
  house: z.string().trim().min(1, 'Pick a house first.').max(60),
})

export type JoinHouseInput = z.input<typeof joinHouseSchema>

/**
 * Lets a student correct the grade or section on their own profile.
 *
 * Every school names these differently, and a typo at sign-up should not be
 * permanent, so this stays editable. It only ever writes the caller's row, and
 * never touches `school_house` (which the database locks after selection).
 */
export async function updateGradeSection(formData: FormData): Promise<void> {
  if (!hasSupabaseEnv()) redirect('/login?error=unconfigured')

  const parsed = gradeSectionSchema.safeParse({
    gradeSection: String(formData.get('grade_section') ?? ''),
  })

  if (!parsed.success) redirect('/dashboard/profile?grade=invalid')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { error } = await supabase
    .from('profiles')
    .update({ grade_section: parsed.data.gradeSection || null })
    .eq('id', user.id)

  revalidatePath('/dashboard/profile')
  revalidatePath('/dashboard', 'layout')

  redirect(error ? '/dashboard/profile?grade=failed' : '/dashboard/profile?grade=saved')
}

/**
 * Assigns the caller to a school house exactly once.
 *
 * House membership decides who a student's points count for, so it is one-way:
 * the UI, the `school_house is null` predicate here, and the database trigger
 * from 20261118090000_house_selection_guard.sql all enforce the same rule.
 */
export async function joinHouse(
  input: JoinHouseInput,
): Promise<ActionResult<{ house: string }>> {
  const parsed = joinHouseSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Pick a house first.' }
  }

  if (!hasSupabaseEnv()) {
    return { ok: false, error: SUPABASE_SETUP_HINT }
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { ok: false, error: 'Your session expired. Sign in again to choose a house.' }
  }

  // Guarantees a profiles row exists for accounts whose signup trigger never ran.
  let profile
  try {
    profile = await ensureProfile(supabase, user)
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : 'Your profile could not be loaded. Try again.',
    }
  }

  if (profile.school_house) {
    return {
      ok: false,
      error: `You are already in ${profile.school_house} House. Houses are locked once joined.`,
    }
  }

  const { data: houses, error: houseError } = await supabase
    .from('school_houses')
    .select('house_name')

  if (houseError) {
    return { ok: false, error: 'Houses could not be loaded right now. Try again in a moment.' }
  }

  const match = (houses ?? []).find(
    (house) => house.house_name.toLowerCase() === parsed.data.house.toLowerCase(),
  )

  if (!match) {
    return { ok: false, error: 'That school house does not exist. Pick one from the list.' }
  }

  const { data: updated, error: writeError } = await supabase
    .from('profiles')
    .update({ school_house: match.house_name })
    .eq('id', user.id)
    .is('school_house', null)
    .select('school_house')
    .maybeSingle()

  if (writeError) {
    // check_violation comes from the one-way guard trigger, not from validation.
    if (writeError.code === '23514' || writeError.message.includes('House already assigned')) {
      return {
        ok: false,
        error: 'Your house is already locked in. Ask a teacher if it needs correcting.',
      }
    }

    return { ok: false, error: writeError.message }
  }

  if (!updated) {
    const { data: current } = await supabase
      .from('profiles')
      .select('school_house')
      .eq('id', user.id)
      .maybeSingle()

    return {
      ok: false,
      error: current?.school_house
        ? `You are already in ${current.school_house} House. Houses are locked once joined.`
        : 'Your profile could not be updated. Refresh the page and try again.',
    }
  }

  revalidatePath('/dashboard', 'layout')
  revalidatePath('/dashboard/profile')
  revalidatePath('/dashboard/house-clash')

  return { ok: true, data: { house: updated.school_house ?? match.house_name } }
}
