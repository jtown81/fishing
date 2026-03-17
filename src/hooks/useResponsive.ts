/**
 * useResponsive Hook
 * Detects screen size and user preferences for responsive design
 */

import { useState, useEffect } from 'react'

export interface ResponsiveState {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  screenWidth: number
  prefersReducedMotion: boolean
  isLowEndDevice: boolean
}

const MOBILE_BREAKPOINT = 640
const TABLET_BREAKPOINT = 1024

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1024,
    prefersReducedMotion: false,
    isLowEndDevice: false,
  })

  useEffect(() => {
    const updateState = () => {
      const width = window.innerWidth
      const prefersReducedMotion =
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const isLowEndDevice =
        navigator.hardwareConcurrency !== undefined &&
        navigator.hardwareConcurrency <= 2

      setState({
        isMobile: width < MOBILE_BREAKPOINT,
        isTablet: width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT,
        isDesktop: width >= TABLET_BREAKPOINT,
        screenWidth: width,
        prefersReducedMotion,
        isLowEndDevice,
      })
    }

    // Initial check
    updateState()

    // Listen for resize
    window.addEventListener('resize', updateState)

    // Listen for prefers-reduced-motion changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    mediaQuery.addEventListener('change', updateState)

    return () => {
      window.removeEventListener('resize', updateState)
      mediaQuery.removeEventListener('change', updateState)
    }
  }, [])

  return state
}
