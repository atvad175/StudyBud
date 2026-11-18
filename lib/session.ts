import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

import { createClient } from '@/lib/supabase/server'
import type { ProfileRow } from '@/types/database'

export type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

/** Sends unauthenticated visitors to the login screen. */
export async function requireUser(): Promise<{
  supabase: SupabaseServerClient
  user: User
}> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return { supabase, user }
}

/**
 * Loads the caller's profile, creating a minimal row if the auth trigger has
 * not run for this account yet.
 */
export async function ensureProfile(
  supabase: SupabaseServerClient,
  user: User,
): Promise<ProfileRow> {
  const { data: existing, error: readError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (readError) {
    throw new Error(`Could not load your StudyBud profile: ${readError.message}`)
  }

  if (existing) return existing

  const fallbackUsername =
    (user.user_metadata?.username as string | undefined)?.trim() ||
    user.email?.split('@')[0] ||
    'student'

  const { data: created, error: writeError } = await supabase
    .from('profiles')
    .insert({ id: user.id, username: fallbackUsername })
    .select('*')
    .single()

  if (writeError || !created) {
    throw new Error(
      `Could not create your StudyBud profile: ${writeError?.message ?? 'unknown error'}`,
    )
  }

  return created
}
