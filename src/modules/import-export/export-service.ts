/**
 * Export Service
 * Handles exporting tournament data to CSV format
 */

import { db } from '@db/database'
import { formatForExport } from './csv-parser'

export interface ExportResult {
  filename: string
  csvContent: string
}

/**
 * Prepare tournament data for CSV export
 * Fetches tournament, teams, and weigh-ins, returns formatted CSV
 */
export async function prepareTournamentExport(tournamentId: string): Promise<ExportResult> {
  // Fetch tournament
  const tournament = await db.tournaments.get(tournamentId)
  if (!tournament) {
    throw new Error(`Tournament ${tournamentId} not found`)
  }

  // Fetch teams
  const teams = await db.teams.where('tournamentId').equals(tournamentId).toArray()
  if (teams.length === 0) {
    throw new Error(`No teams found for tournament ${tournamentId}`)
  }

  // Fetch weigh-ins
  const weighIns = await db.weighIns.where('tournamentId').equals(tournamentId).toArray()

  // Format as CSV
  const csvContent = formatForExport(
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
    weighIns.map(w => ({
      teamNumber: w.teamNumber,
      day: w.day,
      fishCount: w.fishCount,
      rawWeight: w.rawWeight,
      fishReleased: w.fishReleased,
      bigFishWeight: w.bigFishWeight
    }))
  )

  // Generate filename
  const filename = `tournament-${tournament.year}-${tournament.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.csv`

  return {
    filename,
    csvContent
  }
}

/**
 * Download CSV file to user's computer
 * Call this in response to download button click
 */
export function downloadCSV(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
