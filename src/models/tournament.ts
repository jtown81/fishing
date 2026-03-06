/**
 * Tournament and related domain models
 */

export interface TournamentRules {
  maxFish: number
  releaseBonus: number // Per-fish bonus weight (default 0.20 lb)
  teamSize: number // Usually 2
  days: number // Usually 2
}

export interface Tournament {
  id: string
  name: string
  year: number
  location: string
  startDate: Date
  endDate: Date
  logoId?: string // Reference to Logo in IndexedDB
  rules: TournamentRules
  publicSlug?: string // Set when cloud sync is enabled; used for spectator links
  createdAt: Date
  updatedAt: Date
}

export interface TeamMember {
  firstName: string
  lastName: string
}

export interface Team {
  id: string
  tournamentId: string
  teamNumber: number
  members: TeamMember[]
  status: 'active' | 'inactive' | 'disqualified'
  createdAt: Date
  updatedAt: Date
}

export interface WeighIn {
  id: string
  tournamentId: string
  teamId: string
  teamNumber: number
  day: 1 | 2
  fishCount: number
  rawWeight: number // In pounds
  fishReleased: number
  bigFishWeight?: number // Optional big fish weight for this day
  receivedBy: string
  issuedBy: string
  photoDataUrl?: string // base64 JPEG stored in IndexedDB (Phase 6a)
  receivedBySignature?: string // base64 canvas signature (Phase 6c)
  timestamp: Date
  createdAt: Date
  updatedAt: Date
}

export interface Angler {
  id: string
  firstName: string
  lastName: string
  email?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface AnglerAppearance {
  id: string
  anglerId: string
  tournamentId: string
  teamId: string
  teamNumber: number
  createdAt: Date
}

export interface TeamStanding {
  teamId: string
  teamNumber: number
  members: TeamMember[]
  day1Total: number
  day1BigFish?: number
  day2Total: number
  day2BigFish?: number
  grandTotal: number
  rank: number
  rankChange?: number // day1Rank - day2Rank (positive = improved)
}

export interface CalcuttaGroup {
  id: string
  tournamentId: string
  groupNumber: number
  teams: TeamNumber[]
  winningTeamId?: string
  soldPrice?: number
}

export interface Logo {
  id: string
  tournamentId: string
  imageBlob: Blob
  fileName: string
  isDefault: boolean
  createdAt: Date
}

export interface TournamentStats {
  tournamentId: string
  totalTeams: number
  totalFishCaught: number
  totalFishReleased: number
  totalWeightCaught: number
  biggestFish: {
    teamId: string
    teamNumber: number
    weight: number
    day: 1 | 2
  }
}

// Utility type for team number
type TeamNumber = number
