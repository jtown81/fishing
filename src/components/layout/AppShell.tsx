import { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import Dashboard from '@components/dashboard/Dashboard'
import { StatisticsOverview } from '@components/charts'
import { CalcuttaManager } from '@components/calcutta'
import { ScoreboardDisplay } from '@components/scoreboard'
import { ParksReportGenerator } from '@components/reports'
import { PrintManager } from '@components/print'
import { ImportExportManager } from '@components/import-export'
import SettingsView from '@components/settings/SettingsView'
import TournamentSetup from '@components/forms/TournamentSetup'
import TeamList from '@components/teams/TeamList'
import WeighInForm from '@components/weigh-in/WeighInForm'
import AnglerList from '@components/anglers/AnglerList'
import AnglerProfile from '@components/anglers/AnglerProfile'
import AdminDashboard from '@components/admin/AdminDashboard'
import { HallOfFameView } from '@components/hall-of-fame'

type AppView = 'dashboard' | 'statistics' | 'calcutta' | 'scoreboard' | 'reports' | 'setup' | 'teams' | 'weigh-in' | 'import-export' | 'settings' | 'anglers' | 'angler-detail' | 'admin' | 'hall-of-fame'

interface AppShellProps {
  currentView: AppView
  setCurrentView: (view: AppView) => void
  selectedAnglerId: string | null
  setSelectedAnglerId: (id: string | null) => void
}

export default function AppShell({ currentView, setCurrentView, selectedAnglerId, setSelectedAnglerId }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Scoreboard is fullscreen - render without sidebar/header
  if (currentView === 'scoreboard') {
    return <ScoreboardDisplay />
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />
      case 'statistics':
        return <StatisticsOverview />
      case 'calcutta':
        return <CalcuttaManager />
      case 'reports':
        return <ReportsView />
      case 'setup':
        return <TournamentSetup />
      case 'teams':
        return <TeamList />
      case 'weigh-in':
        return <WeighInForm />
      case 'import-export':
        return <ImportExportManager />
      case 'settings':
        return <SettingsView />
      case 'admin':
        return <AdminDashboard />
      case 'hall-of-fame':
        return <HallOfFameView />
      case 'anglers':
        return (
          <AnglerList
            onSelectAngler={(id) => {
              setSelectedAnglerId(id)
              setCurrentView('angler-detail')
            }}
          />
        )
      case 'angler-detail':
        return selectedAnglerId ? (
          <AnglerProfile
            anglerId={selectedAnglerId}
            onBack={() => setCurrentView('anglers')}
          />
        ) : <AnglerList onSelectAngler={(id) => { setSelectedAnglerId(id); setCurrentView('angler-detail') }} />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto">
          {renderView()}
        </main>
      </div>
    </div>
  )
}

/**
 * Reports view wrapper
 */
function ReportsView() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports & Printing</h1>
        <p className="text-gray-600 mt-1">Generate, export, and print tournament data</p>
      </div>

      {/* Parks Report */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Parks & Wildlife Report</h2>
          <p className="text-sm text-gray-600 mt-1">
            Fisheries data for game/parks agencies
          </p>
        </div>
        <div className="p-6">
          <ParksReportGenerator />
        </div>
      </div>

      {/* Print Manager */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Print Suite</h2>
          <p className="text-sm text-gray-600 mt-1">
            Standings, weight tickets, and statistics reports
          </p>
        </div>
        <div className="p-6">
          <PrintManager />
        </div>
      </div>
    </div>
  )
}
