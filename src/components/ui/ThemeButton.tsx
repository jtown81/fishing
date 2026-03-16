/**
 * Theme-Aware Button Component
 * Automatically styled based on current theme
 */

import { ButtonHTMLAttributes } from 'react'
import { useThemeStore } from '@store/theme-store'

interface ThemeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export default function ThemeButton({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ThemeButtonProps) {
  const { currentTheme } = useThemeStore()

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  const baseStyles = `
    rounded-lg font-medium
    transition-all duration-200
    active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-offset-2
  `

  const variantStyles = {
    primary: {
      backgroundColor: currentTheme.colors.primary,
      color: 'white',
      border: `2px solid ${currentTheme.colors.primary}`,
      focusRing: currentTheme.colors.accent,
    },
    accent: {
      backgroundColor: currentTheme.colors.accent,
      color: currentTheme.colors.text,
      border: `2px solid ${currentTheme.colors.accent}`,
      focusRing: currentTheme.colors.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: currentTheme.colors.primary,
      border: `2px solid ${currentTheme.colors.border}`,
      focusRing: currentTheme.colors.accent,
    },
  }

  const style = {
    ...variantStyles[variant],
    focusRingColor: variantStyles[variant].focusRing,
  }

  return (
    <button
      className={`${baseStyles} ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: style.backgroundColor,
        color: style.color,
        borderColor: style.border.split(' ')[2],
      }}
      onMouseEnter={(e) => {
        if (variant === 'primary') {
          e.currentTarget.style.backgroundColor = currentTheme.colors.accent
          e.currentTarget.style.borderColor = currentTheme.colors.accent
        } else if (variant === 'accent') {
          e.currentTarget.style.backgroundColor = currentTheme.colors.primary
          e.currentTarget.style.borderColor = currentTheme.colors.primary
          e.currentTarget.style.color = 'white'
        } else {
          e.currentTarget.style.backgroundColor = currentTheme.colors.accent + '20'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = style.backgroundColor
        e.currentTarget.style.borderColor = style.border.split(' ')[2]
        if (variant !== 'accent') {
          e.currentTarget.style.color = style.color
        }
      }}
      {...props}
    >
      {children}
    </button>
  )
}
