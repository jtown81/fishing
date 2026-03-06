/**
 * Zustand store for subscription state.
 * Mirrors auth-store.ts pattern exactly.
 * Defaults to 'free' on any failure — never blocks the app.
 */
import { create } from 'zustand'
import { useAuthStore } from '@modules/auth'
import {
  fetchSubscription,
  createCheckoutSession,
  createPortalSession,
  tierToPriceId
} from './subscription-service'
import type { SubscriptionTier, SubscriptionStatus } from './subscription-service'

interface SubscriptionStore {
  tier: SubscriptionTier
  status: SubscriptionStatus
  currentPeriodEnd: Date | null
  isLoading: boolean
  error: string | null

  /** Fetch the current subscription from Supabase. Silently defaults to free on error. */
  loadSubscription: () => Promise<void>
  /** Redirect to Stripe Checkout for the given tier. */
  redirectToCheckout: (tier: 'pro' | 'org') => Promise<void>
  /** Redirect to Stripe Billing Portal. */
  redirectToPortal: () => Promise<void>
  /** Reset to free tier (called on sign-out). */
  reset: () => void
}

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  tier: 'free',
  status: 'active',
  currentPeriodEnd: null,
  isLoading: false,
  error: null,

  loadSubscription: async () => {
    set({ isLoading: true, error: null })
    try {
      // Read session outside of React render — use getState(), not hook
      const session = useAuthStore.getState().session
      const record = await fetchSubscription(session)
      set({
        tier: record.tier,
        status: record.status,
        currentPeriodEnd: record.currentPeriodEnd
      })
    } catch {
      // Silently fall back to free — never block the app
      set({ tier: 'free', status: 'active', currentPeriodEnd: null })
    } finally {
      set({ isLoading: false })
    }
  },

  redirectToCheckout: async (tier) => {
    set({ isLoading: true, error: null })
    try {
      const session = useAuthStore.getState().session
      const priceId = tierToPriceId(tier)
      await createCheckoutSession(session, priceId)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start checkout'
      set({ error: message })
    } finally {
      set({ isLoading: false })
    }
  },

  redirectToPortal: async () => {
    set({ isLoading: true, error: null })
    try {
      const session = useAuthStore.getState().session
      await createPortalSession(session)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to open billing portal'
      set({ error: message })
    } finally {
      set({ isLoading: false })
    }
  },

  reset: () => set({
    tier: 'free',
    status: 'active',
    currentPeriodEnd: null,
    isLoading: false,
    error: null
  })
}))
