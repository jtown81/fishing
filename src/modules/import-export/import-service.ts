/**
 * Import service for database operations
 * Handles importing tournament data from parsed CSV into IndexedDB
 */

import { db } from '@db/database'
import type { Tournament, Team, WeighIn } from '@models/tournament'
import { validateImportedData, type ImportedData } from './csv-parser'

export interface ImportResult {
  tournamentId: string
  tournamentName: string
  teamCount: number
  weighInCount: number
}

export interface ImportValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validate imported data for consistency and business rules
 */
export async function validateBeforeImport(data: ImportedData): Promise<ImportValidation> {
  const { errors, warnings } = validateImportedData(data)

  // Additional validation: check for tournament conflicts
  const existingTournament = await db.tournaments
    .where('name')
    .equals(data.tournament.name)
    .filter(t => t.year === data.tournament.year)
    .first()

  if (existingTournament) {
    errors.push(
      `Tournament "${data.tournament.name}" (${data.tournament.year}) already exists. Consider using a different name or year.`
    )
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Import tournament data into the database
 * Performs all-or-nothing transaction: if any step fails, rolls back
 */
export async function importTournament(data: ImportedData): Promise<ImportResult> {
  // Final validation before import
  const validation = await validateBeforeImport(data)
  if (!validation.isValid) {
    throw new Error(`Import validation failed:\n${validation.errors.join('\n')}`)
  }

  const now = new Date()
  const tournamentId = `tournament-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // Create tournament record
  const tournament: Tournament = {
    id: tournamentId,
    name: data.tournament.name,
    year: data.tournament.year,
    location: data.tournament.location,
    startDate: data.tournament.startDate,
    endDate: data.tournament.endDate,
    rules: {
      maxFish: 100,
      releaseBonus: 0.2,
      teamSize: 2,
      days: 2
    },
    createdAt: now,
    updatedAt: now
  }

  try {
    // Insert tournament
    await db.tournaments.add(tournament)

    // Create team ID map for weigh-in references
    const teamMap = new Map<number, string>()

    // Insert all teams
    for (const teamImport of data.teams) {
      const teamId = `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      teamMap.set(teamImport.teamNumber, teamId)

      const team: Team = {
        id: teamId,
        tournamentId,
        teamNumber: teamImport.teamNumber,
        members: [
          {
            firstName: teamImport.member1First,
            lastName: teamImport.member1Last
          },
          {
            firstName: teamImport.member2First,
            lastName: teamImport.member2Last
          }
        ],
        status: teamImport.status,
        createdAt: now,
        updatedAt: now
      }

      await db.teams.add(team)
    }

    // Insert all weigh-ins
    let weighInCount = 0
    for (const weighInImport of data.weighIns) {
      const teamId = teamMap.get(weighInImport.teamNumber)
      if (!teamId) {
        throw new Error(
          `Weigh-in references unknown team ${weighInImport.teamNumber}`
        )
      }

      // Determine timestamp based on day
      const timestamp = weighInImport.day === 1
        ? data.tournament.startDate
        : data.tournament.endDate

      const weighIn: WeighIn = {
        id: `weighin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        tournamentId,
        teamId,
        teamNumber: weighInImport.teamNumber,
        day: weighInImport.day,
        fishCount: weighInImport.fishCount,
        rawWeight: weighInImport.rawWeight,
        fishReleased: weighInImport.fishReleased,
        bigFishWeight: weighInImport.bigFish,
        receivedBy: 'imported',
        issuedBy: 'imported',
        timestamp,
        createdAt: now,
        updatedAt: now
      }

      await db.weighIns.add(weighIn)
      weighInCount++
    }

    return {
      tournamentId,
      tournamentName: tournament.name,
      teamCount: data.teams.length,
      weighInCount
    }
  } catch (error) {
    // Cleanup on error: delete what we inserted
    try {
      await db.tournaments.delete(tournamentId)
    } catch {
      // Ignore cleanup errors
    }
    throw error
  }
}
