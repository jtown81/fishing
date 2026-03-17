/**
 * Animated Species Icon Component
 * Wrapper around species icons with animation variants
 * Respects prefers-reduced-motion and mobile optimizations
 */

import { useResponsive } from '@hooks/useResponsive'
import { WalleyeIcon, BassIcon, PikeIcon, MuskyIcon, SalmonIcon } from './SpeciesIcon'
import { useThemeStore } from '@store/theme-store'

interface AnimatedSpeciesIconProps {
  variant?: 'idle' | 'hero' | 'loading' | 'celebrate'
  size?: number
  className?: string
}

export function AnimatedSpeciesIcon({
  variant = 'idle',
  size = 64,
  className = ''
}: AnimatedSpeciesIconProps) {
  const { currentThemeId } = useThemeStore()
  const { prefersReducedMotion, isMobile } = useResponsive()

  // Determine if animation should be applied
  const shouldAnimate = !prefersReducedMotion && !isMobile

  // Map theme ID to icon component
  const iconComponents = {
    walleye: WalleyeIcon,
    bass: BassIcon,
    pike: PikeIcon,
    musky: MuskyIcon,
    salmon: SalmonIcon
  }

  const IconComponent = iconComponents[currentThemeId as keyof typeof iconComponents] || WalleyeIcon

  // Animation class names per variant
  const animationClasses = {
    idle: shouldAnimate ? `fish-swim-${currentThemeId}` : '',
    hero: shouldAnimate ? `fish-swim-${currentThemeId} fish-swim-large` : '',
    loading: shouldAnimate ? `fish-loading-spin` : '',
    celebrate: shouldAnimate ? `fish-celebrate-bounce` : ''
  }

  const animClass = animationClasses[variant] || ''

  return (
    <div
      className={`inline-block ${animClass} ${className}`}
      data-animate={shouldAnimate ? 'true' : 'false'}
      data-variant={variant}
    >
      <IconComponent size={size} animated={shouldAnimate} />
    </div>
  )
}
