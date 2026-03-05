/**
 * Tournament Statistics Engine
 *
 * Computes all tournament statistics including:
 * - Core stats from XLSM (averages, std dev, big fish, totals)
 * - Enhanced stats (CPUE, release rate, weight distribution)
 * - Most Improved rankings (day 1 vs day 2 rank change)
 * - Calcutta scoring
 *
 * Source: roadmap.md §5.1 & §5.2
 */

import type { WeighIn, TeamStanding } from '@models/tournament'

/**
 * Core tournament statistics matching XLSM Stats sheet
 */
export interface CoreStats {
  // Weight statistics
  avgDay1Weight: number
  avgDay2Weight: number
  day1StdDev: number
  day2StdDev: number

  // Big fish records
  bigFishDay1: number | null
  bigFishDay2: number | null
  avgBigFish: number
  bigFishStdDev: number

  // Totals
  totalFishCaught: number
  totalFishReleased: number
  totalTeams: number
  teamsWithFish: number
}

/**
 * Enhanced statistics for analysis and reporting
 */
export interface EnhancedStats extends CoreStats {
  // Catch rate & effort
  catchPerTeam: number // Average fish per team
  releaseRate: number // Percentage of fish released
  catchPerUnitEffort: number // Fish per team actually fishing

  // Weight distribution
  medianDay1Weight: number
  medianDay2Weight: number
  minDay1Weight: number
  maxDay1Weight: number
  minDay2Weight: number
  maxDay2Weight: number

  // Competition balance
  topTeamDominance: number // How much first place exceeds median

  // Engagement
  dnfRate: number // Teams that didn't fish / registered
  day2Retention: number // Teams fishing both days / teams fishing day 1
}

/**
 * Weight distribution bucket for histogram visualization
 */
export interface WeightBucket {
  min: number
  max: number
  count: number
  percentage: number
}

/**
 * Most Improved result with day 1 & 2 ranks
 */
export interface MostImprovedTeam extends TeamStanding {
  day1Rank: number
  day2Rank: number
  rankImprovement: number // positive = improved, negative = declined
}

/**
 * Calculate average of numeric array (ignoring zeros for certain stats)
 */
function calculateMean(values: number[], ignoreZero = false): number {
  if (values.length === 0) return 0
  const filtered = ignoreZero ? values.filter(v => v > 0) : values
  if (filtered.length === 0) return 0
  return filtered.reduce((a, b) => a + b, 0) / filtered.length
}

/**
 * Calculate population standard deviation
 * STDEV.P in Excel
 */
export function calculateStdDev(values: number[], ignoreZero = false): number {
  if (values.length === 0) return 0
  const filtered = ignoreZero ? values.filter(v => v > 0) : values
  if (filtered.length === 0) return 0

  const mean = filtered.reduce((a, b) => a + b, 0) / filtered.length
  const squaredDiffs = filtered.map(v => Math.pow(v - mean, 2))
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / filtered.length

  return Math.sqrt(variance)
}

/**
 * Calculate median of numeric array
 */
function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

/**
 * Compute core tournament statistics
 * Matches XLSM Stats sheet formulas
 */
export function computeCoreStats(
  weighIns: WeighIn[],
  standings: TeamStanding[]
): CoreStats {
  // Separate weigh-ins by day
  const day1WeighIns = weighIns.filter(w => w.day === 1)
  const day2WeighIns = weighIns.filter(w => w.day === 2)

  // Extract weights (ignoring zero weights)
  const day1Weights = day1WeighIns.map(w => w.rawWeight)
  const day2Weights = day2WeighIns.map(w => w.rawWeight)

  // Extract all big fish
  const allBigFish = weighIns
    .filter(w => w.bigFishWeight && w.bigFishWeight > 0)
    .map(w => w.bigFishWeight!)

  // Count teams that caught fish
  const teamsWithFish = new Set(
    weighIns
      .filter(w => w.fishCount > 0)
      .map(w => w.teamId)
  ).size

  return {
    avgDay1Weight: calculateMean(day1Weights, true),
    avgDay2Weight: calculateMean(day2Weights, true),
    day1StdDev: calculateStdDev(day1Weights, true),
    day2StdDev: calculateStdDev(day2Weights, true),

    bigFishDay1: day1WeighIns.reduce((max, w) =>
      Math.max(max, w.bigFishWeight || 0), 0) || null,
    bigFishDay2: day2WeighIns.reduce((max, w) =>
      Math.max(max, w.bigFishWeight || 0), 0) || null,
    avgBigFish: calculateMean(allBigFish),
    bigFishStdDev: calculateStdDev(allBigFish),

    totalFishCaught: weighIns.reduce((sum, w) => sum + w.fishCount, 0),
    totalFishReleased: weighIns.reduce((sum, w) => sum + w.fishReleased, 0),
    totalTeams: standings.length,
    teamsWithFish
  }
}

/**
 * Compute enhanced statistics for deeper analysis
 */
export function computeEnhancedStats(
  weighIns: WeighIn[],
  standings: TeamStanding[],
  coreStats: CoreStats
): EnhancedStats {
  const day1WeighIns = weighIns.filter(w => w.day === 1)
  const day2WeighIns = weighIns.filter(w => w.day === 2)

  const day1Weights = day1WeighIns.map(w => w.rawWeight)
  const day2Weights = day2WeighIns.map(w => w.rawWeight)

  // Teams fishing each day
  const day1Teams = new Set(day1WeighIns.map(w => w.teamId))
  const day2Teams = new Set(day2WeighIns.map(w => w.teamId))

  return {
    ...coreStats,

    // Catch rate & effort
    catchPerTeam: coreStats.totalTeams > 0
      ? coreStats.totalFishCaught / coreStats.totalTeams
      : 0,
    releaseRate: coreStats.totalFishCaught > 0
      ? (coreStats.totalFishReleased / coreStats.totalFishCaught) * 100
      : 0,
    catchPerUnitEffort: coreStats.teamsWithFish > 0
      ? coreStats.totalFishCaught / coreStats.teamsWithFish
      : 0,

    // Weight distribution
    medianDay1Weight: calculateMedian(day1Weights),
    medianDay2Weight: calculateMedian(day2Weights),
    minDay1Weight: day1Weights.length > 0 ? Math.min(...day1Weights) : 0,
    maxDay1Weight: day1Weights.length > 0 ? Math.max(...day1Weights) : 0,
    minDay2Weight: day2Weights.length > 0 ? Math.min(...day2Weights) : 0,
    maxDay2Weight: day2Weights.length > 0 ? Math.max(...day2Weights) : 0,

    // Competition balance
    topTeamDominance: standings.length > 0 && standings[0].grandTotal > 0
      ? ((standings[0].grandTotal - calculateMedian(standings.map(s => s.grandTotal))) /
         calculateMedian(standings.map(s => s.grandTotal))) * 100
      : 0,

    // Engagement
    dnfRate: 0, // Would need team registration data
    day2Retention: day1Teams.size > 0
      ? (day2Teams.size / day1Teams.size) * 100
      : 0
  }
}

/**
 * Generate weight distribution buckets for histogram
 * Divides weight range into N equal buckets
 */
export function computeWeightDistribution(
  weighIns: WeighIn[],
  bucketCount: number = 10
): WeightBucket[] {
  const weights = weighIns.map(w => w.rawWeight).filter(w => w > 0)
  if (weights.length === 0) return []

  const minWeight = Math.min(...weights)
  const maxWeight = Math.max(...weights)
  const bucketWidth = (maxWeight - minWeight) / bucketCount

  const buckets: WeightBucket[] = Array.from({ length: bucketCount }, (_, i) => {
    const min = minWeight + i * bucketWidth
    const max = i === bucketCount - 1 ? maxWeight + 0.01 : min + bucketWidth

    const count = weights.filter(w => w >= min && w < max).length

    return {
      min: parseFloat(min.toFixed(2)),
      max: parseFloat(max.toFixed(2)),
      count,
      percentage: (count / weights.length) * 100
    }
  })

  return buckets
}

/**
 * Calculate Most Improved rankings (day 1 rank vs day 2 rank)
 * Positive rankImprovement = moved up in standings
 */
export function computeMostImproved(
  standings: TeamStanding[]
): MostImprovedTeam[] {
  // Compute day 1 standings
  const day1Standings = computeDay1Standings(standings)
  const day1RankMap = new Map<string, number>()
  day1Standings.forEach(s => {
    day1RankMap.set(s.teamId, s.rank)
  })

  // Map back to final standings with day 1 ranks
  return standings.map(s => ({
    ...s,
    day1Rank: day1RankMap.get(s.teamId) || 0,
    day2Rank: s.rank,
    rankImprovement: (day1RankMap.get(s.teamId) || 0) - s.rank
  }))
}

/**
 * Compute standings for day 1 only (for Most Improved)
 */
function computeDay1Standings(
  standings: TeamStanding[]
): TeamStanding[] {
  const day1Standings = standings.map(s => ({
    ...s,
    rank: 0
  }))

  // Sort by day1Total descending
  day1Standings.sort((a, b) => b.day1Total - a.day1Total)

  // Assign ranks
  day1Standings.forEach((s, idx) => {
    s.rank = idx + 1
  })

  return day1Standings
}

/**
 * Generate weight tickets list with print metadata
 */
export interface WeightTicket {
  id: string
  tournamentId: string
  teamId: string
  teamNumber: number
  day: 1 | 2
  fishCount: number
  rawWeight: number
  fishReleased: number
  dayTotal: number
  bigFishWeight?: number
  standing: number | null // Current standing after this weigh-in
  timestamp: Date
}

/**
 * Score Calcutta groups - determines winning team in each group
 * Returns the group with the highest-scoring team
 */
export interface CalcuttaGroupScore {
  groupNumber: number
  teamIds: string[]
  winningTeamId: string
  winningTeamNumber: number
  winningScore: number
}

export function scoreCalcuttaGroups(
  groups: Array<{ groupNumber: number; teamIds: string[] }>,
  standings: TeamStanding[]
): CalcuttaGroupScore[] {
  const standingsByTeamId = new Map(standings.map(s => [s.teamId, s]))

  return groups.map(group => {
    let winningTeam = standings[0]
    let maxScore = -Infinity

    for (const teamId of group.teamIds) {
      const standing = standingsByTeamId.get(teamId)
      if (standing && standing.grandTotal > maxScore) {
        maxScore = standing.grandTotal
        winningTeam = standing
      }
    }

    return {
      groupNumber: group.groupNumber,
      teamIds: group.teamIds,
      winningTeamId: winningTeam.teamId,
      winningTeamNumber: winningTeam.teamNumber,
      winningScore: winningTeam.grandTotal
    }
  })
}
