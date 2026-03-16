/**
 * Theme Provider Component
 * Applies theme configuration and loads font files
 */

import { useEffect } from 'react'
import { useThemeStore } from '@store/theme-store'

interface ThemeProviderProps {
  children: React.ReactNode
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const { currentThemeId, currentTheme, loadTheme } = useThemeStore()

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

  return <>{children}</>
}
