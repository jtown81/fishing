/**
 * CSV Import Tests
 * Comprehensive tests for CSV parsing, validation, and import functionality
 */

import { describe, it, expect } from 'vitest'
import {
  parseCSV,
  parseCSVLine,
  validateImportedData,
  formatForExport,
  type ImportedData
} from '@modules/import-export'

describe('CSV Parsing', () => {
  // CSV line parsing tests
  describe('parseCSVLine', () => {
    it('should parse simple comma-separated values', () => {
      const line = 'name,year,location,start_date,end_date'
      const result = parseCSVLine(line)
      expect(result).toEqual(['name', 'year', 'location', 'start_date', 'end_date'])
    })

    it('should handle quoted fields with commas', () => {
      const line = '"Smith, John",2024,Lake XYZ,2024-01-01,2024-01-02'
      const result = parseCSVLine(line)
      expect(result[0]).toBe('Smith, John')
      expect(result[1]).toBe('2024')
    })

    it('should handle escaped quotes in quoted fields', () => {
      const line = '"He said ""hello""",2024'
      const result = parseCSVLine(line)
      expect(result[0]).toBe('He said "hello"')
      expect(result[1]).toBe('2024')
    })

    it('should trim whitespace from fields', () => {
      const line = '  name  ,  value  , other '
      const result = parseCSVLine(line)
      expect(result).toEqual(['name', 'value', 'other'])
    })

    it('should handle empty fields', () => {
      const line = 'a,,c,d'
      const result = parseCSVLine(line)
      expect(result).toEqual(['a', '', 'c', 'd'])
    })
  })

  // Full CSV parsing tests
  describe('parseCSV', () => {
    it('should parse minimal valid CSV', () => {
      const csv = `#TOURNAMENT
name,year,location,start_date,end_date
Test Tournament,2024,Lake XYZ,2024-01-01,2024-01-02

#TEAMS
team_number,member1_first,member1_last,member2_first,member2_last,status
1,John,Doe,Jane,Smith,active

#WEIGH_INS
team_number,day,fish_count,raw_weight,fish_released,big_fish
1,1,5,15.20,1,4.50`

      const result = parseCSV(csv)
      expect(result.tournament.name).toBe('Test Tournament')
      expect(result.tournament.year).toBe(2024)
      expect(result.teams).toHaveLength(1)
      expect(result.teams[0].teamNumber).toBe(1)
      expect(result.weighIns).toHaveLength(1)
      expect(result.weighIns[0].fishCount).toBe(5)
    })

    it('should parse CSV with multiple teams and weigh-ins', () => {
      const csv = `#TOURNAMENT
name,year,location,start_date,end_date
2024 Event,2024,Lake,2024-06-01,2024-06-02

#TEAMS
team_number,member1_first,member1_last,member2_first,member2_last,status
1,Brandon,Seitz,Rob,Crandall,active
2,John,Doe,Jane,Smith,active
3,Matt,James,Chad,Porsch,inactive

#WEIGH_INS
team_number,day,fish_count,raw_weight,fish_released,big_fish
1,1,5,15.20,2,4.50
1,2,4,12.80,3,4.20
2,1,6,18.00,1,5.25
2,2,5,16.50,2,5.10
3,1,0,0,0,`

      const result = parseCSV(csv)
      expect(result.teams).toHaveLength(3)
      expect(result.weighIns).toHaveLength(5)
      expect(result.teams[2].status).toBe('inactive')
    })

    it('should handle missing optional big_fish field', () => {
      const csv = `#TOURNAMENT
name,year,location,start_date,end_date
Test,2024,Lake,2024-01-01,2024-01-02

#TEAMS
team_number,member1_first,member1_last,member2_first,member2_last,status
1,John,Doe,Jane,Smith,active

#WEIGH_INS
team_number,day,fish_count,raw_weight,fish_released,big_fish
1,1,5,15.20,1,`

      const result = parseCSV(csv)
      expect(result.weighIns[0].bigFish).toBeUndefined()
    })

    it('should ignore blank lines', () => {
      const csv = `#TOURNAMENT
name,year,location,start_date,end_date
Test,2024,Lake,2024-01-01,2024-01-02

#TEAMS
team_number,member1_first,member1_last,member2_first,member2_last,status

1,John,Doe,Jane,Smith,active`

      const result = parseCSV(csv)
      expect(result.teams).toHaveLength(1)
    })

    it('should coerce string values to appropriate types', () => {
      const csv = `#TOURNAMENT
name,year,location,start_date,end_date
Test,2024,Lake,2024-01-01,2024-01-02

#TEAMS
team_number,member1_first,member1_last,member2_first,member2_last,status
1,John,Doe,Jane,Smith,active

#WEIGH_INS
team_number,day,fish_count,raw_weight,fish_released,big_fish
1,1,5,15.20,2,4.50`

      const result = parseCSV(csv)
      expect(typeof result.tournament.year).toBe('number')
      expect(typeof result.teams[0].teamNumber).toBe('number')
      expect(typeof result.weighIns[0].fishCount).toBe('number')
      expect(typeof result.weighIns[0].rawWeight).toBe('number')
    })
  })
})

describe('CSV Validation', () => {
  const createValidData = (): ImportedData => ({
    tournament: {
      name: 'Test Tournament',
      year: 2024,
      location: 'Lake XYZ',
      startDate: new Date(2024, 5, 1),
      endDate: new Date(2024, 5, 2)
    },
    teams: [
      {
        teamNumber: 1,
        member1First: 'John',
        member1Last: 'Doe',
        member2First: 'Jane',
        member2Last: 'Smith',
        status: 'active'
      }
    ],
    weighIns: [
      {
        teamNumber: 1,
        day: 1,
        fishCount: 5,
        rawWeight: 15.2,
        fishReleased: 2,
        bigFish: 4.5
      }
    ]
  })

  it('should accept valid data', () => {
    const data = createValidData()
    const errors = validateImportedData(data)
    expect(errors).toHaveLength(0)
  })

  it('should reject missing tournament name', () => {
    const data = createValidData()
    data.tournament.name = ''
    const errors = validateImportedData(data)
    expect(errors.some(e => e.section === 'tournament' && e.message.includes('name'))).toBe(true)
  })

  it('should reject invalid tournament year', () => {
    const data = createValidData()
    data.tournament.year = 1800
    const errors = validateImportedData(data)
    expect(errors.some(e => e.section === 'tournament' && e.message.includes('year'))).toBe(true)
  })

  it('should reject start date after end date', () => {
    const data = createValidData()
    data.tournament.startDate = new Date(2024, 5, 2)
    data.tournament.endDate = new Date(2024, 5, 1)
    const errors = validateImportedData(data)
    expect(errors.some(e => e.message.includes('Start date'))).toBe(true)
  })

  it('should reject empty teams list', () => {
    const data = createValidData()
    data.teams = []
    const errors = validateImportedData(data)
    expect(errors.some(e => e.section === 'teams' && e.message.includes('At least one team'))).toBe(true)
  })

  it('should reject duplicate team numbers', () => {
    const data = createValidData()
    data.teams.push({
      teamNumber: 1, // duplicate
      member1First: 'Bob',
      member1Last: 'Jones',
      member2First: 'Alice',
      member2Last: 'Brown',
      status: 'active'
    })
    const errors = validateImportedData(data)
    expect(errors.some(e => e.message.includes('Duplicate team number'))).toBe(true)
  })

  it('should reject non-positive team numbers', () => {
    const data = createValidData()
    data.teams[0].teamNumber = 0
    const errors = validateImportedData(data)
    expect(errors.some(e => e.message.includes('must be positive'))).toBe(true)
  })

  it('should reject missing team member names', () => {
    const data = createValidData()
    data.teams[0].member1First = ''
    const errors = validateImportedData(data)
    expect(errors.some(e => e.message.includes('Member 1'))).toBe(true)
  })

  it('should reject invalid team status', () => {
    const data = createValidData()
    data.teams[0].status = 'invalid' as any
    const errors = validateImportedData(data)
    expect(errors.some(e => e.message.includes('Invalid status'))).toBe(true)
  })

  it('should reject invalid day value', () => {
    const data = createValidData()
    data.weighIns[0].day = 3 as any
    const errors = validateImportedData(data)
    expect(errors.some(e => e.message.includes('Day must be 1 or 2'))).toBe(true)
  })

  it('should reject negative fish count', () => {
    const data = createValidData()
    data.weighIns[0].fishCount = -1
    const errors = validateImportedData(data)
    expect(errors.some(e => e.message.includes('fish_count cannot be negative'))).toBe(true)
  })

  it('should reject fish_released > fish_count', () => {
    const data = createValidData()
    data.weighIns[0].fishCount = 3
    data.weighIns[0].fishReleased = 5
    const errors = validateImportedData(data)
    expect(errors.some(e => e.message.includes('cannot exceed'))).toBe(true)
  })

  it('should reject big_fish > raw_weight', () => {
    const data = createValidData()
    data.weighIns[0].rawWeight = 10
    data.weighIns[0].bigFish = 15
    const errors = validateImportedData(data)
    expect(errors.some(e => e.message.includes('big_fish') && e.message.includes('cannot exceed'))).toBe(true)
  })

  it('should reject duplicate team+day entries', () => {
    const data = createValidData()
    data.weighIns.push({
      teamNumber: 1,
      day: 1, // duplicate day
      fishCount: 3,
      rawWeight: 12,
      fishReleased: 1
    })
    const errors = validateImportedData(data)
    expect(errors.some(e => e.message.includes('Duplicate entry'))).toBe(true)
  })

  it('should reject weigh-in for non-existent team', () => {
    const data = createValidData()
    data.weighIns[0].teamNumber = 999 // not in teams list
    const errors = validateImportedData(data)
    expect(errors.some(e => e.section === 'cross-section')).toBe(true)
  })
})

describe('CSV Export', () => {
  it('should format tournament data as CSV', () => {
    const tournament = {
      name: 'Test Tournament',
      year: 2024,
      location: 'Lake XYZ',
      startDate: new Date(2024, 5, 1),
      endDate: new Date(2024, 5, 2)
    }

    const teams = [
      {
        teamNumber: 1,
        members: [
          { firstName: 'John', lastName: 'Doe' },
          { firstName: 'Jane', lastName: 'Smith' }
        ],
        status: 'active'
      }
    ]

    const weighIns = [
      {
        teamNumber: 1,
        day: 1 as const,
        fishCount: 5,
        rawWeight: 15.2,
        fishReleased: 2,
        bigFishWeight: 4.5
      }
    ]

    const csv = formatForExport(tournament, teams, weighIns)

    expect(csv).toContain('#TOURNAMENT')
    expect(csv).toContain('Test Tournament')
    expect(csv).toContain('#TEAMS')
    expect(csv).toContain('John,Doe')
    expect(csv).toContain('#WEIGH_INS')
    expect(csv).toContain('15.20')
  })

  it('should round-trip: parse -> format -> parse', () => {
    const original = `#TOURNAMENT
name,year,location,start_date,end_date
Test Tournament,2024,Lake XYZ,2024-06-01,2024-06-02

#TEAMS
team_number,member1_first,member1_last,member2_first,member2_last,status
1,John,Doe,Jane,Smith,active

#WEIGH_INS
team_number,day,fish_count,raw_weight,fish_released,big_fish
1,1,5,15.20,2,4.50`

    const parsed = parseCSV(original)
    const formatted = formatForExport(
      parsed.tournament,
      parsed.teams.map(t => ({
        teamNumber: t.teamNumber,
        members: [
          { firstName: t.member1First, lastName: t.member1Last },
          { firstName: t.member2First, lastName: t.member2Last }
        ],
        status: t.status
      })),
      parsed.weighIns.map(w => ({
        teamNumber: w.teamNumber,
        day: w.day,
        fishCount: w.fishCount,
        rawWeight: w.rawWeight,
        fishReleased: w.fishReleased,
        bigFishWeight: w.bigFish
      }))
    )

    const reparsed = parseCSV(formatted)

    expect(reparsed.tournament.name).toBe(parsed.tournament.name)
    expect(reparsed.tournament.year).toBe(parsed.tournament.year)
    expect(reparsed.teams).toHaveLength(parsed.teams.length)
    expect(reparsed.weighIns).toHaveLength(parsed.weighIns.length)
  })

  it('should escape special characters in CSV output', () => {
    const tournament = {
      name: 'Test, "Tournament"',
      year: 2024,
      location: 'Lake "XYZ"',
      startDate: new Date(2024, 5, 1),
      endDate: new Date(2024, 5, 2)
    }

    const teams = [
      {
        teamNumber: 1,
        members: [
          { firstName: 'John', lastName: 'Doe' },
          { firstName: 'Jane', lastName: 'Smith' }
        ],
        status: 'active'
      }
    ]

    const csv = formatForExport(tournament, teams, [])

    expect(csv).toContain('"Test, "Tournament""')
    expect(csv).toContain('"Lake "XYZ""')
  })
})
