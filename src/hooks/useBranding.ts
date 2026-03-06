/**
 * Hook to apply tournament branding globally
 * Handles color injection, title updates, and CSS variable application
 */

import { useEffect } from 'react'
import { useTournamentStore } from '@modules/tournaments/tournament-store'
import type { TournamentBranding } from '@models/tournament'

export function useBranding() {
  const currentTournament = useTournamentStore((s) => s.currentTournament)
  const branding = currentTournament?.branding

  useEffect(() => {
    if (!branding) {
      // Reset to defaults
      resetBranding()
      return
    }

    applyBranding(branding)
  }, [branding])

  return branding
}

export function applyBranding(branding: TournamentBranding) {
  // Apply CSS variables for colors
  const primaryColor = branding.primaryColor || '#1f2937'
  const secondaryColor = branding.secondaryColor || '#3b82f6'

  const root = document.documentElement
  root.style.setProperty('--branding-primary', primaryColor)
  root.style.setProperty('--branding-secondary', secondaryColor)

  // Update page title
  if (branding.appName) {
    document.title = branding.appName
  }

  // Update meta description
  if (branding.appDescription) {
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', branding.appDescription)
    }
  }
}

export function resetBranding() {
  const root = document.documentElement
  root.style.setProperty('--branding-primary', '#1f2937')
  root.style.setProperty('--branding-secondary', '#3b82f6')
  document.title = 'Fishing Tournament Manager'

  const metaDescription = document.querySelector('meta[name="description"]')
  if (metaDescription) {
    metaDescription.setAttribute('content', 'Offline-first fishing tournament management app')
  }
}
