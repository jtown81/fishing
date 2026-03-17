/**
 * Theme Provider Component
 * Applies theme configuration and loads font files
 * Mounts ambient background layer when appropriate
 * Manages seasonal theme overlays
 */

import { useEffect } from 'react'
import { useThemeStore } from '@store/theme-store'
import { detectSeason } from '@config/seasons'
import AmbientBackground from './AmbientBackground'
import '@styles/seasonal.css'

interface ThemeProviderProps {
  children: React.ReactNode
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const { currentThemeId, currentTheme, currentSeasonId, loadTheme } = useThemeStore()

  // Load saved theme on mount
  useEffect(() => {
    loadTheme()
  }, [loadTheme])

  // Apply theme to DOM and load fonts
  useEffect(() => {
    // Set data-theme attribute
    document.documentElement.setAttribute('data-theme', currentThemeId)

    // Load theme font if URL is provided
    if (currentTheme.typography.fontUrl && !document.querySelector(`link[href*="${currentTheme.typography.fontUrl}"]`)) {
      const link = document.createElement('link')
      link.rel = 'preconnect'
      link.href = 'https://fonts.googleapis.com'
      document.head.appendChild(link)

      const link2 = document.createElement('link')
      link2.rel = 'preconnect'
      link2.href = 'https://fonts.gstatic.com'
      link2.crossOrigin = 'anonymous'
      document.head.appendChild(link2)

      const fontLink = document.createElement('link')
      fontLink.rel = 'stylesheet'
      fontLink.href = currentTheme.typography.fontUrl
      document.head.appendChild(fontLink)
    }
  }, [currentThemeId, currentTheme])

  // Apply season to DOM
  useEffect(() => {
    const seasonToApply = currentSeasonId === 'auto' ? detectSeason(new Date()) : currentSeasonId
    document.documentElement.setAttribute('data-season', seasonToApply)
  }, [currentSeasonId])

  return (
    <>
      <AmbientBackground />
      {children}
    </>
  )
}
