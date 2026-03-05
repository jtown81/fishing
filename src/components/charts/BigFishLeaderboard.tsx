/**
 * Big Fish Leaderboard
 * Shows top fish caught in the tournament
 * Ranked by weight with team and day information
 */

import { useWeighInStore } from '@modules/weigh-ins/weigh-in-store'
import { useTeamStore } from '@modules/teams/team-store'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { formatWeight } from '@utils/formatting'
import { Trophy } from 'lucide-react'

export default function BigFishLeaderboard() {
  const weighIns = useWeighInStore((s) => s.weighIns)
  const teams = useTeamStore((s) => s.teams)

  // Get all big fish entries with team info
  const bigFish = weighIns
    .filter(w => w.bigFishWeight && w.bigFishWeight > 0)
    .map((w) => {
      const team = teams.find(t => t.id === w.teamId)
      return {
        id: w.id,
        weight: w.bigFishWeight!,
        teamNumber: w.teamNumber,
        teamName: team?.members.map(m => m.lastName).join('/') || `Team ${w.teamNumber}`,
        day: w.day,
        label: `Team #${w.teamNumber} (Day ${w.day})`
      }
    })
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 10) // Top 10 only

  if (bigFish.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 h-96 flex items-center justify-center border border-gray-200">
        <p className="text-gray-500">No big fish records yet</p>
      </div>
    )
  }

  // Prepare chart data (reversed for proper display)
  const data = [...bigFish].reverse()

  const getColor = (index: number) => {
    if (index === bigFish.length - 1) return '#fbbf24' // Gold
    if (index === bigFish.length - 2) return '#a78bfa' // Silver
    if (index === bigFish.length - 3) return '#f97316' // Bronze
    return '#3b82f6' // Blue
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Trophy size={20} className="text-amber-500" />
            Big Fish Leaderboard
          </h3>
          <p className="text-sm text-gray-600 mt-1">Top 10 fish caught by weight</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="label" width={140} tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
            formatter={(value: number) => [formatWeight(value), 'Weight']}
          />
          <Bar dataKey="weight" fill="#3b82f6" name="Weight (lbs)">
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={getColor(index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6">
        <div className="space-y-2">
          {bigFish.slice(0, 3).map((fish, index) => (
            <div key={fish.id} className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-white"
                style={{
                  backgroundColor: index === 0 ? '#fbbf24' : index === 1 ? '#a78bfa' : '#f97316'
                }}>
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{fish.label}</p>
                <p className="text-sm text-gray-600">{fish.teamName}</p>
              </div>
              <p className="text-lg font-bold text-gray-900">{formatWeight(fish.weight)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
