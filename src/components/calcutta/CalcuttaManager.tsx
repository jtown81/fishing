/**
 * Calcutta Manager
 * Main component for managing auction-style betting pool
 */

import { useTournamentStore } from '@modules/tournaments/tournament-store'
import CalcuttaGroupGenerator from './CalcuttaGroupGenerator'
import CalcuttaGroupsList from './CalcuttaGroupsList'
import CalcuttaResults from './CalcuttaResults'
import { Gavel } from 'lucide-react'

export default function CalcuttaManager() {
  const currentTournament = useTournamentStore((s) => s.currentTournament)

  if (!currentTournament) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-900">
            Please create or select a tournament to manage Calcutta pools.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Gavel size={28} className="text-amber-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calcutta Manager</h1>
          <p className="text-gray-600">
            {currentTournament.name} • {currentTournament.year}
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-900">
          <strong>Calcutta Pool:</strong> Teams are randomly grouped (3-4 per group) and each group is auctioned to a buyer. The group with the best-performing team (highest grand total weight) wins the pot.
        </p>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Generator and Groups */}
        <div className="lg:col-span-2 space-y-6">
          <CalcuttaGroupGenerator />
          <CalcuttaGroupsList />
        </div>

        {/* Right Column: Results */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Results</h2>
          <CalcuttaResults />
        </div>
      </div>
    </div>
  )
}
