import { useTournamentStore } from '@modules/tournaments/tournament-store'
import StandingsTable from './StandingsTable'
import SummaryCards from './SummaryCards'

export default function Dashboard() {
  const currentTournament = useTournamentStore((s) => s.currentTournament)

  if (!currentTournament) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-900">
            Please create or select a tournament to view the dashboard.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Tournament Standings</h2>
        <p className="text-gray-600">{currentTournament.name} - {currentTournament.year}</p>
      </div>

      <SummaryCards />
      <StandingsTable />
    </div>
  )
}
