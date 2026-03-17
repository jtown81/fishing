/**
 * Theme Message Display Component
 * Shows themed achievement/milestone messages with animations
 */

import { useThemeStore } from '@store/theme-store'
import { X } from 'lucide-react'
import { useState, useEffect } from 'react'

interface ThemeMessageProps {
  message: string
  type?: 'success' | 'info' | 'achievement'
  autoClose?: boolean
  autoCloseDuration?: number
  onClose?: () => void
}

export default function ThemeMessage({
  message,
  type = 'info',
  autoClose = true,
  autoCloseDuration = 5000,
  onClose,
}: ThemeMessageProps) {
  const { currentTheme } = useThemeStore()
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (!autoClose) return

    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, autoCloseDuration)

    return () => clearTimeout(timer)
  }, [autoClose, autoCloseDuration, onClose])

  if (!isVisible) return null

  const bgColor =
    type === 'success'
      ? currentTheme.colors.accent
      : type === 'achievement'
        ? currentTheme.colors.primary
        : currentTheme.colors.secondary

  return (
    <div
      className="fixed top-6 right-6 max-w-md rounded-lg shadow-2xl p-4 flex items-start gap-4 z-50 animate-slide-down border-2"
      style={{
        backgroundColor: 'white',
        borderColor: bgColor,
        animation: 'slideInDown 500ms ease-out',
      }}
      data-animate-in="slide-down"
    >
      <div className="flex-1">
        <p
          className="text-sm font-semibold leading-relaxed"
          style={{ color: bgColor }}
        >
          {message}
        </p>
      </div>
      <button
        onClick={() => {
          setIsVisible(false)
          onClose?.()
        }}
        className="flex-shrink-0 p-1 hover:opacity-60 transition-opacity"
        style={{ color: bgColor }}
      >
        <X size={16} />
      </button>
    </div>
  )
}
