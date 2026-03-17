/**
 * Weight Ticket Component
 * Prints 2 tickets per page (matching XLSM layout)
 * Shows team info, weights, and signature lines
 * Theme-aware with species branding
 */

import { formatWeight, formatDate } from '@utils/formatting'
import type { WeighIn } from '@models/tournament'
import { useThemeStore } from '@store/theme-store'

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
  const { currentTheme } = useThemeStore()
  const dayLabel = weighIn.day === 1 ? 'Day 1' : 'Day 2'
  const dayTotal = weighIn.rawWeight + weighIn.fishReleased * 0.2

  return (
    <div
      className="w-full h-96 border-2 p-4 flex flex-col bg-white text-black"
      style={{
        borderColor: currentTheme.colors.primary,
      }}
    >
      {/* Header */}
      <div
        className="text-center border-b-2 pb-2 mb-2"
        style={{
          borderColor: currentTheme.colors.primary,
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-2xl">{currentTheme.icons.speciesEmoji}</span>
          <div>
            {logoUrl && (
              <img src={logoUrl} alt="Logo" className="h-10" />
            )}
          </div>
        </div>
        <h1 className="font-bold text-lg" style={{ color: currentTheme.colors.primary }}>
          {tournamentName || 'Tournament'}
        </h1>
        <p className="text-xs font-semibold" style={{ color: currentTheme.colors.secondary }}>
          {currentTheme.tagline} — WEIGHT TICKET
        </p>
      </div>

      {/* Top Section */}
      <div className="flex justify-between mb-2 text-sm">
        <div>
          <p className="font-bold" style={{ color: currentTheme.colors.primary }}>
            Team #{weighIn.teamNumber}
          </p>
          <p className="text-xs">{teamMembers}</p>
        </div>
        <div className="text-right">
          <p className="text-xs">
            <span className="font-bold">Date:</span> {formatDate(new Date(weighIn.timestamp))}
          </p>
          {standing && (
            <p className="text-xs">
              <span className="font-bold" style={{ color: currentTheme.colors.primary }}>
                Standing:
              </span>{' '}
              {standing}
            </p>
          )}
        </div>
      </div>

      {/* Grand Total Box */}
      <div
        className="border-2 px-2 py-1 mb-2 text-center"
        style={{
          backgroundColor: currentTheme.colors.background,
          borderColor: currentTheme.colors.accent,
        }}
      >
        <p className="text-xs" style={{ color: currentTheme.colors.text, opacity: 0.7 }}>
          GRAND TOTAL WEIGHT
        </p>
        <p className="text-2xl font-bold" style={{ color: currentTheme.colors.primary }}>
          {formatWeight(weighIn.rawWeight + weighIn.fishReleased * 0.2)}
        </p>
      </div>

      {/* Day Section */}
      <div className="flex-1 flex flex-col">
        <h3 className="font-bold text-sm text-center mb-1" style={{ color: currentTheme.colors.primary }}>
          {dayLabel}
        </h3>

        <div className="grid grid-cols-2 gap-1 text-xs flex-1">
          {/* Left Column */}
          <div
            className="border-2 p-1"
            style={{
              borderColor: currentTheme.colors.border,
            }}
          >
            <p className="font-bold" style={{ color: currentTheme.colors.primary }}>
              Fish Count: {weighIn.fishCount}
            </p>
            <p className="mt-1">Raw Weight: {formatWeight(weighIn.rawWeight)}</p>
            <p>Released: {weighIn.fishReleased}</p>
          </div>

          {/* Right Column */}
          <div
            className="border-2 p-1"
            style={{
              borderColor: currentTheme.colors.border,
            }}
          >
            <p className="font-bold" style={{ color: currentTheme.colors.primary }}>
              Day Total: {formatWeight(dayTotal)}
            </p>
            <p className="mt-1">
              Big Fish:{' '}
              {weighIn.bigFishWeight ? formatWeight(weighIn.bigFishWeight) : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Signature Lines */}
      <div
        className="flex gap-4 text-xs mt-2 pt-2 border-t-2"
        style={{
          borderColor: currentTheme.colors.primary,
        }}
      >
        <div className="flex-1">
          {weighIn.receivedBySignature ? (
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: currentTheme.colors.primary }}>
                Received By:
              </p>
              <img src={weighIn.receivedBySignature} alt="Signature" className="h-12" />
            </div>
          ) : (
            <p
              className="border-t-2 pt-1"
              style={{
                borderColor: currentTheme.colors.primary,
              }}
            >
              Received By: ___________
            </p>
          )}
        </div>
        <div className="flex-1">
          <p
            className="border-t-2 pt-1"
            style={{
              borderColor: currentTheme.colors.primary,
            }}
          >
            Issued By: ___________
          </p>
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
  const { currentTheme } = useThemeStore()

  return (
    <div
      className="p-4 min-h-screen flex flex-col gap-4"
      style={{
        backgroundColor: 'white',
      }}
    >
      {/* Watermark header for print pages */}
      <div
        className="text-center mb-4 pb-4 border-b-2"
        style={{
          color: currentTheme.colors.primary,
          borderColor: currentTheme.colors.border,
        }}
      >
        <p className="text-sm font-semibold">{currentTheme.tagline} Tournament</p>
      </div>

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
