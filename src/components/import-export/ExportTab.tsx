/**
 * Export Tab
 * Allows selecting a tournament and exporting it to CSV
 */

import { useEffect, useState } from 'react'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { prepareTournamentExport, downloadCSV } from '@modules/import-export'
import { useTournamentStore } from '@modules/tournaments/tournament-store'
import type { Tournament } from '@models/tournament'

type ExportStage = 'select' | 'exporting' | 'success' | 'error'

export function ExportTab() {
  const tournaments = useTournamentStore((s: any) => s.tournaments)
  const [stage, setStage] = useState<ExportStage>('select')
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null)
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (tournaments.length > 0 && !selectedTournament) {
      setSelectedTournament(tournaments[0])
    }
  }, [tournaments, selectedTournament])

  const handleExport = async () => {
    if (!selectedTournament) return

    setStage('exporting')
    setIsLoading(true)

    try {
      const result = await prepareTournamentExport(selectedTournament.id)
      downloadCSV(result.filename, result.csvContent)
      setStage('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
      setStage('error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setStage('select')
    setError('')
  }

  if (tournaments.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <AlertCircle className="text-gray-600" size={24} />
            No Tournaments Available
          </h2>
        </div>
        <div className="p-6">
          <p className="text-gray-700">
            There are no tournaments to export. Create a tournament in the app first, then you can export it here.
          </p>
        </div>
      </div>
    )
  }

  if (stage === 'success') {
    return (
      <div className="bg-green-50 rounded-lg shadow border border-green-200">
        <div className="px-6 py-4 border-b border-green-200">
          <h2 className="text-lg font-bold text-green-900 flex items-center gap-2">
            <CheckCircle className="text-green-600" size={24} />
            Export Successful
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-green-800">
            Tournament "{selectedTournament?.name}" ({selectedTournament?.year}) has been downloaded as CSV.
          </p>
          <p className="text-gray-700">You can now:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
            <li>Edit the file in Excel or any text editor</li>
            <li>Share with others</li>
            <li>Import it back into the app later</li>
          </ul>
          <button
            onClick={handleReset}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            Export Another Tournament
          </button>
        </div>
      </div>
    )
  }

  if (stage === 'error') {
    return (
      <div className="bg-red-50 rounded-lg shadow border border-red-200">
        <div className="px-6 py-4 border-b border-red-200">
          <h2 className="text-lg font-bold text-red-900 flex items-center gap-2">
            <AlertCircle className="text-red-600" size={24} />
            Export Failed
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-red-800 font-medium">{error}</p>
          <button
            onClick={handleReset}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Export Tournament to CSV</h2>
        <p className="text-sm text-gray-600 mt-1">Select a tournament and download its data as a CSV file</p>
      </div>
      <div className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tournament</label>
          <select
            value={selectedTournament?.id || ''}
            onChange={(e) => {
              const t = tournaments.find((t: Tournament) => t.id === e.target.value)
              if (t) setSelectedTournament(t)
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {tournaments.map((t: Tournament) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.year}) - {t.location}
              </option>
            ))}
          </select>
        </div>

        {selectedTournament && (
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
            <div className="space-y-1">
              <p className="text-lg font-semibold">
                {selectedTournament.name} ({selectedTournament.year})
              </p>
              <p className="text-sm text-gray-600">{selectedTournament.location}</p>
              <p className="text-xs text-gray-500">
                {selectedTournament.startDate instanceof Date
                  ? selectedTournament.startDate.toLocaleDateString()
                  : new Date(selectedTournament.startDate).toLocaleDateString()}{' '}
                →{' '}
                {selectedTournament.endDate instanceof Date
                  ? selectedTournament.endDate.toLocaleDateString()
                  : new Date(selectedTournament.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        <div className="p-3 bg-blue-50 rounded text-sm text-blue-800">
          <p className="font-semibold mb-1">CSV Format</p>
          <p>The exported file will contain tournament info, teams, and weigh-in data in a standard format you can edit.</p>
        </div>

        <button
          onClick={handleExport}
          disabled={isLoading || !selectedTournament}
          className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium"
        >
          {isLoading ? 'Exporting...' : 'Download CSV'}
        </button>
      </div>
    </div>
  )
}
