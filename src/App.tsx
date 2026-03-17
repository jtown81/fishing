import { useState, useEffect, useRef } from 'react'
import { useTournamentStore } from '@modules/tournaments/tournament-store'
import { useTeamStore } from '@modules/teams/team-store'
import { useWeighInStore } from '@modules/weigh-ins/weigh-in-store'
import { useAuthStore } from '@modules/auth'
import { useSubscriptionStore } from '@modules/subscription'
import { flushSyncQueue, subscribeToTournament } from '@modules/sync'
import AppShell from '@components/layout/AppShell'
import SpectatorView from '@components/spectator/SpectatorView'
import LoadingScreen from '@components/layout/LoadingScreen'
import { initDevSeedTools } from '@utils/dev-seed'
import { requestPushPermissions, registerPushDevice, onPushReceived } from '@lib/push-notifications'
import { Capacitor } from '@capacitor/core'
import { useRoleStore } from '@modules/roles'
import { useAnglerStore } from '@modules/anglers'

export default function App() {
  const [view, setView] = useState<'dashboard' | 'statistics' | 'calcutta' | 'scoreboard' | 'reports' | 'setup' | 'teams' | 'weigh-in' | 'import-export' | 'settings' | 'anglers' | 'angler-detail' | 'admin' | 'hall-of-fame'>('dashboard')
  const [selectedAnglerId, setSelectedAnglerId] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  // Spectator mode: detect ?spectator=<slug> query param
  const [spectatorSlug] = useState<string | null>(() => {
    return new URLSearchParams(window.location.search).get('spectator')
  })

  // Detect ?billing=success to reload subscription after Stripe redirect
  const [billingSuccess] = useState<boolean>(() => {
    return new URLSearchParams(window.location.search).get('billing') === 'success'
  })

  const currentTournament = useTournamentStore((s) => s.currentTournament)
  const loadTournaments = useTournamentStore((s) => s.loadTournaments)
  const loadTeams = useTeamStore((s) => s.loadTeams)
  const loadWeighIns = useWeighInStore((s) => s.loadWeighIns)
  const { user, initAuth } = useAuthStore()
  const { loadSubscription, reset: resetSubscription } = useSubscriptionStore()
  const upsertWeighIn = useWeighInStore((s) => s.upsertWeighIn)
  const upsertTeam = useTeamStore((s) => s.upsertTeam)
  const { loadMembers: loadRoleMembers, reset: resetRoles } = useRoleStore()
  const loadAnglers = useAnglerStore((s) => s.loadAnglers)

  // Track current realtime unsubscribe fn
  const realtimeUnsubRef = useRef<(() => void) | null>(null)

  // Initialize data on mount
  useEffect(() => {
    // Spectator mode: skip normal init entirely
    if (spectatorSlug) return

    const init = async () => {
      // Dev tools: expose seeding utilities in console (development only)
      initDevSeedTools()

      await loadTournaments()

      // Auth restore + initial sync flush
      await initAuth()

      // Load subscription after auth is initialized
      await loadSubscription()

      // Load angler profiles
      await loadAnglers()

      // Register push notifications on native platforms
      if (Capacitor.isNativePlatform()) {
        await requestPushPermissions()
      }

      setInitialized(true)
    }
    init()
  }, [loadTournaments, initAuth, spectatorSlug])

  // Flush sync queue, reload subscription, and register push device when user signs in/out
  useEffect(() => {
    if (user) {
      flushSyncQueue().catch(() => {})
      loadSubscription()
      if (Capacitor.isNativePlatform()) {
        registerPushDevice(user.id).catch(() => {})
      }
    } else {
      resetSubscription()
      resetRoles()
    }
  }, [user, loadSubscription, resetSubscription, resetRoles])

  // Listen for push notifications (billing updates)
  useEffect(() => {
    const unsub = onPushReceived((data) => {
      const payload = data as Record<string, unknown>
      if (payload?.type === 'billing') {
        loadSubscription()
      }
    })
    return unsub
  }, [loadSubscription])

  // Reload subscription after successful Stripe redirect
  useEffect(() => {
    if (billingSuccess) {
      loadSubscription()
      // Clean up query param without reloading the page
      const url = new URL(window.location.href)
      url.searchParams.delete('billing')
      window.history.replaceState({}, '', url.toString())
    }
  }, [billingSuccess, loadSubscription])

  // Load teams, weigh-ins, and role members when tournament changes
  useEffect(() => {
    if (currentTournament) {
      loadTeams(currentTournament.id)
      loadWeighIns(currentTournament.id)
      loadRoleMembers(currentTournament.id)
    }
  }, [currentTournament, loadTeams, loadWeighIns, loadRoleMembers])

  // Subscribe to realtime updates when tournament changes and user is signed in
  useEffect(() => {
    // Unsubscribe from previous tournament
    realtimeUnsubRef.current?.()
    realtimeUnsubRef.current = null

    if (!currentTournament || !user) return

    const unsub = subscribeToTournament(currentTournament.id, {
      onWeighIn: (w) => upsertWeighIn(w),
      onTeam: (t) => upsertTeam(t)
    })
    realtimeUnsubRef.current = unsub

    return () => {
      unsub()
      realtimeUnsubRef.current = null
    }
  }, [currentTournament, user, upsertWeighIn, upsertTeam])

  // Listen for navigation events from Settings view
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail
      if (detail === 'import-export') {
        setView('import-export')
      }
    }
    window.addEventListener('navigate', handler)
    return () => window.removeEventListener('navigate', handler)
  }, [])

  // Spectator mode: render standalone view without shell
  if (spectatorSlug) {
    return <SpectatorView slug={spectatorSlug} />
  }

  if (!initialized) {
    return <LoadingScreen />
  }

  return (
    <AppShell
      currentView={view}
      setCurrentView={setView}
      selectedAnglerId={selectedAnglerId}
      setSelectedAnglerId={setSelectedAnglerId}
    />
  )
}
