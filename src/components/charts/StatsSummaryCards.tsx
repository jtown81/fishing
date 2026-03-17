/**
 * Enhanced statistics summary cards
 * Shows core stats from the stats engine
 */

import { useTournamentStats } from '@modules/stats'
import { formatWeight, formatNumber, formatPercent } from '@utils/formatting'
import { useThemeStore } from '@store/theme-store'

export default function StatsSummaryCards() {
  const { coreStats, enhancedStats } = useTournamentStats()
  const { currentTheme } = useThemeStore()

  const cardEmojis = ['🎣', '🎯', '🏆', '📊', '✨', '📈', '👥', '🐟']

  const cards = [
    {
      label: 'Avg Day 1 Weight',
      value: formatWeight(coreStats.avgDay1Weight),
      subtext: `±${formatWeight(coreStats.day1StdDev)}`,
      emoji: cardEmojis[0]
    },
    {
      label: 'Avg Day 2 Weight',
      value: formatWeight(coreStats.avgDay2Weight),
      subtext: `±${formatWeight(coreStats.day2StdDev)}`,
      emoji: cardEmojis[1]
    },
    {
      label: 'Big Fish Day 1',
      value: coreStats.bigFishDay1 ? formatWeight(coreStats.bigFishDay1) : '—',
      subtext: 'Tournament record',
      emoji: cardEmojis[2]
    },
    {
      label: 'Big Fish Day 2',
      value: coreStats.bigFishDay2 ? formatWeight(coreStats.bigFishDay2) : '—',
      subtext: 'Tournament record',
      emoji: cardEmojis[3]
    },
    {
      label: 'Total Fish Caught',
      value: formatNumber(coreStats.totalFishCaught),
      subtext: `Released: ${formatNumber(coreStats.totalFishReleased)}`,
      emoji: cardEmojis[4]
    },
    {
      label: 'Release Rate',
      value: formatPercent(enhancedStats.releaseRate),
      subtext: 'Catch & release %',
      emoji: cardEmojis[5]
    },
    {
      label: 'Avg Catch/Team',
      value: formatNumber(enhancedStats.catchPerTeam, 1),
      subtext: 'fish per team',
      emoji: cardEmojis[6]
    },
    {
      label: 'Teams Fishing',
      value: `${coreStats.teamsWithFish}/${coreStats.totalTeams}`,
      subtext: `${formatPercent((coreStats.teamsWithFish / coreStats.totalTeams) * 100)}`,
      emoji: cardEmojis[7]
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg p-4 border-2 transition-all duration-200 hover:shadow-lg"
          style={{
            backgroundColor: currentTheme.colors.background,
            borderColor: currentTheme.colors.border,
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: currentTheme.colors.text }}
              >
                {card.label}
              </p>
              <p className="text-2xl font-bold mt-2" style={{ color: currentTheme.colors.primary }}>
                {card.value}
              </p>
              {card.subtext && (
                <p className="text-xs mt-1" style={{ color: currentTheme.colors.text, opacity: 0.7 }}>
                  {card.subtext}
                </p>
              )}
            </div>
            <div className="flex-shrink-0 text-3xl opacity-60">{card.emoji}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
