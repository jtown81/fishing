import Dexie, { type Table } from 'dexie'
import type {
  Tournament,
  Team,
  WeighIn,
  CalcuttaGroup,
  Logo,
  TournamentStats
} from '@models/tournament'
import type {
  CustomField,
  ComputedFieldValue
} from '@models/custom-field'

export class TournamentDB extends Dexie {
  tournaments!: Table<Tournament>
  teams!: Table<Team>
  weighIns!: Table<WeighIn>
  calcuttas!: Table<CalcuttaGroup>
  logos!: Table<Logo>
  stats!: Table<TournamentStats>
  customFields!: Table<CustomField>
  computedFieldValues!: Table<ComputedFieldValue>

  constructor() {
    super('FishingTournamentDB')

    // Version 1: Initial schema
    this.version(1).stores({
      tournaments: '++id, year',
      teams: '++id, tournamentId, teamNumber',
      weighIns: '++id, tournamentId, teamId, day, timestamp',
      calcuttas: '++id, tournamentId, groupNumber',
      logos: '++id, tournamentId, isDefault',
      stats: 'tournamentId'
    })

    // Version 2: Add custom fields support
    this.version(2).stores({
      tournaments: '++id, year',
      teams: '++id, tournamentId, teamNumber',
      weighIns: '++id, tournamentId, teamId, day, timestamp',
      calcuttas: '++id, tournamentId, groupNumber',
      logos: '++id, tournamentId, isDefault',
      stats: 'tournamentId',
      customFields: '++id, tournamentId, order',
      computedFieldValues: '++id, entityId, customFieldId, [customFieldId+entityId]'
    })
  }
}

export const db = new TournamentDB()
