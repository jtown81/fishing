/**
 * Live Scoreboard Display
 * Full-screen projector-optimized view for tournament site
 *
 * Features:
 * - Large, readable fonts and high contrast
 * - Top 10 standings with live rank changes
 * - Big Fish leader display
 * - Total catch/release counters
 * - Auto-refresh capability
 * - Dark theme for outdoor visibility
 */

import { useEffect, useState, useCallback } from 'react'
import { useStandings } from '@hooks/useStandings'
import { useTournamentStats } from '@modules/stats'
import { useTournamentStore } from '@modules/tournaments/tournament-store'
import { formatWeight, formatNumber } from '@utils/formatting'
import {
  Trophy,
  Fish,
  TrendingUp,
  TrendingDown,
  Pause,
  Play,
  RotateCcw
} from 'lucide-react'

interface ScoreboardState {
  autoRefresh: boolean
  refreshInterval: number
  displayType: 'standings' | 'stats'
}

export default function ScoreboardDisplay() {
  const currentTournament = useTournamentStore((s) => s.currentTournament)
  const standings = useStandings()
  const { coreStats } = useTournamentStats()

  const [state, setState] = useState<ScoreboardState>({
    autoRefresh: true,
    refreshInterval: 30,
    displayType: 'standings'
  })

  const [refreshCount, setRefreshCount] = useState(0)

  // Auto-refresh effect
  useEffect(() => {
    if (!state.autoRefresh) return

    const interval = setInterval(() => {
      setRefreshCount(c => c + 1)
    }, state.refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [state.autoRefresh, state.refreshInterval])

  // Handle fullscreen
  const toggleFullscreen = useCallback(() => {
    const elem = document.documentElement
    if (!document.fullscreenElement) {
      elem.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }, [])

  if (!currentTournament) {
    return (
      <div className="w-full h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold">No Tournament Selected</p>
          <p className="text-gray-400 mt-2">Please select a tournament to display</p>
        </div>
      </div>
    )
  }

  const top10 = standings.slice(0, 10)

  return (
    <div className="w-full h-screen bg-slate-950 text-white flex flex-col overflow-hidden">
      {/* Controls Bar */}
      <div className="bg-slate-900 px-6 py-3 flex items-center justify-between border-b border-slate-700">
        <div>
          <h1 className="text-xl font-bold">{currentTournament.name}</h1>
          <p className="text-sm text-gray-400">Live Scoreboard</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-2 bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setState(s => ({ ...s, displayType: 'standings' }))}
              className={`px-4 py-2 rounded font-semibold text-sm transition ${
                state.displayType === 'standings'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Standings
            </button>
            <button
              onClick={() => setState(s => ({ ...s, displayType: 'stats' }))}
              className={`px-4 py-2 rounded font-semibold text-sm transition ${
                state.displayType === 'stats'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Stats
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setState(s => ({ ...s, autoRefresh: !s.autoRefresh }))}
              title={state.autoRefresh ? 'Pause auto-refresh' : 'Resume auto-refresh'}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded transition"
            >
              {state.autoRefresh ? <Pause size={20} /> : <Play size={20} />}
            </button>

            <button
              onClick={toggleFullscreen}
              title="Fullscreen"
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded transition"
            >
              ⛶
            </button>

            <button
              onClick={() => setRefreshCount(c => c + 1)}
              title="Refresh now"
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded transition"
            >
              <RotateCcw size={20} />
            </button>
          </div>

          <div className="text-xs text-gray-500">
            Auto-refresh: {state.autoRefresh ? `${state.refreshInterval}s` : 'OFF'}
            {refreshCount > 0 && ` (${refreshCount})`}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {state.displayType === 'standings' ? (
          <StandingsView standings={top10} />
        ) : (
          <StatsView stats={coreStats} currentTournament={currentTournament} />
        )}
      </div>
    </div>
  )
}

/**
 * Standings view - Top 10 teams
 */
function StandingsView({ standings }: { standings: any[] }) {
  if (standings.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 text-2xl">
        No weigh-in data yet
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-8 py-4 flex items-center gap-4">
        <Trophy size={40} className="text-amber-400" />
        <div>
          <h2 className="text-4xl font-bold">Current Standings</h2>
          <p className="text-blue-200">{standings.length} teams competing</p>
        </div>
      </div>

      {/* Standings Table */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-3">
        {standings.map((team: any, idx: number) => (
          <div
            key={team.teamId}
            className={`flex items-center justify-between p-5 rounded-lg border-2 transition ${
              idx === 0
                ? 'bg-amber-900 border-amber-400 shadow-lg'
                : idx === 1
                  ? 'bg-slate-800 border-gray-400'
                  : idx === 2
                    ? 'bg-orange-900 border-orange-400'
                    : 'bg-slate-800 border-slate-700'
            }`}
          >
            {/* Rank and Team */}
            <div className="flex items-center gap-6 flex-1">
              <div className={`flex items-center justify-center w-16 h-16 rounded-full font-bold text-xl ${
                idx === 0
                  ? 'bg-amber-400 text-slate-900'
                  : idx === 1
                    ? 'bg-gray-400 text-slate-900'
                    : idx === 2
                      ? 'bg-orange-400 text-slate-900'
                      : 'bg-slate-700 text-white'
              }`}>
                #{idx + 1}
              </div>

              <div>
                <p className="text-2xl font-bold">Team #{team.teamNumber}</p>
                <p className="text-sm text-gray-300">
                  {team.members.map((m: any) => `${m.firstName} ${m.lastName}`).join(' & ')}
                </p>
              </div>
            </div>

            {/* Rank Change */}
            {team.rankChange !== undefined && team.rankChange !== 0 && (
              <div className="flex items-center gap-2 mr-6">
                {team.rankChange > 0 ? (
                  <>
                    <TrendingUp size={24} className="text-green-400" />
                    <span className="text-lg font-bold text-green-400">↑{team.rankChange}</span>
                  </>
                ) : (
                  <>
                    <TrendingDown size={24} className="text-red-400" />
                    <span className="text-lg font-bold text-red-400">↓{Math.abs(team.rankChange)}</span>
                  </>
                )}
              </div>
            )}

            {/* Weight */}
            <div className="text-right min-w-40">
              <p className="text-4xl font-bold text-white">{formatWeight(team.grandTotal)}</p>
              <p className="text-sm text-gray-400">
                Day 1: {formatWeight(team.day1Total)} | Day 2: {formatWeight(team.day2Total)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Stats view - Tournament statistics
 */
function StatsView({ stats, currentTournament }: any) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-900 to-green-800 px-8 py-4 flex items-center gap-4">
        <Fish size={40} className="text-green-400" />
        <div>
          <h2 className="text-4xl font-bold">Tournament Statistics</h2>
          <p className="text-green-200">{currentTournament.year} Tournament</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="flex-1 p-8 grid grid-cols-3 gap-6 overflow-hidden">
        {/* Total Fish */}
        <StatCard
          icon={<Fish size={48} />}
          label="Total Fish Caught"
          value={formatNumber(stats.totalFishCaught)}
          color="bg-blue-900"
        />

        {/* Total Released */}
        <StatCard
          icon={<TrendingUp size={48} />}
          label="Fish Released"
          value={formatNumber(stats.totalFishReleased)}
          color="bg-green-900"
        />

        {/* Avg Weight Day 1 */}
        <StatCard
          icon={<Trophy size={48} />}
          label="Avg Day 1 Weight"
          value={formatWeight(stats.avgDay1Weight)}
          color="bg-purple-900"
        />

        {/* Avg Weight Day 2 */}
        <StatCard
          icon={<Trophy size={48} />}
          label="Avg Day 2 Weight"
          value={formatWeight(stats.avgDay2Weight)}
          color="bg-indigo-900"
        />

        {/* Big Fish Day 1 */}
        <StatCard
          icon={<Trophy size={48} />}
          label="Big Fish Day 1"
          value={stats.bigFishDay1 ? formatWeight(stats.bigFishDay1) : '—'}
          color="bg-amber-900"
        />

        {/* Big Fish Day 2 */}
        <StatCard
          icon={<Trophy size={48} />}
          label="Big Fish Day 2"
          value={stats.bigFishDay2 ? formatWeight(stats.bigFishDay2) : '—'}
          color="bg-orange-900"
        />
      </div>
    </div>
  )
}

/**
 * Individual stat card
 */
function StatCard({
  icon,
  label,
  value,
  color
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}) {
  return (
    <div
      className={`${color} rounded-lg p-6 flex flex-col items-center justify-center text-center border-2 border-opacity-50`}
    >
      <div className="text-slate-300 mb-4">{icon}</div>
      <p className="text-xl text-slate-200 mb-3">{label}</p>
      <p className="text-5xl font-bold text-white">{value}</p>
    </div>
  )
}
