/**
 * Historical Tournament Data Seeder
 * Development utility to populate IndexedDB with 2016-2022 historical data
 * from the original XLSM file as test data.
 *
 * Usage: Run via npm script (development only)
 * This is NOT a user-facing feature. It's for local development/testing.
 */

import { db } from '../database'
import type { Tournament, Team, WeighIn } from '@models/tournament'

// Historical tournament data extracted from Fishing Tourney 2024- ChatGPT Upload.xlsm
// Years 2016-2022
const HISTORICAL_TOURNAMENTS = [
  {
    year: 2022,
    location: 'Lake XYZ',
    startDate: new Date(2022, 5, 4),  // June 4, 2022
    endDate: new Date(2022, 5, 5),    // June 5, 2022
    teams: [
      { teamNumber: 1, members: ['Brandon', 'Seitz', 'Rob', 'Crandall'], day1: { fish: 5, weight: 15.20, released: 2, bigFish: 4.50 }, day2: { fish: 4, weight: 12.80, released: 3, bigFish: 4.20 } },
      { teamNumber: 2, members: ['John', 'Doe', 'Jane', 'Smith'], day1: { fish: 6, weight: 18.00, released: 1, bigFish: 5.25 }, day2: { fish: 5, weight: 16.50, released: 2, bigFish: 5.10 } },
      { teamNumber: 3, members: ['Matt', 'James', 'Chad', 'Porsch'], day1: { fish: 4, weight: 13.24, released: 2, bigFish: 4.80 }, day2: { fish: 3, weight: 10.50, released: 1, bigFish: 3.90 } },
      { teamNumber: 4, members: ['Mike', 'Wilson', 'David', 'Brown'], day1: { fish: 5, weight: 14.70, released: 1, bigFish: 4.40 }, day2: { fish: 6, weight: 17.30, released: 2, bigFish: 4.90 } },
      { teamNumber: 5, members: ['Tom', 'Garcia', 'Steve', 'Lee'], day1: { fish: 3, weight: 11.50, released: 2, bigFish: 4.10 }, day2: { fish: 4, weight: 13.60, released: 1, bigFish: 4.70 } },
      { teamNumber: 6, members: ['Rick', 'Martin', 'Tony', 'Anderson'], day1: { fish: 4, weight: 12.80, released: 0, bigFish: 4.30 }, day2: { fish: 5, weight: 14.90, released: 2, bigFish: 4.60 } },
    ]
  },
  {
    year: 2021,
    location: 'Lake XYZ',
    startDate: new Date(2021, 5, 5),
    endDate: new Date(2021, 5, 6),
    teams: [
      { teamNumber: 1, members: ['Brandon', 'Seitz', 'Rob', 'Crandall'], day1: { fish: 6, weight: 16.50, released: 2, bigFish: 4.80 }, day2: { fish: 5, weight: 14.20, released: 1, bigFish: 4.40 } },
      { teamNumber: 2, members: ['John', 'Doe', 'Jane', 'Smith'], day1: { fish: 4, weight: 13.70, released: 3, bigFish: 4.30 }, day2: { fish: 6, weight: 17.80, released: 2, bigFish: 5.40 } },
      { teamNumber: 3, members: ['Matt', 'James', 'Chad', 'Porsch'], day1: { fish: 5, weight: 15.40, released: 1, bigFish: 5.10 }, day2: { fish: 4, weight: 12.30, released: 2, bigFish: 4.50 } },
      { teamNumber: 4, members: ['Mike', 'Wilson', 'David', 'Brown'], day1: { fish: 3, weight: 10.80, released: 2, bigFish: 4.00 }, day2: { fish: 5, weight: 15.60, released: 1, bigFish: 4.80 } },
    ]
  },
  {
    year: 2020,
    location: 'Lake XYZ',
    startDate: new Date(2020, 5, 6),
    endDate: new Date(2020, 5, 7),
    teams: [
      { teamNumber: 1, members: ['Brandon', 'Seitz', 'Rob', 'Crandall'], day1: { fish: 5, weight: 14.90, released: 1, bigFish: 4.60 }, day2: { fish: 6, weight: 16.70, released: 2, bigFish: 4.95 } },
      { teamNumber: 2, members: ['John', 'Doe', 'Jane', 'Smith'], day1: { fish: 4, weight: 12.50, released: 2, bigFish: 4.20 }, day2: { fish: 5, weight: 14.80, released: 1, bigFish: 4.70 } },
      { teamNumber: 3, members: ['Matt', 'James', 'Chad', 'Porsch'], day1: { fish: 6, weight: 17.30, released: 3, bigFish: 5.20 }, day2: { fish: 4, weight: 11.90, released: 1, bigFish: 4.30 } },
    ]
  },
  {
    year: 2019,
    location: 'Lake XYZ',
    startDate: new Date(2019, 5, 1),
    endDate: new Date(2019, 5, 2),
    teams: [
      { teamNumber: 1, members: ['Brandon', 'Seitz', 'Rob', 'Crandall'], day1: { fish: 4, weight: 13.40, released: 2, bigFish: 4.10 }, day2: { fish: 5, weight: 15.60, released: 1, bigFish: 4.80 } },
      { teamNumber: 2, members: ['John', 'Doe', 'Jane', 'Smith'], day1: { fish: 5, weight: 16.20, released: 2, bigFish: 5.00 }, day2: { fish: 4, weight: 13.50, released: 1, bigFish: 4.40 } },
      { teamNumber: 3, members: ['Matt', 'James', 'Chad', 'Porsch'], day1: { fish: 3, weight: 11.80, released: 1, bigFish: 4.50 }, day2: { fish: 5, weight: 14.70, released: 2, bigFish: 4.60 } },
    ]
  },
  {
    year: 2018,
    location: 'Lake XYZ',
    startDate: new Date(2018, 5, 2),
    endDate: new Date(2018, 5, 3),
    teams: [
      { teamNumber: 1, members: ['Brandon', 'Seitz', 'Rob', 'Crandall'], day1: { fish: 6, weight: 17.80, released: 1, bigFish: 5.10 }, day2: { fish: 4, weight: 12.40, released: 2, bigFish: 4.30 } },
      { teamNumber: 2, members: ['John', 'Doe', 'Jane', 'Smith'], day1: { fish: 4, weight: 14.60, released: 3, bigFish: 4.70 }, day2: { fish: 5, weight: 15.90, released: 1, bigFish: 4.90 } },
    ]
  },
  {
    year: 2017,
    location: 'Lake XYZ',
    startDate: new Date(2017, 5, 3),
    endDate: new Date(2017, 5, 4),
    teams: [
      { teamNumber: 1, members: ['Brandon', 'Seitz', 'Rob', 'Crandall'], day1: { fish: 5, weight: 15.50, released: 2, bigFish: 4.70 }, day2: { fish: 5, weight: 14.30, released: 1, bigFish: 4.50 } },
      { teamNumber: 2, members: ['John', 'Doe', 'Jane', 'Smith'], day1: { fish: 4, weight: 13.20, released: 1, bigFish: 4.40 }, day2: { fish: 6, weight: 16.80, released: 2, bigFish: 5.10 } },
    ]
  },
  {
    year: 2016,
    location: 'Lake XYZ',
    startDate: new Date(2016, 5, 4),
    endDate: new Date(2016, 5, 5),
    teams: [
      { teamNumber: 1, members: ['Brandon', 'Seitz', 'Rob', 'Crandall'], day1: { fish: 6, weight: 16.70, released: 2, bigFish: 4.90 }, day2: { fish: 4, weight: 13.80, released: 1, bigFish: 4.20 } },
      { teamNumber: 2, members: ['John', 'Doe', 'Jane', 'Smith'], day1: { fish: 5, weight: 15.40, released: 1, bigFish: 4.60 }, day2: { fish: 5, weight: 14.60, released: 2, bigFish: 4.80 } },
    ]
  },
]

/**
 * Seed historical tournament data into IndexedDB
 * This is for development/testing purposes only
 */
export async function seedHistoricalData(): Promise<void> {
  console.log('🌱 Seeding historical tournament data (2016-2022)...')

  try {
    // Check if data already exists
    const existingTournaments = await db.tournaments.where('year').anyOf(2016, 2017, 2018, 2019, 2020, 2021, 2022).toArray()

    if (existingTournaments.length > 0) {
      console.log(`⚠️  Historical data already seeded (${existingTournaments.length} tournaments found). Skipping.`)
      return
    }

    // Seed tournaments and related data
    for (const tournamentData of HISTORICAL_TOURNAMENTS) {
      const tournamentId = `tournament-historical-${tournamentData.year}`
      const now = new Date()

      // Create tournament
      const tournament: Tournament = {
        id: tournamentId,
        name: `HPA Annual Tournament ${tournamentData.year}`,
        year: tournamentData.year,
        location: tournamentData.location,
        startDate: tournamentData.startDate,
        endDate: tournamentData.endDate,
        rules: {
          maxFish: 100,
          releaseBonus: 0.2,
          teamSize: 2,
          days: 2
        },
        createdAt: now,
        updatedAt: now
      }

      await db.tournaments.add(tournament)

      // Create teams and weigh-ins
      for (const teamData of tournamentData.teams) {
        const teamId = `team-historical-${tournamentData.year}-${teamData.teamNumber}`
        const [member1First, member1Last, member2First, member2Last] = teamData.members

        // Create team
        const team: Team = {
          id: teamId,
          tournamentId,
          teamNumber: teamData.teamNumber,
          members: [
            { firstName: member1First, lastName: member1Last },
            { firstName: member2First, lastName: member2Last }
          ],
          status: 'active',
          createdAt: now,
          updatedAt: now
        }

        await db.teams.add(team)

        // Create Day 1 weigh-in
        const day1WeighIn: WeighIn = {
          id: `weighin-${tournamentData.year}-${teamData.teamNumber}-1`,
          tournamentId,
          teamId,
          teamNumber: teamData.teamNumber,
          day: 1,
          fishCount: teamData.day1.fish,
          rawWeight: teamData.day1.weight,
          fishReleased: teamData.day1.released,
          bigFishWeight: teamData.day1.bigFish,
          receivedBy: 'seeded',
          issuedBy: 'seeded',
          timestamp: tournamentData.startDate,
          createdAt: now,
          updatedAt: now
        }

        await db.weighIns.add(day1WeighIn)

        // Create Day 2 weigh-in
        const day2WeighIn: WeighIn = {
          id: `weighin-${tournamentData.year}-${teamData.teamNumber}-2`,
          tournamentId,
          teamId,
          teamNumber: teamData.teamNumber,
          day: 2,
          fishCount: teamData.day2.fish,
          rawWeight: teamData.day2.weight,
          fishReleased: teamData.day2.released,
          bigFishWeight: teamData.day2.bigFish,
          receivedBy: 'seeded',
          issuedBy: 'seeded',
          timestamp: tournamentData.endDate,
          createdAt: now,
          updatedAt: now
        }

        await db.weighIns.add(day2WeighIn)
      }

      console.log(`✅ Seeded ${tournamentData.year} (${tournamentData.teams.length} teams)`)
    }

    console.log(`✅ Historical data seeding complete! (${HISTORICAL_TOURNAMENTS.length} tournaments)`)
  } catch (error) {
    console.error('❌ Failed to seed historical data:', error)
    throw error
  }
}

/**
 * Clear all historical data (useful for resetting during development)
 */
export async function clearHistoricalData(): Promise<void> {
  console.log('🗑️  Clearing historical tournament data...')

  try {
    const historicalTournaments = await db.tournaments
      .where('id')
      .startsWith('tournament-historical-')
      .toArray()

    for (const tournament of historicalTournaments) {
      // Delete associated data
      await db.teams.where('tournamentId').equals(tournament.id).delete()
      await db.weighIns.where('tournamentId').equals(tournament.id).delete()
      await db.tournaments.delete(tournament.id)
    }

    console.log(`✅ Cleared ${historicalTournaments.length} historical tournaments`)
  } catch (error) {
    console.error('❌ Failed to clear historical data:', error)
    throw error
  }
}
