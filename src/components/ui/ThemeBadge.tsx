/**
 * Theme-Aware Badge Component
 * Small label with theme colors
 */

import { useThemeStore } from '@store/theme-store'

interface ThemeBadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'primary' | 'accent' | 'secondary'
}

export default function ThemeBadge({
  children,
  className = '',
  variant = 'accent',
}: ThemeBadgeProps) {
  const { currentTheme } = useThemeStore()

  const colorMap = {
    primary: {
      backgroundColor: currentTheme.colors.primary,
      color: 'white',
    },
    accent: {
      backgroundColor: currentTheme.colors.accent,
      color: currentTheme.colors.text,
    },
    secondary: {
      backgroundColor: currentTheme.colors.secondary,
      color: 'white',
    },
  }

  const style = colorMap[variant]

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all duration-200 ${className}`}
      style={{
        ...style,
      }}
    >
      {children}
    </span>
  )
}
