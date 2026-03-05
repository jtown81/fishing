/**
 * Export service for preparing tournament data as CSV
 * Fetches data from the database and formats it for export
 */

import { db } from '@db/database'
import { formatForExport } from './csv-parser'

/**
 * Prepare a tournament for export as CSV
 * Returns the CSV content as a string
 */
export async function prepareTournamentExport(tournamentId: string): Promise<string> {
  // Fetch tournament
  const tournament = await db.tournaments.get(tournamentId)
  if (!tournament) {
    throw new Error(`Tournament with ID ${tournamentId} not found`)
  }

  // Fetch teams
  const teams = await db.teams
    .where('tournamentId')
    .equals(tournamentId)
    .toArray()

  // Fetch weigh-ins
  const weighIns = await db.weighIns
    .where('tournamentId')
    .equals(tournamentId)
    .toArray()

  // Format and return CSV
  return formatForExport(
    {
      name: tournament.name,
      year: tournament.year,
      location: tournament.location,
      startDate: tournament.startDate,
      endDate: tournament.endDate
    },
    teams.map(team => ({
      teamNumber: team.teamNumber,
      members: team.members,
      status: team.status
    })),
    weighIns.map(weighIn => ({
      teamNumber: weighIn.teamNumber,
      day: weighIn.day,
      fishCount: weighIn.fishCount,
      rawWeight: weighIn.rawWeight,
      fishReleased: weighIn.fishReleased,
      bigFishWeight: weighIn.bigFishWeight
    }))
  )
}

/**
 * Generate a filename for tournament export
 */
export function generateExportFilename(tournamentName: string, year: number): string {
  const sanitized = tournamentName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')
  return `${sanitized}-${year}-${new Date().toISOString().split('T')[0]}.csv`
}
