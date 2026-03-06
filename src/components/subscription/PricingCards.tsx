/**
 * PricingCards — three-column Free / Pro / Org pricing grid.
 * Highlights current plan, disables CTA for current or lower tiers.
 */
import { Check, Zap, Building2 } from 'lucide-react'
import { useSubscriptionStore } from '@modules/subscription'
import type { SubscriptionTier } from '@modules/subscription'

interface PlanConfig {
  tier: SubscriptionTier
  name: string
  price: string
  period: string
  description: string
  features: string[]
  icon: React.ReactNode
  popular?: boolean
}

const PLANS: PlanConfig[] = [
  {
    tier: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'For single-event use',
    icon: null,
    features: [
      '1 tournament',
      'Local storage only',
      'Core stats & scoreboard',
      'Weight tickets & print suite'
    ]
  },
  {
    tier: 'pro',
    name: 'Pro',
    price: '$9.99',
    period: 'per month',
    description: 'For clubs & regular events',
    icon: <Zap size={16} />,
    popular: true,
    features: [
      'Unlimited tournaments',
      'Cloud sync across devices',
      'Multi-year historical analytics',
      'Live spectator sharing',
      'All reports (Parks & Wildlife, etc.)',
      'CSV import / export'
    ]
  },
  {
    tier: 'org',
    name: 'Organization',
    price: '$29.99',
    period: 'per month',
    description: 'For associations & leagues',
    icon: <Building2 size={16} />,
    features: [
      'Everything in Pro',
      'Multi-user weigh-in stations',
      'Custom branding',
      'API access',
      'Priority support'
    ]
  }
]

const TIER_ORDER: Record<SubscriptionTier, number> = { free: 0, pro: 1, org: 2 }

export default function PricingCards() {
  const { tier: currentTier, redirectToCheckout, isLoading } = useSubscriptionStore()

  const handleUpgrade = (plan: PlanConfig) => {
    if (plan.tier === 'free') return
    redirectToCheckout(plan.tier as 'pro' | 'org')
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {PLANS.map((plan) => {
        const isCurrent = plan.tier === currentTier
        const isDowngrade = TIER_ORDER[plan.tier] < TIER_ORDER[currentTier]
        const isDisabled = isCurrent || isDowngrade || plan.tier === 'free'

        return (
          <div
            key={plan.tier}
            className={`relative flex flex-col rounded-xl border p-5 ${
              isCurrent
                ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50'
                : plan.popular
                ? 'border-blue-300 bg-white'
                : 'border-gray-200 bg-white'
            }`}
          >
            {plan.popular && !isCurrent && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}

            {isCurrent && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Current Plan
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 mb-1">
              {plan.icon && <span className="text-blue-600">{plan.icon}</span>}
              <h3 className="font-semibold text-gray-900">{plan.name}</h3>
            </div>

            <p className="text-xs text-gray-500 mb-3">{plan.description}</p>

            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
              <span className="text-sm text-gray-500 ml-1">/ {plan.period}</span>
            </div>

            <ul className="space-y-2 flex-1 mb-5">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                  <Check size={14} className="text-green-500 mt-0.5 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade(plan)}
              disabled={isDisabled || isLoading}
              className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                isCurrent
                  ? 'bg-green-100 text-green-700 cursor-default'
                  : isDisabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : plan.popular
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-900 text-white hover:bg-gray-700'
              }`}
            >
              {isCurrent ? 'Current Plan' : isDowngrade ? 'Downgrade' : plan.tier === 'free' ? 'Free' : `Upgrade to ${plan.name}`}
            </button>
          </div>
        )
      })}
    </div>
  )
}
