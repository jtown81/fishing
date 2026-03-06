/**
 * UpgradePrompt — explains why an action is gated and offers upgrade CTA.
 * inline=false (default): full-page modal overlay
 * inline=true: card for embedding in SettingsView
 */
import { X, Zap } from 'lucide-react'
import { useSubscriptionStore } from '@modules/subscription'

interface UpgradePromptProps {
  reason: string
  inline?: boolean
  onClose?: () => void
}

const PRO_FEATURES = [
  'Unlimited tournaments',
  'Cloud sync across devices',
  'Historical data & multi-year analytics',
  'All reports (Parks & Wildlife, etc.)',
  'Live scoreboard sharing & spectator links'
]

export default function UpgradePrompt({ reason, inline = false, onClose }: UpgradePromptProps) {
  const { redirectToCheckout, isLoading } = useSubscriptionStore()

  const handleUpgrade = () => {
    redirectToCheckout('pro')
  }

  const content = (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 ${inline ? 'p-5' : 'p-6 max-w-md w-full mx-4'}`}>
      {!inline && onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Zap size={20} className="text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Upgrade to Pro</h3>
          <p className="text-sm text-gray-500">{reason}</p>
        </div>
      </div>

      <ul className="space-y-2 mb-5">
        {PRO_FEATURES.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
            <span className="text-blue-500 font-bold">✓</span>
            {feature}
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-2xl font-bold text-gray-900">$9.99</span>
          <span className="text-sm text-gray-500"> / month</span>
        </div>
        <button
          onClick={handleUpgrade}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Zap size={14} />
          {isLoading ? 'Redirecting…' : 'Upgrade to Pro'}
        </button>
      </div>
    </div>
  )

  if (inline) return content

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative">{content}</div>
    </div>
  )
}
