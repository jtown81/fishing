/**
 * React hook for tournament statistics
 *
 * Computes core and enhanced stats based on weigh-ins and standings
 */

import { useMemo } from 'react'
import {
  computeCoreStats,
  computeEnhancedStats,
  computeMostImproved,
  computeWeightDistribution,
  scoreCalcuttaGroups,
  type CoreStats,
  type EnhancedStats,
  type MostImprovedTeam,
  type WeightBucket,
  type CalcuttaGroupScore
} from './stats-engine'
import { useWeighInStore } from '../weigh-ins/weigh-in-store'
import { useStandings } from '@hooks/useStandings'

export interface TournamentStatsResult {
  coreStats: CoreStats
  enhancedStats: EnhancedStats
  mostImproved: MostImprovedTeam[]
  weightDistribution: WeightBucket[]
  isLoading: boolean
}

/**
 * Hook to compute all tournament statistics
 * Dependencies: weighIns, standings
 */
export function useTournamentStats(tournamentId?: string): TournamentStatsResult {
  const weighIns = useWeighInStore((s) => s.weighIns)
  const standings = useStandings(tournamentId)

  return useMemo(() => {
    if (standings.length === 0 || weighIns.length === 0) {
      return {
        coreStats: {
          avgDay1Weight: 0,
          avgDay2Weight: 0,
          day1StdDev: 0,
          day2StdDev: 0,
          bigFishDay1: null,
          bigFishDay2: null,
          avgBigFish: 0,
          bigFishStdDev: 0,
          totalFishCaught: 0,
          totalFishReleased: 0,
          totalTeams: 0,
          teamsWithFish: 0
        },
        enhancedStats: {
          avgDay1Weight: 0,
          avgDay2Weight: 0,
          day1StdDev: 0,
          day2StdDev: 0,
          bigFishDay1: null,
          bigFishDay2: null,
          avgBigFish: 0,
          bigFishStdDev: 0,
          totalFishCaught: 0,
          totalFishReleased: 0,
          totalTeams: 0,
          teamsWithFish: 0,
          catchPerTeam: 0,
          releaseRate: 0,
          catchPerUnitEffort: 0,
          medianDay1Weight: 0,
          medianDay2Weight: 0,
          minDay1Weight: 0,
          maxDay1Weight: 0,
          minDay2Weight: 0,
          maxDay2Weight: 0,
          topTeamDominance: 0,
          dnfRate: 0,
          day2Retention: 0
        },
        mostImproved: [],
        weightDistribution: [],
        isLoading: false
      }
    }

    const coreStats = computeCoreStats(weighIns, standings)
    const enhancedStats = computeEnhancedStats(weighIns, standings, coreStats)
    const mostImproved = computeMostImproved(standings)
    const weightDistribution = computeWeightDistribution(weighIns)

    return {
      coreStats,
      enhancedStats,
      mostImproved,
      weightDistribution,
      isLoading: false
    }
  }, [weighIns, standings, tournamentId])
}

/**
 * Score Calcutta groups based on current standings
 */
export function useCalcuttaScores(
  groups: Array<{ groupNumber: number; teamIds: string[] }>,
  tournamentId?: string
): CalcuttaGroupScore[] {
  const standings = useStandings(tournamentId)

  return useMemo(() => {
    if (groups.length === 0 || standings.length === 0) {
      return []
    }

    return scoreCalcuttaGroups(groups, standings)
  }, [groups, standings, tournamentId])
}
