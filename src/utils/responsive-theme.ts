/**
 * Responsive Theme Utilities
 * Helpers for optimizing theme experience based on device capabilities
 */

/**
 * Determine if animations should be enabled based on device
 */
export function shouldEnableAnimations(
  _isMobile: boolean,
  isLowEndDevice: boolean,
  prefersReducedMotion: boolean
): boolean {
  // Disable animations for:
  // - Users who prefer reduced motion
  // - Low-end devices (detected by CPU cores)
  // - Mobile devices by default (but can be overridden)
  if (prefersReducedMotion) return false
  if (isLowEndDevice) return false

  // Allow animations on modern devices
  return true
}

/**
 * Get optimized animation duration based on device
 */
export function getAnimationDuration(
  isMobile: boolean,
  isLowEndDevice: boolean
): string {
  if (isLowEndDevice) {
    return '100ms' // Very fast for low-end devices
  }

  if (isMobile) {
    return '200ms' // Fast for mobile
  }

  return '300ms' // Standard for desktop
}

/**
 * Get optimized touch target size
 */
export function getTouchTargetSize(isMobile: boolean): string {
  if (isMobile) {
    return '44px' // iOS recommended minimum
  }

  return '36px' // Desktop standard
}

/**
 * Get responsive font size
 */
export function getResponsiveFontSize(
  isMobile: boolean,
  baseSize: number
): string {
  if (isMobile) {
    return `${Math.max(baseSize * 0.875, 12)}px` // Slightly smaller on mobile
  }

  return `${baseSize}px`
}

/**
 * Get responsive padding
 */
export function getResponsivePadding(
  isMobile: boolean,
  baseValue: number
): string {
  if (isMobile) {
    return `${Math.round(baseValue * 0.75)}px` // 75% of base on mobile
  }

  return `${baseValue}px`
}

/**
 * Get responsive gap between elements
 */
export function getResponsiveGap(isMobile: boolean, baseValue: number): string {
  if (isMobile) {
    return `${Math.round(baseValue * 0.5)}px` // 50% of base on mobile
  }

  return `${baseValue}px`
}

/**
 * Get optimized opacity for performance
 */
export function getOptimizedOpacity(
  isMobile: boolean,
  baseOpacity: number
): number {
  if (isMobile) {
    // Reduce opacity complexity on mobile
    return Math.round(baseOpacity * 100) / 100
  }

  return baseOpacity
}

/**
 * Determine if we should use simplified gradients
 */
export function useSimplifiedGradients(
  _isMobile: boolean,
  isLowEndDevice: boolean
): boolean {
  // Use simplified gradients on low-end devices
  if (isLowEndDevice) return true

  // Optional: Use simplified gradients on mobile to reduce GPU load
  // return _isMobile
  return false
}
