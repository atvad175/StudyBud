'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getSupabaseEnv, hasSupabaseEnv, SUPABASE_SETUP_HINT } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'
import type { SupabaseServerClient } from '@/lib/session'
import type { ActionResult } from '@/lib/types'

/** Shown when the request never reaches Supabase at all (offline, bad URL, DNS). */
const REACHABILITY_HINT =
  'We could not reach the StudyBud server just now. Check your connection and try again in a moment.'

/**
 * Supabase surfaces transport failures as raw text such as "fetch failed",
 * which means nothing to a student. Anything that looks like a network problem
 * becomes one plain sentence; real auth messages (wrong password, unconfirmed
 * email) are passed through untouched.
 */
function friendlyAuthError(message: string): string {
  const text = message.toLowerCase()
  const looksLikeTransport = [
    'fetch failed',
    'failed to fetch',
    'network',
    'timeout',
    'timed out',
    'econnrefused',
    'enotfound',
  ].some((fragment) => text.includes(fragment))

  return looksLikeTransport ? REACHABILITY_HINT : message
}

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

  if (!hasSupabaseEnv()) {
    return { ok: false, error: SUPABASE_SETUP_HINT }
  }

  // A malformed URL would throw before Supabase can answer; report it instead.
  try {
    getSupabaseEnv()
  } catch {
    return { ok: false, error: SUPABASE_SETUP_HINT }
  }

  let supabase: SupabaseServerClient
  try {
    supabase = await createClient()
  } catch {
    return { ok: false, error: SUPABASE_SETUP_HINT }
  }

  const { data, error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    return { ok: false, error: friendlyAuthError(error.message) }
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

  if (!hasSupabaseEnv()) {
    return { ok: false, error: SUPABASE_SETUP_HINT }
  }

  const headerStore = await headers()
  const origin =
    headerStore.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  let supabase: SupabaseServerClient
  try {
    supabase = await createClient()
  } catch {
    return { ok: false, error: SUPABASE_SETUP_HINT }
  }

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
    return { ok: false, error: friendlyAuthError(error.message) }
  }

  revalidatePath('/', 'layout')

  return { ok: true, data: { requiresConfirmation: !data.session } }
}

const emailOnlySchema = z.object({ email: emailSchema })

const newPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Use at least 8 characters.')
    .max(72, 'Passwords must be 72 characters or fewer.'),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password.'),
  newPassword: newPasswordSchema.shape.password,
})

export type RequestPasswordResetInput = z.input<typeof emailOnlySchema>
export type NewPasswordInput = z.input<typeof newPasswordSchema>
export type ChangePasswordInput = z.input<typeof changePasswordSchema>

/**
 * Sends a password-reset link. The reply is deliberately identical whether or
 * not the address has an account, so this form cannot be used to discover who
 * studies here.
 */
export async function requestPasswordReset(
  input: RequestPasswordResetInput,
): Promise<ActionResult<{ sent: true }>> {
  const parsed = emailOnlySchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Enter a valid email address.' }
  }

  if (!hasSupabaseEnv()) {
    return { ok: false, error: SUPABASE_SETUP_HINT }
  }

  const headerStore = await headers()
  const origin =
    headerStore.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  let supabase: SupabaseServerClient
  try {
    supabase = await createClient()
  } catch {
    return { ok: false, error: SUPABASE_SETUP_HINT }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  })

  // Rate limiting is the one failure worth telling the student about: silently
  // pretending we sent another email would leave them waiting for nothing.
  if (error && error.message.toLowerCase().includes('rate')) {
    return {
      ok: false,
      error: 'A reset email was just sent. Wait a minute before requesting another one.',
    }
  }

  return { ok: true, data: { sent: true } }
}

/**
 * Sets a new password for the signed-in user. The reset email signs the student
 * in through `/auth/callback`, so by the time this runs there is a real session.
 */
export async function setNewPassword(input: NewPasswordInput): Promise<ActionResult<{ updated: true }>> {
  const parsed = newPasswordSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Choose a stronger password.' }
  }

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
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      ok: false,
      error: 'That reset link has expired. Request a new one from the sign-in page.',
    }
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })

  if (error) {
    return { ok: false, error: friendlyAuthError(error.message) }
  }

  revalidatePath('/', 'layout')

  return { ok: true, data: { updated: true } }
}

/**
 * Changes the password of the signed-in student after re-checking the current
 * one, so a borrowed laptop cannot be used to lock the owner out.
 */
export async function changePassword(
  input: ChangePasswordInput,
): Promise<ActionResult<{ updated: true }>> {
  const parsed = changePasswordSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Check both password fields.' }
  }

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
  } = await supabase.auth.getUser()

  if (!user?.email) {
    return { ok: false, error: 'Your session expired. Sign in again to change your password.' }
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.currentPassword,
  })

  if (verifyError) {
    return { ok: false, error: 'That is not your current password.' }
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.newPassword })

  if (error) {
    return { ok: false, error: friendlyAuthError(error.message) }
  }

  return { ok: true, data: { updated: true } }
}

export async function signOut(): Promise<void> {
  if (!hasSupabaseEnv()) {
    redirect('/login')
  }

  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
