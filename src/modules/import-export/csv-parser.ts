/**
 * CSV Parser for tournament import/export
 * Handles parsing, validation, and formatting of tournament data in CSV format
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
  section: string
  row: number
  message: string
}

/**
 * Parse CSV content into structured tournament data
 */
export function parseCSV(csvContent: string): ImportedData {
  const lines = csvContent.split('\n').map(line => line.trim())
  let currentSection = ''
  let sectionHeaders: string[] = []
  const data: ImportedData = {
    tournament: {
      name: '',
      year: 0,
      location: '',
      startDate: new Date(),
      endDate: new Date()
    },
    teams: [],
    weighIns: []
  }

  let rowNum = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Skip blank lines and comments
    if (!line || line.startsWith('#')) {
      if (line === '#TOURNAMENT') {
        currentSection = 'tournament'
        sectionHeaders = []
      } else if (line === '#TEAMS') {
        currentSection = 'teams'
        sectionHeaders = []
      } else if (line === '#WEIGH_INS') {
        currentSection = 'weigh-ins'
        sectionHeaders = []
      }
      continue
    }

    // Parse headers
    if (sectionHeaders.length === 0 && currentSection) {
      sectionHeaders = parseCSVLine(line)
      continue
    }

    // Parse data rows
    if (currentSection && sectionHeaders.length > 0) {
      rowNum++
      const values = parseCSVLine(line)
      const row = createRowObject(sectionHeaders, values)

      try {
        if (currentSection === 'tournament') {
          data.tournament = parseTournamentRow(row)
        } else if (currentSection === 'teams') {
          data.teams.push(parseTeamRow(row))
        } else if (currentSection === 'weigh-ins') {
          data.weighIns.push(parseWeighInRow(row))
        }
      } catch (err) {
        throw new Error(
          `${currentSection} row ${rowNum}: ${err instanceof Error ? err.message : 'Unknown error'}`
        )
      }
    }
  }

  return data
}

/**
 * Parse a single CSV line handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"'
        i++
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

/**
 * Create an object from headers and values
 */
function createRowObject(headers: string[], values: string[]): Record<string, string> {
  const obj: Record<string, string> = {}
  for (let i = 0; i < headers.length; i++) {
    obj[headers[i]] = values[i] || ''
  }
  return obj
}

/**
 * Parse tournament row
 */
function parseTournamentRow(row: Record<string, string>): TournamentImport {
  const { name, year, location, start_date, end_date } = row

  if (!name) throw new Error('name is required')
  if (!year) throw new Error('year is required')
  if (!location) throw new Error('location is required')
  if (!start_date) throw new Error('start_date is required')
  if (!end_date) throw new Error('end_date is required')

  const parsedYear = parseInt(year, 10)
  if (isNaN(parsedYear)) throw new Error('year must be a number')

  const startDate = parseDate(start_date)
  if (!startDate) throw new Error('start_date must be in YYYY-MM-DD format')

  const endDate = parseDate(end_date)
  if (!endDate) throw new Error('end_date must be in YYYY-MM-DD format')

  return {
    name,
    year: parsedYear,
    location,
    startDate,
    endDate
  }
}

/**
 * Parse team row
 */
function parseTeamRow(row: Record<string, string>): TeamImport {
  const { team_number, member1_first, member1_last, member2_first, member2_last, status } = row

  if (!team_number) throw new Error('team_number is required')
  if (!member1_first) throw new Error('member1_first is required')
  if (!member1_last) throw new Error('member1_last is required')
  if (!member2_first) throw new Error('member2_first is required')
  if (!member2_last) throw new Error('member2_last is required')
  if (!status) throw new Error('status is required')

  const teamNum = parseInt(team_number, 10)
  if (isNaN(teamNum) || teamNum <= 0) throw new Error('team_number must be a positive integer')

  const validStatus = status.toLowerCase() as 'active' | 'inactive' | 'disqualified'
  if (!['active', 'inactive', 'disqualified'].includes(validStatus)) {
    throw new Error('status must be: active, inactive, or disqualified')
  }

  return {
    teamNumber: teamNum,
    member1First: member1_first,
    member1Last: member1_last,
    member2First: member2_first,
    member2Last: member2_last,
    status: validStatus
  }
}

/**
 * Parse weigh-in row
 */
function parseWeighInRow(row: Record<string, string>): WeighInImport {
  const { team_number, day, fish_count, raw_weight, fish_released, big_fish } = row

  if (!team_number) throw new Error('team_number is required')
  if (!day) throw new Error('day is required')
  if (fish_count === undefined) throw new Error('fish_count is required')
  if (raw_weight === undefined) throw new Error('raw_weight is required')
  if (fish_released === undefined) throw new Error('fish_released is required')

  const teamNum = parseInt(team_number, 10)
  if (isNaN(teamNum) || teamNum <= 0) throw new Error('team_number must be a positive integer')

  const dayNum = parseInt(day, 10)
  if (dayNum !== 1 && dayNum !== 2) throw new Error('day must be 1 or 2')

  const fishCountNum = parseInt(fish_count, 10)
  if (isNaN(fishCountNum) || fishCountNum < 0) throw new Error('fish_count must be a non-negative integer')

  const rawWeightNum = parseFloat(raw_weight)
  if (isNaN(rawWeightNum) || rawWeightNum < 0) throw new Error('raw_weight must be a non-negative number')

  const fishReleasedNum = parseInt(fish_released, 10)
  if (isNaN(fishReleasedNum) || fishReleasedNum < 0) throw new Error('fish_released must be a non-negative integer')

  if (fishReleasedNum > fishCountNum) {
    throw new Error('fish_released cannot exceed fish_count')
  }

  // Parse optional big_fish
  let bigFishNum: number | undefined
  if (big_fish && big_fish.trim() !== '') {
    bigFishNum = parseFloat(big_fish)
    if (isNaN(bigFishNum) || bigFishNum < 0) throw new Error('big_fish must be a non-negative number')
    if (bigFishNum > rawWeightNum) throw new Error('big_fish cannot exceed raw_weight')
  }

  return {
    teamNumber: teamNum,
    day: dayNum as 1 | 2,
    fishCount: fishCountNum,
    rawWeight: parseFloat(rawWeightNum.toFixed(2)),
    fishReleased: fishReleasedNum,
    bigFish: bigFishNum ? parseFloat(bigFishNum.toFixed(2)) : undefined
  }
}

/**
 * Parse ISO date string (YYYY-MM-DD)
 */
function parseDate(dateStr: string): Date | null {
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null

  const [, year, month, day] = match
  const date = new Date(`${year}-${month}-${day}T00:00:00Z`)

  // Verify the date is valid
  if (isNaN(date.getTime())) return null
  return date
}

/**
 * Validate imported data and return errors/warnings
 */
export function validateImportedData(data: ImportedData): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Tournament validation
  if (!data.tournament.name) errors.push('Tournament name is required')
  if (!data.tournament.year) errors.push('Tournament year is required')
  if (!data.tournament.location) errors.push('Tournament location is required')
  if (!data.tournament.startDate) errors.push('Tournament start_date is required')
  if (!data.tournament.endDate) errors.push('Tournament end_date is required')

  if (data.tournament.startDate > data.tournament.endDate) {
    errors.push('Tournament start_date must be before end_date')
  }

  // Teams validation
  if (data.teams.length === 0) {
    errors.push('At least one team is required')
  }

  const teamNumbers = new Set<number>()
  for (const team of data.teams) {
    if (teamNumbers.has(team.teamNumber)) {
      errors.push(`Duplicate team_number: ${team.teamNumber}`)
    }
    teamNumbers.add(team.teamNumber)
  }

  // Weigh-ins validation
  const weighInsByTeamDay = new Map<string, boolean>()

  for (const weighIn of data.weighIns) {
    // Check team exists
    if (!teamNumbers.has(weighIn.teamNumber)) {
      errors.push(`Weigh-in references non-existent team_number: ${weighIn.teamNumber}`)
    }

    // Check duplicate entries
    const key = `${weighIn.teamNumber}-${weighIn.day}`
    if (weighInsByTeamDay.has(key)) {
      errors.push(`Duplicate weigh-in for team ${weighIn.teamNumber} on day ${weighIn.day}`)
    }
    weighInsByTeamDay.set(key, true)
  }

  // Warning: teams without weigh-ins
  for (const team of data.teams) {
    const hasWeighIn = data.weighIns.some(w => w.teamNumber === team.teamNumber)
    if (!hasWeighIn && team.status === 'active') {
      warnings.push(`Team ${team.teamNumber} (${team.member1First} ${team.member1Last}) has no weigh-in data`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Format tournament data as CSV for export
 */
export function formatForExport(
  tournament: {
    name: string
    year: number
    location: string
    startDate: Date
    endDate: Date
  },
  teams: Array<{
    teamNumber: number
    members: Array<{ firstName: string; lastName: string }>
    status: 'active' | 'inactive' | 'disqualified'
  }>,
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
    [
      escapeCSV(tournament.name),
      tournament.year,
      escapeCSV(tournament.location),
      formatDateISO(tournament.startDate),
      formatDateISO(tournament.endDate)
    ].join(',')
  )
  lines.push('')

  // Teams section
  lines.push('#TEAMS')
  lines.push('team_number,member1_first,member1_last,member2_first,member2_last,status')
  for (const team of teams) {
    const m1 = team.members[0]
    const m2 = team.members[1]
    lines.push(
      [
        team.teamNumber,
        escapeCSV(m1.firstName),
        escapeCSV(m1.lastName),
        escapeCSV(m2.firstName),
        escapeCSV(m2.lastName),
        team.status
      ].join(',')
    )
  }
  lines.push('')

  // Weigh-ins section
  lines.push('#WEIGH_INS')
  lines.push('team_number,day,fish_count,raw_weight,fish_released,big_fish')
  for (const weighIn of weighIns) {
    lines.push(
      [
        weighIn.teamNumber,
        weighIn.day,
        weighIn.fishCount,
        weighIn.rawWeight.toFixed(2),
        weighIn.fishReleased,
        weighIn.bigFishWeight?.toFixed(2) || ''
      ].join(',')
    )
  }

  return lines.join('\n')
}

/**
 * Escape CSV field (quote if contains comma, newline, or quote)
 */
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/**
 * Format Date as ISO string (YYYY-MM-DD)
 */
function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0]
}
