/**
 * Hall of Fame Record Card
 * Displays a single all-time record with trophy
 */

import { AllTimeRecord } from '@modules/hall-of-fame'
import { formatWeight, formatNumber } from '@utils/formatting'
import { useThemeStore } from '@store/theme-store'
import AnimatedTrophy from './AnimatedTrophy'

interface RecordCardProps {
  record: AllTimeRecord
  rank?: number
}

const CATEGORY_LABELS: Record<string, string> = {
  biggestFish: 'Biggest Fish',
  bestTeamTotal: 'Best Team Total',
  mostConsistent: 'Most Consistent',
  mostImproved: 'Most Improved',
  highestRelease: 'Highest Release'
}

const CATEGORY_ICONS: Record<string, string> = {
  biggestFish: '🐟',
  bestTeamTotal: '⚖️',
  mostConsistent: '📊',
  mostImproved: '📈',
  highestRelease: '🦅'
}

export default function RecordCard({ record, rank }: RecordCardProps) {
  const { currentTheme } = useThemeStore()

  const formatValue = (): string => {
    switch (record.category) {
      case 'biggestFish':
        return formatWeight(record.value)
      case 'bestTeamTotal':
        return formatWeight(record.value)
      case 'mostConsistent':
        return record.value.toFixed(2) // Standard deviation
      case 'mostImproved':
      case 'highestRelease':
        return formatNumber(Math.round(record.value))
      default:
        return record.value.toString()
    }
  }

  return (
    <div
      className="rounded-lg p-4 flex items-start gap-4 border-2 transition-all hover:shadow-lg"
      style={{
        backgroundColor: 'white',
        borderColor: currentTheme.colors.border,
        borderLeftWidth: '6px',
        borderLeftColor: currentTheme.colors.accent
      }}
    >
      {/* Trophy */}
      <div className="flex-shrink-0">
        <AnimatedTrophy tier={record.tier} size={48} animated={true} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{CATEGORY_ICONS[record.category]}</span>
          <h3 className="font-bold text-lg" style={{ color: currentTheme.colors.primary }}>
            {CATEGORY_LABELS[record.category]}
          </h3>
          {rank && (
            <span
              className="ml-auto text-xs font-semibold px-2 py-1 rounded"
              style={{
                backgroundColor: currentTheme.colors.accent,
                color: currentTheme.colors.text
              }}
            >
              #{rank}
            </span>
          )}
        </div>

        <div className="text-sm space-y-1">
          <div>
            <span className="opacity-75">Team #{record.teamNumber}</span>
            {record.memberNames.length > 0 && (
              <span className="ml-2 text-xs opacity-60">
                {record.memberNames.join(', ')}
              </span>
            )}
          </div>

          <div className="font-semibold text-base" style={{ color: currentTheme.colors.accent }}>
            {formatValue()}
          </div>

          <div className="text-xs opacity-60">
            {record.tournamentName} — {record.tournamentYear}
          </div>
        </div>
      </div>

      {/* Tier Badge */}
      <div className="flex-shrink-0 text-center">
        <div className="text-3xl mb-1">
          {record.tier === 'legendary' && '⭐'}
          {record.tier === 'gold' && '🥇'}
          {record.tier === 'silver' && '🥈'}
          {record.tier === 'bronze' && '🥉'}
        </div>
        <div className="text-xs font-semibold opacity-75">{record.tier}</div>
      </div>
    </div>
  )
}
