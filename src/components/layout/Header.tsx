import { useState, useEffect } from 'react'
import { Menu, Cloud, CloudOff, CloudLightning, Loader2, LogOut } from 'lucide-react'
import { useTournamentStore } from '@modules/tournaments/tournament-store'
import { useAuthStore } from '@modules/auth'
import { isCloudEnabled } from '@lib/supabase'
import { getPendingCount } from '@modules/sync'
import AuthModal from '@components/auth/AuthModal'

interface HeaderProps {
  onMenuClick: () => void
}

type SyncStatus = 'local-only' | 'synced' | 'pending' | 'error'

export default function Header({ onMenuClick }: HeaderProps) {
  const currentTournament = useTournamentStore((s) => s.currentTournament)
  const { user, signOut } = useAuthStore()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('local-only')

  // Poll pending count to determine sync status
  useEffect(() => {
    if (!isCloudEnabled) {
      setSyncStatus('local-only')
      return
    }

    if (!user) {
      setSyncStatus('local-only')
      return
    }

    const checkPending = async () => {
      try {
        const count = await getPendingCount()
        setSyncStatus(count > 0 ? 'pending' : 'synced')
      } catch {
        setSyncStatus('error')
      }
    }

    checkPending()
    const interval = setInterval(checkPending, 10_000)
    return () => clearInterval(interval)
  }, [user])

  const handleCloudIconClick = () => {
    if (!isCloudEnabled) return
    if (!user) {
      setShowAuthModal(true)
    }
    // If signed in, clicking does nothing (settings view has sign-out)
  }

  const renderCloudStatus = () => {
    if (!isCloudEnabled) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-400" title="Local only — cloud sync not configured">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="hidden sm:inline">Offline Ready</span>
        </div>
      )
    }

    if (!user) {
      return (
        <button
          onClick={handleCloudIconClick}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          title="Click to sign in and enable cloud sync"
        >
          <CloudOff size={18} className="text-gray-400" />
          <span className="hidden sm:inline">Sign in to sync</span>
        </button>
      )
    }

    if (syncStatus === 'pending') {
      return (
        <div className="flex items-center gap-2 text-sm text-yellow-600" title="Changes pending sync">
          <Loader2 size={18} className="animate-spin text-yellow-500" />
          <span className="hidden sm:inline">Syncing...</span>
        </div>
      )
    }

    if (syncStatus === 'error') {
      return (
        <div className="flex items-center gap-2 text-sm text-red-600" title="Sync error — changes will retry">
          <CloudLightning size={18} className="text-red-500" />
          <span className="hidden sm:inline">Sync error</span>
        </div>
      )
    }

    // synced
    return (
      <div className="flex items-center gap-2 text-sm text-green-600" title={`Synced as ${user.email}`}>
        <Cloud size={18} className="text-green-500" />
        <span className="hidden sm:inline truncate max-w-[140px]">{user.email}</span>
        <button
          onClick={signOut}
          className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors"
          title="Sign out"
        >
          <LogOut size={14} />
        </button>
      </div>
    )
  }

  return (
    <>
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
          {renderCloudStatus()}
        </div>
      </header>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </>
  )
}
