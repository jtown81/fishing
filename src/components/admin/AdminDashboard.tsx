/**
 * Admin Dashboard (Organization Tier Only)
 * Manage all tournaments, view cross-tournament statistics
 */

import { useEffect } from 'react'
import { useTournamentStore } from '@modules/tournaments/tournament-store'
import { useTeamStore } from '@modules/teams/team-store'
import { useWeighInStore } from '@modules/weigh-ins/weigh-in-store'
import { useSubscriptionStore } from '@modules/subscription'
import { AlertCircle, Trophy, Fish, Weight } from 'lucide-react'

export default function AdminDashboard() {
  const { tier: subscriptionTier, redirectToCheckout } = useSubscriptionStore()
  const tournaments = useTournamentStore((s) => s.tournaments)
  const currentTournament = useTournamentStore((s) => s.currentTournament)
  const setCurrentTournament = useTournamentStore((s) => s.setCurrentTournament)
  const teams = useTeamStore((s) => s.teams)
  const weighIns = useWeighInStore((s) => s.weighIns)

  // Load teams and weigh-ins for initial tournament
  useEffect(() => {
    if (tournaments.length > 0 && !currentTournament) {
      setCurrentTournament(tournaments[0])
    }
  }, [tournaments, currentTournament, setCurrentTournament])

  // Gate: Show upgrade prompt if not org tier
  if (subscriptionTier !== 'org') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <Trophy size={48} className="mx-auto text-blue-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
          <p className="text-gray-600 mb-6">
            Manage all your tournaments and view cross-tournament statistics with an Organization tier subscription.
          </p>
          <button
            onClick={() => redirectToCheckout('org')}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Upgrade to Organization Tier
          </button>
        </div>
      </div>
    )
  }

  // Compute cross-tournament stats
  const totalTournaments = tournaments.length

  // Find biggest fish across all tournaments
  let biggestFishEver: { weight: number; tournamentId: string; teamNumber: number } | null = null
  let maxWeight = 0
  for (const weighIn of weighIns) {
    if ((weighIn.bigFishWeight || 0) > maxWeight) {
      maxWeight = weighIn.bigFishWeight || 0
      biggestFishEver = {
        weight: maxWeight,
        tournamentId: weighIn.tournamentId,
        teamNumber: weighIn.teamNumber
      }
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Trophy size={32} className="text-blue-600" />
          Your Tournaments
          <span className="text-lg text-gray-600 ml-2">({totalTournaments})</span>
        </h1>
        <p className="text-gray-600 mt-2">Organization tier • Manage all tournaments and analytics</p>
      </div>

      {/* Aggregate Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <Trophy size={24} className="text-amber-600" />
            <div>
              <p className="text-xs text-gray-600">Total Tournaments</p>
              <p className="text-2xl font-bold text-gray-900">{totalTournaments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <Fish size={24} className="text-green-600" />
            <div>
              <p className="text-xs text-gray-600">Fish Caught</p>
              <p className="text-2xl font-bold text-gray-900">
                {tournaments.reduce((sum, t) => {
                  const tourWeighIns = weighIns.filter((w) => w.tournamentId === t.id)
                  return sum + tourWeighIns.reduce((s, w) => s + w.fishCount, 0)
                }, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <Fish size={24} className="text-blue-600" />
            <div>
              <p className="text-xs text-gray-600">Released</p>
              <p className="text-2xl font-bold text-gray-900">
                {tournaments.reduce((sum, t) => {
                  const tourWeighIns = weighIns.filter((w) => w.tournamentId === t.id)
                  return sum + tourWeighIns.reduce((s, w) => s + w.fishReleased, 0)
                }, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <Weight size={24} className="text-purple-600" />
            <div>
              <p className="text-xs text-gray-600">Biggest Fish</p>
              <p className="text-2xl font-bold text-gray-900">
                {biggestFishEver ? `${biggestFishEver.weight.toFixed(1)} lbs` : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tournaments Grid */}
      {tournaments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center border border-gray-200">
          <AlertCircle size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-600">No tournaments created yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => {
            const tourTeams = teams.filter((t) => t.tournamentId === tournament.id)
            const tourWeighIns = weighIns.filter((w) => w.tournamentId === tournament.id)
            const isActive = currentTournament?.id === tournament.id

            return (
              <div
                key={tournament.id}
                className={`rounded-lg shadow border-2 p-6 transition cursor-pointer hover:shadow-lg ${
                  isActive
                    ? 'bg-blue-50 border-blue-600'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{tournament.name}</h3>
                    <p className="text-sm text-gray-600">{tournament.year}</p>
                  </div>
                  {isActive && (
                    <span className="inline-block bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded">
                      Active
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Teams:</span>
                    <span className="font-semibold text-gray-900">{tourTeams.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weigh-Ins:</span>
                    <span className="font-semibold text-gray-900">{tourWeighIns.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-semibold text-gray-900">{tournament.location}</span>
                  </div>
                </div>

                {/* Open Button */}
                <button
                  onClick={() => setCurrentTournament(tournament)}
                  className={`w-full py-2 px-4 rounded-lg font-semibold transition ${
                    isActive
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {isActive ? 'Currently Active' : 'Open Tournament'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
