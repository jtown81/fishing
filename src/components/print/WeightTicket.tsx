/**
 * Weight Ticket Component
 * Prints 2 tickets per page (matching XLSM layout)
 * Shows team info, weights, and signature lines
 */

import { formatWeight, formatDate } from '@utils/formatting'
import type { WeighIn } from '@models/tournament'

interface WeightTicketProps {
  weighIn: WeighIn
  standing?: number
  teamMembers?: string
  tournamentName?: string
  logoUrl?: string
}

export function WeightTicket({
  weighIn,
  standing,
  teamMembers,
  tournamentName,
  logoUrl
}: WeightTicketProps) {
  const dayLabel = weighIn.day === 1 ? 'Day 1' : 'Day 2'
  const dayTotal = weighIn.rawWeight + weighIn.fishReleased * 0.2

  return (
    <div className="w-full h-96 border border-gray-400 p-4 flex flex-col bg-white text-black">
      {/* Header */}
      <div className="text-center border-b border-gray-400 pb-2 mb-2">
        {logoUrl && (
          <img src={logoUrl} alt="Logo" className="h-12 mx-auto mb-1" />
        )}
        <h1 className="font-bold text-lg">{tournamentName || 'Tournament'}</h1>
        <p className="text-xs font-semibold">WEIGHT TICKET</p>
      </div>

      {/* Top Section */}
      <div className="flex justify-between mb-2 text-sm">
        <div>
          <p className="font-bold">Team #{weighIn.teamNumber}</p>
          <p className="text-xs">{teamMembers}</p>
        </div>
        <div className="text-right">
          <p className="text-xs">
            <span className="font-bold">Date:</span> {formatDate(new Date(weighIn.timestamp))}
          </p>
          {standing && (
            <p className="text-xs">
              <span className="font-bold">Standing:</span> {standing}
            </p>
          )}
        </div>
      </div>

      {/* Grand Total Box */}
      <div className="bg-gray-200 border border-gray-400 px-2 py-1 mb-2 text-center">
        <p className="text-xs text-gray-600">GRAND TOTAL WEIGHT</p>
        <p className="text-2xl font-bold">{formatWeight(weighIn.rawWeight + weighIn.fishReleased * 0.2)}</p>
      </div>

      {/* Day Section */}
      <div className="flex-1 flex flex-col">
        <h3 className="font-bold text-sm text-center mb-1">{dayLabel}</h3>

        <div className="grid grid-cols-2 gap-1 text-xs flex-1">
          {/* Left Column */}
          <div className="border border-gray-300 p-1">
            <p className="font-bold">Fish Count: {weighIn.fishCount}</p>
            <p className="mt-1">Raw Weight: {formatWeight(weighIn.rawWeight)}</p>
            <p>Released: {weighIn.fishReleased}</p>
          </div>

          {/* Right Column */}
          <div className="border border-gray-300 p-1">
            <p className="font-bold">Day Total: {formatWeight(dayTotal)}</p>
            <p className="mt-1">
              Big Fish:{' '}
              {weighIn.bigFishWeight ? formatWeight(weighIn.bigFishWeight) : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Signature Lines */}
      <div className="flex gap-4 text-xs mt-2 pt-2 border-t border-gray-400">
        <div className="flex-1">
          {weighIn.receivedBySignature ? (
            <div>
              <p className="text-xs font-semibold mb-1">Received By:</p>
              <img src={weighIn.receivedBySignature} alt="Signature" className="h-12" />
            </div>
          ) : (
            <p className="border-t border-gray-400 pt-1">Received By: ___________</p>
          )}
        </div>
        <div className="flex-1">
          <p className="border-t border-gray-400 pt-1">Issued By: ___________</p>
        </div>
      </div>
    </div>
  )
}

/**
 * Two tickets per page layout
 */
export default function WeightTicketPage({
  weighIn1,
  weighIn2,
  standings,
  teamMap,
  tournamentName,
  logoUrl
}: {
  weighIn1: WeighIn
  weighIn2?: WeighIn
  standings: Map<string, number>
  teamMap: Map<string, string>
  tournamentName: string
  logoUrl?: string
}) {
  return (
    <div className="bg-white p-4 min-h-screen flex flex-col gap-4">
      <WeightTicket
        weighIn={weighIn1}
        standing={standings.get(weighIn1.teamId)}
        teamMembers={teamMap.get(weighIn1.teamId)}
        tournamentName={tournamentName}
        logoUrl={logoUrl}
      />

      {weighIn2 && (
        <WeightTicket
          weighIn={weighIn2}
          standing={standings.get(weighIn2.teamId)}
          teamMembers={teamMap.get(weighIn2.teamId)}
          tournamentName={tournamentName}
          logoUrl={logoUrl}
        />
      )}
    </div>
  )
}
