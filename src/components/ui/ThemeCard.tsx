/**
 * Theme-Aware Card Component
 * Card with theme-aware borders and styling
 */

import { useThemeStore } from '@store/theme-store'

interface ThemeCardProps {
  children: React.ReactNode
  className?: string
  interactive?: boolean
}

export default function ThemeCard({
  children,
  className = '',
  interactive = false,
}: ThemeCardProps) {
  const { currentTheme } = useThemeStore()

  return (
    <div
      className={`rounded-lg p-4 transition-all duration-200 ${interactive ? 'cursor-pointer hover:shadow-lg' : ''} ${className}`}
      style={{
        backgroundColor: 'white',
        border: `2px solid ${currentTheme.colors.border}`,
        boxShadow: interactive
          ? `0 0 0 0 ${currentTheme.colors.accent}00`
          : '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}
      onMouseEnter={(e) => {
        if (interactive) {
          e.currentTarget.style.borderColor = currentTheme.colors.accent
          e.currentTarget.style.boxShadow = `0 4px 12px ${currentTheme.colors.accent}20`
        }
      }}
      onMouseLeave={(e) => {
        if (interactive) {
          e.currentTarget.style.borderColor = currentTheme.colors.border
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      {children}
    </div>
  )
}
