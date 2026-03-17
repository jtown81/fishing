/**
 * Achievement Badge Component
 * Displays themed achievement/milestone badges with animations
 */

import { useThemeStore } from '@store/theme-store'

interface AchievementBadgeProps {
  title: string
  description: string
  icon: string // emoji
  type?: 'bronze' | 'silver' | 'gold' | 'legendary'
  animated?: boolean
  className?: string
}

export default function AchievementBadge({
  title,
  description,
  icon,
  type = 'bronze',
  animated = true,
  className = '',
}: AchievementBadgeProps) {
  const { currentTheme } = useThemeStore()

  const borderColors = {
    bronze: 'rgba(205, 127, 50, 0.7)',
    silver: 'rgba(192, 192, 192, 0.7)',
    gold: currentTheme.colors.accent,
    legendary: currentTheme.colors.primary,
  }

  const bgColors = {
    bronze: 'rgba(205, 127, 50, 0.1)',
    silver: 'rgba(192, 192, 192, 0.1)',
    gold: `rgba(${parseInt(currentTheme.colors.accent.slice(1, 3), 16)}, ${parseInt(currentTheme.colors.accent.slice(3, 5), 16)}, ${parseInt(currentTheme.colors.accent.slice(5, 7), 16)}, 0.1)`,
    legendary: `rgba(${parseInt(currentTheme.colors.primary.slice(1, 3), 16)}, ${parseInt(currentTheme.colors.primary.slice(3, 5), 16)}, ${parseInt(currentTheme.colors.primary.slice(5, 7), 16)}, 0.1)`,
  }

  return (
    <div
      className={`p-4 rounded-lg border-2 flex items-start gap-4 transition-all duration-300 ${
        animated ? 'animate-pulse hover:animate-none' : ''
      } ${className}`}
      style={{
        borderColor: borderColors[type],
        backgroundColor: bgColors[type],
      }}
    >
      <div className="text-4xl">{icon}</div>
      <div className="flex-1">
        <h3 className="font-bold text-lg" style={{ color: borderColors[type] }}>
          {title}
        </h3>
        <p className="text-sm mt-1" style={{ color: currentTheme.colors.text, opacity: 0.8 }}>
          {description}
        </p>
      </div>
      {type === 'gold' && <span className="text-2xl">✨</span>}
      {type === 'legendary' && <span className="text-2xl">⭐</span>}
    </div>
  )
}
