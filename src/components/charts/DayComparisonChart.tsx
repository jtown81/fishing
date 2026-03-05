/**
 * Day 1 vs Day 2 Comparison Scatter Plot
 * Shows team performance across both days
 * X-axis: Day 1 total weight
 * Y-axis: Day 2 total weight
 * Bubble size: Grand total
 */

import { useStandings } from '@hooks/useStandings'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { formatWeight } from '@utils/formatting'

export default function DayComparisonChart() {
  const standings = useStandings()

  if (standings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 h-96 flex items-center justify-center border border-gray-200">
        <p className="text-gray-500">No weigh-in data available</p>
      </div>
    )
  }

  const data = standings.map((team) => ({
    teamNumber: team.teamNumber,
    day1: team.day1Total,
    day2: team.day2Total,
    grandTotal: team.grandTotal,
    name: `Team #${team.teamNumber}`,
    // Size for the bubble (scale grand total for visibility)
    size: Math.max((team.grandTotal * 2) + 50, 100)
  }))

  // Calculate average day weights for reference lines
  const avgDay1 = data.reduce((sum, d) => sum + d.day1, 0) / data.length
  const avgDay2 = data.reduce((sum, d) => sum + d.day2, 0) / data.length

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">Day 1 vs Day 2 Performance</h3>
        <p className="text-sm text-gray-600 mt-1">
          Bubble size represents grand total weight
        </p>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <ScatterChart margin={{ top: 20, right: 30, left: 10, bottom: 50 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            type="number"
            dataKey="day1"
            name="Day 1 Total"
            label={{ value: 'Day 1 Total (lbs)', position: 'insideBottomRight', offset: -10 }}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            type="number"
            dataKey="day2"
            name="Day 2 Total"
            label={{ value: 'Day 2 Total (lbs)', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
            cursor={{ strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              if (active && payload && payload[0]) {
                const data = payload[0].payload
                return (
                  <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                    <p className="font-semibold text-gray-900">{data.name}</p>
                    <p className="text-sm text-gray-600">
                      Day 1: {formatWeight(data.day1)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Day 2: {formatWeight(data.day2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Total: {formatWeight(data.grandTotal)}
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <ReferenceLine
            x={avgDay1}
            stroke="#9ca3af"
            strokeDasharray="5 5"
            label={{ value: `Avg Day 1: ${formatWeight(avgDay1)}`, position: 'top' }}
          />
          <ReferenceLine
            y={avgDay2}
            stroke="#9ca3af"
            strokeDasharray="5 5"
            label={{ value: `Avg Day 2: ${formatWeight(avgDay2)}`, position: 'left' }}
          />
          <Scatter name="Teams" data={data} fill="#3b82f6" />
        </ScatterChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-600">Day 1 Average</p>
          <p className="text-lg font-bold text-gray-900">{formatWeight(avgDay1)}</p>
        </div>
        <div>
          <p className="text-gray-600">Day 2 Average</p>
          <p className="text-lg font-bold text-gray-900">{formatWeight(avgDay2)}</p>
        </div>
      </div>
    </div>
  )
}
