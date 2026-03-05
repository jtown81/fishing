import {
  BarChart3,
  FileText,
  Gavel,
  LineChart,
  Monitor,
  Settings,
  Users,
  Weight,
  Zap,
  X
} from 'lucide-react'
import { useTournamentStore } from '@modules/tournaments/tournament-store'

interface SidebarProps {
  currentView: 'dashboard' | 'statistics' | 'calcutta' | 'scoreboard' | 'reports' | 'setup' | 'teams' | 'weigh-in' | 'settings'
  setCurrentView: (view: 'dashboard' | 'statistics' | 'calcutta' | 'scoreboard' | 'reports' | 'setup' | 'teams' | 'weigh-in' | 'settings') => void
  open: boolean
  setOpen: (open: boolean) => void
}

interface NavItem {
  label: string
  view: 'dashboard' | 'statistics' | 'calcutta' | 'scoreboard' | 'reports' | 'setup' | 'teams' | 'weigh-in' | 'settings'
  icon: React.ReactNode
  requiresTournament?: boolean
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    view: 'dashboard',
    icon: <BarChart3 size={20} />,
    requiresTournament: true
  },
  {
    label: 'Statistics',
    view: 'statistics',
    icon: <LineChart size={20} />,
    requiresTournament: true
  },
  {
    label: 'Calcutta',
    view: 'calcutta',
    icon: <Gavel size={20} />,
    requiresTournament: true
  },
  {
    label: 'Live Scoreboard',
    view: 'scoreboard',
    icon: <Monitor size={20} />,
    requiresTournament: true
  },
  {
    label: 'Reports',
    view: 'reports',
    icon: <FileText size={20} />,
    requiresTournament: true
  },
  {
    label: 'Tournament Setup',
    view: 'setup',
    icon: <Zap size={20} />
  },
  {
    label: 'Teams',
    view: 'teams',
    icon: <Users size={20} />,
    requiresTournament: true
  },
  {
    label: 'Weigh-In',
    view: 'weigh-in',
    icon: <Weight size={20} />,
    requiresTournament: true
  },
  {
    label: 'Settings',
    view: 'settings',
    icon: <Settings size={20} />
  }
]

export default function Sidebar({
  currentView,
  setCurrentView,
  open,
  setOpen
}: SidebarProps) {
  const currentTournament = useTournamentStore((s) => s.currentTournament)

  const handleNavClick = (view: typeof currentView) => {
    setCurrentView(view)
    setOpen(false)
  }

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out z-40 md:relative md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close button for mobile */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 md:hidden p-2 hover:bg-gray-800 rounded-lg"
        >
          <X size={20} />
        </button>

        {/* Sidebar content */}
        <div className="pt-12 md:pt-0 h-full flex flex-col">
          {/* Logo/Title */}
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-bold">Tourney Manager</h2>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => {
              const isDisabled =
                item.requiresTournament && !currentTournament
              const isActive = currentView === item.view

              return (
                <button
                  key={item.view}
                  onClick={() => !isDisabled && handleNavClick(item.view)}
                  disabled={isDisabled}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : isDisabled
                        ? 'text-gray-500 cursor-not-allowed'
                        : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-700 text-xs text-gray-400">
            <p>v0.1.0</p>
            <p className="mt-2">Offline-capable PWA</p>
          </div>
        </div>
      </aside>
    </>
  )
}
