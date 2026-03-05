/**
 * Most Improved Report
 * Shows rank change from Day 1 to Day 2
 * Displays teams that climbed or fell the most in standings
 */

import { useTournamentStats } from '@modules/stats'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { formatWeight } from '@utils/formatting'

export default function MostImprovedReport() {
  const { mostImproved } = useTournamentStats()

  if (mostImproved.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <p className="text-gray-500">No rank data available</p>
      </div>
    )
  }

  // Sort by improvement (positive = improved)
  const improved = [...mostImproved].sort((a, b) => b.rankImprovement - a.rankImprovement)

  // Most improved (positive change)
  const mostImprovedTeams = improved.filter(t => t.rankImprovement > 0).slice(0, 5)

  // Most declined (negative change)
  const mostDeclinedTeams = improved.filter(t => t.rankImprovement < 0).sort((a, b) => a.rankImprovement - b.rankImprovement).slice(0, 5)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Most Improved */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="text-green-600" size={20} />
          <h3 className="text-lg font-bold text-gray-900">Most Improved</h3>
        </div>

        {mostImprovedTeams.length > 0 ? (
          <div className="space-y-3">
            {mostImprovedTeams.map((team, index) => (
              <div
                key={team.teamId}
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-green-600 text-white rounded-full text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Team #{team.teamNumber}
                    </p>
                    <p className="text-xs text-gray-600">
                      {team.day1Rank && team.day2Rank ? `Rank: ${team.day1Rank} → ${team.day2Rank}` : 'No Day 1 data'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-700">
                    +{team.rankImprovement}
                  </p>
                  <p className="text-xs text-gray-600">
                    {formatWeight(team.grandTotal)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No improvement data</p>
        )}
      </div>

      {/* Most Declined */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="mb-4 flex items-center gap-2">
          <TrendingDown className="text-red-600" size={20} />
          <h3 className="text-lg font-bold text-gray-900">Most Declined</h3>
        </div>

        {mostDeclinedTeams.length > 0 ? (
          <div className="space-y-3">
            {mostDeclinedTeams.map((team, index) => (
              <div
                key={team.teamId}
                className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-red-600 text-white rounded-full text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Team #{team.teamNumber}
                    </p>
                    <p className="text-xs text-gray-600">
                      {team.day1Rank && team.day2Rank ? `Rank: ${team.day1Rank} → ${team.day2Rank}` : 'No Day 1 data'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-700">
                    {team.rankImprovement}
                  </p>
                  <p className="text-xs text-gray-600">
                    {formatWeight(team.grandTotal)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No decline data</p>
        )}
      </div>

      {/* Summary */}
      {mostImprovedTeams.length === 0 && mostDeclinedTeams.length === 0 && (
        <div className="lg:col-span-2 text-center py-8">
          <Minus className="mx-auto text-gray-400 mb-2" size={32} />
          <p className="text-gray-500">Need both Day 1 and Day 2 data to show rank changes</p>
        </div>
      )}
    </div>
  )
}
