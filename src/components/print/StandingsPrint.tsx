/**
 * Standings Print Report
 * Full tournament rankings optimized for printing
 */

import { formatWeight, formatDate } from '@utils/formatting'
import type { TeamStanding } from '@models/tournament'

interface StandingsPrintProps {
  standings: TeamStanding[]
  tournamentName: string
  year: number
  location: string
  printDate: Date
}

export default function StandingsPrint({
  standings,
  tournamentName,
  year,
  location,
  printDate
}: StandingsPrintProps) {
  return (
    <div className="bg-white p-8 min-h-screen text-black">
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-black pb-4">
        <h1 className="text-3xl font-bold">{tournamentName}</h1>
        <p className="text-lg">{year} Tournament</p>
        <p className="text-sm text-gray-600">
          {location} • Printed: {formatDate(printDate)}
        </p>
      </div>

      {/* Table */}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b-2 border-black">
            <th className="text-left py-2 px-2 font-bold">Place</th>
            <th className="text-left py-2 px-2 font-bold">Team #</th>
            <th className="text-left py-2 px-2 font-bold">Team Members</th>
            <th className="text-right py-2 px-2 font-bold">Day 1</th>
            <th className="text-right py-2 px-2 font-bold">Day 2</th>
            <th className="text-right py-2 px-2 font-bold">Grand Total</th>
            <th className="text-center py-2 px-2 font-bold">Rank Change</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team, idx) => (
            <tr
              key={team.teamId}
              className={`border-b border-gray-300 ${
                idx < 3 ? 'bg-gray-100 font-bold' : ''
              }`}
            >
              <td className="text-center py-2 px-2">{idx + 1}</td>
              <td className="py-2 px-2">#{team.teamNumber}</td>
              <td className="py-2 px-2">
                {team.members.map(m => `${m.firstName} ${m.lastName}`).join(' & ')}
              </td>
              <td className="text-right py-2 px-2">{formatWeight(team.day1Total)}</td>
              <td className="text-right py-2 px-2">{formatWeight(team.day2Total)}</td>
              <td className="text-right py-2 px-2 font-bold">
                {formatWeight(team.grandTotal)}
              </td>
              <td className="text-center py-2 px-2">
                {team.rankChange !== undefined && team.rankChange !== 0
                  ? team.rankChange > 0
                    ? `↑ ${team.rankChange}`
                    : `↓ ${Math.abs(team.rankChange)}`
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <div className="mt-8 text-xs text-gray-600 border-t border-gray-300 pt-4">
        <p>Total Teams: {standings.length}</p>
        <p>
          Big Fish: {formatWeight(
            Math.max(
              ...standings
                .filter(s => s.day1BigFish || s.day2BigFish)
                .map(s => Math.max(s.day1BigFish || 0, s.day2BigFish || 0))
            )
          )}
        </p>
      </div>
    </div>
  )
}
