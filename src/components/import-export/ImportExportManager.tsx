/**
 * Import/Export Manager Component
 * Manages CSV import and export for tournaments
 */

import { useState, useRef } from 'react'
import { Download, Upload, AlertCircle, CheckCircle, Loader } from 'lucide-react'
import { useTournamentStore } from '@modules/tournaments/tournament-store'
import { useTeamStore } from '@modules/teams/team-store'
import { useWeighInStore } from '@modules/weigh-ins/weigh-in-store'
import {
  parseCSV,
  validateImportedData,
  prepareTournamentExport,
  generateExportFilename,
  importTournament,
  type ImportedData
} from '@modules/import-export'

export default function ImportExportManager() {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import')
  const [importFile, setImportFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ImportedData | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [validationWarnings, setValidationWarnings] = useState<string[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const [importSuccess, setImportSuccess] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const tournaments = useTournamentStore((s) => s.tournaments)
  const loadTournaments = useTournamentStore((s) => s.loadTournaments)
  const loadTeams = useTeamStore((s) => s.loadTeams)
  const loadWeighIns = useWeighInStore((s) => s.loadWeighIns)

  /**
   * Handle file selection and parsing
   */
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImportFile(file)
    setParsedData(null)
    setValidationErrors([])
    setValidationWarnings([])
    setImportSuccess(null)

    try {
      const content = await file.text()
      const data = parseCSV(content)
      const validation = validateImportedData(data)

      setParsedData(data)
      setValidationErrors(validation.errors)
      setValidationWarnings(validation.warnings)
    } catch (err) {
      setValidationErrors([
        `Failed to parse CSV: ${err instanceof Error ? err.message : 'Unknown error'}`
      ])
    }
  }

  /**
   * Handle import confirmation
   */
  const handleImportConfirm = async () => {
    if (!parsedData) return

    setIsImporting(true)
    try {
      const result = await importTournament(parsedData)

      // Reload tournament data
      await loadTournaments()
      await loadTeams(result.tournamentId)
      await loadWeighIns(result.tournamentId)

      setImportSuccess(
        `✓ Successfully imported "${result.tournamentName}" with ${result.teamCount} teams and ${result.weighInCount} weigh-ins`
      )
      setParsedData(null)
      setImportFile(null)
      setValidationErrors([])
      setValidationWarnings([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      setValidationErrors([
        `Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      ])
    } finally {
      setIsImporting(false)
    }
  }

  /**
   * Handle export
   */
  const handleExport = async (tournamentId: string) => {
    setIsExporting(true)
    setExportError(null)

    try {
      const tournament = tournaments.find((t) => t.id === tournamentId)
      if (!tournament) throw new Error('Tournament not found')

      const csvContent = await prepareTournamentExport(tournamentId)
      const filename = generateExportFilename(tournament.name, tournament.year)

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      link.click()
      URL.revokeObjectURL(link.href)
    } catch (err) {
      setExportError(
        `Export failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Import / Export</h1>
        <p className="text-gray-600 mt-1">Import tournament data from CSV or export existing tournaments</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('import')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'import'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Upload size={18} className="inline mr-2" />
          Import
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'export'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Download size={18} className="inline mr-2" />
          Export
        </button>
      </div>

      {/* Import Tab */}
      {activeTab === 'import' && <ImportTab
        importFile={importFile}
        parsedData={parsedData}
        validationErrors={validationErrors}
        validationWarnings={validationWarnings}
        isImporting={isImporting}
        importSuccess={importSuccess}
        fileInputRef={fileInputRef}
        onFileSelect={handleFileSelect}
        onImportConfirm={handleImportConfirm}
        onClear={() => {
          setParsedData(null)
          setImportFile(null)
          setValidationErrors([])
          setValidationWarnings([])
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
        }}
      />}

      {/* Export Tab */}
      {activeTab === 'export' && <ExportTab
        tournaments={tournaments}
        isExporting={isExporting}
        exportError={exportError}
        onExport={handleExport}
      />}
    </div>
  )
}

/**
 * Import Tab Component
 */
function ImportTab({
  importFile,
  parsedData,
  validationErrors,
  validationWarnings,
  isImporting,
  importSuccess,
  fileInputRef,
  onFileSelect,
  onImportConfirm,
  onClear
}: {
  importFile: File | null
  parsedData: ImportedData | null
  validationErrors: string[]
  validationWarnings: string[]
  isImporting: boolean
  importSuccess: string | null
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void
  onImportConfirm: () => void
  onClear: () => void
}) {
  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Upload CSV File</h2>
          <p className="text-sm text-gray-600 mt-1">
            Select a CSV file with tournament data (tournament, teams, and weigh-ins)
          </p>
        </div>
        <div className="p-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={onFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload size={18} />
              Select CSV File
            </button>
            <p className="text-gray-600 text-sm mt-4">
              or drag and drop a CSV file here
            </p>
            {importFile && (
              <p className="text-green-600 font-medium mt-2">
                ✓ {importFile.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Success Message */}
      {importSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-green-900">{importSuccess}</p>
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-900">Validation Errors</h3>
              <ul className="text-sm text-red-800 mt-2 space-y-1">
                {validationErrors.map((error, idx) => (
                  <li key={idx}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Validation Warnings */}
      {validationWarnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-yellow-900">Warnings</h3>
              <ul className="text-sm text-yellow-800 mt-2 space-y-1">
                {validationWarnings.map((warning, idx) => (
                  <li key={idx}>⚠ {warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      {parsedData && validationErrors.length === 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Preview</h2>
          </div>
          <div className="p-6 space-y-4">
            {/* Tournament Info */}
            <div className="bg-gray-50 rounded p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Tournament</h3>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <dt className="text-gray-600">Name:</dt>
                <dd className="text-gray-900 font-medium">{parsedData.tournament.name}</dd>
                <dt className="text-gray-600">Year:</dt>
                <dd className="text-gray-900 font-medium">{parsedData.tournament.year}</dd>
                <dt className="text-gray-600">Location:</dt>
                <dd className="text-gray-900 font-medium">{parsedData.tournament.location}</dd>
                <dt className="text-gray-600">Date Range:</dt>
                <dd className="text-gray-900 font-medium">
                  {parsedData.tournament.startDate.toLocaleDateString()} to{' '}
                  {parsedData.tournament.endDate.toLocaleDateString()}
                </dd>
              </dl>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{parsedData.teams.length}</div>
                <div className="text-sm text-gray-600 mt-1">Teams</div>
              </div>
              <div className="bg-green-50 rounded p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{parsedData.weighIns.length}</div>
                <div className="text-sm text-gray-600 mt-1">Weigh-ins</div>
              </div>
              <div className="bg-purple-50 rounded p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {parsedData.weighIns.reduce((sum, w) => sum + w.fishCount, 0)}
                </div>
                <div className="text-sm text-gray-600 mt-1">Total Fish</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={onImportConfirm}
                disabled={isImporting}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isImporting ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Confirm Import
                  </>
                )}
              </button>
              <button
                onClick={onClear}
                disabled={isImporting}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">CSV Format</h3>
        <p className="text-sm text-blue-800 mb-2">
          Your CSV file should have three sections: <code>#TOURNAMENT</code>, <code>#TEAMS</code>, and <code>#WEIGH_INS</code>
        </p>
        <p className="text-sm text-blue-800">
          See <a href="#" className="underline font-medium">CSV Format Guide</a> for detailed specifications.
        </p>
      </div>
    </div>
  )
}

/**
 * Export Tab Component
 */
function ExportTab({
  tournaments,
  isExporting,
  exportError,
  onExport
}: {
  tournaments: any[]
  isExporting: boolean
  exportError: string | null
  onExport: (tournamentId: string) => void
}) {
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('')

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {exportError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-900">{exportError}</p>
          </div>
        </div>
      )}

      {/* Tournament Selector */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Export Tournament</h2>
          <p className="text-sm text-gray-600 mt-1">
            Select a tournament to export as CSV
          </p>
        </div>
        <div className="p-6 space-y-4">
          {tournaments.length === 0 ? (
            <p className="text-gray-600">No tournaments available. Create one first.</p>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Tournament
                </label>
                <select
                  value={selectedTournamentId}
                  onChange={(e) => setSelectedTournamentId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Select a tournament...</option>
                  {tournaments.map((tournament) => (
                    <option key={tournament.id} value={tournament.id}>
                      {tournament.name} ({tournament.year}) - {tournament.location}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => selectedTournamentId && onExport(selectedTournamentId)}
                disabled={!selectedTournamentId || isExporting}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isExporting ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    Download CSV
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Export Information</h3>
        <p className="text-sm text-blue-800">
          The exported CSV file contains all tournament data (tournament info, teams, and weigh-ins) in a format that can be re-imported or edited externally.
        </p>
      </div>
    </div>
  )
}
