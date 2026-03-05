/**
 * Import Service
 * Handles validation and database operations for tournament imports
 */

import { db } from '@db/database'
import type { ImportedData, ValidationError } from './csv-parser'
import { validateImportedData } from './csv-parser'
import type { Tournament, Team, WeighIn } from '@models/tournament'

export interface ImportValidation {
  isValid: boolean
  errors: ValidationError[]
  warnings: string[]
}

export interface ImportResult {
  tournamentId: string
  teamCount: number
  weighInCount: number
  summary: string
}

/**
 * Validate imported data before import
 * Checks for errors and warnings
 */
export async function validateBeforeImport(data: ImportedData): Promise<ImportValidation> {
  const errors = validateImportedData(data)
  const warnings: string[] = []

  // Additional warnings (non-fatal)
  if (data.teams.some(t => t.status === 'inactive' || t.status === 'disqualified')) {
    const nonActiveCount = data.teams.filter(t => t.status !== 'active').length
    warnings.push(`${nonActiveCount} team(s) with non-active status`)
  }

  // Check for teams missing weigh-in data
  const weighInTeamDays = new Map<number, Set<number>>()
  data.weighIns.forEach(w => {
    if (!weighInTeamDays.has(w.teamNumber)) {
      weighInTeamDays.set(w.teamNumber, new Set())
    }
    weighInTeamDays.get(w.teamNumber)!.add(w.day)
  })

  data.teams.forEach(team => {
    if (team.status === 'active') {
      const days = weighInTeamDays.get(team.teamNumber) || new Set()
      if (days.size === 0) {
        warnings.push(`Team ${team.teamNumber} (${team.member1First} ${team.member1Last}) has no weigh-in data`)
      } else if (days.size === 1) {
        const day = days.has(1) ? 1 : 2
        const otherDay = day === 1 ? 2 : 1
        warnings.push(`Team ${team.teamNumber} missing Day ${otherDay} weigh-in data`)
      }
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Import tournament data into IndexedDB
 * Creates tournament, teams, and weigh-in records
 * Throws error if tournament already exists (same name+year)
 */
export async function importTournament(data: ImportedData): Promise<ImportResult> {
  // Validate data first
  const validation = await validateBeforeImport(data)
  if (!validation.isValid) {
    const errorMessages = validation.errors.map(e => `${e.section} ${e.row ? `(row ${e.row})` : ''}: ${e.message}`).join('\n')
    throw new Error(`Import validation failed:\n${errorMessages}`)
  }

  // Check for existing tournament with same name and year
  const existing = await db.tournaments
    .where('name')
    .equals(data.tournament.name)
    .filter(t => t.year === data.tournament.year)
    .first()

  if (existing) {
    throw new Error(
      `Tournament "${data.tournament.name}" (${data.tournament.year}) already exists. Please use a different name or year.`
    )
  }

  const now = new Date()
  const tournamentId = `tournament-imported-${data.tournament.year}-${Date.now()}`

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

  await db.tournaments.add(tournament)

  // Create team records and associated weigh-ins
  let weighInCount = 0

  for (const teamData of data.teams) {
    const teamId = `team-imported-${tournamentId}-${teamData.teamNumber}`

    // Create team
    const team: Team = {
      id: teamId,
      tournamentId,
      teamNumber: teamData.teamNumber,
      members: [
        {
          firstName: teamData.member1First,
          lastName: teamData.member1Last
        },
        {
          firstName: teamData.member2First,
          lastName: teamData.member2Last
        }
      ],
      status: teamData.status,
      createdAt: now,
      updatedAt: now
    }

    await db.teams.add(team)

    // Create weigh-in records for this team
    const teamWeighIns = data.weighIns.filter(w => w.teamNumber === teamData.teamNumber)
    for (const weighInData of teamWeighIns) {
      const weighIn: WeighIn = {
        id: `weighin-imported-${tournamentId}-${teamData.teamNumber}-${weighInData.day}`,
        tournamentId,
        teamId,
        teamNumber: teamData.teamNumber,
        day: weighInData.day,
        fishCount: weighInData.fishCount,
        rawWeight: weighInData.rawWeight,
        fishReleased: weighInData.fishReleased,
        bigFishWeight: weighInData.bigFish,
        receivedBy: 'imported',
        issuedBy: 'imported',
        // Use start date for day 1, end date for day 2
        timestamp: weighInData.day === 1 ? data.tournament.startDate : data.tournament.endDate,
        createdAt: now,
        updatedAt: now
      }

      await db.weighIns.add(weighIn)
      weighInCount++
    }
  }

  return {
    tournamentId,
    teamCount: data.teams.length,
    weighInCount,
    summary: `Imported "${data.tournament.name}" (${data.tournament.year}) with ${data.teams.length} teams and ${weighInCount} weigh-ins`
  }
}

/**
 * Check if a tournament with given name and year already exists
 */
export async function tournamentExists(name: string, year: number): Promise<boolean> {
  const existing = await db.tournaments
    .where('name')
    .equals(name)
    .filter(t => t.year === year)
    .first()

  return !!existing
}
