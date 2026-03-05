/**
 * Calcutta Group Generator
 * UI for creating random groups and selecting group size
 */

import { useState } from 'react'
import { useTeamStore } from '@modules/teams/team-store'
import { useCalcuttaStore } from '@modules/calcutta/calcutta-store'
import { Shuffle, AlertCircle } from 'lucide-react'

export default function CalcuttaGroupGenerator() {
  const teams = useTeamStore((s) => s.teams)
  const groups = useCalcuttaStore((s) => s.groups)
  const generateGroups = useCalcuttaStore((s) => s.generateGroups)
  const clearGroups = useCalcuttaStore((s) => s.clearGroups)

  const [groupSize, setGroupSize] = useState<3 | 4>(4)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = () => {
    if (teams.length < 3) {
      alert('Need at least 3 teams to generate groups')
      return
    }

    setIsGenerating(true)
    setTimeout(() => {
      generateGroups(teams, groupSize)
      setIsGenerating(false)
    }, 500) // Small delay for UX feedback
  }

  const handleClear = () => {
    if (confirm('Clear all groups? This cannot be undone.')) {
      clearGroups()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Generate Groups</h2>

      {teams.length === 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
          <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800">
            Add teams first before generating Calcutta groups
          </p>
        </div>
      )}

      <div className="space-y-4">
        {/* Team Count Info */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>{teams.length} teams registered</strong>
          </p>
          {teams.length > 0 && (
            <p className="text-xs text-blue-700 mt-2">
              {groupSize === 4
                ? `Will create ${Math.ceil(teams.length / 4)} groups of ~4 teams`
                : `Will create ${Math.ceil(teams.length / 3)} groups of ~3 teams`}
            </p>
          )}
        </div>

        {/* Group Size Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Teams per Group
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[3, 4].map((size) => (
              <button
                key={size}
                onClick={() => setGroupSize(size as 3 | 4)}
                disabled={teams.length < size}
                className={`py-3 px-4 rounded-lg border-2 font-semibold transition ${
                  groupSize === size
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                } ${teams.length < size ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {size} Teams
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleGenerate}
            disabled={teams.length === 0 || isGenerating}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Shuffle size={18} />
            {isGenerating ? 'Generating...' : 'Generate Random Groups'}
          </button>

          {groups.length > 0 && (
            <button
              onClick={handleClear}
              className="py-3 px-6 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition"
            >
              Clear
            </button>
          )}
        </div>

        {/* Groups Summary */}
        {groups.length > 0 && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-semibold text-green-900">
              ✓ {groups.length} groups generated
            </p>
            <p className="text-xs text-green-700 mt-1">
              Scroll down to set buyers and amounts
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
