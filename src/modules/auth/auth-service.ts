/**
 * Auth service — thin wrapper around Supabase Auth.
 * All functions are no-ops when supabase === null (local-only mode).
 */
import { supabase } from '@lib/supabase'
import type { Session, User } from '@supabase/supabase-js'

export type { Session, User }

export async function getSession(): Promise<Session | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function signIn(
  email: string,
  password: string
): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Cloud sync not configured' }
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  return error ? { error: error.message } : {}
}

export async function signUp(
  email: string,
  password: string
): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Cloud sync not configured' }
  const { error } = await supabase.auth.signUp({ email, password })
  return error ? { error: error.message } : {}
}

export async function signOut(): Promise<void> {
  if (!supabase) return
  await supabase.auth.signOut()
}

/**
 * Subscribe to auth state changes.
 * Returns an unsubscribe function.
 */
export function onAuthChange(
  callback: (user: User | null, session: Session | null) => void
): () => void {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null, session)
  })
  return () => data.subscription.unsubscribe()
}
