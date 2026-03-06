import Dexie, { type Table } from 'dexie'
import type {
  Tournament,
  Team,
  WeighIn,
  CalcuttaGroup,
  Logo,
  TournamentStats,
  Angler,
  AnglerAppearance
} from '@models/tournament'
import type {
  CustomField,
  ComputedFieldValue
} from '@models/custom-field'

export interface SyncOperation {
  id?: number // auto-increment
  entityType: 'tournament' | 'team' | 'weighIn'
  entityId: string
  action: 'upsert' | 'delete'
  payload: object
  timestamp: Date
  synced: boolean
  retryCount: number
}

export interface DeviceToken {
  id?: string
  userId: string
  platform: 'ios' | 'android'
  token: string
  createdAt: Date
}

export class TournamentDB extends Dexie {
  tournaments!: Table<Tournament>
  teams!: Table<Team>
  weighIns!: Table<WeighIn>
  calcuttas!: Table<CalcuttaGroup>
  logos!: Table<Logo>
  stats!: Table<TournamentStats>
  customFields!: Table<CustomField>
  computedFieldValues!: Table<ComputedFieldValue>
  syncQueue!: Table<SyncOperation>
  deviceTokens!: Table<DeviceToken>
  anglers!: Table<Angler>
  anglerAppearances!: Table<AnglerAppearance>

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

    // Version 3: Add sync queue for cloud sync
    this.version(3).stores({
      tournaments: '++id, year',
      teams: '++id, tournamentId, teamNumber',
      weighIns: '++id, tournamentId, teamId, day, timestamp',
      calcuttas: '++id, tournamentId, groupNumber',
      logos: '++id, tournamentId, isDefault',
      stats: 'tournamentId',
      customFields: '++id, tournamentId, order',
      computedFieldValues: '++id, entityId, customFieldId, [customFieldId+entityId]',
      syncQueue: '++id, entityType, entityId, synced, timestamp'
    })

    // Version 4: Add device tokens for push notifications (Phase 6a)
    // Optional fields on weighIns (photoDataUrl, receivedBySignature) auto-migrate
    this.version(4).stores({
      tournaments: '++id, year',
      teams: '++id, tournamentId, teamNumber',
      weighIns: '++id, tournamentId, teamId, day, timestamp',
      calcuttas: '++id, tournamentId, groupNumber',
      logos: '++id, tournamentId, isDefault',
      stats: 'tournamentId',
      customFields: '++id, tournamentId, order',
      computedFieldValues: '++id, entityId, customFieldId, [customFieldId+entityId]',
      syncQueue: '++id, entityType, entityId, synced, timestamp',
      deviceTokens: '++id, userId, platform, token'
    })

    // Version 5: Add angler profiles (Phase 6c)
    this.version(5).stores({
      tournaments: '++id, year',
      teams: '++id, tournamentId, teamNumber',
      weighIns: '++id, tournamentId, teamId, day, timestamp',
      calcuttas: '++id, tournamentId, groupNumber',
      logos: '++id, tournamentId, isDefault',
      stats: 'tournamentId',
      customFields: '++id, tournamentId, order',
      computedFieldValues: '++id, entityId, customFieldId, [customFieldId+entityId]',
      syncQueue: '++id, entityType, entityId, synced, timestamp',
      deviceTokens: '++id, userId, platform, token',
      anglers: 'id, firstName, lastName',
      anglerAppearances: 'id, anglerId, tournamentId, teamId, [anglerId+tournamentId]'
    })
  }
}

export const db = new TournamentDB()
