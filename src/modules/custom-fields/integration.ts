/**
 * Custom Fields Integration
 * Integrate custom field values into standings, reports, and displays
 */

import { computeAllFieldValues, getEntityComputedValues } from './custom-field-service'
import type { CustomField, ComputedFieldValue } from '@models/custom-field'
import type { TeamStanding, WeighIn } from '@models/tournament'

// ============================================================================
// WEIGH-IN INTEGRATION
// ============================================================================

/**
 * Compute custom field values for a weigh-in
 */
export async function computeWeighInCustomFields(
  tournamentId: string,
  weighIn: WeighIn,
  customFields: CustomField[]
): Promise<Map<string, ComputedFieldValue>> {
  const applicableFields = customFields.filter(f => f.appliesTo === 'weigh-in')

  if (applicableFields.length === 0) {
    return new Map()
  }

  // Build weigh-in context with available fields
  const context = {
    fish_count: weighIn.fishCount,
    raw_weight: weighIn.rawWeight,
    fish_released: weighIn.fishReleased,
    big_fish: weighIn.bigFishWeight ?? null,
    day: weighIn.day,
    day_total: weighIn.rawWeight + weighIn.fishReleased * 0.2, // Standard formula
    avg_weight: weighIn.rawWeight / Math.max(weighIn.fishCount, 1),
    max_weight: weighIn.bigFishWeight ?? 0,
    min_weight: weighIn.fishCount > 0 ? weighIn.rawWeight / weighIn.fishCount : 0
  }

  return computeAllFieldValues(tournamentId, weighIn.id, context)
}

/**
 * Enhance weigh-in display with custom field values
 */
export interface EnhancedWeighIn extends WeighIn {
  customFieldValues: Map<string, any>
}

export async function enhanceWeighIn(
  tournamentId: string,
  weighIn: WeighIn,
  customFields: CustomField[]
): Promise<EnhancedWeighIn> {
  const customFieldValues = await computeWeighInCustomFields(tournamentId, weighIn, customFields)

  const valueMap = new Map<string, any>()
  customFieldValues.forEach((value, fieldId) => {
    valueMap.set(fieldId, value.value)
  })

  return {
    ...weighIn,
    customFieldValues: valueMap
  }
}

// ============================================================================
// STANDING INTEGRATION
// ============================================================================

/**
 * Compute custom field values for a team standing
 */
export async function computeTeamCustomFields(
  tournamentId: string,
  standing: TeamStanding,
  customFields: CustomField[],
  day1WeighIns: WeighIn[],
  day2WeighIns: WeighIn[]
): Promise<Map<string, ComputedFieldValue>> {
  const applicableFields = customFields.filter(f => f.appliesTo === 'team')

  if (applicableFields.length === 0) {
    return new Map()
  }

  // Find weigh-ins for this team
  const teamDay1 = day1WeighIns.find(w => w.teamId === standing.teamId)
  const teamDay2 = day2WeighIns.find(w => w.teamId === standing.teamId)

  // Calculate total fish caught and released
  const totalFish = (teamDay1?.fishCount ?? 0) + (teamDay2?.fishCount ?? 0)
  const totalReleased = (teamDay1?.fishReleased ?? 0) + (teamDay2?.fishReleased ?? 0)

  // Build team context
  const context = {
    day1_total: standing.day1Total,
    day2_total: standing.day2Total,
    grand_total: standing.grandTotal,
    total_fish: totalFish,
    total_released: totalReleased,
    big_fish_day1: standing.day1BigFish ?? null,
    big_fish_day2: standing.day2BigFish ?? null,
    rank: standing.rank,
    day1_rank: 0, // Would need additional context to compute
    day2_rank: 0, // Would need additional context to compute
    rank_change: standing.rankChange ?? 0,
    avg_weight: totalFish > 0 ? standing.grandTotal / totalFish : 0,
    max_weight: Math.max(standing.day1BigFish ?? 0, standing.day2BigFish ?? 0),
    team_count: 0, // Will be set by caller if needed
    status: 'active'
  }

  return computeAllFieldValues(tournamentId, standing.teamId, context)
}

/**
 * Enhance team standing with custom field values
 */
export interface EnhancedTeamStanding extends TeamStanding {
  customFieldValues: Map<string, any>
}

export async function enhanceTeamStanding(
  tournamentId: string,
  standing: TeamStanding,
  customFields: CustomField[],
  day1WeighIns: WeighIn[],
  day2WeighIns: WeighIn[]
): Promise<EnhancedTeamStanding> {
  const customFieldValues = await computeTeamCustomFields(
    tournamentId,
    standing,
    customFields,
    day1WeighIns,
    day2WeighIns
  )

  const valueMap = new Map<string, any>()
  customFieldValues.forEach((value, fieldId) => {
    valueMap.set(fieldId, value.value)
  })

  return {
    ...standing,
    customFieldValues: valueMap
  }
}

/**
 * Enhance all standings with custom field values
 */
export async function enhanceAllStandings(
  tournamentId: string,
  standings: TeamStanding[],
  customFields: CustomField[],
  day1WeighIns: WeighIn[],
  day2WeighIns: WeighIn[]
): Promise<EnhancedTeamStanding[]> {
  return Promise.all(
    standings.map(standing =>
      enhanceTeamStanding(tournamentId, standing, customFields, day1WeighIns, day2WeighIns)
    )
  )
}

// ============================================================================
// DISPLAY UTILITIES
// ============================================================================

/**
 * Format custom field value for display
 */
export function formatCustomFieldValue(value: any, fieldType: string): string {
  if (value === null) {
    return '-'
  }

  switch (fieldType) {
    case 'currency':
      return `$${typeof value === 'number' ? value.toFixed(2) : value}`
    case 'number':
      return typeof value === 'number' ? value.toFixed(2) : String(value)
    case 'boolean':
      return value ? 'Yes' : 'No'
    case 'text':
    default:
      return String(value)
  }
}

/**
 * Get custom field value for an entity
 */
export async function getCustomFieldValue(
  entityId: string,
  customFieldId: string
): Promise<any | null> {
  const values = await getEntityComputedValues(entityId)
  const fieldValue = values.find(v => v.customFieldId === customFieldId)
  return fieldValue?.value ?? null
}

/**
 * Get all custom field values for an entity
 */
export async function getAllCustomFieldValues(
  entityId: string
): Promise<Map<string, any>> {
  const values = await getEntityComputedValues(entityId)
  const result = new Map<string, any>()

  for (const value of values) {
    result.set(value.customFieldId, value.value)
  }

  return result
}
