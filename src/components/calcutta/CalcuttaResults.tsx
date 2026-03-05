/**
 * Calcutta Results
 * Shows winning groups and payout calculations
 */

import { useCalcuttaStore } from '@modules/calcutta/calcutta-store'
import { useStandings } from '@hooks/useStandings'
import { scoreCalcuttaGroups } from '@modules/stats'
import { calculatePoolValue } from '@modules/calcutta'
import { formatWeight, formatCurrency } from '@utils/formatting'
import { Trophy, TrendingUp, Zap } from 'lucide-react'

export default function CalcuttaResults() {
  const groups = useCalcuttaStore((s) => s.groups)
  const standings = useStandings()

  if (groups.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200 text-center">
        <Trophy size={32} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">No Calcutta groups yet</p>
      </div>
    )
  }

  // Score the groups with current standings
  const groupsWithoutWinners = groups.map(g => ({
    groupNumber: g.groupNumber,
    teamIds: g.teamIds
  }))
  const scores = scoreCalcuttaGroups(groupsWithoutWinners, standings)

  // Merge scores back into groups
  const scoredGroups = groups.map((group, idx) => {
    const score = scores[idx]
    return {
      ...group,
      winningTeamId: score?.winningTeamId,
      winningTeamNumber: score?.winningTeamNumber,
      winningScore: score?.winningScore
    }
  })

  const poolValue = calculatePoolValue(groups)
  const soldGroups = groups.filter(g => g.buyer && g.amount).length
  const isBidsComplete = soldGroups === groups.length

  // Calculate rankings
  const winners = scoredGroups
    .map((group) => ({
      ...group,
      winnerTeamNumber: group.winningTeamNumber,
      winnerScore: group.winningScore
    }))
    .sort((a, b) => (b.winnerScore || 0) - (a.winnerScore || 0))

  const topWinner = winners[0]

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      {isBidsComplete ? (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
          <div className="flex items-start gap-4">
            <Trophy size={32} className="text-amber-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">Calcutta Complete</h3>
              <p className="text-sm text-gray-700 mt-1">
                Total Pool: <strong>{formatCurrency(poolValue)}</strong>
              </p>
              {topWinner && (
                <p className="text-sm text-gray-700 mt-1">
                  Top Winner: <strong>Team #{topWinner.winningTeamNumber}</strong> ({formatWeight(topWinner.winnerScore || 0)})
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <p className="text-sm text-yellow-800">
            Enter all buyers and amounts to see final results
          </p>
        </div>
      )}

      {/* Winner Rankings */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp size={20} />
          Group Winners
        </h3>

        <div className="space-y-3">
          {winners.map((group, idx) => (
            <div
              key={group.id}
              className={`rounded-lg p-4 border-l-4 ${
                idx === 0
                  ? 'bg-amber-50 border-l-amber-400 border border-amber-200'
                  : idx === 1
                    ? 'bg-gray-100 border-l-gray-400 border border-gray-300'
                    : idx === 2
                      ? 'bg-orange-50 border-l-orange-400 border border-orange-200'
                      : 'bg-white border-l-blue-400 border border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {idx < 3 && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-white flex-shrink-0"
                      style={{
                        backgroundColor: idx === 0 ? '#fbbf24' : idx === 1 ? '#9ca3af' : '#f97316'
                      }}>
                      {idx + 1}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">
                      Group {group.groupNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      {group.buyer ? `Sold to ${group.buyer}` : 'Not sold'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    Team #{group.winningTeamNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatWeight(group.winningScore || 0)}
                  </p>
                  {group.amount && (
                    <p className="text-sm font-semibold text-green-600 mt-1">
                      {formatCurrency(group.amount)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payout Summary */}
      {isBidsComplete && (
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap size={20} />
            Payout Summary
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <p className="text-gray-700">Total Pool Value</p>
              <p className="font-bold text-lg">{formatCurrency(poolValue)}</p>
            </div>

            <div className="flex justify-between items-center p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-blue-900 font-medium">Groups Won (by highest weight)</p>
              <p className="font-bold text-lg text-blue-900">
                {winners.filter(w => w.buyer).length}/{groups.length}
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-100 rounded border border-blue-300 text-sm text-blue-900">
            <p className="font-semibold mb-2">💡 Typical Payout Structure:</p>
            <ul className="space-y-1 text-xs">
              <li>• 1st Place Winner (Group with highest Team): Gets half the pool</li>
              <li>• 2nd Place: Gets 30% of pool</li>
              <li>• 3rd Place: Gets remaining amount</li>
            </ul>
            <p className="text-xs text-blue-800 mt-3">
              Note: Configure payouts manually based on your tournament rules
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
