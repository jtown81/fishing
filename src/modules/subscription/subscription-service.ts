/**
 * Subscription service — thin wrapper around Supabase for subscription management.
 * All functions are no-ops / return 'free' when supabase === null (local-only mode).
 */
/// <reference types="vite/client" />
import { supabase } from '@lib/supabase'
import type { Session } from '@modules/auth'

export type SubscriptionTier = 'free' | 'pro' | 'org'
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete'

export interface SubscriptionRecord {
  tier: SubscriptionTier
  status: SubscriptionStatus
  currentPeriodEnd: Date | null
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
}

const FREE_SUBSCRIPTION: SubscriptionRecord = {
  tier: 'free',
  status: 'active',
  currentPeriodEnd: null,
  stripeCustomerId: null,
  stripeSubscriptionId: null
}

/**
 * Fetch the current user's subscription record from Supabase.
 * Returns free-tier defaults when not configured or no record found.
 */
export async function fetchSubscription(session: Session | null): Promise<SubscriptionRecord> {
  if (!supabase || !session) return FREE_SUBSCRIPTION

  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('tier, status, current_period_end, stripe_customer_id, stripe_subscription_id')
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (error || !data) return FREE_SUBSCRIPTION

  return {
    tier: data.tier as SubscriptionTier,
    status: data.status as SubscriptionStatus,
    currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : null,
    stripeCustomerId: data.stripe_customer_id ?? null,
    stripeSubscriptionId: data.stripe_subscription_id ?? null
  }
}

/**
 * Maps a subscription tier to the configured Stripe price ID.
 */
export function tierToPriceId(tier: 'pro' | 'org'): string {
  if (tier === 'pro') {
    return import.meta.env.VITE_STRIPE_PRO_PRICE_ID as string ?? ''
  }
  return import.meta.env.VITE_STRIPE_ORG_PRICE_ID as string ?? ''
}

/**
 * Redirect the browser to Stripe Checkout for the given price.
 * No-op when Supabase is not configured.
 */
export async function createCheckoutSession(
  session: Session | null,
  priceId: string
): Promise<void> {
  if (!supabase || !session) return

  const { data, error } = await supabase.functions.invoke('create-checkout-session', {
    body: { priceId },
    headers: { Authorization: `Bearer ${session.access_token}` }
  })

  if (error) throw new Error(error.message)
  if (data?.url) window.location.href = data.url
}

/**
 * Redirect the browser to Stripe Billing Portal.
 * No-op when Supabase is not configured.
 */
export async function createPortalSession(session: Session | null): Promise<void> {
  if (!supabase || !session) return

  const { data, error } = await supabase.functions.invoke('create-portal-session', {
    body: {},
    headers: { Authorization: `Bearer ${session.access_token}` }
  })

  if (error) throw new Error(error.message)
  if (data?.url) window.location.href = data.url
}
