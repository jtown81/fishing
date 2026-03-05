/**
 * Import Tab
 * Handles CSV file upload, parsing, validation, and import workflow
 */

import { useState } from 'react'
import { AlertCircle, CheckCircle, Upload, AlertTriangle } from 'lucide-react'
import { parseCSV, validateBeforeImport, importTournament } from '@modules/import-export'
import type { ImportedData, ValidationError } from '@modules/import-export'

type ImportStage = 'upload' | 'validating' | 'preview' | 'importing' | 'success' | 'error'

export function ImportTab() {
  const [stage, setStage] = useState<ImportStage>('upload')
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [importedData, setImportedData] = useState<ImportedData | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [warnings, setWarnings] = useState<string[]>([])
  const [importError, setImportError] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const handleFileSelect = async (file: File) => {
    setCsvFile(file)
    setStage('validating')
    setValidationErrors([])
    setWarnings([])
    setImportError('')

    try {
      const content = await file.text()
      const data = parseCSV(content)
      setImportedData(data)

      // Validate
      const validation = await validateBeforeImport(data)
      if (validation.isValid) {
        setWarnings(validation.warnings)
        setStage('preview')
      } else {
        setValidationErrors(validation.errors)
        setWarnings(validation.warnings)
        setStage('error')
      }
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to parse CSV')
      setStage('error')
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files[0]
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      handleFileSelect(file)
    } else {
      setImportError('Please upload a CSV file')
      setStage('error')
    }
  }

  const handleImportConfirm = async () => {
    if (!importedData) return

    setStage('importing')
    setIsLoading(true)

    try {
      const result = await importTournament(importedData)
      setSuccessMessage(result.summary)
      setStage('success')
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed')
      setStage('error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setStage('upload')
    setCsvFile(null)
    setImportedData(null)
    setValidationErrors([])
    setWarnings([])
    setImportError('')
    setSuccessMessage('')
  }

  // Upload Stage
  if (stage === 'upload' || stage === 'validating') {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Upload CSV File</h2>
          <p className="text-sm text-gray-600 mt-1">Select a CSV file with tournament data to import</p>
        </div>
        <div className="p-6">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition"
          >
            <Upload className="mx-auto mb-2 text-gray-400" size={32} />
            <p className="text-sm text-gray-600 mb-2">Drag and drop your CSV file here, or click to select</p>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileSelect(file)
              }}
              className="hidden"
              id="csv-input"
            />
            <label htmlFor="csv-input">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer font-medium">
                Choose File
              </button>
            </label>
          </div>

          {stage === 'validating' && (
            <div className="mt-4 p-4 bg-blue-50 rounded flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
              <p className="text-blue-700">Parsing and validating CSV...</p>
            </div>
          )}

          {csvFile && stage === 'validating' && (
            <div className="mt-4 text-sm text-gray-600">
              File: <span className="font-mono">{csvFile.name}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Success Stage
  if (stage === 'success') {
    return (
      <div className="bg-green-50 rounded-lg shadow border border-green-200">
        <div className="px-6 py-4 border-b border-green-200">
          <h2 className="text-lg font-bold text-green-900 flex items-center gap-2">
            <CheckCircle className="text-green-600" size={24} />
            Import Successful
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-green-800 font-medium">{successMessage}</p>
          <p className="text-gray-700">The tournament has been imported and is now available in your tournament list.</p>
          <button
            onClick={handleReset}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            Import Another Tournament
          </button>
        </div>
      </div>
    )
  }

  // Error Stage
  if (stage === 'error') {
    return (
      <div className="bg-red-50 rounded-lg shadow border border-red-200">
        <div className="px-6 py-4 border-b border-red-200">
          <h2 className="text-lg font-bold text-red-900 flex items-center gap-2">
            <AlertCircle className="text-red-600" size={24} />
            Import Failed
          </h2>
        </div>
        <div className="p-6 space-y-4">
          {importError && <p className="text-red-800 font-medium">{importError}</p>}

          {validationErrors.length > 0 && (
            <div className="bg-white p-4 rounded border border-red-200">
              <p className="font-semibold text-red-900 mb-2">Errors found ({validationErrors.length}):</p>
              <ul className="space-y-1">
                {validationErrors.slice(0, 10).map((err, idx) => (
                  <li key={idx} className="text-sm text-red-700">
                    <span className="font-mono text-xs bg-red-100 px-2 py-1 rounded mr-2">{err.section}</span>
                    {err.row && <span className="text-xs text-gray-600">Row {err.row}: </span>}
                    {err.message}
                  </li>
                ))}
              </ul>
              {validationErrors.length > 10 && (
                <p className="text-sm text-red-600 mt-2">...and {validationErrors.length - 10} more errors</p>
              )}
            </div>
          )}

          {warnings.length > 0 && (
            <div className="bg-white p-4 rounded border border-yellow-200">
              <p className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                <AlertTriangle size={16} />
                Warnings ({warnings.length})
              </p>
              <ul className="space-y-1">
                {warnings.map((w, idx) => (
                  <li key={idx} className="text-sm text-yellow-700">
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Try Another File
            </button>
          </div>

          <div className="p-3 bg-blue-50 rounded text-sm text-blue-800">
            <p className="font-semibold mb-1">Need help?</p>
            <p>Check the CSV format guide for correct column names and data types.</p>
          </div>
        </div>
      </div>
    )
  }

  // Preview Stage
  return (
    <>
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Review Import</h2>
          <p className="text-sm text-gray-600 mt-1">Review the tournament data before importing</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm font-medium text-gray-700 mb-2">Tournament</p>
            <div className="space-y-1">
              <p className="text-lg font-semibold">
                {importedData?.tournament.name} ({importedData?.tournament.year})
              </p>
              <p className="text-sm text-gray-600">{importedData?.tournament.location}</p>
              <p className="text-xs text-gray-500">
                {importedData?.tournament.startDate instanceof Date
                  ? importedData?.tournament.startDate.toLocaleDateString()
                  : new Date(importedData?.tournament.startDate ?? '').toLocaleDateString()}{' '}
                →{' '}
                {importedData?.tournament.endDate instanceof Date
                  ? importedData?.tournament.endDate.toLocaleDateString()
                  : new Date(importedData?.tournament.endDate ?? '').toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-2xl font-bold text-blue-900">{importedData?.teams.length}</p>
              <p className="text-sm text-blue-700">Teams</p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <p className="text-2xl font-bold text-green-900">{importedData?.weighIns.length}</p>
              <p className="text-sm text-green-700">Weigh-Ins</p>
            </div>
          </div>

          {warnings.length > 0 && (
            <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
              <p className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                <AlertTriangle size={16} />
                Warnings
              </p>
              <ul className="space-y-1">
                {warnings.map((w, idx) => (
                  <li key={idx} className="text-sm text-yellow-700">
                    • {w}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <button
          onClick={handleReset}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleImportConfirm}
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium"
        >
          {isLoading ? 'Importing...' : 'Confirm & Import'}
        </button>
      </div>
    </>
  )
}
