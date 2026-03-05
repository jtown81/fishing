/**
 * Hook to compute and cache tournament standings
 */

import { useMemo } from 'react'
import { computeStandings } from '@utils/calculations'
import { useTeamStore } from '@modules/teams/team-store'
import { useWeighInStore } from '@modules/weigh-ins/weigh-in-store'
import { useTournamentStore } from '@modules/tournaments/tournament-store'
import type { TeamStanding } from '@models/tournament'

export function useStandings(tournamentId?: string): TeamStanding[] {
  const teams = useTeamStore((s) => s.teams)
  const weighIns = useWeighInStore((s) => s.weighIns)
  const currentTournament = useTournamentStore((s) => s.currentTournament)

  const tournament = currentTournament || { rules: { releaseBonus: 0.2 } }

  return useMemo(() => {
    if (teams.length === 0) return []

    const relevantWeighIns = tournamentId
      ? weighIns.filter((w) => w.tournamentId === tournamentId)
      : weighIns

    return computeStandings(teams, relevantWeighIns, tournament.rules.releaseBonus)
  }, [teams, weighIns, tournament.rules.releaseBonus, tournamentId])
}
