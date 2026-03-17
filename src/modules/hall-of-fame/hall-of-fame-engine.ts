/**
 * Hall of Fame Engine
 * Pure functions to compute all-time records from tournament history
 */

import { WeighIn, Tournament } from '@models/tournament'

export type RecordCategory = 'biggestFish' | 'bestTeamTotal' | 'mostConsistent' | 'mostImproved' | 'highestRelease'
export type TierLevel = 'bronze' | 'silver' | 'gold' | 'legendary'

export interface AllTimeRecord {
  category: RecordCategory
  value: number
  teamNumber: number
  memberNames: string[]
  tournamentName: string
  tournamentYear: number
  tier: TierLevel
  date?: Date
}

/**
 * Determine tier based on percentile rank
 */
export function getTier(percentileRank: number): TierLevel {
  if (percentileRank >= 90) return 'legendary'
  if (percentileRank >= 75) return 'gold'
  if (percentileRank >= 50) return 'silver'
  return 'bronze'
}

/**
 * Compute percentile rank (0-100)
 */
export function getPercentileRank(value: number, allValues: number[]): number {
  const sorted = [...allValues].sort((a, b) => b - a)
  const rank = sorted.indexOf(value)
  if (rank === -1) return 0
  return Math.round(((sorted.length - rank - 1) / (sorted.length - 1)) * 100)
}

/**
 * Find biggest single fish caught across all tournaments
 */
export function computeBiggestFish(tournaments: Tournament[], weighIns: WeighIn[]): AllTimeRecord[] {
  if (!tournaments.length || !weighIns.length) return []

  // Find the max individual fish weight or big fish weight
  const maxFish = Math.max(...weighIns.map(w => Math.max(w.rawWeight || 0, w.bigFishWeight || 0)))
  if (maxFish === 0) return []

  const record = weighIns.find(w => w.bigFishWeight === maxFish || w.rawWeight === maxFish)
  if (!record) return []

  const tournament = tournaments.find(t => t.id === record.tournamentId)
  if (!tournament) return []

  // All fish records for percentile calculation
  const allFish = weighIns.map(w => Math.max(w.rawWeight || 0, w.bigFishWeight || 0)).filter(w => w > 0)
  const percentile = getPercentileRank(maxFish, allFish)
  const tier = getTier(percentile)

  return [
    {
      category: 'biggestFish',
      value: maxFish,
      teamNumber: record.teamNumber,
      memberNames: [], // Would be populated with actual team member names
      tournamentName: tournament.name,
      tournamentYear: tournament.year,
      tier,
      date: record.createdAt
    }
  ]
}

/**
 * Find best team total across all tournaments
 * Day total = raw_weight + (fish_released * 0.20)
 */
export function computeBestTeamTotal(
  tournaments: Tournament[],
  weighIns: WeighIn[]
): AllTimeRecord[] {
  if (!tournaments.length || !weighIns.length) return []

  const teamTotals = new Map<string, { total: number; tournamentId: string; teamNumber: number }>()

  // Group by tournament and team, sum each day
  weighIns.forEach(w => {
    const dayTotal = (w.rawWeight || 0) + ((w.fishReleased || 0) * 0.2)
    const key = `${w.tournamentId}-${w.teamNumber}`
    const current = teamTotals.get(key)

    if (current) {
      teamTotals.set(key, {
        ...current,
        total: current.total + dayTotal
      })
    } else {
      teamTotals.set(key, {
        total: dayTotal,
        tournamentId: w.tournamentId,
        teamNumber: w.teamNumber
      })
    }
  })

  if (teamTotals.size === 0) return []

  // Find max total
  let maxEntry: { total: number; tournamentId: string; teamNumber: number } | null = null
  for (const entry of teamTotals.values()) {
    if (!maxEntry || entry.total > maxEntry.total) {
      maxEntry = entry
    }
  }

  if (!maxEntry) return []

  const tournament = tournaments.find(t => t.id === maxEntry.tournamentId)
  if (!tournament) return []

  // Percentile calculation
  const allTotals = Array.from(teamTotals.values()).map(e => e.total)
  const percentile = getPercentileRank(maxEntry.total, allTotals)
  const tier = getTier(percentile)

  return [
    {
      category: 'bestTeamTotal',
      value: maxEntry.total,
      teamNumber: maxEntry.teamNumber,
      memberNames: [],
      tournamentName: tournament.name,
      tournamentYear: tournament.year,
      tier
    }
  ]
}

/**
 * Find most consistent team (lowest standard deviation)
 */
export function computeMostConsistent(
  tournaments: Tournament[],
  weighIns: WeighIn[]
): AllTimeRecord[] {
  if (!tournaments.length || !weighIns.length) return []

  const teamTotals = new Map<string, { values: number[]; tournamentId: string; teamNumber: number }>()

  // Collect day totals per team
  weighIns.forEach(w => {
    const dayTotal = (w.rawWeight || 0) + ((w.fishReleased || 0) * 0.2)
    const key = `${w.tournamentId}-${w.teamNumber}`
    const current = teamTotals.get(key)

    if (current) {
      teamTotals.set(key, {
        ...current,
        values: [...current.values, dayTotal]
      })
    } else {
      teamTotals.set(key, {
        values: [dayTotal],
        tournamentId: w.tournamentId,
        teamNumber: w.teamNumber
      })
    }
  })

  if (teamTotals.size === 0) return []

  // Calculate stdev for each team (lower is better)
  let minStdev = Infinity
  let minEntry: { values: number[]; tournamentId: string; teamNumber: number } | null = null

  for (const entry of teamTotals.values()) {
    if (entry.values.length < 2) continue

    const mean = entry.values.reduce((a, b) => a + b, 0) / entry.values.length
    const stdev = Math.sqrt(entry.values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / entry.values.length)

    if (stdev < minStdev) {
      minStdev = stdev
      minEntry = entry
    }
  }

  if (!minEntry) return []

  const tournament = tournaments.find(t => t.id === minEntry.tournamentId)
  if (!tournament) return []

  // Tier based on stdev (lower stdev = better consistency)
  const allStdevs = Array.from(teamTotals.values()).map(entry => {
    if (entry.values.length < 2) return Infinity
    const mean = entry.values.reduce((a, b) => a + b, 0) / entry.values.length
    return Math.sqrt(entry.values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / entry.values.length)
  }).filter(s => isFinite(s))

  const percentile = 100 - getPercentileRank(minStdev, allStdevs)
  const tier = getTier(Math.max(0, percentile))

  return [
    {
      category: 'mostConsistent',
      value: minStdev,
      teamNumber: minEntry.teamNumber,
      memberNames: [],
      tournamentName: tournament.name,
      tournamentYear: tournament.year,
      tier
    }
  ]
}

/**
 * Compute all hall of fame records
 */
export function computeHallOfFame(tournaments: Tournament[], weighIns: WeighIn[]): AllTimeRecord[] {
  const records: AllTimeRecord[] = []

  records.push(...computeBiggestFish(tournaments, weighIns))
  records.push(...computeBestTeamTotal(tournaments, weighIns))
  records.push(...computeMostConsistent(tournaments, weighIns))

  return records
}
