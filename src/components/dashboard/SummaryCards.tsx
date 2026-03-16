import { useTournamentStore } from '@modules/tournaments/tournament-store'
import { useTeamStore } from '@modules/teams/team-store'
import { useWeighInStore } from '@modules/weigh-ins/weigh-in-store'
import { computeTournamentStats, getBigFishLeader } from '@utils/calculations'
import { formatWeight, formatNumber } from '@utils/formatting'
import { Fish, Trophy, Users, Zap } from 'lucide-react'
import { useThemeStore } from '@store/theme-store'

export default function SummaryCards() {
  const currentTournament = useTournamentStore((s) => s.currentTournament)
  const teams = useTeamStore((s) => s.teams)
  const weighIns = useWeighInStore((s) => s.weighIns)
  const { currentTheme } = useThemeStore()

  const stats = currentTournament && weighIns.length > 0
    ? computeTournamentStats(weighIns, teams)
    : null

  const bigFishLeader = weighIns.length > 0 ? getBigFishLeader(weighIns) : null

  const cards = [
    {
      label: 'Total Teams',
      value: formatNumber(teams.length),
      icon: Users,
      iconEmoji: '👥'
    },
    {
      label: 'Total Fish Caught',
      value: formatNumber(stats?.totalFishCaught || 0),
      icon: Fish,
      iconEmoji: '🎣'
    },
    {
      label: 'Total Weight',
      value: formatWeight(stats?.totalWeightCaught || 0),
      icon: Zap,
      iconEmoji: '⚡'
    },
    {
      label: 'Big Fish',
      value: bigFishLeader ? formatWeight(bigFishLeader.bigFishWeight || 0) : '—',
      icon: Trophy,
      iconEmoji: '🏆'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg p-6 border-2 transition-all duration-200 hover:shadow-lg"
          style={{
            backgroundColor: currentTheme.colors.background,
            borderColor: currentTheme.colors.border,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: currentTheme.colors.text }}>{card.label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: currentTheme.colors.primary }}>{card.value}</p>
            </div>
            <div
              className="text-4xl opacity-60"
            >
              {card.iconEmoji}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
