/**
 * Parks & Wildlife Management Report Service
 *
 * Generates formatted reports for submission to game/fish/parks agencies
 * Includes harvest data, participation metrics, weight statistics, and trends
 *
 * Source: roadmap.md §5.2 & §5.3
 */

import type { WeighIn, Team } from '@models/tournament'
import type { CoreStats } from '@modules/stats'

/**
 * Parks report data structure
 */
export interface ParksReport {
  // Header info
  eventName: string
  location: string
  year: number
  startDate: Date
  endDate: Date

  // Participation
  registeredTeams: number
  teamsFishingDay1: number
  teamsFishingDay2: number
  dNFTeams: number
  dNFRate: number

  // Harvest
  totalFishCaught: number
  totalFishReleased: number
  fishKept: number
  releaseRate: number
  catchPerTeam: number

  // Weight data
  totalWeightDay1: number
  totalWeightDay2: number
  totalWeightCombined: number
  avgFishWeight: number
  medianFishWeight: number
  largestFish: {
    weight: number
    teamNumber: number
  } | null
  weightStdDev: number

  // GPS locations (anonymized/rounded)
  locations?: Array<{ lat: number; lng: number }>

  // Statistics
  stats: CoreStats
}

/**
 * Generate Parks & Wildlife report from tournament data
 */
export function generateParksReport(
  tournament: any,
  teams: Team[],
  weighIns: WeighIn[],
  coreStats: CoreStats
): ParksReport {
  // Participation metrics
  const day1Teams = new Set(weighIns.filter(w => w.day === 1).map(w => w.teamId))
  const day2Teams = new Set(weighIns.filter(w => w.day === 2).map(w => w.teamId))
  const fishingTeams = new Set([...day1Teams, ...day2Teams])
  const dNFTeams = teams.length - fishingTeams.size

  // Harvest metrics
  const totalCaught = coreStats.totalFishCaught
  const totalReleased = coreStats.totalFishReleased
  const fishKept = totalCaught - totalReleased

  // Weight metrics
  const day1WeighIns = weighIns.filter(w => w.day === 1)
  const day2WeighIns = weighIns.filter(w => w.day === 2)
  const totalWeightDay1 = day1WeighIns.reduce((sum, w) => sum + w.rawWeight, 0)
  const totalWeightDay2 = day2WeighIns.reduce((sum, w) => sum + w.rawWeight, 0)
  const allWeights = weighIns.map(w => w.rawWeight)
  const avgFishWeight = allWeights.length > 0
    ? allWeights.reduce((a, b) => a + b, 0) / allWeights.length
    : 0
  const medianWeight = calculateMedian(allWeights.filter(w => w > 0))

  // Find largest fish
  let largestFish: { weight: number; teamNumber: number } | null = null
  let maxWeight = 0
  for (const weighIn of weighIns) {
    if ((weighIn.bigFishWeight || 0) > maxWeight) {
      maxWeight = weighIn.bigFishWeight || 0
      largestFish = {
        weight: maxWeight,
        teamNumber: weighIn.teamNumber
      }
    }
  }

  // Extract and round GPS locations for privacy
  const locations = weighIns
    .filter((w) => w.fishingLocation)
    .map((w) => ({
      lat: Math.round(w.fishingLocation!.lat * 1000) / 1000,
      lng: Math.round(w.fishingLocation!.lng * 1000) / 1000
    }))

  return {
    eventName: tournament.name,
    location: tournament.location || 'Unknown Location',
    year: tournament.year,
    startDate: tournament.startDate,
    endDate: tournament.endDate,

    registeredTeams: teams.length,
    teamsFishingDay1: day1Teams.size,
    teamsFishingDay2: day2Teams.size,
    dNFTeams,
    dNFRate: teams.length > 0 ? (dNFTeams / teams.length) * 100 : 0,

    totalFishCaught: totalCaught,
    totalFishReleased: totalReleased,
    fishKept,
    releaseRate: totalCaught > 0 ? (totalReleased / totalCaught) * 100 : 0,
    catchPerTeam: teams.length > 0 ? totalCaught / teams.length : 0,

    totalWeightDay1,
    totalWeightDay2,
    totalWeightCombined: totalWeightDay1 + totalWeightDay2,
    avgFishWeight,
    medianFishWeight: medianWeight,
    largestFish,
    weightStdDev: coreStats.day1StdDev, // Use day 1 as representative

    ...(locations.length > 0 && { locations }),

    stats: coreStats
  }
}

/**
 * Calculate median of array
 */
function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2
}

/**
 * Format Parks report as CSV string
 */
export function exportParksReportCSV(report: ParksReport): string {
  const lines: string[] = []

  // Header
  lines.push('TOURNAMENT FISHERIES REPORT')
  lines.push('')

  // Event info
  lines.push('EVENT INFORMATION')
  lines.push(`Event,${report.eventName}`)
  lines.push(`Location,${report.location}`)
  lines.push(`Year,${report.year}`)
  lines.push(`Date,${formatDate(report.startDate)} - ${formatDate(report.endDate)}`)
  lines.push('')

  // Participation
  lines.push('PARTICIPATION')
  lines.push(`Registered Teams,${report.registeredTeams}`)
  lines.push(`Teams Fishing Day 1,${report.teamsFishingDay1}`)
  lines.push(`Teams Fishing Day 2,${report.teamsFishingDay2}`)
  lines.push(`Did Not Finish,${report.dNFTeams}`)
  lines.push(`DNF Rate,${report.dNFRate.toFixed(1)}%`)
  lines.push('')

  // Harvest
  lines.push('HARVEST DATA')
  lines.push(`Total Fish Caught,${report.totalFishCaught}`)
  lines.push(`Total Fish Released,${report.totalFishReleased}`)
  lines.push(`Fish Kept,${report.fishKept}`)
  lines.push(`Release Rate,${report.releaseRate.toFixed(1)}%`)
  lines.push(`Catch Per Team (avg),${report.catchPerTeam.toFixed(2)}`)
  lines.push('')

  // Weight data
  lines.push('WEIGHT DATA')
  lines.push(`Total Weight Day 1,${report.totalWeightDay1.toFixed(2)} lbs`)
  lines.push(`Total Weight Day 2,${report.totalWeightDay2.toFixed(2)} lbs`)
  lines.push(`Total Weight Combined,${report.totalWeightCombined.toFixed(2)} lbs`)
  lines.push(`Average Fish Weight,${report.avgFishWeight.toFixed(2)} lbs`)
  lines.push(`Median Fish Weight,${report.medianFishWeight.toFixed(2)} lbs`)
  if (report.largestFish) {
    lines.push(
      `Largest Fish,${report.largestFish.weight.toFixed(2)} lbs (Team #${report.largestFish.teamNumber})`
    )
  }
  lines.push(`Weight Standard Deviation,${report.weightStdDev.toFixed(2)} lbs`)
  lines.push('')

  // Additional stats
  lines.push('ADDITIONAL STATISTICS')
  lines.push(`Big Fish Day 1,${report.stats.bigFishDay1 ? report.stats.bigFishDay1.toFixed(2) : 'N/A'} lbs`)
  lines.push(`Big Fish Day 2,${report.stats.bigFishDay2 ? report.stats.bigFishDay2.toFixed(2) : 'N/A'} lbs`)
  lines.push(`Avg Big Fish,${report.stats.avgBigFish.toFixed(2)} lbs`)
  lines.push(`Teams With Fish,${report.stats.teamsWithFish}`)
  lines.push('')

  // Fishing locations (if available)
  if (report.locations && report.locations.length > 0) {
    lines.push('FISHING LOCATIONS')
    lines.push('Latitude,Longitude')
    report.locations.forEach((loc) => {
      lines.push(`${loc.lat.toFixed(3)},${loc.lng.toFixed(3)}`)
    })
  }

  return lines.join('\n')
}

/**
 * Format date for reports
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  }).format(date)
}

/**
 * Generate filename for export
 */
export function generateParksReportFilename(report: ParksReport): string {
  const dateStr = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(report.startDate)

  return `Parks_Report_${report.eventName}_${dateStr}.csv`
}
