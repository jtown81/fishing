/**
 * Branding Settings Component
 * Allows Org tier users to customize tournament branding
 * Features: custom logo, colors, domain, app name
 */

import { useState } from 'react'
import { useTournamentStore } from '@modules/tournaments/tournament-store'
import { useSubscriptionStore } from '@modules/subscription'
import { Palette, Link2, Type, AlertCircle } from 'lucide-react'
import type { TournamentBranding } from '@models/tournament'

interface BrandingSettingsProps {
  onUpdate: (branding: TournamentBranding) => void
}

export default function BrandingSettings({ onUpdate }: BrandingSettingsProps) {
  const { tier } = useSubscriptionStore()
  const currentTournament = useTournamentStore((s) => s.currentTournament)
  const [branding, setBranding] = useState<TournamentBranding>(
    currentTournament?.branding || {}
  )
  const [isSaving, setIsSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState(false)

  // Gate: Org tier only
  if (tier !== 'org') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex gap-3">
          <AlertCircle size={20} className="text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Organization Tier Only</h3>
            <p className="text-sm text-blue-800">
              Custom branding is available with an Organization subscription. Upgrade to unlock tournament customization.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!currentTournament) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-500">Select a tournament to customize its branding.</p>
      </div>
    )
  }

  const handleColorChange = (key: 'primaryColor' | 'secondaryColor', value: string) => {
    setBranding((prev) => ({ ...prev, [key]: value }))
  }

  const handleTextChange = (key: keyof TournamentBranding, value: string) => {
    setBranding((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      onUpdate(branding)
      setSavedMessage(true)
      setTimeout(() => setSavedMessage(false), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Palette size={20} />
          Tournament Branding
        </h2>

        {/* Colors Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Primary Color
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={branding.primaryColor || '#1f2937'}
                onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={branding.primaryColor || '#1f2937'}
                onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                placeholder="#1f2937"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Used for buttons, headers, links</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Secondary Color
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={branding.secondaryColor || '#3b82f6'}
                onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={branding.secondaryColor || '#3b82f6'}
                onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                placeholder="#3b82f6"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Used for accents and highlights</p>
          </div>
        </div>

        {/* Text Customization Section */}
        <div className="space-y-4 mb-6 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Type size={16} />
            App Customization
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Custom App Name
            </label>
            <input
              type="text"
              value={branding.appName || 'Fishing Tournament Manager'}
              onChange={(e) => handleTextChange('appName', e.target.value)}
              placeholder="E.g., My Tournament Pro"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Shown in header and browser tab</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              App Description
            </label>
            <textarea
              value={branding.appDescription || ''}
              onChange={(e) => handleTextChange('appDescription', e.target.value)}
              placeholder="E.g., Professional tournament management system"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">SEO description for search engines</p>
          </div>
        </div>

        {/* Domain Customization Section */}
        <div className="space-y-4 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Link2 size={16} />
            Custom Domain (Coming Soon)
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Custom Domain
            </label>
            <input
              type="text"
              value={branding.customDomain || ''}
              onChange={(e) => handleTextChange('customDomain', e.target.value)}
              placeholder="E.g., mytournament.example.com"
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              ⚠️ Custom domain routing requires enterprise configuration. Contact support.
            </p>
          </div>
        </div>

        {/* Logo Section */}
        <div className="space-y-4 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900">Logo</h3>
          {branding.logoUrl && (
            <div className="relative inline-block mb-4">
              <img
                src={branding.logoUrl}
                alt="Tournament logo"
                className="h-20 rounded border border-gray-200"
              />
            </div>
          )}
          <p className="text-xs text-gray-500">
            Upload via tournament settings. Logo displayed in header and printed materials.
          </p>
        </div>

        {/* Save Button */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Branding'}
          </button>

          {savedMessage && (
            <span className="flex items-center text-green-600 text-sm">
              ✓ Branding updated
            </span>
          )}
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Preview</h3>

        {/* Header Preview */}
        <div
          style={{ backgroundColor: branding.primaryColor || '#1f2937' }}
          className="rounded-lg p-4 text-white mb-4"
        >
          <h2 className="text-xl font-bold">{branding.appName || 'Fishing Tournament Manager'}</h2>
          <p className="text-sm opacity-90">{currentTournament.name} - {currentTournament.year}</p>
        </div>

        {/* Button Preview */}
        <div className="flex gap-3">
          <button
            style={{ backgroundColor: branding.primaryColor || '#1f2937' }}
            className="px-4 py-2 text-white rounded-lg font-medium"
          >
            Primary Button
          </button>
          <button
            style={{ backgroundColor: branding.secondaryColor || '#3b82f6' }}
            className="px-4 py-2 text-white rounded-lg font-medium"
          >
            Secondary Button
          </button>
        </div>
      </div>
    </div>
  )
}
