/**
 * Ambient Background Component
 * SVG water layer with animated sine-wave ripples
 * Disabled on mobile and when prefers-reduced-motion is set
 */

import { useResponsive } from '@hooks/useResponsive'
import { useThemeStore } from '@store/theme-store'

interface AmbientBackgroundProps {
  opacity?: number
}

export default function AmbientBackground({ opacity = 0.05 }: AmbientBackgroundProps) {
  const { prefersReducedMotion, isMobile } = useResponsive()
  const { currentTheme } = useThemeStore()

  // Disable on mobile or if user prefers reduced motion
  if (isMobile || prefersReducedMotion) {
    return null
  }

  const bgColor = currentTheme.colors.accent || '#daa520'

  return (
    <svg
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{
        zIndex: -1,
        opacity,
        backgroundColor: 'transparent'
      }}
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Wave 1 - slow, large amplitude */}
      <path
        d="M0,450 Q360,380 720,450 T1440,450"
        stroke={bgColor}
        strokeWidth="2"
        fill="none"
        opacity="0.6"
        className="water-wave-1"
      />

      {/* Wave 2 - medium speed, medium amplitude */}
      <path
        d="M0,480 Q360,420 720,480 T1440,480"
        stroke={bgColor}
        strokeWidth="2"
        fill="none"
        opacity="0.4"
        className="water-wave-2"
      />

      {/* Wave 3 - fast, small amplitude */}
      <path
        d="M0,510 Q360,490 720,510 T1440,510"
        stroke={bgColor}
        strokeWidth="1.5"
        fill="none"
        opacity="0.3"
        className="water-wave-3"
      />

      <defs>
        <filter id="water-blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
        </filter>
      </defs>
    </svg>
  )
}
