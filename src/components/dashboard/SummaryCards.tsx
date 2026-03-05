import { useTournamentStore } from '@modules/tournaments/tournament-store'
import { useTeamStore } from '@modules/teams/team-store'
import { useWeighInStore } from '@modules/weigh-ins/weigh-in-store'
import { computeTournamentStats, getBigFishLeader } from '@utils/calculations'
import { formatWeight, formatNumber } from '@utils/formatting'
import { Fish, Trophy, Users, Zap } from 'lucide-react'

export default function SummaryCards() {
  const currentTournament = useTournamentStore((s) => s.currentTournament)
  const teams = useTeamStore((s) => s.teams)
  const weighIns = useWeighInStore((s) => s.weighIns)

  const stats = currentTournament && weighIns.length > 0
    ? computeTournamentStats(weighIns, teams)
    : null

  const bigFishLeader = weighIns.length > 0 ? getBigFishLeader(weighIns) : null

  const cards = [
    {
      label: 'Total Teams',
      value: formatNumber(teams.length),
      icon: Users,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      label: 'Total Fish Caught',
      value: formatNumber(stats?.totalFishCaught || 0),
      icon: Fish,
      color: 'bg-green-50 text-green-600'
    },
    {
      label: 'Total Weight',
      value: formatWeight(stats?.totalWeightCaught || 0),
      icon: Zap,
      color: 'bg-purple-50 text-purple-600'
    },
    {
      label: 'Big Fish',
      value: bigFishLeader ? formatWeight(bigFishLeader.bigFishWeight || 0) : '—',
      icon: Trophy,
      color: 'bg-amber-50 text-amber-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${card.color} rounded-lg p-6 border border-current border-opacity-20`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
            </div>
            <card.icon size={32} className="opacity-50" />
          </div>
        </div>
      ))}
    </div>
  )
}
