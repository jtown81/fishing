/**
 * Import/Export Manager
 * Two-tab interface for importing tournament data from CSV and exporting to CSV
 */

import { useState } from 'react'
import { Download, Upload } from 'lucide-react'
import { ImportTab } from './ImportTab'
import { ExportTab } from './ExportTab'

export function ImportExportManager() {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import')

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Import / Export</h1>
          <p className="text-gray-600">Import tournament data from CSV files or export existing tournaments</p>
        </div>

        {/* Tab buttons */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'import'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Upload size={18} />
            Import Tournament
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'export'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Download size={18} />
            Export Tournament
          </button>
        </div>

        {/* Tab content */}
        {activeTab === 'import' && <ImportTab />}
        {activeTab === 'export' && <ExportTab />}
      </div>
    </div>
  )
}
