'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'
import type { SupabaseServerClient } from '@/lib/session'
import type { ActionResult } from '@/lib/types'

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Enter a valid email address.')

const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password.'),
})

const signUpSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(8, 'Use at least 8 characters.')
    .max(72, 'Passwords must be 72 characters or fewer.'),
  username: z
    .string()
    .trim()
    .min(2, 'Usernames need at least 2 characters.')
    .max(30, 'Usernames must be 30 characters or fewer.')
    .regex(/^[a-zA-Z0-9 ._-]+$/, 'Use letters, numbers, spaces, dots, dashes or underscores.'),
  schoolHouse: z.string().trim().max(60).optional(),
  gradeSection: z.string().trim().max(60).optional(),
})

export type SignInInput = z.input<typeof signInSchema>
export type SignUpInput = z.input<typeof signUpSchema>

/**
 * Resolves a requested house against the real `school_houses` table so signup
 * can never create a profile pointing at a house that does not exist.
 *
 * If the table cannot be read (schema not migrated yet) the house is dropped
 * rather than guessed: the student simply picks one from their profile later.
 */
async function resolveSchoolHouse(
  supabase: SupabaseServerClient,
  requested: string | undefined,
): Promise<{ ok: true; house: string | null } | { ok: false; error: string }> {
  const wanted = requested?.trim()
  if (!wanted) return { ok: true, house: null }

  const { data, error } = await supabase.from('school_houses').select('house_name')

  if (error) return { ok: true, house: null }

  const match = (data ?? []).find(
    (house) => house.house_name.toLowerCase() === wanted.toLowerCase(),
  )

  if (!match) {
    return {
      ok: false,
      error: 'That school house does not exist. Pick one from the list, or choose nothing and join later from your profile.',
    }
  }

  return { ok: true, house: match.house_name }
}

export async function signIn(
  input: SignInInput,
): Promise<ActionResult<{ requiresConfirmation: boolean }>> {
  const parsed = signInSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Check your sign-in details.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath('/', 'layout')

  return { ok: true, data: { requiresConfirmation: !data.session } }
}

export async function signUp(
  input: SignUpInput,
): Promise<ActionResult<{ requiresConfirmation: boolean }>> {
  const parsed = signUpSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Check your account details.' }
  }

  const headerStore = await headers()
  const origin =
    headerStore.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const supabase = await createClient()
  const house = await resolveSchoolHouse(supabase, parsed.data.schoolHouse)
  if (!house.ok) {
    return { ok: false, error: house.error }
  }

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        username: parsed.data.username,
        school_house: house.house,
        grade_section: parsed.data.gradeSection ?? null,
      },
    },
  })

  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath('/', 'layout')

  return { ok: true, data: { requiresConfirmation: !data.session } }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
