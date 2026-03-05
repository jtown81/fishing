/**
 * CSV Import/Export Parser
 * Handles parsing and formatting tournament data in CSV format
 *
 * Format: Three-section CSV with headers for #TOURNAMENT, #TEAMS, #WEIGH_INS
 * See docs/import-export-guide.md for full format specification
 */

/**
 * Imported data types
 */
export interface TournamentImport {
  name: string
  year: number
  location: string
  startDate: Date
  endDate: Date
}

export interface TeamImport {
  teamNumber: number
  member1First: string
  member1Last: string
  member2First: string
  member2Last: string
  status: 'active' | 'inactive' | 'disqualified'
}

export interface WeighInImport {
  teamNumber: number
  day: 1 | 2
  fishCount: number
  rawWeight: number
  fishReleased: number
  bigFish?: number
}

export interface ImportedData {
  tournament: TournamentImport
  teams: TeamImport[]
  weighIns: WeighInImport[]
}

export interface ValidationError {
  section: 'tournament' | 'teams' | 'weigh-ins' | 'cross-section'
  row?: number
  message: string
}

/**
 * Parse CSV content into structured data
 * Throws error if format is invalid
 */
export function parseCSV(csvContent: string): ImportedData {
  const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line.length > 0)

  let currentSection: 'tournament' | 'teams' | 'weigh-ins' | null = null
  let tournamentHeaders: string[] = []
  let teamsHeaders: string[] = []
  let weighInsHeaders: string[] = []

  const tournament: TournamentImport = {
    name: '',
    year: 0,
    location: '',
    startDate: new Date(),
    endDate: new Date()
  }
  const teams: TeamImport[] = []
  const weighIns: WeighInImport[] = []

  for (const line of lines) {
    // Section markers
    if (line === '#TOURNAMENT') {
      currentSection = 'tournament'
      continue
    }
    if (line === '#TEAMS') {
      currentSection = 'teams'
      continue
    }
    if (line === '#WEIGH_INS') {
      currentSection = 'weigh-ins'
      continue
    }

    // Parse headers and data based on current section
    if (currentSection === 'tournament') {
      if (tournamentHeaders.length === 0) {
        tournamentHeaders = parseCSVLine(line)
      } else {
        const values = parseCSVLine(line)
        parseTournamentRow(values, tournamentHeaders, tournament)
      }
    } else if (currentSection === 'teams') {
      if (teamsHeaders.length === 0) {
        teamsHeaders = parseCSVLine(line)
      } else {
        const values = parseCSVLine(line)
        const team = parseTeamRow(values, teamsHeaders)
        if (team) teams.push(team)
      }
    } else if (currentSection === 'weigh-ins') {
      if (weighInsHeaders.length === 0) {
        weighInsHeaders = parseCSVLine(line)
      } else {
        const values = parseCSVLine(line)
        const weighIn = parseWeighInRow(values, weighInsHeaders)
        if (weighIn) weighIns.push(weighIn)
      }
    }
  }

  return { tournament, teams, weighIns }
}

/**
 * Parse a CSV line using RFC 4180 rules
 * Handles quoted fields with escaped quotes
 */
export function parseCSVLine(line: string): string[] {
  const fields: string[] = []
  let currentField = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"'
        i++ // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      fields.push(currentField.trim())
      currentField = ''
    } else {
      currentField += char
    }
  }

  // Add final field
  fields.push(currentField.trim())

  return fields
}

/**
 * Parse tournament row
 */
function parseTournamentRow(
  values: string[],
  headers: string[],
  tournament: TournamentImport
): void {
  const row: Record<string, string> = {}
  headers.forEach((header, idx) => {
    row[header.toLowerCase()] = values[idx] || ''
  })

  tournament.name = row['name'] || ''
  tournament.year = parseInt(row['year'], 10) || 0
  tournament.location = row['location'] || ''
  tournament.startDate = parseDate(row['start_date']) || new Date()
  tournament.endDate = parseDate(row['end_date']) || new Date()
}

/**
 * Parse team row
 */
function parseTeamRow(values: string[], headers: string[]): TeamImport | null {
  const row: Record<string, string> = {}
  headers.forEach((header, idx) => {
    row[header.toLowerCase()] = values[idx] || ''
  })

  const teamNumber = parseInt(row['team_number'], 10) || 0
  const status = (row['status'] || 'active').toLowerCase() as 'active' | 'inactive' | 'disqualified'

  // Skip if empty row
  if (teamNumber === 0 && !row['member1_first']) {
    return null
  }

  return {
    teamNumber,
    member1First: row['member1_first'] || '',
    member1Last: row['member1_last'] || '',
    member2First: row['member2_first'] || '',
    member2Last: row['member2_last'] || '',
    status: ['active', 'inactive', 'disqualified'].includes(status) ? status : 'active'
  }
}

/**
 * Parse weigh-in row
 */
function parseWeighInRow(values: string[], headers: string[]): WeighInImport | null {
  const row: Record<string, string> = {}
  headers.forEach((header, idx) => {
    row[header.toLowerCase()] = values[idx] || ''
  })

  const teamNumber = parseInt(row['team_number'], 10) || 0
  const dayRaw = parseInt(row['day'], 10) || 0
  const day = (dayRaw === 1 || dayRaw === 2 ? dayRaw : 0) as 1 | 2
  const fishCount = parseInt(row['fish_count'], 10) || 0
  const rawWeight = parseFloat(row['raw_weight']) || 0
  const fishReleased = parseInt(row['fish_released'], 10) || 0
  const bigFish = row['big_fish'] ? parseFloat(row['big_fish']) : undefined

  // Skip if empty row (both teamNumber and day are missing/invalid)
  if (teamNumber === 0) {
    return null
  }

  return {
    teamNumber,
    day,
    fishCount,
    rawWeight,
    fishReleased,
    bigFish: bigFish && bigFish > 0 ? bigFish : undefined
  }
}

/**
 * Parse ISO date string (YYYY-MM-DD)
 */
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null
  const [, year, month, day] = match
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
}

/**
 * Validate imported data
 * Returns all errors found (empty array if valid)
 */
export function validateImportedData(data: ImportedData): ValidationError[] {
  const errors: ValidationError[] = []

  // Validate tournament
  if (!data.tournament.name || data.tournament.name.trim().length === 0) {
    errors.push({
      section: 'tournament',
      message: 'Tournament name is required'
    })
  }

  if (data.tournament.year < 1900 || data.tournament.year > 2100) {
    errors.push({
      section: 'tournament',
      message: `Tournament year must be between 1900 and 2100 (got ${data.tournament.year})`
    })
  }

  if (!data.tournament.location || data.tournament.location.trim().length === 0) {
    errors.push({
      section: 'tournament',
      message: 'Tournament location is required'
    })
  }

  if (data.tournament.startDate > data.tournament.endDate) {
    errors.push({
      section: 'tournament',
      message: 'Start date must be before end date'
    })
  }

  // Validate teams
  if (data.teams.length === 0) {
    errors.push({
      section: 'teams',
      message: 'At least one team is required'
    })
  }

  const teamNumbers = new Set<number>()
  data.teams.forEach((team, idx) => {
    const row = idx + 2 // +1 for header, +1 for 1-indexed

    if (team.teamNumber <= 0) {
      errors.push({
        section: 'teams',
        row,
        message: `Team number must be positive (got ${team.teamNumber})`
      })
    }

    if (teamNumbers.has(team.teamNumber)) {
      errors.push({
        section: 'teams',
        row,
        message: `Duplicate team number: ${team.teamNumber}`
      })
    }
    teamNumbers.add(team.teamNumber)

    if (!team.member1First || !team.member1Last) {
      errors.push({
        section: 'teams',
        row,
        message: `Team ${team.teamNumber}: Member 1 first and last name required`
      })
    }

    if (!team.member2First || !team.member2Last) {
      errors.push({
        section: 'teams',
        row,
        message: `Team ${team.teamNumber}: Member 2 first and last name required`
      })
    }

    const validStatuses = ['active', 'inactive', 'disqualified']
    if (!validStatuses.includes(team.status)) {
      errors.push({
        section: 'teams',
        row,
        message: `Team ${team.teamNumber}: Invalid status '${team.status}' (must be: active, inactive, or disqualified)`
      })
    }
  })

  // Validate weigh-ins
  const weighInsByTeamDay = new Map<string, WeighInImport>()
  data.weighIns.forEach((weighIn, idx) => {
    const row = idx + 2 // Account for header

    if (weighIn.day !== 1 && weighIn.day !== 2) {
      errors.push({
        section: 'weigh-ins',
        row,
        message: `Team ${weighIn.teamNumber}: Day must be 1 or 2 (got ${weighIn.day})`
      })
    }

    if (weighIn.fishCount < 0) {
      errors.push({
        section: 'weigh-ins',
        row,
        message: `Team ${weighIn.teamNumber} Day ${weighIn.day}: fish_count cannot be negative`
      })
    }

    if (weighIn.rawWeight < 0) {
      errors.push({
        section: 'weigh-ins',
        row,
        message: `Team ${weighIn.teamNumber} Day ${weighIn.day}: raw_weight cannot be negative`
      })
    }

    if (weighIn.fishReleased < 0) {
      errors.push({
        section: 'weigh-ins',
        row,
        message: `Team ${weighIn.teamNumber} Day ${weighIn.day}: fish_released cannot be negative`
      })
    }

    if (weighIn.fishReleased > weighIn.fishCount) {
      errors.push({
        section: 'weigh-ins',
        row,
        message: `Team ${weighIn.teamNumber} Day ${weighIn.day}: fish_released (${weighIn.fishReleased}) cannot exceed fish_count (${weighIn.fishCount})`
      })
    }

    if (weighIn.bigFish !== undefined && weighIn.bigFish > weighIn.rawWeight) {
      errors.push({
        section: 'weigh-ins',
        row,
        message: `Team ${weighIn.teamNumber} Day ${weighIn.day}: big_fish (${weighIn.bigFish}) cannot exceed raw_weight (${weighIn.rawWeight})`
      })
    }

    // Check for duplicate team+day
    const key = `${weighIn.teamNumber}-${weighIn.day}`
    if (weighInsByTeamDay.has(key)) {
      errors.push({
        section: 'weigh-ins',
        row,
        message: `Team ${weighIn.teamNumber}: Duplicate entry for day ${weighIn.day}`
      })
    }
    weighInsByTeamDay.set(key, weighIn)
  })

  // Cross-section validation: weigh-in teams must exist in teams list
  data.weighIns.forEach((weighIn, idx) => {
    if (!teamNumbers.has(weighIn.teamNumber)) {
      const row = idx + 2
      errors.push({
        section: 'cross-section',
        row,
        message: `Weigh-in for team ${weighIn.teamNumber} but team not found in teams list`
      })
    }
  })

  return errors
}

/**
 * Format tournament data as CSV for export
 * Returns CSV string ready for file download
 */
export function formatForExport(
  tournament: { name: string; year: number; location: string; startDate: Date; endDate: Date },
  teams: Array<{ teamNumber: number; members: Array<{ firstName: string; lastName: string }>; status: string }>,
  weighIns: Array<{
    teamNumber: number
    day: 1 | 2
    fishCount: number
    rawWeight: number
    fishReleased: number
    bigFishWeight?: number
  }>
): string {
  const lines: string[] = []

  // Tournament section
  lines.push('#TOURNAMENT')
  lines.push('name,year,location,start_date,end_date')
  lines.push(
    formatCSVLine([
      tournament.name,
      tournament.year.toString(),
      tournament.location,
      formatDateISO(tournament.startDate),
      formatDateISO(tournament.endDate)
    ])
  )

  // Teams section
  lines.push('')
  lines.push('#TEAMS')
  lines.push('team_number,member1_first,member1_last,member2_first,member2_last,status')
  teams.forEach(team => {
    const member1 = team.members[0] || { firstName: '', lastName: '' }
    const member2 = team.members[1] || { firstName: '', lastName: '' }
    lines.push(
      formatCSVLine([
        team.teamNumber.toString(),
        member1.firstName,
        member1.lastName,
        member2.firstName,
        member2.lastName,
        team.status
      ])
    )
  })

  // Weigh-ins section
  lines.push('')
  lines.push('#WEIGH_INS')
  lines.push('team_number,day,fish_count,raw_weight,fish_released,big_fish')
  weighIns.forEach(weighIn => {
    lines.push(
      formatCSVLine([
        weighIn.teamNumber.toString(),
        weighIn.day.toString(),
        weighIn.fishCount.toString(),
        weighIn.rawWeight.toFixed(2),
        weighIn.fishReleased.toString(),
        weighIn.bigFishWeight ? weighIn.bigFishWeight.toFixed(2) : ''
      ])
    )
  })

  return lines.join('\n')
}

/**
 * Format values as CSV line, handling quoting and escaping
 */
function formatCSVLine(fields: string[]): string {
  return fields
    .map(field => {
      // Quote field if it contains comma, quote, or newline
      if (field.includes(',') || field.includes('"') || field.includes('\n')) {
        // Escape quotes by doubling them
        const escaped = field.replace(/"/g, '""')
        return `"${escaped}"`
      }
      return field
    })
    .join(',')
}

/**
 * Format date as ISO string (YYYY-MM-DD)
 */
function formatDateISO(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
