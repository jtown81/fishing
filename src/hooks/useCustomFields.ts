/**
 * useCustomFields Hook
 * React hook for managing custom fields in components
 */

import { useMemo } from 'react'
import { getCustomFieldsByTournament } from '@modules/custom-fields'
import { enhanceTeamStanding, formatCustomFieldValue } from '@modules/custom-fields/integration'
import type { CustomField } from '@models/custom-field'
import type { TeamStanding, WeighIn } from '@models/tournament'

/**
 * Load custom fields for a tournament
 */
export async function loadTournamentCustomFields(tournamentId: string): Promise<CustomField[]> {
  return getCustomFieldsByTournament(tournamentId)
}

/**
 * Hook to memoize custom field formatting
 */
export function useCustomFieldFormatting(fields: CustomField[]) {
  return useMemo(() => {
    return {
      format: (value: any, fieldId: string) => {
        const field = fields.find(f => f.id === fieldId)
        if (!field) return String(value)
        return formatCustomFieldValue(value, field.fieldType)
      },
      getFieldById: (fieldId: string) => {
        return fields.find(f => f.id === fieldId)
      },
      getFieldsByType: (type: 'weigh-in' | 'team') => {
        return fields.filter(f => f.appliesTo === type)
      },
      getFieldsByScope: (scope: 'day1' | 'day2' | 'both') => {
        return fields.filter(f => f.scope === scope)
      }
    }
  }, [fields])
}

/**
 * Hook to enhance standings with custom fields (async)
 * Usage: const enhancedStandings = await useEnhancedStandings(tournamentId, standings, fields, ...)
 */
export function useEnhanceStandingsWith(
  fields: CustomField[],
  day1WeighIns: WeighIn[],
  day2WeighIns: WeighIn[]
) {
  return async (
    tournamentId: string,
    standing: TeamStanding
  ) => {
    return enhanceTeamStanding(
      tournamentId,
      standing,
      fields,
      day1WeighIns,
      day2WeighIns
    )
  }
}
