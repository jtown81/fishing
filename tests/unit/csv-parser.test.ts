import { describe, it, expect } from 'vitest'
import {
  parseCSV,
  validateImportedData,
  formatForExport,
  type ImportedData
} from '@modules/import-export'

describe('CSV Parser', () => {
  describe('parseCSV - Valid CSV', () => {
    it('should parse minimal valid CSV', () => {
      const csv = `#TOURNAMENT
name,year,location,start_date,end_date
Test Tournament,2024,Anywhere,2024-01-01,2024-01-02

#TEAMS
team_number,member1_first,member1_last,member2_first,member2_last,status
1,John,Doe,Jane,Smith,active

#WEIGH_INS
team_number,day,fish_count,raw_weight,fish_released,big_fish
1,1,0,0,0,`

      const data = parseCSV(csv)

      expect(data.tournament.name).toBe('Test Tournament')
      expect(data.tournament.year).toBe(2024)
      expect(data.teams).toHaveLength(1)
      expect(data.weighIns).toHaveLength(1)
    })

    it('should parse complete CSV with all fields', () => {
      const csv = `#TOURNAMENT
name,year,location,start_date,end_date
HPA Annual,2024,Lake XYZ,2024-06-01,2024-06-02

#TEAMS
team_number,member1_first,member1_last,member2_first,member2_last,status
1,Brandon,Seitz,Rob,Crandall,active
2,John,Doe,Jane,Smith,inactive
3,Matt,James,Chad,Porsch,disqualified

#WEIGH_INS
team_number,day,fish_count,raw_weight,fish_released,big_fish
1,1,5,15.20,2,4.50
1,2,4,12.80,3,4.20
2,1,6,18.00,1,5.25
2,2,5,16.50,2,5.10
3,1,4,13.24,2,4.80
3,2,3,10.50,1,3.90`

      const data = parseCSV(csv)

      expect(data.tournament.name).toBe('HPA Annual')
      expect(data.tournament.year).toBe(2024)
      expect(data.teams).toHaveLength(3)
      expect(data.weighIns).toHaveLength(6)

      // Check team parsing
      expect(data.teams[0].teamNumber).toBe(1)
      expect(data.teams[0].member1First).toBe('Brandon')
      expect(data.teams[0].status).toBe('active')

      // Check weigh-in parsing
      expect(data.weighIns[0].fishCount).toBe(5)
      expect(data.weighIns[0].rawWeight).toBe(15.2)
      expect(data.weighIns[0].fishReleased).toBe(2)
      expect(data.weighIns[0].bigFish).toBe(4.5)
    })

    it('should handle optional big_fish field', () => {
      const csv = `#TOURNAMENT
name,year,location,start_date,end_date
Test,2024,Test,2024-01-01,2024-01-02

#TEAMS
team_number,member1_first,member1_last,member2_first,member2_last,status
1,John,Doe,Jane,Smith,active

#WEIGH_INS
team_number,day,fish_count,raw_weight,fish_released,big_fish
1,1,5,15.00,0,`

      const data = parseCSV(csv)
      expect(data.weighIns[0].bigFish).toBeUndefined()
    })

    it('should trim whitespace from fields', () => {
      const csv = `#TOURNAMENT
name,year,location,start_date,end_date
  Test  , 2024 ,  Location  , 2024-01-01 , 2024-01-02

#TEAMS
team_number,member1_first,member1_last,member2_first,member2_last,status
1 , John , Doe , Jane , Smith , active

#WEIGH_INS
team_number,day,fish_count,raw_weight,fish_released,big_fish
1 , 1 , 5 , 15.00 , 2 , 4.50 `

      const data = parseCSV(csv)
      expect(data.tournament.name).toBe('Test')
      expect(data.teams[0].member1First).toBe('John')
      expect(data.weighIns[0].fishCount).toBe(5)
    })

    it('should handle CSV quoted fields', () => {
      const csv = `#TOURNAMENT
name,year,location,start_date,end_date
"Tournament, Inc.",2024,"Lake, State",2024-01-01,2024-01-02

#TEAMS
team_number,member1_first,member1_last,member2_first,member2_last,status
1,"John, Jr.","Doe, Jr.",Jane,Smith,active

#WEIGH_INS
team_number,day,fish_count,raw_weight,fish_released,big_fish
1,1,5,15.00,0,`

      const data = parseCSV(csv)
      expect(data.tournament.name).toBe('Tournament, Inc.')
      expect(data.tournament.location).toBe('Lake, State')
      expect(data.teams[0].member1First).toBe('John, Jr.')
    })

    it('should handle blank lines between sections', () => {
      const csv = `#TOURNAMENT
name,year,location,start_date,end_date
Test,2024,Location,2024-01-01,2024-01-02

#TEAMS
team_number,member1_first,member1_last,member2_first,member2_last,status
1,John,Doe,Jane,Smith,active

#WEIGH_INS
team_number,day,fish_count,raw_weight,fish_released,big_fish
1,1,5,15.00,0,`

      expect(() => parseCSV(csv)).not.toThrow()
    })

    it('should normalize status to lowercase', () => {
      const csv = `#TOURNAMENT
name,year,location,start_date,end_date
Test,2024,Location,2024-01-01,2024-01-02

#TEAMS
team_number,member1_first,member1_last,member2_first,member2_last,status
1,John,Doe,Jane,Smith,ACTIVE
2,Bob,Jones,Alice,Brown,InActive

#WEIGH_INS
team_number,day,fish_count,raw_weight,fish_released,big_fish`

      const data = parseCSV(csv)
      expect(data.teams[0].status).toBe('active')
      expect(data.teams[1].status).toBe('inactive')
    })

    it('should handle multiple weigh-ins per team', () => {
      const csv = `#TOURNAMENT
name,year,location,start_date,end_date
Test,2024,Location,2024-01-01,2024-01-02

#TEAMS
team_number,member1_first,member1_last,member2_first,member2_last,status
1,John,Doe,Jane,Smith,active

#WEIGH_INS
team_number,day,fish_count,raw_weight,fish_released,big_fish
1,1,5,15.00,2,4.50
1,2,4,12.80,1,3.20`

      const data = parseCSV(csv)
      expect(data.weighIns.filter(w => w.teamNumber === 1)).toHaveLength(2)
      expect(data.weighIns[0].day).toBe(1)
      expect(data.weighIns[1].day).toBe(2)
    })
  })

  describe('parseCSV - Invalid CSV', () => {
    it('should throw on missing tournament section', () => {
      const csv = `#TEAMS
team_number,member1_first,member1_last,member2_first,member2_last,status
1,John,Doe,Jane,Smith,active`

      expect(() => parseCSV(csv)).toThrow()
    })

    it('should throw on invalid year', () => {
      const csv = `#TOURNAMENT
name,year,location,start_date,end_date
Test,not_a_number,Location,2024-01-01,2024-01-02

#TEAMS
team_number,member1_first,member1_last,member2_first,member2_last,status
1,John,Doe,Jane,Smith,active

#WEIGH_INS
team_number,day,fish_count,raw_weight,fish_released,big_fish`

      expect(() => parseCSV(csv)).toThrow('year must be a number')
    })

    it('should throw on invalid date format', () => {
      const csv = `#TOURNAMENT
name,year,location,start_date,end_date
Test,2024,Location,01-01-2024,2024-01-02

#TEAMS
team_number,member1_first,member1_last,member2_first,member2_last,status
1,John,Doe,Jane,Smith,active

#WEIGH_INS
team_number,day,fish_count,raw_weight,fish_released,big_fish`

      expect(() => parseCSV(csv)).toThrow('start_date must be in YYYY-MM-DD format')
    })

    it('should throw on invalid team_number', () => {
      const csv = `#TOURNAMENT
name,year,location,start_date,end_date
Test,2024,Location,2024-01-01,2024-01-02

#TEAMS
team_number,member1_first,member1_last,member2_first,member2_last,status
abc,John,Doe,Jane,Smith,active

#WEIGH_INS
team_number,day,fish_count,raw_weight,fish_released,big_fish`

      expect(() => parseCSV(csv)).toThrow('team_number must be a positive integer')
    })

    it('should throw on zero team_number', () => {
      const csv = `#TOURNAMENT
name,year,location,start_date,end_date
Test,2024,Location,2024-01-01,2024-01-02

#TEAMS
team_number,member1_first,member1_last,member2_first,member2_last,status
0,John,Doe,Jane,Smith,active

#WEIGH_INS
team_number,day,fish_count,raw_weight,fish_released,big_fish`

      expect(() => parseCSV(csv)).toThrow('team_number must be a positive integer')
    })

    it('should throw on invalid status', () => {
      const csv = `#TOURNAMENT
name,year,location,start_date,end_date
Test,2024,Location,2024-01-01,2024-01-02

#TEAMS
team_number,member1_first,member1_last,member2_first,member2_last,status
1,John,Doe,Jane,Smith,invalid_status

#WEIGH_INS
team_number,day,fish_count,raw_weight,fish_released,big_fish`

      expect(() => parseCSV(csv)).toThrow('status must be: active, inactive, or disqualified')
    })

    it('should throw on fish_released > fish_count', () => {
      const csv = `#TOURNAMENT
name,year,location,start_date,end_date
Test,2024,Location,2024-01-01,2024-01-02

#TEAMS
team_number,member1_first,member1_last,member2_first,member2_last,status
1,John,Doe,Jane,Smith,active

#WEIGH_INS
team_number,day,fish_count,raw_weight,fish_released,big_fish
1,1,5,15.00,10,`

      expect(() => parseCSV(csv)).toThrow('fish_released cannot exceed fish_count')
    })

    it('should throw on big_fish > raw_weight', () => {
      const csv = `#TOURNAMENT
name,year,location,start_date,end_date
Test,2024,Location,2024-01-01,2024-01-02

#TEAMS
team_number,member1_first,member1_last,member2_first,member2_last,status
1,John,Doe,Jane,Smith,active

#WEIGH_INS
team_number,day,fish_count,raw_weight,fish_released,big_fish
1,1,5,15.00,2,20.00`

      expect(() => parseCSV(csv)).toThrow('big_fish cannot exceed raw_weight')
    })

    it('should throw on invalid day', () => {
      const csv = `#TOURNAMENT
name,year,location,start_date,end_date
Test,2024,Location,2024-01-01,2024-01-02

#TEAMS
team_number,member1_first,member1_last,member2_first,member2_last,status
1,John,Doe,Jane,Smith,active

#WEIGH_INS
team_number,day,fish_count,raw_weight,fish_released,big_fish
1,3,5,15.00,2,4.50`

      expect(() => parseCSV(csv)).toThrow('day must be 1 or 2')
    })

    it('should throw on invalid fish_count', () => {
      const csv = `#TOURNAMENT
name,year,location,start_date,end_date
Test,2024,Location,2024-01-01,2024-01-02

#TEAMS
team_number,member1_first,member1_last,member2_first,member2_last,status
1,John,Doe,Jane,Smith,active

#WEIGH_INS
team_number,day,fish_count,raw_weight,fish_released,big_fish
1,1,not_a_number,15.00,2,4.50`

      expect(() => parseCSV(csv)).toThrow('fish_count must be a non-negative integer')
    })
  })

  describe('validateImportedData', () => {
    it('should validate correct data', () => {
      const data: ImportedData = {
        tournament: {
          name: 'Test',
          year: 2024,
          location: 'Test',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-02')
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
            rawWeight: 15.0,
            fishReleased: 2
          }
        ]
      }

      const result = validateImportedData(data)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect duplicate team_number', () => {
      const data: ImportedData = {
        tournament: {
          name: 'Test',
          year: 2024,
          location: 'Test',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-02')
        },
        teams: [
          {
            teamNumber: 1,
            member1First: 'John',
            member1Last: 'Doe',
            member2First: 'Jane',
            member2Last: 'Smith',
            status: 'active'
          },
          {
            teamNumber: 1,
            member1First: 'Bob',
            member1Last: 'Jones',
            member2First: 'Alice',
            member2Last: 'Brown',
            status: 'active'
          }
        ],
        weighIns: []
      }

      const result = validateImportedData(data)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('Duplicate team_number'))).toBe(true)
    })

    it('should detect weigh-in referencing non-existent team', () => {
      const data: ImportedData = {
        tournament: {
          name: 'Test',
          year: 2024,
          location: 'Test',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-02')
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
            teamNumber: 999,
            day: 1,
            fishCount: 5,
            rawWeight: 15.0,
            fishReleased: 2
          }
        ]
      }

      const result = validateImportedData(data)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('non-existent team_number'))).toBe(true)
    })

    it('should warn about teams without weigh-ins', () => {
      const data: ImportedData = {
        tournament: {
          name: 'Test',
          year: 2024,
          location: 'Test',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-02')
        },
        teams: [
          {
            teamNumber: 1,
            member1First: 'John',
            member1Last: 'Doe',
            member2First: 'Jane',
            member2Last: 'Smith',
            status: 'active'
          },
          {
            teamNumber: 2,
            member1First: 'Bob',
            member1Last: 'Jones',
            member2First: 'Alice',
            member2Last: 'Brown',
            status: 'active'
          }
        ],
        weighIns: [
          {
            teamNumber: 1,
            day: 1,
            fishCount: 5,
            rawWeight: 15.0,
            fishReleased: 2
          }
        ]
      }

      const result = validateImportedData(data)
      expect(result.isValid).toBe(true)
      expect(result.warnings.some(w => w.includes('Team 2'))).toBe(true)
    })

    it('should not warn about inactive teams without weigh-ins', () => {
      const data: ImportedData = {
        tournament: {
          name: 'Test',
          year: 2024,
          location: 'Test',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-02')
        },
        teams: [
          {
            teamNumber: 1,
            member1First: 'John',
            member1Last: 'Doe',
            member2First: 'Jane',
            member2Last: 'Smith',
            status: 'inactive'
          }
        ],
        weighIns: []
      }

      const result = validateImportedData(data)
      expect(result.isValid).toBe(true)
      expect(result.warnings).toHaveLength(0)
    })

    it('should detect start_date after end_date', () => {
      const data: ImportedData = {
        tournament: {
          name: 'Test',
          year: 2024,
          location: 'Test',
          startDate: new Date('2024-01-02'),
          endDate: new Date('2024-01-01')
        },
        teams: [],
        weighIns: []
      }

      const result = validateImportedData(data)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('start_date must be before end_date'))).toBe(true)
    })

    it('should require at least one team', () => {
      const data: ImportedData = {
        tournament: {
          name: 'Test',
          year: 2024,
          location: 'Test',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-02')
        },
        teams: [],
        weighIns: []
      }

      const result = validateImportedData(data)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('At least one team is required'))).toBe(true)
    })
  })

  describe('formatForExport', () => {
    it('should format tournament data as CSV', () => {
      const tournament = {
        name: 'Test Tournament',
        year: 2024,
        location: 'Test Lake',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-02')
      }

      const teams = [
        {
          teamNumber: 1,
          members: [
            { firstName: 'John', lastName: 'Doe' },
            { firstName: 'Jane', lastName: 'Smith' }
          ],
          status: 'active' as const
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
      expect(csv).toContain('#TEAMS')
      expect(csv).toContain('#WEIGH_INS')
      expect(csv).toContain('Test Tournament')
      expect(csv).toContain('2024')
      expect(csv).toContain('John')
      expect(csv).toContain('15.20')
    })

    it('should escape CSV special characters', () => {
      const tournament = {
        name: 'Tournament, Inc.',
        year: 2024,
        location: 'Lake, State',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-02')
      }

      const teams = []
      const weighIns = []

      const csv = formatForExport(tournament, teams, weighIns)

      expect(csv).toContain('"Tournament, Inc."')
      expect(csv).toContain('"Lake, State"')
    })

    it('should handle empty weigh-ins', () => {
      const tournament = {
        name: 'Test',
        year: 2024,
        location: 'Test',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-02')
      }

      const teams = [
        {
          teamNumber: 1,
          members: [
            { firstName: 'John', lastName: 'Doe' },
            { firstName: 'Jane', lastName: 'Smith' }
          ],
          status: 'active' as const
        }
      ]

      const weighIns: any[] = []

      const csv = formatForExport(tournament, teams, weighIns)

      expect(csv).toContain('#TOURNAMENT')
      expect(csv).toContain('#TEAMS')
      expect(csv).toContain('#WEIGH_INS')
    })

    it('should handle optional big_fish field', () => {
      const tournament = {
        name: 'Test',
        year: 2024,
        location: 'Test',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-02')
      }

      const teams: any[] = []

      const weighIns = [
        {
          teamNumber: 1,
          day: 1 as const,
          fishCount: 5,
          rawWeight: 15.0,
          fishReleased: 2
          // bigFishWeight is undefined
        }
      ]

      const csv = formatForExport(tournament, teams, weighIns)

      // Should have empty big_fish column
      expect(csv).toContain('1,1,5,15.00,2,')
    })
  })
})
