/**
 * useHallOfFame Hook
 * Lazy-loads all-time tournament records from database
 */

import { useMemo } from 'react'
import { computeHallOfFame, AllTimeRecord } from '@modules/hall-of-fame'
import { useTournamentStore } from '@modules/tournaments/tournament-store'
import { useWeighInStore } from '@modules/weigh-ins/weigh-in-store'

export interface HallOfFameData {
  records: AllTimeRecord[]
  isLoading: boolean
  isEmpty: boolean
}

export function useHallOfFame(): HallOfFameData {
  // Get all tournaments (local state)
  const allTournaments = useTournamentStore((s) => s.tournaments)

  // Get all weigh-ins from the store
  // Note: This is a simplified approach assuming weigh-ins are available in store
  // For production, you'd query IndexedDB directly
  const weighIns = useWeighInStore((s) => s.weighIns)

  const records = useMemo(() => {
    if (!allTournaments || !weighIns) {
      return []
    }

    return computeHallOfFame(allTournaments, weighIns)
  }, [allTournaments, weighIns])

  return {
    records,
    isLoading: !allTournaments || !weighIns,
    isEmpty: records.length === 0
  }
}
