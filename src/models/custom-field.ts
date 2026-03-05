/**
 * Custom Field Models
 */

export interface CustomField {
  id: string
  tournamentId: string
  name: string
  description?: string
  fieldType: 'number' | 'boolean' | 'text' | 'currency'
  formula?: string
  appliesTo: 'weigh-in' | 'team'
  scope: 'day1' | 'day2' | 'both'
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface ComputedFieldValue {
  id: string
  entityId: string                // teamId or weighInId
  customFieldId: string
  value: number | boolean | string | null
  dependsOn: string[]             // Field names it references
  lastComputed: Date
  isDirty: boolean
}

// Formula evaluation context - available fields
export interface WeighInContext {
  fish_count: number
  raw_weight: number
  fish_released: number
  big_fish: number | null
  day: number
  day_total: number
  avg_weight: number
  max_weight: number
  min_weight: number
}

export interface TeamContext {
  day1_total: number
  day2_total: number
  grand_total: number
  total_fish: number
  total_released: number
  big_fish_day1: number | null
  big_fish_day2: number | null
  rank: number
  day1_rank: number
  day2_rank: number
  rank_change: number
  avg_weight: number
  max_weight: number
  team_count: number
  status: string
}

export type FormulaContext = WeighInContext | TeamContext
