import { useStandings } from '@hooks/useStandings'
import { formatWeight, formatTeamMembers, formatRankChange } from '@utils/formatting'
import { useTournamentStore } from '@modules/tournaments/tournament-store'

export default function StandingsTable() {
  const currentTournament = useTournamentStore((s) => s.currentTournament)
  const standings = useStandings(currentTournament?.id)

  if (standings.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-600">No standings data yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Rank</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Team #</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Members</th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Day 1</th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Day 2</th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Grand Total</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Change</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {standings.map((standing) => (
            <tr key={standing.teamId} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-sm font-bold text-gray-900">
                {standing.rank}
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                #{standing.teamNumber}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">
                {formatTeamMembers(standing.members)}
              </td>
              <td className="px-4 py-3 text-sm text-right text-gray-700">
                {formatWeight(standing.day1Total)}
              </td>
              <td className="px-4 py-3 text-sm text-right text-gray-700">
                {formatWeight(standing.day2Total)}
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-right text-gray-900">
                {formatWeight(standing.grandTotal)}
              </td>
              <td className="px-4 py-3 text-sm text-center">
                <span className={
                  standing.rankChange && standing.rankChange > 0
                    ? 'text-green-600 font-semibold'
                    : standing.rankChange && standing.rankChange < 0
                    ? 'text-red-600 font-semibold'
                    : 'text-gray-600'
                }>
                  {formatRankChange(standing.rankChange)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
