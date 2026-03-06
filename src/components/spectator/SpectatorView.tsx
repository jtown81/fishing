/**
 * Spectator view — public read-only live standings fetched by public slug.
 * No authentication required. Realtime updates via Supabase.
 */
import { useState, useEffect, useCallback } from 'react'
import { Fish, Wifi, WifiOff, Trophy } from 'lucide-react'
import { fetchBySlug, subscribeToWeighIns } from '@modules/sync'
import type { SpectatorData } from '@modules/sync/spectator-service'
import type { WeighIn } from '@models/tournament'
import { formatWeight } from '@utils/formatting'
import { computeStandings } from '@utils/calculations'

interface SpectatorViewProps {
  slug: string
}

export default function SpectatorView({ slug }: SpectatorViewProps) {
  const [data, setData] = useState<SpectatorData | null>(null)
  const [weighIns, setWeighIns] = useState<WeighIn[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleWeighIn = useCallback((w: WeighIn) => {
    setWeighIns((prev) => {
      const exists = prev.some((x) => x.id === w.id)
      return exists ? prev.map((x) => x.id === w.id ? w : x) : [...prev, w]
    })
  }, [])

  useEffect(() => {
    let unsub: (() => void) | null = null

    const load = async () => {
      setIsLoading(true)
      setError(null)
      const result = await fetchBySlug(slug)
      if (!result) {
        setError('Tournament not found. The link may be invalid or expired.')
        setIsLoading(false)
        return
      }

      setData(result)
      setWeighIns(result.weighIns)
      setIsLoading(false)

      // Subscribe to realtime updates
      unsub = subscribeToWeighIns(result.tournament.id, (w) => {
        handleWeighIn(w)
        setIsConnected(true)
      })
      setIsConnected(true)
    }

    load()

    return () => {
      unsub?.()
    }
  }, [slug, handleWeighIn])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg animate-pulse">Loading standings...</div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Fish size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-red-400 text-lg">{error ?? 'Not found'}</p>
        </div>
      </div>
    )
  }

  const standings = computeStandings(data.teams, weighIns)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Fish size={28} className="text-blue-400" />
          <div>
            <h1 className="text-xl font-bold">{data.tournament.name}</h1>
            <p className="text-sm text-gray-400">{data.tournament.year} • {data.tournament.location}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {isConnected ? (
            <>
              <Wifi size={16} className="text-green-400" />
              <span className="text-green-400">Live</span>
            </>
          ) : (
            <>
              <WifiOff size={16} className="text-yellow-400" />
              <span className="text-yellow-400">Connecting...</span>
            </>
          )}
        </div>
      </div>

      {/* Standings table */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={20} className="text-yellow-400" />
          <h2 className="text-lg font-semibold">Live Standings</h2>
          <span className="ml-auto text-sm text-gray-400">{standings.length} teams</span>
        </div>

        {standings.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Fish size={40} className="mx-auto mb-3 text-gray-700" />
            <p>No weigh-in data yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {standings.map((s) => (
              <div
                key={s.teamId}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl ${
                  s.rank === 1
                    ? 'bg-yellow-900/40 border border-yellow-700/40'
                    : s.rank === 2
                    ? 'bg-gray-700/50 border border-gray-600/30'
                    : s.rank === 3
                    ? 'bg-amber-900/30 border border-amber-700/30'
                    : 'bg-gray-800 border border-gray-700/30'
                }`}
              >
                {/* Rank */}
                <div className="w-8 text-center">
                  {s.rank <= 3 ? (
                    <span className="text-lg">
                      {s.rank === 1 ? '🥇' : s.rank === 2 ? '🥈' : '🥉'}
                    </span>
                  ) : (
                    <span className="text-gray-400 font-mono text-sm">#{s.rank}</span>
                  )}
                </div>

                {/* Team info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">
                    Team {s.teamNumber}
                    {s.rankChange !== undefined && s.rankChange !== 0 && (
                      <span className={`ml-2 text-xs ${s.rankChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {s.rankChange > 0 ? `▲${s.rankChange}` : `▼${Math.abs(s.rankChange)}`}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {s.members.map(m => `${m.firstName} ${m.lastName}`).join(' & ')}
                  </p>
                </div>

                {/* Weights */}
                <div className="text-right text-sm shrink-0">
                  <p className="font-bold text-white">{formatWeight(s.grandTotal)}</p>
                  <p className="text-xs text-gray-400">
                    D1: {formatWeight(s.day1Total)} · D2: {formatWeight(s.day2Total)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center pb-8 text-xs text-gray-600">
        Fishing Tournament Manager • Spectator View
      </div>
    </div>
  )
}
