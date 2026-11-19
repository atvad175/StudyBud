'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { AIUnavailableError, generateFlashcards } from '@/lib/ai'
import { currentStreak, todayKey } from '@/lib/dates'
import { hasSupabaseEnv, SUPABASE_SETUP_HINT } from '@/lib/env'
import { focusPoints } from '@/lib/houses'
import { createClient } from '@/lib/supabase/server'
import type { SupabaseServerClient } from '@/lib/session'
import type { ActionResult } from '@/lib/types'
import type { Flashcard, FlashcardPayload, HabitRow, Json } from '@/types/database'

// --------------------------------------------------------------------- schemas

const createHabitSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Give the habit a name.')
    .max(120, 'Keep habit names under 120 characters.'),
})

const toggleHabitSchema = z.object({
  habitId: z.string().uuid('That habit could not be found.'),
})

const logFocusSchema = z.object({
  minutes: z
    .number()
    .int('Focus time must be whole minutes.')
    .min(1, 'A focus session needs at least one minute.')
    .max(600, 'A single session cannot exceed 600 minutes.'),
  mode: z.enum(['pomodoro', 'deep']).optional(),
})

const generateFlashcardsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Name this deck.')
    .max(160, 'Deck titles must be 160 characters or fewer.'),
  content: z
    .string()
    .trim()
    .min(80, 'Paste at least a few sentences of notes so the AI has enough to work with.')
    .max(20000, 'Notes must be 20,000 characters or fewer.'),
})

export type CreateHabitInput = z.input<typeof createHabitSchema>
export type ToggleHabitInput = z.input<typeof toggleHabitSchema>
export type LogFocusSessionInput = z.input<typeof logFocusSchema>
export type GenerateFlashcardsInput = z.input<typeof generateFlashcardsSchema>

// --------------------------------------------------------------------- helpers

async function authenticated(): Promise<
  | { ok: true; supabase: SupabaseServerClient; userId: string }
  | { ok: false; error: string }
> {
  if (!hasSupabaseEnv()) {
    return { ok: false, error: SUPABASE_SETUP_HINT }
  }

  let supabase: SupabaseServerClient
  try {
    supabase = await createClient()
  } catch {
    return { ok: false, error: SUPABASE_SETUP_HINT }
  }
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return { ok: false, error: 'Your session expired. Sign in again to keep your progress.' }
  }

  return { ok: true, supabase, userId: user.id }
}

/**
 * Points are credited by database triggers, never by the client or by this
 * action. All this does is decide whether the student has a house at all, so
 * the UI can say either "+N house points" or nothing.
 *
 * The triggers attach the award to the row that was actually written, which is
 * why the old `award_house_points` RPC is revoked: calling it directly used to
 * let any signed-in user mint points for their own house.
 */
async function houseAward(
  supabase: SupabaseServerClient,
  userId: string,
  points: number,
): Promise<number | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('school_house')
    .eq('id', userId)
    .maybeSingle()

  // A missing house is expected for new students; never fail the save for it.
  if (error || !data?.school_house) return null
  return points
}

// --------------------------------------------------------------------- actions

export async function createHabit(input: CreateHabitInput): Promise<ActionResult<HabitRow>> {
  const parsed = createHabitSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'That habit is not valid.' }
  }

  const auth = await authenticated()
  if (!auth.ok) return { ok: false, error: auth.error }

  const { data, error } = await auth.supabase
    .from('habits')
    .insert({ user_id: auth.userId, title: parsed.data.title })
    .select('*')
    .single()

  if (error || !data) {
    return { ok: false, error: error?.message ?? 'Could not save that habit.' }
  }

  revalidatePath('/dashboard/habits')
  revalidatePath('/dashboard')

  return { ok: true, data }
}

export async function toggleHabit(input: ToggleHabitInput): Promise<
  ActionResult<{ habit: HabitRow; completedToday: boolean; housePoints: number | null }>
> {
  const parsed = toggleHabitSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'That habit is not valid.' }
  }

  const auth = await authenticated()
  if (!auth.ok) return { ok: false, error: auth.error }

  const { data: habit, error: readError } = await auth.supabase
    .from('habits')
    .select('*')
    .eq('id', parsed.data.habitId)
    .maybeSingle()

  if (readError || !habit) {
    return { ok: false, error: readError?.message ?? 'That habit no longer exists.' }
  }

  const today = todayKey()
  const completed = new Set(habit.completed_dates ?? [])
  const wasCompletedToday = completed.has(today)

  if (wasCompletedToday) {
    completed.delete(today)
  } else {
    completed.add(today)
  }

  const completedDates = [...completed].sort()
  const streak = currentStreak(completedDates, today)

  const { data: updated, error: writeError } = await auth.supabase
    .from('habits')
    .update({ completed_dates: completedDates, streak_count: streak })
    .eq('id', habit.id)
    .select('*')
    .single()

  if (writeError || !updated) {
    return { ok: false, error: writeError?.message ?? 'Could not update that habit.' }
  }

  // Only a fresh completion earns points; un-checking a day never subtracts.
  const housePoints = wasCompletedToday ? null : await houseAward(auth.supabase, auth.userId, 1)

  revalidatePath('/dashboard/habits')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/house-clash')

  return {
    ok: true,
    data: { habit: updated, completedToday: !wasCompletedToday, housePoints },
  }
}

export async function logFocusSession(
  input: LogFocusSessionInput,
): Promise<ActionResult<{ minutes: number; housePoints: number | null }>> {
  const parsed = logFocusSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'That session is not valid.' }
  }

  const auth = await authenticated()
  if (!auth.ok) return { ok: false, error: auth.error }

  const { minutes, mode } = parsed.data

  const { error } = await auth.supabase.from('focus_sessions').insert({
    user_id: auth.userId,
    duration_minutes: minutes,
    duration_seconds: minutes * 60,
    mode: mode ?? 'pomodoro',
    category: 'focus',
  })

  if (error) {
    return { ok: false, error: error.message }
  }

  const housePoints = await houseAward(auth.supabase, auth.userId, focusPoints(minutes))

  revalidatePath('/dashboard/focus')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/house-clash')

  return { ok: true, data: { minutes, housePoints } }
}

export async function generateAIFlashcards(input: GenerateFlashcardsInput): Promise<
  ActionResult<{ materialId: string; cards: Flashcard[]; model: string }>
> {
  const parsed = generateFlashcardsSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Those notes are not valid.' }
  }

  const auth = await authenticated()
  if (!auth.ok) return { ok: false, error: auth.error }

  let deck: { cards: Flashcard[]; model: string }
  try {
    deck = await generateFlashcards({ title: parsed.data.title, content: parsed.data.content })
  } catch (error) {
    if (error instanceof AIUnavailableError) {
      return { ok: false, error: error.message }
    }
    console.error('[studybud] Unexpected flashcard failure:', error)
    return { ok: false, error: 'Flashcard generation failed unexpectedly. Please try again.' }
  }

  const summary: FlashcardPayload = {
    cards: deck.cards,
    model: deck.model,
    generated_at: new Date().toISOString(),
  }

  const { data, error } = await auth.supabase
    .from('study_materials')
    .insert({
      user_id: auth.userId,
      title: parsed.data.title,
      content: parsed.data.content,
      ai_summary: summary as unknown as Json,
    })
    .select('id')
    .single()

  if (error || !data) {
    return {
      ok: false,
      error: `Your cards were generated but could not be saved: ${error?.message ?? 'unknown error'}`,
    }
  }

  revalidatePath('/dashboard/study')
  revalidatePath('/dashboard')

  return { ok: true, data: { materialId: data.id, cards: deck.cards, model: deck.model } }
}
