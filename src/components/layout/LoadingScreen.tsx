/**
 * Loading Screen Component
 * Themed loading screen with animated species icon
 * Replaces bare "Loading..." div in App.tsx
 */

import { AnimatedSpeciesIcon } from '@components/icons/AnimatedSpeciesIcon'
import { useThemeStore } from '@store/theme-store'

export default function LoadingScreen() {
  const { currentTheme } = useThemeStore()

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen"
      style={{
        backgroundColor: currentTheme.colors.background,
        color: currentTheme.colors.text
      }}
    >
      <div className="flex flex-col items-center space-y-6">
        {/* Animated species icon */}
        <AnimatedSpeciesIcon variant="loading" size={80} />

        {/* Loading text */}
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold">Loading Tournament</p>
          <p className="text-sm opacity-60">Preparing your experience...</p>
        </div>

        {/* Loading indicator dots */}
        <div className="flex space-x-2">
          <div
            className="w-2 h-2 rounded-full animate-bounce"
            style={{
              backgroundColor: currentTheme.colors.primary,
              animationDelay: '0ms'
            }}
          />
          <div
            className="w-2 h-2 rounded-full animate-bounce"
            style={{
              backgroundColor: currentTheme.colors.primary,
              animationDelay: '150ms'
            }}
          />
          <div
            className="w-2 h-2 rounded-full animate-bounce"
            style={{
              backgroundColor: currentTheme.colors.primary,
              animationDelay: '300ms'
            }}
          />
        </div>
      </div>
    </div>
  )
}
