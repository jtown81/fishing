/**
 * Angler service — pure IndexedDB functions for angler profiles.
 */
import { db } from '@db/database'
import type { Angler, AnglerAppearance, WeighIn } from '@models/tournament'
import type { TeamStanding } from '@models/tournament'

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export async function getAllAnglers(): Promise<Angler[]> {
  return db.anglers.toArray()
}

export async function createAngler(
  data: Omit<Angler, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Angler> {
  const now = new Date()
  const angler: Angler = {
    id: `angler-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...data,
    createdAt: now,
    updatedAt: now
  }
  await db.anglers.add(angler)
  return angler
}

export async function updateAngler(angler: Angler): Promise<void> {
  await db.anglers.put({ ...angler, updatedAt: new Date() })
}

export async function deleteAngler(id: string): Promise<void> {
  // Cascade to appearances
  await db.anglerAppearances.where('anglerId').equals(id).delete()
  await db.anglers.delete(id)
}

// ---------------------------------------------------------------------------
// Linking
// ---------------------------------------------------------------------------

export async function linkAnglerToTeam(
  anglerId: string,
  tournamentId: string,
  teamId: string,
  teamNumber: number
): Promise<AnglerAppearance> {
  // Remove any existing link for this angler in this tournament (one link per tournament per angler)
  await db.anglerAppearances
    .where('[anglerId+tournamentId]')
    .equals([anglerId, tournamentId])
    .delete()

  const appearance: AnglerAppearance = {
    id: `appearance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    anglerId,
    tournamentId,
    teamId,
    teamNumber,
    createdAt: new Date()
  }
  await db.anglerAppearances.add(appearance)
  return appearance
}

export async function unlinkAppearance(appearanceId: string): Promise<void> {
  await db.anglerAppearances.delete(appearanceId)
}

export async function getAnglerHistory(anglerId: string): Promise<AnglerAppearance[]> {
  return db.anglerAppearances.where('anglerId').equals(anglerId).toArray()
}

export async function getAppearancesForTeam(teamId: string): Promise<AnglerAppearance[]> {
  return db.anglerAppearances.where('teamId').equals(teamId).toArray()
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export interface AnglerStats {
  tournaments: number
  grandTotals: number[]
  bestGrandTotal: number
  avgGrandTotal: number
  bestRank: number | null
  avgRank: number | null
}

export function computeAnglerStats(
  appearances: AnglerAppearance[],
  weighIns: WeighIn[],
  standings: TeamStanding[]
): AnglerStats {
  if (appearances.length === 0) {
    return {
      tournaments: 0,
      grandTotals: [],
      bestGrandTotal: 0,
      avgGrandTotal: 0,
      bestRank: null,
      avgRank: null
    }
  }

  const teamIds = new Set(appearances.map((a) => a.teamId))

  const grandTotals = standings
    .filter((s) => teamIds.has(s.teamId))
    .map((s) => s.grandTotal)
    .filter((w) => w > 0)

  const ranks = standings
    .filter((s) => teamIds.has(s.teamId))
    .map((s) => s.rank)

  // Also try to compute from weighIns if standings are not available
  if (grandTotals.length === 0) {
    const teamWeighIns = weighIns.filter((w) => teamIds.has(w.teamId))
    if (teamWeighIns.length > 0) {
      const byTeam = new Map<string, number>()
      for (const w of teamWeighIns) {
        byTeam.set(w.teamId, (byTeam.get(w.teamId) ?? 0) + w.rawWeight + w.fishReleased * 0.2)
      }
      grandTotals.push(...byTeam.values())
    }
  }

  const bestGrandTotal = grandTotals.length > 0 ? Math.max(...grandTotals) : 0
  const avgGrandTotal = grandTotals.length > 0
    ? grandTotals.reduce((a, b) => a + b, 0) / grandTotals.length
    : 0
  const bestRank = ranks.length > 0 ? Math.min(...ranks) : null
  const avgRank = ranks.length > 0
    ? Math.round(ranks.reduce((a, b) => a + b, 0) / ranks.length)
    : null

  return {
    tournaments: appearances.length,
    grandTotals,
    bestGrandTotal,
    avgGrandTotal,
    bestRank,
    avgRank
  }
}
