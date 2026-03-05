import Dexie, { type Table } from 'dexie'
import type {
  Tournament,
  Team,
  WeighIn,
  CalcuttaGroup,
  Logo,
  TournamentStats
} from '@models/tournament'

export class TournamentDB extends Dexie {
  tournaments!: Table<Tournament>
  teams!: Table<Team>
  weighIns!: Table<WeighIn>
  calcuttas!: Table<CalcuttaGroup>
  logos!: Table<Logo>
  stats!: Table<TournamentStats>

  constructor() {
    super('FishingTournamentDB')
    this.version(1).stores({
      tournaments: '++id, year',
      teams: '++id, tournamentId, teamNumber',
      weighIns: '++id, tournamentId, teamId, day, timestamp',
      calcuttas: '++id, tournamentId, groupNumber',
      logos: '++id, tournamentId, isDefault',
      stats: 'tournamentId'
    })
  }
}

export const db = new TournamentDB()
