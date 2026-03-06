/**
 * Sync Status Badge
 * Shows the current cloud sync status: synced, pending, offline
 */

import { useEffect, useState } from 'react'
import { useAuthStore } from '@modules/auth'
import { getPendingCount, getLastSyncTime } from '@modules/sync'
import { isCloudEnabled } from '@lib/supabase'
import { CheckCircle, Clock, WifiOff } from 'lucide-react'

export default function SyncStatusBadge() {
  const { user } = useAuthStore()
  const [pendingCount, setPendingCount] = useState(0)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Poll for sync status every 2 seconds
  useEffect(() => {
    const updateSyncStatus = async () => {
      const count = await getPendingCount()
      setPendingCount(count)

      const lastSync = await getLastSyncTime()
      setLastSyncTime(lastSync)
    }

    updateSyncStatus()
    const interval = setInterval(updateSyncStatus, 2000)

    return () => clearInterval(interval)
  }, [])

  // Hide if cloud is not enabled or user is not signed in
  if (!isCloudEnabled || !user) {
    return null
  }

  // Determine status
  const isOffline = !isOnline
  const isPending = pendingCount > 0

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Never'
    const now = new Date()
    const diff = now.getTime() - lastSyncTime.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (seconds < 60) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return lastSyncTime.toLocaleDateString()
  }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        isOffline
          ? 'bg-gray-100 text-gray-700'
          : isPending
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-green-100 text-green-800'
      }`}
      title={
        isOffline
          ? 'Offline — changes will sync when online'
          : isPending
            ? `${pendingCount} change${pendingCount !== 1 ? 's' : ''} pending sync`
            : `Synced — last sync ${formatLastSync()}`
      }
    >
      {isOffline ? (
        <>
          <WifiOff size={14} />
          <span>Offline</span>
        </>
      ) : isPending ? (
        <>
          <Clock size={14} className="animate-spin" />
          <span>{pendingCount} pending</span>
        </>
      ) : (
        <>
          <CheckCircle size={14} />
          <span>Synced</span>
        </>
      )}
    </div>
  )
}
