/**
 * Settings view — Account, Cloud Sync, Data, and About sections.
 */
import { useState, useEffect } from 'react'
import {
  User,
  Users,
  Cloud,
  CloudOff,
  Database,
  Info,
  RefreshCw,
  Download,
  Trash2,
  Loader2,
  LogIn,
  LogOut,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Zap
} from 'lucide-react'
import { useAuthStore } from '@modules/auth'
import { useSubscriptionStore } from '@modules/subscription'
import { isCloudEnabled } from '@lib/supabase'
import { getPendingCount, getLastSyncTime, flushSyncQueue } from '@modules/sync'
import AuthModal from '@components/auth/AuthModal'
import SubscriptionBadge from '@components/subscription/SubscriptionBadge'
import UpgradePrompt from '@components/subscription/UpgradePrompt'
import PricingCards from '@components/subscription/PricingCards'
import MembersPanel from '@components/settings/MembersPanel'

export default function SettingsView() {
  const { user, signOut } = useAuthStore()
  const { tier, status, currentPeriodEnd, redirectToPortal, isLoading: subLoading } = useSubscriptionStore()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showPricing, setShowPricing] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setPendingCount(await getPendingCount())
      setLastSync(await getLastSyncTime())
    }
    load()
  }, [user])

  const handleSyncNow = async () => {
    setIsSyncing(true)
    setSyncMsg(null)
    try {
      await flushSyncQueue()
      const count = await getPendingCount()
      setPendingCount(count)
      setLastSync(await getLastSyncTime())
      setSyncMsg(count === 0 ? 'All changes synced.' : `${count} change(s) still pending.`)
    } catch {
      setSyncMsg('Sync failed. Check your connection.')
    } finally {
      setIsSyncing(false)
    }
  }

  const handleClearData = () => {
    if (!window.confirm('Delete ALL local tournament data? This cannot be undone.')) return
    indexedDB.deleteDatabase('FishingTournamentDB')
    window.location.reload()
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account, sync, and data</p>
      </div>

      {/* Account */}
      <Section icon={<User size={20} />} title="Account">
        {!isCloudEnabled ? (
          <Notice variant="info">
            Cloud sync is not configured. The app runs fully offline.
            To enable cloud sync, add Supabase credentials to <code className="text-xs bg-gray-100 px-1 rounded">.env.local</code>.
          </Notice>
        ) : user ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">{user.email}</p>
                  <SubscriptionBadge tier={tier} showFree />
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  {status === 'active' || status === 'trialing'
                    ? tier === 'free'
                      ? 'Free plan — local storage only'
                      : currentPeriodEnd
                        ? `Renews ${currentPeriodEnd.toLocaleDateString()}`
                        : 'Active subscription'
                    : status === 'past_due'
                    ? 'Payment past due'
                    : status === 'canceled'
                    ? 'Subscription canceled'
                    : 'Signed in'}
                </p>
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>

            {/* Subscription actions */}
            <div className="flex flex-wrap gap-2 pt-1">
              {tier !== 'free' ? (
                <button
                  onClick={() => redirectToPortal()}
                  disabled={subLoading}
                  className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  <CreditCard size={14} />
                  {subLoading ? 'Loading…' : 'Manage Billing'}
                </button>
              ) : null}
              <button
                onClick={() => setShowPricing((v) => !v)}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Zap size={14} />
                {showPricing ? 'Hide Plans' : tier === 'free' ? 'Upgrade Plan' : 'Change Plan'}
              </button>
            </div>

            {showPricing && (
              <div className="pt-2">
                <PricingCards />
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Not signed in. Sign in to enable cloud sync.</p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <LogIn size={16} />
              Sign In
            </button>
          </div>
        )}
      </Section>

      {/* Cloud Sync */}
      <Section icon={isCloudEnabled && user && tier !== 'free' ? <Cloud size={20} /> : <CloudOff size={20} />} title="Cloud Sync">
        {!isCloudEnabled || !user ? (
          <Notice variant="info">
            {!isCloudEnabled
              ? 'Configure Supabase credentials to enable cloud sync.'
              : 'Sign in to enable realtime sync and spectator links.'}
          </Notice>
        ) : tier === 'free' ? (
          <UpgradePrompt
            reason="Cloud sync requires a Pro or Org subscription."
            inline
          />
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Pending changes</p>
                <p className={`font-semibold ${pendingCount > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {pendingCount}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Last synced</p>
                <p className="font-semibold text-gray-900">
                  {lastSync ? lastSync.toLocaleTimeString() : 'Never'}
                </p>
              </div>
            </div>

            {syncMsg && (
              <Notice variant={syncMsg.includes('failed') ? 'error' : 'success'}>
                {syncMsg}
              </Notice>
            )}

            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              Sync Now
            </button>
          </div>
        )}
      </Section>

      {/* Tournament Members (Org tier) */}
      <Section icon={<Users size={20} />} title="Tournament Members">
        {!isCloudEnabled || !user ? (
          <Notice variant="info">
            {!isCloudEnabled
              ? 'Configure Supabase credentials to enable multi-user access.'
              : 'Sign in to manage tournament members.'}
          </Notice>
        ) : tier === 'org' ? (
          <MembersPanel />
        ) : (
          <UpgradePrompt
            reason="Multi-user access requires an Org subscription."
            inline
          />
        )}
      </Section>

      {/* Data */}
      <Section icon={<Database size={20} />} title="Data">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            All tournament data is stored locally in your browser (IndexedDB).
            Use Import/Export to backup or transfer your data.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#import-export"
              onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('navigate', { detail: 'import-export' })) }}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download size={16} />
              Import / Export
            </a>
            <button
              onClick={handleClearData}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 size={16} />
              Clear All Local Data
            </button>
          </div>
        </div>
      </Section>

      {/* About */}
      <Section icon={<Info size={20} />} title="About">
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Version</span>
            <span className="font-medium text-gray-900">Phase 5 (Subscriptions)</span>
          </div>
          <div className="flex justify-between">
            <span>Storage</span>
            <span className="font-medium text-gray-900">IndexedDB (local)</span>
          </div>
          <div className="flex justify-between">
            <span>Cloud</span>
            <span className={`font-medium ${isCloudEnabled ? 'text-green-600' : 'text-gray-400'}`}>
              {isCloudEnabled ? 'Supabase configured' : 'Not configured'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Network</span>
            <span className="font-medium text-gray-900">
              {navigator.onLine ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </Section>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Internal sub-components
// ---------------------------------------------------------------------------

function Section({
  icon,
  title,
  children
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <span className="text-gray-500">{icon}</span>
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="px-6 py-4">{children}</div>
    </div>
  )
}

function Notice({
  variant,
  children
}: {
  variant: 'info' | 'success' | 'error'
  children: React.ReactNode
}) {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-700',
    success: 'bg-green-50 border-green-200 text-green-700',
    error: 'bg-red-50 border-red-200 text-red-700'
  }
  const icons = {
    info: <Info size={14} />,
    success: <CheckCircle size={14} />,
    error: <AlertCircle size={14} />
  }
  return (
    <div className={`flex items-start gap-2 p-3 rounded-lg border text-sm ${styles[variant]}`}>
      <span className="mt-0.5 shrink-0">{icons[variant]}</span>
      <span>{children}</span>
    </div>
  )
}
