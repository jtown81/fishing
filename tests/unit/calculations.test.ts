import { describe, it, expect } from 'vitest'
import {
  calculateDayTotal,
  calculateGrandTotal,
  computeStandings,
  computeTournamentStats
} from '@utils/calculations'
import type { Team, WeighIn } from '@models/tournament'

describe('calculations', () => {
  describe('calculateDayTotal', () => {
    it('should calculate day total with release bonus', () => {
      const total = calculateDayTotal(10.5, 2, 0.2)
      expect(total).toBe(10.9) // 10.5 + (2 * 0.2)
    })

    it('should handle zero releases', () => {
      const total = calculateDayTotal(10.5, 0, 0.2)
      expect(total).toBe(10.5)
    })

    it('should use default release bonus', () => {
      const total = calculateDayTotal(10, 1)
      expect(total).toBe(10.2)
    })
  })

  describe('calculateGrandTotal', () => {
    it('should sum day totals', () => {
      const total = calculateGrandTotal(15.5, 12.3)
      expect(total).toBe(27.8)
    })
  })

  describe('computeStandings', () => {
    it('should rank teams by grand total', () => {
      const teams: Team[] = [
        {
          id: 'team-1',
          tournamentId: 'tournament-1',
          teamNumber: 1,
          members: [
            { firstName: 'John', lastName: 'Doe' },
            { firstName: 'Jane', lastName: 'Doe' }
          ],
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'team-2',
          tournamentId: 'tournament-1',
          teamNumber: 2,
          members: [
            { firstName: 'Bob', lastName: 'Smith' },
            { firstName: 'Alice', lastName: 'Smith' }
          ],
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      const weighIns: WeighIn[] = [
        {
          id: 'weighin-1',
          tournamentId: 'tournament-1',
          teamId: 'team-1',
          teamNumber: 1,
          day: 1,
          fishCount: 3,
          rawWeight: 15,
          fishReleased: 1,
          receivedBy: 'Officer 1',
          issuedBy: 'Officer 2',
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'weighin-2',
          tournamentId: 'tournament-1',
          teamId: 'team-1',
          teamNumber: 1,
          day: 2,
          fishCount: 2,
          rawWeight: 12,
          fishReleased: 0,
          receivedBy: 'Officer 1',
          issuedBy: 'Officer 2',
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'weighin-3',
          tournamentId: 'tournament-1',
          teamId: 'team-2',
          teamNumber: 2,
          day: 1,
          fishCount: 2,
          rawWeight: 10,
          fishReleased: 0,
          receivedBy: 'Officer 1',
          issuedBy: 'Officer 2',
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'weighin-4',
          tournamentId: 'tournament-1',
          teamId: 'team-2',
          teamNumber: 2,
          day: 2,
          fishCount: 3,
          rawWeight: 20,
          fishReleased: 1,
          receivedBy: 'Officer 1',
          issuedBy: 'Officer 2',
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      const standings = computeStandings(teams, weighIns, 0.2)

      expect(standings).toHaveLength(2)
      // Team 2 has higher grand total (30.2 vs 27.2) so it ranks first
      expect(standings[0].teamNumber).toBe(2)
      expect(standings[0].grandTotal).toBe(30.2) // 10 + (20 + 0.2)
      expect(standings[0].rank).toBe(1)

      expect(standings[1].teamNumber).toBe(1)
      expect(standings[1].grandTotal).toBe(27.2) // (15 + 0.2) + 12
      expect(standings[1].rank).toBe(2)
    })

    it('should compute rank change', () => {
      const teams: Team[] = [
        {
          id: 'team-1',
          tournamentId: 'tournament-1',
          teamNumber: 1,
          members: [{ firstName: 'A', lastName: 'B' }],
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'team-2',
          tournamentId: 'tournament-1',
          teamNumber: 2,
          members: [{ firstName: 'C', lastName: 'D' }],
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      const weighIns: WeighIn[] = [
        // Day 1: Team 2 leads
        {
          id: 'w1',
          tournamentId: 'tournament-1',
          teamId: 'team-1',
          teamNumber: 1,
          day: 1,
          fishCount: 1,
          rawWeight: 5,
          fishReleased: 0,
          receivedBy: '',
          issuedBy: '',
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'w2',
          tournamentId: 'tournament-1',
          teamId: 'team-2',
          teamNumber: 2,
          day: 1,
          fishCount: 1,
          rawWeight: 10,
          fishReleased: 0,
          receivedBy: '',
          issuedBy: '',
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        // Day 2: Team 1 leads overall
        {
          id: 'w3',
          tournamentId: 'tournament-1',
          teamId: 'team-1',
          teamNumber: 1,
          day: 2,
          fishCount: 1,
          rawWeight: 25,
          fishReleased: 0,
          receivedBy: '',
          issuedBy: '',
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'w4',
          tournamentId: 'tournament-1',
          teamId: 'team-2',
          teamNumber: 2,
          day: 2,
          fishCount: 1,
          rawWeight: 5,
          fishReleased: 0,
          receivedBy: '',
          issuedBy: '',
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      const standings = computeStandings(teams, weighIns, 0.2)

      // Team 1: ranked 2nd on day 1, ranked 1st overall -> improved by 1
      expect(standings[0].teamNumber).toBe(1)
      expect(standings[0].rankChange).toBe(1)

      // Team 2: ranked 1st on day 1, ranked 2nd overall -> dropped by 1
      expect(standings[1].teamNumber).toBe(2)
      expect(standings[1].rankChange).toBe(-1)
    })
  })

  describe('computeTournamentStats', () => {
    it('should compute tournament statistics', () => {
      const weighIns: WeighIn[] = [
        {
          id: 'w1',
          tournamentId: 'tournament-1',
          teamId: 'team-1',
          teamNumber: 1,
          day: 1,
          fishCount: 5,
          rawWeight: 20,
          fishReleased: 2,
          bigFishWeight: 8,
          receivedBy: '',
          issuedBy: '',
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'w2',
          tournamentId: 'tournament-1',
          teamId: 'team-2',
          teamNumber: 2,
          day: 1,
          fishCount: 3,
          rawWeight: 12,
          fishReleased: 1,
          bigFishWeight: 6,
          receivedBy: '',
          issuedBy: '',
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      const teams: Team[] = [
        { id: 'team-1', tournamentId: 'tournament-1', teamNumber: 1, members: [], status: 'active', createdAt: new Date(), updatedAt: new Date() },
        { id: 'team-2', tournamentId: 'tournament-1', teamNumber: 2, members: [], status: 'active', createdAt: new Date(), updatedAt: new Date() }
      ]

      const stats = computeTournamentStats(weighIns, teams)

      expect(stats.totalTeams).toBe(2)
      expect(stats.totalFishCaught).toBe(8)
      expect(stats.totalFishReleased).toBe(3)
      expect(stats.totalWeightCaught).toBe(32)
      expect(stats.biggestFish?.weight).toBe(8)
    })
  })
})
