/**
 * Sync engine — manages the local syncQueue and pushes changes to Supabase.
 * All operations degrade gracefully when supabase === null (local-only mode).
 */
import { db, type SyncOperation } from '@db/database'
import { supabase } from '@lib/supabase'
import { useAuthStore } from '@modules/auth/auth-store'
import type { WeighIn, Team } from '@models/tournament'

const MAX_RETRY_COUNT = 3

/** Conflict resolution: last-write-wins by updatedAt timestamp. */
export function resolveConflict<T extends { updatedAt: Date }>(
  local: T,
  remote: T
): T {
  const localTime = new Date(local.updatedAt).getTime()
  const remoteTime = new Date(remote.updatedAt).getTime()
  return remoteTime > localTime ? remote : local
}

/**
 * Enqueue a mutation for cloud sync.
 * - If cloud is not configured or user not signed in: stores in local syncQueue only.
 * - If online and signed in: attempts immediate Supabase upsert; falls back to queue on failure.
 */
export async function enqueueMutation(
  op: Omit<SyncOperation, 'id' | 'synced' | 'retryCount'>
): Promise<void> {
  const user = useAuthStore.getState().user

  if (!supabase || !user) {
    // Local-only: store in queue for later sync
    await db.syncQueue.add({ ...op, synced: false, retryCount: 0 })
    return
  }

  // Try immediate push
  try {
    await pushOperation(op)
    // Record as already synced
    await db.syncQueue.add({ ...op, synced: true, retryCount: 0 })
  } catch {
    // Fallback: store for retry
    await db.syncQueue.add({ ...op, synced: false, retryCount: 0 })
  }
}

/** Push all pending sync operations to Supabase in timestamp order. */
export async function flushSyncQueue(): Promise<void> {
  if (!supabase) return
  const user = useAuthStore.getState().user
  if (!user) return

  const pending = await db.syncQueue
    .where('synced')
    .equals(0) // Dexie stores booleans as 0/1 for indexed queries
    .toArray()

  // Sort by timestamp ascending (oldest first)
  pending.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  for (const op of pending) {
    if (op.retryCount >= MAX_RETRY_COUNT) continue

    try {
      await pushOperation(op)
      await db.syncQueue.update(op.id!, { synced: true })
    } catch {
      await db.syncQueue.update(op.id!, { retryCount: (op.retryCount ?? 0) + 1 })
    }
  }
}

/** Count pending (unsynced) operations. */
export async function getPendingCount(): Promise<number> {
  return db.syncQueue.where('synced').equals(0).count()
}

/** Get the timestamp of the last successful sync. */
export async function getLastSyncTime(): Promise<Date | null> {
  const last = await db.syncQueue
    .where('synced')
    .equals(1)
    .reverse()
    .sortBy('timestamp')
  return last.length > 0 ? new Date(last[0].timestamp) : null
}

/**
 * Subscribe to realtime changes for a tournament.
 * Returns an unsubscribe function.
 */
export function subscribeToTournament(
  tournamentId: string,
  handlers: {
    onWeighIn: (w: WeighIn) => void
    onTeam: (t: Team) => void
  }
): () => void {
  if (!supabase) return () => {}
  const client = supabase

  const channel = client
    .channel(`tournament-${tournamentId}`)
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
          handlers.onWeighIn(mapWeighInFromDb(payload.new))
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'teams',
        filter: `tournament_id=eq.${tournamentId}`
      },
      (payload) => {
        if (payload.new && Object.keys(payload.new).length > 0) {
          handlers.onTeam(mapTeamFromDb(payload.new))
        }
      }
    )
    .subscribe()

  return () => {
    client.removeChannel(channel)
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function pushOperation(
  op: Omit<SyncOperation, 'id' | 'synced' | 'retryCount'>
): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured')

  const table = entityTypeToTable(op.entityType)

  if (op.action === 'upsert') {
    const { error } = await supabase.from(table).upsert(mapPayloadToDb(op.entityType, op.payload as Record<string, unknown>))
    if (error) throw new Error(error.message)
  } else if (op.action === 'delete') {
    const { error } = await supabase.from(table).delete().eq('id', op.entityId)
    if (error) throw new Error(error.message)
  }
}

function entityTypeToTable(entityType: SyncOperation['entityType']): string {
  switch (entityType) {
    case 'tournament': return 'tournaments'
    case 'team': return 'teams'
    case 'weighIn': return 'weigh_ins'
  }
}

/** Convert camelCase app model to snake_case DB row. */
function mapPayloadToDb(
  entityType: SyncOperation['entityType'],
  payload: Record<string, unknown>
): Record<string, unknown> {
  if (entityType === 'weighIn') {
    return {
      id: payload.id,
      tournament_id: payload.tournamentId,
      team_id: payload.teamId,
      team_number: payload.teamNumber,
      day: payload.day,
      fish_count: payload.fishCount,
      raw_weight: payload.rawWeight,
      fish_released: payload.fishReleased,
      big_fish_weight: payload.bigFishWeight ?? null,
      received_by: payload.receivedBy,
      issued_by: payload.issuedBy,
      timestamp: payload.timestamp,
      updated_at: payload.updatedAt
    }
  }
  if (entityType === 'team') {
    return {
      id: payload.id,
      tournament_id: payload.tournamentId,
      team_number: payload.teamNumber,
      members: payload.members,
      status: payload.status,
      updated_at: payload.updatedAt
    }
  }
  if (entityType === 'tournament') {
    return {
      id: payload.id,
      name: payload.name,
      year: payload.year,
      location: payload.location,
      start_date: payload.startDate,
      end_date: payload.endDate,
      rules: payload.rules,
      public_slug: payload.publicSlug ?? null,
      updated_at: payload.updatedAt
    }
  }
  return payload
}

/** Convert snake_case DB row to camelCase WeighIn model. */
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

/** Convert snake_case DB row to camelCase Team model. */
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
