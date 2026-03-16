/**
 * Theme Switcher Component
 * Dropdown menu to select between 5 fish-species themes
 */

import { useThemeStore } from '@store/theme-store'
import { getAllThemes, ThemeConfig } from '@config/themes'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

export default function ThemeSwitcher() {
  const { currentThemeId, setTheme } = useThemeStore()
  const [isOpen, setIsOpen] = useState(false)
  const themes = getAllThemes()
  const currentTheme = themes.find((t: ThemeConfig) => t.id === currentThemeId)

  return (
    <div className="relative group">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 rounded-lg border-2 border-current hover:opacity-80 transition-opacity flex items-center gap-2"
        style={{
          borderColor: 'var(--color-accent)',
          color: 'var(--color-text)',
        }}
        title="Switch theme"
      >
        <span className="text-lg">{currentTheme?.icons.speciesEmoji}</span>
        <span className="text-sm font-semibold hidden sm:inline">{currentTheme?.name}</span>
        <ChevronDown size={16} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg border-2 z-50 py-2"
          style={{
            backgroundColor: 'var(--color-background)',
            borderColor: 'var(--color-border)',
          }}
        >
          {themes.map((theme: ThemeConfig) => (
            <button
              key={theme.id}
              onClick={() => {
                setTheme(theme.id)
                setIsOpen(false)
              }}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors hover:opacity-80 ${
                currentThemeId === theme.id ? 'font-bold' : ''
              }`}
              style={{
                backgroundColor:
                  currentThemeId === theme.id
                    ? 'rgba(0, 0, 0, 0.05)'
                    : 'transparent',
                color: 'var(--color-text)',
              }}
            >
              <span className="text-2xl">{theme.icons.speciesEmoji}</span>
              <div className="flex-1">
                <div className="font-semibold text-sm">{theme.name}</div>
                <div className="text-xs opacity-75">{theme.tagline}</div>
              </div>
              {currentThemeId === theme.id && (
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
