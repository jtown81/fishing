import { Menu } from 'lucide-react'
import { useTournamentStore } from '@modules/tournaments/tournament-store'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const currentTournament = useTournamentStore((s) => s.currentTournament)

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Fishing Tournament Manager</h1>
          {currentTournament && (
            <p className="text-sm text-gray-600">
              {currentTournament.name} - {currentTournament.year}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Offline Ready</span>
        </div>
      </div>
    </header>
  )
}
