/**
 * Statistics Overview Dashboard
 * Comprehensive view of all tournament statistics
 * Combines summary cards, charts, and reports
 */

import { useTournamentStore } from '@modules/tournaments/tournament-store'
import StatsSummaryCards from './StatsSummaryCards'
import WeightDistributionChart from './WeightDistributionChart'
import DayComparisonChart from './DayComparisonChart'
import BigFishLeaderboard from './BigFishLeaderboard'
import MostImprovedReport from './MostImprovedReport'
import { BarChart3 } from 'lucide-react'

export default function StatisticsOverview() {
  const currentTournament = useTournamentStore((s) => s.currentTournament)

  if (!currentTournament) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-900">
            Please create or select a tournament to view statistics.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BarChart3 size={28} className="text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tournament Statistics</h1>
          <p className="text-gray-600">
            {currentTournament.name} • {currentTournament.year}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
        <StatsSummaryCards />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Weight Distribution</h2>
          <WeightDistributionChart />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Day Comparison</h2>
          <DayComparisonChart />
        </div>
      </div>

      {/* Big Fish */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Big Fish Records</h2>
        <BigFishLeaderboard />
      </div>

      {/* Most Improved */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Rank Changes</h2>
        <MostImprovedReport />
      </div>
    </div>
  )
}
