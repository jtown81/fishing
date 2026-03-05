/**
 * Enhanced statistics summary cards
 * Shows core stats from the stats engine
 */

import { useTournamentStats } from '@modules/stats'
import { formatWeight, formatNumber, formatPercent } from '@utils/formatting'
import { Fish, TrendingUp, Target, Zap, Percent, Users } from 'lucide-react'

export default function StatsSummaryCards() {
  const { coreStats, enhancedStats } = useTournamentStats()

  const cards = [
    {
      label: 'Avg Day 1 Weight',
      value: formatWeight(coreStats.avgDay1Weight),
      subtext: `±${formatWeight(coreStats.day1StdDev)}`,
      icon: Fish,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      label: 'Avg Day 2 Weight',
      value: formatWeight(coreStats.avgDay2Weight),
      subtext: `±${formatWeight(coreStats.day2StdDev)}`,
      icon: Fish,
      color: 'bg-cyan-50 text-cyan-600'
    },
    {
      label: 'Big Fish Day 1',
      value: coreStats.bigFishDay1 ? formatWeight(coreStats.bigFishDay1) : '—',
      subtext: 'Tournament record',
      icon: Target,
      color: 'bg-amber-50 text-amber-600'
    },
    {
      label: 'Big Fish Day 2',
      value: coreStats.bigFishDay2 ? formatWeight(coreStats.bigFishDay2) : '—',
      subtext: 'Tournament record',
      icon: Target,
      color: 'bg-orange-50 text-orange-600'
    },
    {
      label: 'Total Fish Caught',
      value: formatNumber(coreStats.totalFishCaught),
      subtext: `Released: ${formatNumber(coreStats.totalFishReleased)}`,
      icon: Zap,
      color: 'bg-green-50 text-green-600'
    },
    {
      label: 'Release Rate',
      value: formatPercent(enhancedStats.releaseRate),
      subtext: 'Catch & release %',
      icon: Percent,
      color: 'bg-teal-50 text-teal-600'
    },
    {
      label: 'Avg Catch/Team',
      value: formatNumber(enhancedStats.catchPerTeam, 1),
      subtext: 'fish per team',
      icon: TrendingUp,
      color: 'bg-violet-50 text-violet-600'
    },
    {
      label: 'Teams Fishing',
      value: `${coreStats.teamsWithFish}/${coreStats.totalTeams}`,
      subtext: `${formatPercent((coreStats.teamsWithFish / coreStats.totalTeams) * 100)}`,
      icon: Users,
      color: 'bg-rose-50 text-rose-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${card.color} rounded-lg p-4 border border-current border-opacity-20`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                {card.label}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
              {card.subtext && (
                <p className="text-xs text-gray-600 mt-1">{card.subtext}</p>
              )}
            </div>
            <card.icon size={24} className="flex-shrink-0 opacity-40" />
          </div>
        </div>
      ))}
    </div>
  )
}
