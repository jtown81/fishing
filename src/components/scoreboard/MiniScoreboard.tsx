/**
 * Mini Scoreboard
 * Compact standings display for dashboard or sidebar
 * Shows top 5 teams in a card format
 */

import { useStandings } from '@hooks/useStandings'
import { formatWeight } from '@utils/formatting'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function MiniScoreboard() {
  const standings = useStandings()

  if (standings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200 text-center">
        <p className="text-gray-500">No weigh-in data yet</p>
      </div>
    )
  }

  const top5 = standings.slice(0, 5)

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b border-gray-200">
        <h3 className="font-bold text-gray-900">Live Standings</h3>
        <p className="text-xs text-gray-600">Top 5 Teams</p>
      </div>

      <div className="divide-y divide-gray-200">
        {top5.map((team, idx) => (
          <div key={team.teamId} className="p-3 hover:bg-gray-50 transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 truncate">
                    Team #{team.teamNumber}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {formatWeight(team.grandTotal)}
                  </p>
                </div>
              </div>

              {team.rankChange !== undefined && team.rankChange !== 0 && (
                <div className="flex items-center gap-1 ml-2">
                  {team.rankChange > 0 ? (
                    <TrendingUp size={14} className="text-green-600" />
                  ) : (
                    <TrendingDown size={14} className="text-red-600" />
                  )}
                  <span className={`text-xs font-bold ${
                    team.rankChange > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {team.rankChange > 0 ? '+' : ''}{team.rankChange}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 text-xs text-gray-600 text-center">
        {standings.length} teams total
      </div>
    </div>
  )
}
