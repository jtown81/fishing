/**
 * Print Manager
 * UI for selecting and printing tournament reports
 */

import { useState, useRef } from 'react'
import type { WeighIn } from '@models/tournament'
import { useTournamentStore } from '@modules/tournaments/tournament-store'
import { useWeighInStore } from '@modules/weigh-ins/weigh-in-store'
import { useStandings } from '@hooks/useStandings'
import { useTournamentStats } from '@modules/stats'
import StandingsPrint from './StandingsPrint'
import WeightTicket from './WeightTicket'
import { printContent, getPrintDate } from '@utils/print'
import { shareUrl } from '@lib/share'
import { Printer, Share2, CheckCircle, AlertCircle } from 'lucide-react'

export default function PrintManager() {
  const currentTournament = useTournamentStore((s) => s.currentTournament)
  const weighIns = useWeighInStore((s) => s.weighIns)
  const standings = useStandings()
  const { coreStats } = useTournamentStats()

  const [printType, setPrintType] = useState<'standings' | 'tickets' | 'stats'>('standings')
  const [ticketDay, setTicketDay] = useState<1 | 2>(1)
  const printRef = useRef<HTMLDivElement>(null)

  const handleShare = async () => {
    if (!currentTournament) return
    const title = `${currentTournament.name} ${currentTournament.year}`
    await shareUrl(title, `${window.location.origin}?spectator=${currentTournament.publicSlug || ''}`)
  }

  if (!currentTournament) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <p className="text-gray-500 text-center">No tournament selected</p>
      </div>
    )
  }

  if (standings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200 flex items-start gap-4">
        <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-1" />
        <div>
          <p className="font-semibold text-gray-900">No Data Available</p>
          <p className="text-sm text-gray-600 mt-1">
            Tournament needs weigh-in data to print reports
          </p>
        </div>
      </div>
    )
  }

  const handlePrint = () => {
    if (!printRef.current) return

    const title =
      printType === 'standings'
        ? `${currentTournament.name} ${currentTournament.year} - Standings`
        : printType === 'tickets'
          ? `${currentTournament.name} - Day ${ticketDay} Tickets`
          : `${currentTournament.name} ${currentTournament.year} - Statistics`

    printContent(printRef.current, title)
  }

  const printOptions = [
    {
      id: 'standings',
      label: 'Standings Report',
      description: 'Full tournament rankings and grand totals'
    },
    {
      id: 'tickets',
      label: 'Weight Tickets',
      description: 'Weigh-in tickets for selected day (2 per page)'
    },
    {
      id: 'stats',
      label: 'Statistics Report',
      description: 'Tournament statistics and big fish records'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Print Type Selection */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Select What to Print</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {printOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setPrintType(option.id as any)}
              className={`p-4 rounded-lg border-2 transition text-left ${
                printType === option.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <p className="font-semibold text-gray-900">{option.label}</p>
              <p className="text-sm text-gray-600 mt-1">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Day Selection (for tickets) */}
      {printType === 'tickets' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Select Day
          </label>
          <div className="flex gap-3">
            {[1, 2].map((day) => (
              <button
                key={day}
                onClick={() => setTicketDay(day as 1 | 2)}
                className={`py-2 px-4 rounded font-semibold transition ${
                  ticketDay === day
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-100'
                }`}
              >
                Day {day}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Print Preview Container (hidden) */}
      <div ref={printRef} style={{ display: 'none' }} className="print-container">
        {printType === 'standings' && (
          <StandingsPrint
            standings={standings}
            tournamentName={currentTournament.name}
            year={currentTournament.year}
            location={currentTournament.location}
            printDate={getPrintDate()}
          />
        )}

        {printType === 'tickets' && (
          <div className="bg-white p-4 min-h-screen">
            {weighIns
              .filter((w) => w.day === ticketDay)
              .reduce<WeighIn[][]>((pages, weighIn, idx) => {
                if (idx % 2 === 0) pages.push([])
                pages[pages.length - 1].push(weighIn)
                return pages
              }, [])
              .map((pair, idx) => (
                <WeightTicket
                  key={idx}
                  weighIn1={pair[0]}
                  weighIn2={pair[1]}
                  standings={new Map(standings.map((s) => [s.teamId, s.rank]))}
                  teamMap={new Map()} // Would need to pass team members here
                  tournamentName={currentTournament.name}
                />
              ))}
          </div>
        )}

        {printType === 'stats' && (
          <div className="p-8">
            <div className="text-center mb-8 border-b-2 border-black pb-4">
              <h1 className="text-3xl font-bold">{currentTournament.name}</h1>
              <p className="text-lg">{currentTournament.year} Tournament Statistics</p>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {[
                ['Average Day 1 Weight', coreStats.avgDay1Weight.toFixed(2) + ' lbs'],
                ['Average Day 2 Weight', coreStats.avgDay2Weight.toFixed(2) + ' lbs'],
                ['Big Fish Day 1', coreStats.bigFishDay1 ? coreStats.bigFishDay1.toFixed(2) + ' lbs' : 'N/A'],
                ['Big Fish Day 2', coreStats.bigFishDay2 ? coreStats.bigFishDay2.toFixed(2) + ' lbs' : 'N/A'],
                ['Total Fish Caught', coreStats.totalFishCaught.toString()],
                ['Total Fish Released', coreStats.totalFishReleased.toString()],
                ['Day 1 Std Dev', coreStats.day1StdDev.toFixed(2)],
                ['Day 2 Std Dev', coreStats.day2StdDev.toFixed(2)]
              ].map(([label, value]) => (
                <div key={label} className="border-b border-gray-300 pb-2">
                  <p className="font-semibold text-gray-900">{label}</p>
                  <p className="text-lg text-gray-700">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Print and Share Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handlePrint}
          className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition text-lg"
        >
          <Printer size={20} />
          Print {printType === 'standings' ? 'Standings' : printType === 'tickets' ? `Day ${ticketDay} Tickets` : 'Statistics'}
        </button>

        {currentTournament?.publicSlug && 'share' in navigator && (
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition text-lg"
          >
            <Share2 size={20} />
            Share Live Link
          </button>
        )}
      </div>

      {/* Tips */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex gap-3">
          <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-900">
            <p className="font-semibold mb-1">💡 Printing Tips:</p>
            <ul className="space-y-1 text-xs">
              <li>• Use landscape orientation for better formatting</li>
              <li>• Disable headers/footers in print dialog for cleaner output</li>
              <li>• For weight tickets: print single-sided, 2 per page</li>
              <li>• Adjust page margins if needed for optimal layout</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
