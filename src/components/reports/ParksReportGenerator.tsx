/**
 * Parks & Wildlife Management Report Generator
 * Generates and exports fisheries data for game/parks agencies
 */

import { useMemo } from 'react'
import { useTournamentStore } from '@modules/tournaments/tournament-store'
import { useTeamStore } from '@modules/teams/team-store'
import { useWeighInStore } from '@modules/weigh-ins/weigh-in-store'
import { useTournamentStats } from '@modules/stats'
import {
  generateParksReport,
  exportParksReportCSV,
  generateParksReportFilename
} from '@modules/reports/parks-report-service'
import { shareUrl } from '@lib/share'
import { formatWeight, formatPercent } from '@utils/formatting'
import { Download, Share2, AlertCircle, FileText } from 'lucide-react'

export default function ParksReportGenerator() {
  const currentTournament = useTournamentStore((s) => s.currentTournament)
  const teams = useTeamStore((s) => s.teams)
  const weighIns = useWeighInStore((s) => s.weighIns)
  const { coreStats } = useTournamentStats()

  const report = useMemo(() => {
    if (!currentTournament || teams.length === 0 || weighIns.length === 0) {
      return null
    }
    return generateParksReport(currentTournament, teams, weighIns, coreStats)
  }, [currentTournament, teams, weighIns, coreStats])

  const handleExportCSV = () => {
    if (!report) return

    const csv = exportParksReportCSV(report)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', generateParksReportFilename(report))
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleShare = async () => {
    if (!report) return
    await shareUrl(report.eventName, window.location.href)
  }

  if (!currentTournament) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200 text-center">
        <AlertCircle size={32} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">No tournament selected</p>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex items-start gap-4">
          <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-1" />
          <div>
            <p className="font-semibold text-gray-900">No Data Available</p>
            <p className="text-sm text-gray-600 mt-1">
              Tournament needs teams and weigh-in data to generate report
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Export and Share Buttons */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          <Download size={18} />
          Export as CSV
        </button>

        {report && 'share' in navigator && (
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
          >
            <Share2 size={18} />
            Share Report
          </button>
        )}

        <p className="text-sm text-gray-600 flex items-center">
          CSV format for game agencies
        </p>
      </div>

      {/* Report Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Information */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={20} />
            Event Information
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Event Name:</span>
              <span className="font-semibold text-gray-900">{report.eventName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Location:</span>
              <span className="font-semibold text-gray-900">{report.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Year:</span>
              <span className="font-semibold text-gray-900">{report.year}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-semibold text-gray-900">
                {new Date(report.startDate).toLocaleDateString()} - {new Date(report.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Participation */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Participation</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Registered Teams:</span>
              <span className="font-semibold text-gray-900">{report.registeredTeams}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fishing Day 1:</span>
              <span className="font-semibold text-gray-900">{report.teamsFishingDay1}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fishing Day 2:</span>
              <span className="font-semibold text-gray-900">{report.teamsFishingDay2}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-gray-600">Did Not Finish:</span>
              <span className="font-semibold text-red-600">
                {report.dNFTeams} ({formatPercent(report.dNFRate)})
              </span>
            </div>
          </div>
        </div>

        {/* Harvest Data */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Harvest Data</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Fish Caught:</span>
              <span className="font-semibold text-gray-900">{report.totalFishCaught}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fish Released:</span>
              <span className="font-semibold text-green-600">{report.totalFishReleased}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fish Kept:</span>
              <span className="font-semibold text-gray-900">{report.fishKept}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-gray-600">Release Rate:</span>
              <span className="font-semibold text-green-700">{formatPercent(report.releaseRate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Catch Per Team:</span>
              <span className="font-semibold text-gray-900">
                {report.catchPerTeam.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Weight Data */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Weight Data (lbs)</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Day 1 Total:</span>
              <span className="font-semibold text-gray-900">
                {report.totalWeightDay1.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Day 2 Total:</span>
              <span className="font-semibold text-gray-900">
                {report.totalWeightDay2.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Combined Total:</span>
              <span className="font-semibold text-blue-600">
                {report.totalWeightCombined.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-gray-600">Average Fish Weight:</span>
              <span className="font-semibold text-gray-900">
                {report.avgFishWeight.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Median Fish Weight:</span>
              <span className="font-semibold text-gray-900">
                {report.medianFishWeight.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Weight Std Deviation:</span>
              <span className="font-semibold text-gray-900">
                {report.weightStdDev.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Big Fish */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Big Fish Records</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Largest Fish:</span>
              <span className="font-semibold text-amber-600">
                {report.largestFish
                  ? `${report.largestFish.weight.toFixed(2)} lbs (Team #${report.largestFish.teamNumber})`
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Day 1 Record:</span>
              <span className="font-semibold text-gray-900">
                {report.stats.bigFishDay1 ? formatWeight(report.stats.bigFishDay1) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Day 2 Record:</span>
              <span className="font-semibold text-gray-900">
                {report.stats.bigFishDay2 ? formatWeight(report.stats.bigFishDay2) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-gray-600">Avg Big Fish:</span>
              <span className="font-semibold text-gray-900">
                {formatWeight(report.stats.avgBigFish)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes for Agencies */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-900">
          <strong>📋 For Game/Parks Agency:</strong> This report summarizes tournament fisheries data in standard format. Include with any required filings or habitat impact assessments. All statistics are calculated from tournament weigh-in data.
        </p>
      </div>
    </div>
  )
}
