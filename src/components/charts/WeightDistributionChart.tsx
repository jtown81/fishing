/**
 * Weight Distribution Histogram
 * Shows distribution of fish weights across the tournament
 * Helps identify population health and size structure
 */

import { useTournamentStats } from '@modules/stats'
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

export default function WeightDistributionChart() {
  const { weightDistribution } = useTournamentStats()

  if (weightDistribution.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 h-96 flex items-center justify-center border border-gray-200">
        <p className="text-gray-500">No weigh-in data available</p>
      </div>
    )
  }

  const data = weightDistribution.map((bucket) => ({
    name: `${bucket.min.toFixed(1)}-${bucket.max.toFixed(1)} lbs`,
    count: bucket.count,
    percentage: parseFloat(bucket.percentage.toFixed(1)),
    min: bucket.min,
    max: bucket.max
  }))

  // Color gradient from blue to red based on count
  const getColor = (value: number, max: number) => {
    const ratio = value / max
    if (ratio < 0.3) return '#3b82f6' // blue
    if (ratio < 0.6) return '#10b981' // green
    if (ratio < 0.8) return '#f59e0b' // amber
    return '#ef4444' // red
  }

  const maxCount = Math.max(...weightDistribution.map(b => b.count))

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">Weight Distribution</h3>
        <p className="text-sm text-gray-600 mt-1">
          Fish weights across all weigh-ins
        </p>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 50 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
            formatter={(value: number) => [value, 'Fish Count']}
            labelFormatter={(label: string) => `Weight: ${label}`}
          />
          <Bar dataKey="count" fill="#3b82f6" name="Fish Count">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.count, maxCount)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-gray-600">Min Weight</p>
          <p className="text-lg font-bold text-gray-900">
            {weightDistribution[0]?.min.toFixed(1)} lbs
          </p>
        </div>
        <div>
          <p className="text-gray-600">Max Weight</p>
          <p className="text-lg font-bold text-gray-900">
            {weightDistribution[weightDistribution.length - 1]?.max.toFixed(1)} lbs
          </p>
        </div>
        <div>
          <p className="text-gray-600">Total Fish</p>
          <p className="text-lg font-bold text-gray-900">
            {weightDistribution.reduce((sum, b) => sum + b.count, 0)}
          </p>
        </div>
      </div>
    </div>
  )
}
