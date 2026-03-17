import {
  BarChart3,
  Download,
  FileText,
  Gavel,
  LayoutDashboard,
  LineChart,
  Monitor,
  Settings,
  User,
  Users,
  Weight,
  Zap,
  X
} from 'lucide-react'
import { useTournamentStore } from '@modules/tournaments/tournament-store'
import { useSubscriptionStore } from '@modules/subscription'
import { useThemeStore } from '@store/theme-store'
import { useResponsive } from '@hooks/useResponsive'

type AppView = 'dashboard' | 'statistics' | 'calcutta' | 'scoreboard' | 'reports' | 'setup' | 'teams' | 'weigh-in' | 'import-export' | 'settings' | 'anglers' | 'angler-detail' | 'admin'

interface SidebarProps {
  currentView: AppView
  setCurrentView: (view: AppView) => void
  open: boolean
  setOpen: (open: boolean) => void
}

interface NavItem {
  label: string
  view: AppView
  icon: React.ReactNode
  requiresTournament?: boolean
}

export default function Sidebar({
  currentView,
  setCurrentView,
  open,
  setOpen
}: SidebarProps) {
  const currentTournament = useTournamentStore((s) => s.currentTournament)
  const { tier } = useSubscriptionStore()
  const { currentTheme } = useThemeStore()
  const { isMobile } = useResponsive()

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
      label: 'Anglers',
      view: 'anglers',
      icon: <User size={20} />
    },
    {
      label: 'Import / Export',
      view: 'import-export',
      icon: <Download size={20} />
    },
    {
      label: 'Settings',
      view: 'settings',
      icon: <Settings size={20} />
    },
    ...(tier === 'org' ? [{
      label: 'Admin',
      view: 'admin' as AppView,
      icon: <LayoutDashboard size={20} />,
      requiresTournament: false
    }] : [])
  ]

  const handleNavClick = (view: AppView) => {
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
        className={`fixed inset-y-0 left-0 w-64 text-white transform transition-transform duration-300 ease-in-out z-40 md:relative md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          backgroundColor: currentTheme.colors.primary,
          backgroundImage: `linear-gradient(180deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
        }}
      >
        {/* Close button for mobile */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 md:hidden p-2 rounded-lg transition-all"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
          }}
        >
          <X size={20} />
        </button>

        {/* Sidebar content */}
        <div className="pt-12 md:pt-0 h-full flex flex-col">
          {/* Logo/Title */}
          <div
            className="px-6 py-4 border-b"
            style={{
              borderColor: `rgba(255, 255, 255, 0.2)`,
            }}
          >
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="text-2xl">{currentTheme.icons.speciesEmoji}</span>
              <span>Manager</span>
            </h2>
            <p className="text-xs opacity-75 mt-1">{currentTheme.tagline}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => {
              const isDisabled =
                item.requiresTournament && !currentTournament
              const isActive =
                currentView === item.view ||
                (item.view === 'anglers' && currentView === 'angler-detail')

              return (
                <button
                  key={item.view}
                  onClick={() => !isDisabled && handleNavClick(item.view)}
                  disabled={isDisabled}
                  className="w-full flex items-center gap-3 rounded-lg transition-all duration-200"
                  style={{
                    padding: isMobile ? '10px 12px' : '8px 16px',
                    minHeight: isMobile ? '44px' : 'auto',
                    backgroundColor: isActive
                      ? `${currentTheme.colors.accent}dd`
                      : isDisabled
                        ? 'rgba(0, 0, 0, 0.2)'
                        : 'rgba(255, 255, 255, 0.1)',
                    color: isDisabled ? 'rgba(255, 255, 255, 0.5)' : 'white',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    transform: isActive ? 'translateX(4px)' : 'translateX(0)',
                    fontSize: isMobile ? '0.875rem' : '0.875rem',
                  }}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Footer */}
          <div
            className="px-6 py-4 border-t text-xs"
            style={{
              borderColor: `rgba(255, 255, 255, 0.2)`,
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            <p>v0.1.0</p>
            <p className="mt-2">Offline-capable PWA</p>
            <p className="mt-2 opacity-60">{currentTheme.species}</p>
          </div>
        </div>
      </aside>
    </>
  )
}
