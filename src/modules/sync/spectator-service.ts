/**
 * Spectator service — fetch tournament data by public slug (no auth required).
 * Uses Supabase public RLS policies.
 */
import { supabase } from '@lib/supabase'
import type { Tournament, Team, WeighIn } from '@models/tournament'

export interface SpectatorData {
  tournament: Tournament
  teams: Team[]
  weighIns: WeighIn[]
}

/** Fetch all data for a tournament by its public slug. Returns null if not found. */
export async function fetchBySlug(slug: string): Promise<SpectatorData | null> {
  if (!supabase) return null

  // Fetch tournament
  const { data: tRow, error: tErr } = await supabase
    .from('tournaments')
    .select('*')
    .eq('public_slug', slug)
    .single()

  if (tErr || !tRow) return null

  const tournament = mapTournamentFromDb(tRow)

  // Fetch teams and weigh-ins in parallel
  const [teamsResult, weighInsResult] = await Promise.all([
    supabase.from('teams').select('*').eq('tournament_id', tournament.id),
    supabase.from('weigh_ins').select('*').eq('tournament_id', tournament.id)
  ])

  const teams: Team[] = (teamsResult.data ?? []).map(mapTeamFromDb)
  const weighIns: WeighIn[] = (weighInsResult.data ?? []).map(mapWeighInFromDb)

  return { tournament, teams, weighIns }
}

/**
 * Subscribe to realtime weigh-in updates for a spectator view.
 * Returns an unsubscribe function.
 */
export function subscribeToWeighIns(
  tournamentId: string,
  onWeighIn: (w: WeighIn) => void
): () => void {
  if (!supabase) return () => {}
  const client = supabase

  const channel = client
    .channel(`spectator-${tournamentId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'weigh_ins',
        filter: `tournament_id=eq.${tournamentId}`
      },
      (payload) => {
        if (payload.new && Object.keys(payload.new).length > 0) {
          onWeighIn(mapWeighInFromDb(payload.new as Record<string, unknown>))
        }
      }
    )
    .subscribe()

  return () => {
    client.removeChannel(channel)
  }
}

/**
 * Generate a public slug for a tournament.
 * Format: {year}-{name-slug}-{6 random hex chars}
 */
export function generatePublicSlug(year: number, name: string): string {
  const nameSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 20)
  const hex = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, '0')
  return `${year}-${nameSlug}-${hex}`
}

/**
 * Save a public slug to a tournament in Supabase.
 * Requires the calling user to be the tournament owner.
 */
export async function setPublicSlug(
  tournamentId: string,
  slug: string
): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Cloud sync not configured' }
  const { error } = await supabase
    .from('tournaments')
    .update({ public_slug: slug, updated_at: new Date().toISOString() })
    .eq('id', tournamentId)
  return error ? { error: error.message } : {}
}

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function mapTournamentFromDb(row: Record<string, unknown>): Tournament {
  return {
    id: row.id as string,
    name: row.name as string,
    year: row.year as number,
    location: row.location as string,
    startDate: new Date(row.start_date as string),
    endDate: new Date(row.end_date as string),
    rules: row.rules as Tournament['rules'],
    publicSlug: row.public_slug as string | undefined,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string)
  }
}

function mapTeamFromDb(row: Record<string, unknown>): Team {
  return {
    id: row.id as string,
    tournamentId: row.tournament_id as string,
    teamNumber: row.team_number as number,
    members: row.members as Team['members'],
    status: row.status as Team['status'],
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string)
  }
}

function mapWeighInFromDb(row: Record<string, unknown>): WeighIn {
  return {
    id: row.id as string,
    tournamentId: row.tournament_id as string,
    teamId: row.team_id as string,
    teamNumber: row.team_number as number,
    day: row.day as 1 | 2,
    fishCount: row.fish_count as number,
    rawWeight: row.raw_weight as number,
    fishReleased: row.fish_released as number,
    bigFishWeight: row.big_fish_weight as number | undefined,
    receivedBy: row.received_by as string,
    issuedBy: row.issued_by as string,
    timestamp: new Date(row.timestamp as string),
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string)
  }
}
