/**
 * Animated Trophy Component
 * Tier-specific SVG trophy with CSS glow animations
 */

import { TierLevel } from '@modules/hall-of-fame'
import { useResponsive } from '@hooks/useResponsive'

interface AnimatedTrophyProps {
  tier: TierLevel
  size?: number
  animated?: boolean
}

const TIER_COLORS: Record<TierLevel, { fill: string; glow: string; label: string; emoji: string }> = {
  bronze: {
    fill: '#CD7F32',
    glow: 'rgba(205, 127, 50, 0.6)',
    label: 'Bronze',
    emoji: '🥉'
  },
  silver: {
    fill: '#C0C0C0',
    glow: 'rgba(192, 192, 192, 0.6)',
    label: 'Silver',
    emoji: '🥈'
  },
  gold: {
    fill: '#FFD700',
    glow: 'rgba(255, 215, 0, 0.8)',
    label: 'Gold',
    emoji: '🥇'
  },
  legendary: {
    fill: '#FF1493',
    glow: 'rgba(255, 20, 147, 0.9)',
    label: 'Legendary',
    emoji: '⭐'
  }
}

export default function AnimatedTrophy({
  tier,
  size = 64,
  animated = true
}: AnimatedTrophyProps) {
  const { prefersReducedMotion } = useResponsive()
  const tierColors = TIER_COLORS[tier]
  const shouldAnimate = animated && !prefersReducedMotion

  const animationClass = shouldAnimate ? 'animate-pulse' : ''

  return (
    <div className={`inline-flex flex-col items-center gap-2 ${animationClass}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: shouldAnimate ? `drop-shadow(0 0 8px ${tierColors.glow})` : 'none',
          transition: 'filter 0.3s ease'
        }}
      >
        {/* Cup body */}
        <path
          d="M 16 20 L 20 12 L 44 12 L 48 20 Z"
          fill={tierColors.fill}
          stroke={tierColors.fill}
          strokeWidth="1.5"
          opacity="0.9"
        />

        {/* Cup opening */}
        <ellipse cx="32" cy="20" rx="16" ry="4" fill="none" stroke={tierColors.fill} strokeWidth="1.5" />

        {/* Cup sides */}
        <path
          d="M 20 20 Q 16 32 20 40 L 44 40 Q 48 32 44 20"
          fill={tierColors.fill}
          opacity="0.85"
        />

        {/* Cup handles */}
        <path d="M 20 24 Q 8 28 8 36" stroke={tierColors.fill} strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M 44 24 Q 56 28 56 36" stroke={tierColors.fill} strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Stem */}
        <rect x="28" y="40" width="8" height="12" fill={tierColors.fill} opacity="0.8" />

        {/* Base */}
        <ellipse cx="32" cy="52" rx="18" ry="4" fill={tierColors.fill} opacity="0.7" />
        <path d="M 14 52 L 50 52" stroke={tierColors.fill} strokeWidth="2" opacity="0.5" />

        {/* Star on top for legendary */}
        {tier === 'legendary' && (
          <path
            d="M 32 2 L 34 8 L 40 8 L 35 12 L 37 18 L 32 14 L 27 18 L 29 12 L 24 8 L 30 8 Z"
            fill={tierColors.fill}
            opacity="1"
          />
        )}

        {/* Shine effect */}
        <ellipse
          cx="32"
          cy="26"
          rx="6"
          ry="8"
          fill="white"
          opacity={shouldAnimate ? 0.4 : 0.2}
          style={{
            animation: shouldAnimate
              ? 'shine 2s ease-in-out infinite'
              : 'none'
          }}
        />
      </svg>

      {/* Tier label */}
      <div className="text-xs font-semibold text-center" style={{ color: tierColors.fill }}>
        {tierColors.emoji} {tierColors.label}
      </div>

      <style>{`
        @keyframes shine {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  )
}
