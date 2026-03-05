/**
 * Core calculation functions for tournament standings and statistics
 *
 * Formulas from roadmap §2.1 and verified against Retire-original.xlsx patterns:
 * - dayTotal = rawWeight + (fishReleased * releaseBonusPerFish)
 * - grandTotal = day1Total + day2Total
 * - rankChange = day1Rank - day2Rank (positive = improved)
 */

import type { WeighIn, TeamStanding, Team } from '@models/tournament'

/**
 * Calculate the total weight for a single day's weigh-in
 *
 * Formula: dayTotal = rawWeight + (fishReleased * releaseBonus)
 */
export function calculateDayTotal(
  rawWeight: number,
  fishReleased: number,
  releaseBonus: number = 0.2
): number {
  return rawWeight + fishReleased * releaseBonus
}

/**
 * Calculate grand total across both days
 *
 * Formula: grandTotal = day1Total + day2Total
 */
export function calculateGrandTotal(day1Total: number, day2Total: number): number {
  return day1Total + day2Total
}

/**
 * Compute all team standings for a tournament
 *
 * Returns standings ranked by grandTotal (descending), with rankChange computed
 */
export function computeStandings(
  teams: Team[],
  weighIns: WeighIn[],
  releaseBonus: number = 0.2
): TeamStanding[] {
  // Group weigh-ins by teamId
  const weighInsByTeam = new Map<string, WeighIn[]>()
  for (const weighIn of weighIns) {
    if (!weighInsByTeam.has(weighIn.teamId)) {
      weighInsByTeam.set(weighIn.teamId, [])
    }
    weighInsByTeam.get(weighIn.teamId)!.push(weighIn)
  }

  // Build standings for each team
  const standings: TeamStanding[] = teams.map(team => {
    const teamWeighIns = weighInsByTeam.get(team.id) || []

    // Separate by day
    const day1WeighIns = teamWeighIns.filter(w => w.day === 1)
    const day2WeighIns = teamWeighIns.filter(w => w.day === 2)

    // Calculate totals (sum all weigh-ins for each day)
    const day1Total = day1WeighIns.reduce(
      (sum, w) => sum + calculateDayTotal(w.rawWeight, w.fishReleased, releaseBonus),
      0
    )
    const day2Total = day2WeighIns.reduce(
      (sum, w) => sum + calculateDayTotal(w.rawWeight, w.fishReleased, releaseBonus),
      0
    )

    // Get big fish for each day (max across all weigh-ins that day)
    const day1BigFish = day1WeighIns.reduce((max, w) => {
      const bigFish = w.bigFishWeight || 0
      return bigFish > max ? bigFish : max
    }, 0)

    const day2BigFish = day2WeighIns.reduce((max, w) => {
      const bigFish = w.bigFishWeight || 0
      return bigFish > max ? bigFish : max
    }, 0)

    return {
      teamId: team.id,
      teamNumber: team.teamNumber,
      members: team.members,
      day1Total,
      day1BigFish: day1BigFish || undefined,
      day2Total,
      day2BigFish: day2BigFish || undefined,
      grandTotal: calculateGrandTotal(day1Total, day2Total),
      rank: 0 // Will be assigned after sorting
    }
  })

  // Sort by grandTotal descending and assign ranks
  standings.sort((a, b) => b.grandTotal - a.grandTotal)
  standings.forEach((standing, index) => {
    standing.rank = index + 1
  })

  // Compute rankChange by comparing Day 1 and Day 2 rankings
  const day1Standings = [...standings].sort(
    (a, b) => b.day1Total - a.day1Total
  )
  const day1RankMap = new Map<string, number>()
  day1Standings.forEach((standing, index) => {
    day1RankMap.set(standing.teamId, index + 1)
  })

  standings.forEach(standing => {
    const day1Rank = day1RankMap.get(standing.teamId) || 0
    standing.rankChange = day1Rank - standing.rank
  })

  return standings
}

/**
 * Get the big fish leader across the entire tournament
 */
export function getBigFishLeader(weighIns: WeighIn[]) {
  if (weighIns.length === 0) return null

  let leader = weighIns[0]
  for (const weighIn of weighIns) {
    const leaderBigFish = leader.bigFishWeight || 0
    const currentBigFish = weighIn.bigFishWeight || 0
    if (currentBigFish > leaderBigFish) {
      leader = weighIn
    }
  }

  return leader.bigFishWeight ? leader : null
}

/**
 * Compute tournament-wide statistics
 */
export function computeTournamentStats(weighIns: WeighIn[], teams: Team[]) {
  const totalTeams = teams.length
  let totalFishCaught = 0
  let totalFishReleased = 0
  let totalWeightCaught = 0
  let biggestFish: WeighIn | null = null
  let maxBigFishWeight = 0

  for (const weighIn of weighIns) {
    totalFishCaught += weighIn.fishCount
    totalFishReleased += weighIn.fishReleased
    totalWeightCaught += weighIn.rawWeight

    if (weighIn.bigFishWeight && weighIn.bigFishWeight > maxBigFishWeight) {
      maxBigFishWeight = weighIn.bigFishWeight
      biggestFish = weighIn
    }
  }

  return {
    totalTeams,
    totalFishCaught,
    totalFishReleased,
    totalWeightCaught,
    biggestFish: biggestFish
      ? {
          teamNumber: biggestFish.teamNumber,
          weight: maxBigFishWeight,
          day: biggestFish.day
        }
      : null
  }
}
