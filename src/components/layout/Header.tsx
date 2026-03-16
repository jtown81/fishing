import { useState, useEffect } from 'react'
import { Menu, Cloud, CloudOff, CloudLightning, Loader2, LogOut } from 'lucide-react'
import { useTournamentStore } from '@modules/tournaments/tournament-store'
import { useAuthStore } from '@modules/auth'
import { isCloudEnabled } from '@lib/supabase'
import { getPendingCount } from '@modules/sync'
import AuthModal from '@components/auth/AuthModal'
import ThemeSwitcher from '@components/theme/ThemeSwitcher'

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
        <div className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }} title="Local only — cloud sync not configured">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#4ade80' }}></div>
          <span className="hidden sm:inline">Offline Ready</span>
        </div>
      )
    }

    if (!user) {
      return (
        <button
          onClick={handleCloudIconClick}
          className="flex items-center gap-2 text-sm transition-colors p-2 rounded"
          style={{ color: 'rgba(255, 255, 255, 0.8)', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          title="Click to sign in and enable cloud sync"
        >
          <CloudOff size={18} />
          <span className="hidden sm:inline">Sign in</span>
        </button>
      )
    }

    if (syncStatus === 'pending') {
      return (
        <div className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255, 255, 255, 0.9)' }} title="Changes pending sync">
          <Loader2 size={18} className="animate-spin" />
          <span className="hidden sm:inline">Syncing...</span>
        </div>
      )
    }

    if (syncStatus === 'error') {
      return (
        <div className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255, 200, 200, 1)' }} title="Sync error — changes will retry">
          <CloudLightning size={18} />
          <span className="hidden sm:inline">Sync error</span>
        </div>
      )
    }

    // synced
    return (
      <div className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255, 255, 255, 0.9)' }} title={`Synced as ${user.email}`}>
        <Cloud size={18} />
        <span className="hidden sm:inline truncate max-w-[140px]">{user.email}</span>
        <button
          onClick={signOut}
          className="p-1 rounded transition-colors"
          style={{ color: 'rgba(255, 255, 255, 0.7)', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          title="Sign out"
        >
          <LogOut size={14} />
        </button>
      </div>
    )
  }

  return (
    <>
      <header
        className="border-b px-4 py-4 flex items-center justify-between sticky top-0 z-10 transition-all duration-300"
        style={{
          background: `linear-gradient(135deg, var(--gradient-from), var(--gradient-to))`,
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{
              color: 'var(--color-text)',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            }}
            title="Toggle menu"
          >
            <Menu size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
              🎣 Fishing Tournament
            </h1>
            {currentTournament && (
              <p className="text-sm opacity-90" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                {currentTournament.name} - {currentTournament.year}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <div style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            {renderCloudStatus()}
          </div>
        </div>
      </header>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </>
  )
}
