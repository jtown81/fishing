/**
 * SubscriptionBadge — small pill showing current subscription tier.
 * Renders nothing for Free tier by default (showFree=false).
 */
import type { SubscriptionTier } from '@modules/subscription'

interface SubscriptionBadgeProps {
  tier: SubscriptionTier
  showFree?: boolean
}

const TIER_STYLES: Record<SubscriptionTier, string> = {
  free: 'bg-gray-100 text-gray-600 border-gray-200',
  pro: 'bg-blue-100 text-blue-700 border-blue-200',
  org: 'bg-purple-100 text-purple-700 border-purple-200'
}

const TIER_LABELS: Record<SubscriptionTier, string> = {
  free: 'Free',
  pro: 'Pro',
  org: 'Org'
}

export default function SubscriptionBadge({ tier, showFree = false }: SubscriptionBadgeProps) {
  if (tier === 'free' && !showFree) return null

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${TIER_STYLES[tier]}`}>
      {TIER_LABELS[tier]}
    </span>
  )
}
