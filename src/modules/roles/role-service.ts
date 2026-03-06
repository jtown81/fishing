/**
 * Role service — fetches and manages tournament_members via Supabase.
 * All functions are no-ops / return null when supabase === null.
 */
import { supabase } from '@lib/supabase'
import type { Session } from '@supabase/supabase-js'

export type TournamentRole = 'owner' | 'operator' | 'viewer'

export interface TournamentMember {
  id: string
  tournamentId: string
  userId: string
  role: TournamentRole
  invitedBy?: string
  invitedAt: Date
  acceptedAt?: Date
  email?: string // Joined from auth.users for display
}

export async function fetchTournamentMembers(
  _session: Session | null,
  tournamentId: string
): Promise<TournamentMember[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('tournament_members')
    .select('*')
    .eq('tournament_id', tournamentId)

  if (error || !data) return []

  return data.map((row) => ({
    id: row.id,
    tournamentId: row.tournament_id,
    userId: row.user_id,
    role: row.role as TournamentRole,
    invitedBy: row.invited_by ?? undefined,
    invitedAt: new Date(row.invited_at),
    acceptedAt: row.accepted_at ? new Date(row.accepted_at) : undefined
  }))
}

export async function inviteMember(
  session: Session | null,
  tournamentId: string,
  email: string,
  role: 'operator' | 'viewer'
): Promise<{ error?: string }> {
  if (!supabase || !session) return { error: 'Not signed in' }

  const supabaseUrl = (supabase as unknown as { supabaseUrl: string }).supabaseUrl
  const response = await fetch(`${supabaseUrl}/functions/v1/invite-member`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`
    },
    body: JSON.stringify({ tournamentId, email, role })
  })

  const json = await response.json()
  if (!response.ok) return { error: json.error ?? 'Invite failed' }
  return {}
}

export async function removeMember(
  _session: Session | null,
  tournamentId: string,
  userId: string
): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Not configured' }

  const { error } = await supabase
    .from('tournament_members')
    .delete()
    .eq('tournament_id', tournamentId)
    .eq('user_id', userId)

  return error ? { error: error.message } : {}
}

export async function getCurrentRole(
  _session: Session | null,
  tournamentId: string,
  userId: string
): Promise<TournamentRole | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('tournament_members')
    .select('role')
    .eq('tournament_id', tournamentId)
    .eq('user_id', userId)
    .single()

  if (error || !data) return null
  return data.role as TournamentRole
}
