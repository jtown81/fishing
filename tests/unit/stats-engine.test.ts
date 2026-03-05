/**
 * Unit tests for statistics engine
 *
 * Verifies all formulas match XLSM Standards sheet patterns
 */

import { describe, it, expect } from 'vitest'
import {
  calculateStdDev,
  computeCoreStats,
  computeEnhancedStats,
  computeMostImproved,
  computeWeightDistribution,
  scoreCalcuttaGroups,
  type WeighIn,
  type TeamStanding
} from '../../src/modules/stats'

// Test data
const mockTeams = [
  { id: 'team-1', teamNumber: 1, members: [] } as any,
  { id: 'team-2', teamNumber: 2, members: [] } as any,
  { id: 'team-3', teamNumber: 3, members: [] } as any
]

const mockWeighIns: WeighIn[] = [
  {
    id: '1',
    tournamentId: 'tour-1',
    teamId: 'team-1',
    teamNumber: 1,
    day: 1,
    fishCount: 5,
    rawWeight: 12.5,
    fishReleased: 1,
    bigFishWeight: 4.2,
    receivedBy: 'Judge A',
    issuedBy: 'Judge B',
    timestamp: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    tournamentId: 'tour-1',
    teamId: 'team-1',
    teamNumber: 1,
    day: 2,
    fishCount: 4,
    rawWeight: 10.8,
    fishReleased: 2,
    bigFishWeight: 3.5,
    receivedBy: 'Judge A',
    issuedBy: 'Judge B',
    timestamp: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    tournamentId: 'tour-1',
    teamId: 'team-2',
    teamNumber: 2,
    day: 1,
    fishCount: 6,
    rawWeight: 14.2,
    fishReleased: 0,
    bigFishWeight: 3.8,
    receivedBy: 'Judge A',
    issuedBy: 'Judge B',
    timestamp: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    tournamentId: 'tour-1',
    teamId: 'team-2',
    teamNumber: 2,
    day: 2,
    fishCount: 3,
    rawWeight: 8.5,
    fishReleased: 1,
    bigFishWeight: 2.9,
    receivedBy: 'Judge A',
    issuedBy: 'Judge B',
    timestamp: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '5',
    tournamentId: 'tour-1',
    teamId: 'team-3',
    teamNumber: 3,
    day: 1,
    fishCount: 2,
    rawWeight: 5.3,
    fishReleased: 0,
    bigFishWeight: 2.8,
    receivedBy: 'Judge A',
    issuedBy: 'Judge B',
    timestamp: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  }
  // team-3 did not fish day 2
]

const mockStandings: TeamStanding[] = [
  {
    teamId: 'team-1',
    teamNumber: 1,
    members: [],
    day1Total: 12.7, // 12.5 + 1*0.2
    day1BigFish: 4.2,
    day2Total: 11.2, // 10.8 + 2*0.2
    day2BigFish: 3.5,
    grandTotal: 23.9, // 12.7 + 11.2
    rank: 1
  },
  {
    teamId: 'team-2',
    teamNumber: 2,
    members: [],
    day1Total: 14.2, // 14.2 + 0*0.2
    day1BigFish: 3.8,
    day2Total: 8.7, // 8.5 + 1*0.2
    day2BigFish: 2.9,
    grandTotal: 22.9,
    rank: 2
  },
  {
    teamId: 'team-3',
    teamNumber: 3,
    members: [],
    day1Total: 5.3, // 5.3 + 0*0.2
    day1BigFish: 2.8,
    day2Total: 0,
    grandTotal: 5.3,
    rank: 3
  }
]

describe('Stats Engine', () => {
  describe('Standard Deviation', () => {
    it('calculates population standard deviation correctly', () => {
      const values = [2, 4, 4, 4, 5, 5, 7, 9]
      const result = calculateStdDev(values)
      expect(result).toBeCloseTo(2.0, 1)
    })

    it('ignores zero values when requested', () => {
      const values = [10, 0, 20, 0, 30]
      const result = calculateStdDev(values, true)
      // Should only include [10, 20, 30]
      // mean = 20, variance = ((10-20)^2 + (20-20)^2 + (30-20)^2) / 3
      // variance = (100 + 0 + 100) / 3 = 66.67, stddev ≈ 8.16
      expect(result).toBeCloseTo(8.16, 1)
    })
  })

  describe('Core Statistics', () => {
    it('calculates average weights for each day', () => {
      const stats = computeCoreStats(mockWeighIns, mockStandings)

      // Day 1 weights: 12.5, 14.2, 5.3 = 32.0 / 3 = 10.67
      expect(stats.avgDay1Weight).toBeCloseTo(10.67, 1)

      // Day 2 weights: 10.8, 8.5 = 19.3 / 2 = 9.65
      expect(stats.avgDay2Weight).toBeCloseTo(9.65, 1)
    })

    it('calculates big fish records', () => {
      const stats = computeCoreStats(mockWeighIns, mockStandings)

      expect(stats.bigFishDay1).toBe(4.2)
      expect(stats.bigFishDay2).toBe(3.5)
    })

    it('counts total fish caught and released', () => {
      const stats = computeCoreStats(mockWeighIns, mockStandings)

      expect(stats.totalFishCaught).toBe(20) // 5+4+6+3+2
      expect(stats.totalFishReleased).toBe(4) // 1+2+0+1+0
    })

    it('counts teams and teams with fish', () => {
      const stats = computeCoreStats(mockWeighIns, mockStandings)

      expect(stats.totalTeams).toBe(3)
      expect(stats.teamsWithFish).toBe(3)
    })

    it('calculates average big fish across all days', () => {
      const stats = computeCoreStats(mockWeighIns, mockStandings)

      // All big fish: 4.2, 3.5, 3.8, 2.9, 2.8 = 17.2 / 5 = 3.44
      expect(stats.avgBigFish).toBeCloseTo(3.44, 1)
    })
  })

  describe('Enhanced Statistics', () => {
    it('calculates catch per team', () => {
      const coreStats = computeCoreStats(mockWeighIns, mockStandings)
      const stats = computeEnhancedStats(mockWeighIns, mockStandings, coreStats)

      // 20 fish / 3 teams = 6.67
      expect(stats.catchPerTeam).toBeCloseTo(6.67, 1)
    })

    it('calculates release rate percentage', () => {
      const coreStats = computeCoreStats(mockWeighIns, mockStandings)
      const stats = computeEnhancedStats(mockWeighIns, mockStandings, coreStats)

      // 4 released / 20 caught * 100 = 20%
      expect(stats.releaseRate).toBeCloseTo(20, 0)
    })

    it('calculates catch per unit effort', () => {
      const coreStats = computeCoreStats(mockWeighIns, mockStandings)
      const stats = computeEnhancedStats(mockWeighIns, mockStandings, coreStats)

      // 20 fish / 3 teams fishing = 6.67
      expect(stats.catchPerUnitEffort).toBeCloseTo(6.67, 1)
    })

    it('calculates weight distribution medians', () => {
      const coreStats = computeCoreStats(mockWeighIns, mockStandings)
      const stats = computeEnhancedStats(mockWeighIns, mockStandings, coreStats)

      // Day 1 weights sorted: 5.3, 12.5, 14.2 -> median = 12.5
      expect(stats.medianDay1Weight).toBe(12.5)

      // Day 2 weights sorted: 8.5, 10.8 -> median = 9.65
      expect(stats.medianDay2Weight).toBeCloseTo(9.65, 1)
    })

    it('calculates day 2 retention rate', () => {
      const coreStats = computeCoreStats(mockWeighIns, mockStandings)
      const stats = computeEnhancedStats(mockWeighIns, mockStandings, coreStats)

      // 2 teams day 2 (team-1, team-2) / 3 teams day 1 (all) = 66.67%
      expect(stats.day2Retention).toBeCloseTo(66.67, 1)
    })
  })

  describe('Weight Distribution', () => {
    it('creates histogram buckets', () => {
      const buckets = computeWeightDistribution(mockWeighIns, 5)

      expect(buckets.length).toBe(5)
      expect(buckets.every(b => b.count >= 0)).toBe(true)
      expect(buckets.reduce((sum, b) => sum + b.count, 0)).toBe(5) // 5 weights > 0
    })

    it('calculates bucket percentages correctly', () => {
      const buckets = computeWeightDistribution(mockWeighIns, 3)

      const totalPercentage = buckets.reduce((sum, b) => sum + b.percentage, 0)
      expect(totalPercentage).toBeCloseTo(100, 0)
    })
  })

  describe('Most Improved', () => {
    it('calculates rank changes correctly', () => {
      const improved = computeMostImproved(mockStandings)

      // Team 1: day1 rank would be 2nd (14.2 > 12.7), final rank 1st -> improvement of +1
      // Team 2: day1 rank would be 1st (14.2 > 12.7 > 5.3), final rank 2nd -> decline of -1
      // Team 3: day1 rank would be 3rd, final rank 3rd -> no change

      expect(improved[0].rankImprovement).toBe(1) // Team 1 improved
      expect(improved[1].rankImprovement).toBe(-1) // Team 2 declined
      expect(improved[2].rankImprovement).toBe(0) // Team 3 stayed same
    })
  })

  describe('Calcutta Scoring', () => {
    it('identifies winning team in each group', () => {
      const groups = [
        { groupNumber: 1, teamIds: ['team-1', 'team-3'] },
        { groupNumber: 2, teamIds: ['team-2'] }
      ]

      const scores = scoreCalcuttaGroups(groups, mockStandings)

      expect(scores[0].winningTeamNumber).toBe(1) // team-1 has higher grand total
      expect(scores[0].winningScore).toBe(23.9)

      expect(scores[1].winningTeamNumber).toBe(2)
      expect(scores[1].winningScore).toBe(22.9)
    })

    it('handles mixed group sizes', () => {
      const groups = [
        { groupNumber: 1, teamIds: ['team-1', 'team-2', 'team-3'] },
        { groupNumber: 2, teamIds: ['team-2', 'team-3'] }
      ]

      const scores = scoreCalcuttaGroups(groups, mockStandings)

      expect(scores).toHaveLength(2)
      expect(scores[0].winningTeamNumber).toBe(1)
      expect(scores[1].winningTeamNumber).toBe(2)
    })
  })

  describe('Edge Cases', () => {
    it('handles empty data gracefully', () => {
      const emptyWeighIns: WeighIn[] = []
      const emptyStandings: TeamStanding[] = []

      const stats = computeCoreStats(emptyWeighIns, emptyStandings)

      expect(stats.totalFishCaught).toBe(0)
      expect(stats.avgDay1Weight).toBe(0)
      expect(stats.bigFishDay1).toBeNull()
    })

    it('handles missing big fish data', () => {
      const weighInsNoBigFish: WeighIn[] = [
        {
          id: '1',
          tournamentId: 'tour-1',
          teamId: 'team-1',
          teamNumber: 1,
          day: 1,
          fishCount: 5,
          rawWeight: 12.5,
          fishReleased: 0,
          receivedBy: 'Judge A',
          issuedBy: 'Judge B',
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      const standings: TeamStanding[] = [
        {
          teamId: 'team-1',
          teamNumber: 1,
          members: [],
          day1Total: 12.5,
          day2Total: 0,
          grandTotal: 12.5,
          rank: 1
        }
      ]

      const stats = computeCoreStats(weighInsNoBigFish, standings)

      expect(stats.bigFishDay1).toBeNull()
      expect(stats.avgBigFish).toBe(0)
    })
  })
})
