import { useState, useEffect } from 'react'
import { useTournamentStore } from '@modules/tournaments/tournament-store'
import { useTeamStore } from '@modules/teams/team-store'
import { useWeighInStore } from '@modules/weigh-ins/weigh-in-store'
import AppShell from '@components/layout/AppShell'

export default function App() {
  const [view, setView] = useState<'dashboard' | 'statistics' | 'calcutta' | 'scoreboard' | 'reports' | 'setup' | 'teams' | 'weigh-in' | 'settings'>('dashboard')
  const [initialized, setInitialized] = useState(false)

  const currentTournament = useTournamentStore((s) => s.currentTournament)
  const loadTournaments = useTournamentStore((s) => s.loadTournaments)
  const loadTeams = useTeamStore((s) => s.loadTeams)
  const loadWeighIns = useWeighInStore((s) => s.loadWeighIns)

  // Initialize data on mount
  useEffect(() => {
    const init = async () => {
      await loadTournaments()
      setInitialized(true)
    }
    init()
  }, [loadTournaments])

  // Load teams and weigh-ins when tournament changes
  useEffect(() => {
    if (currentTournament) {
      loadTeams(currentTournament.id)
      loadWeighIns(currentTournament.id)
    }
  }, [currentTournament, loadTeams, loadWeighIns])

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  return <AppShell currentView={view} setCurrentView={setView} />
}
