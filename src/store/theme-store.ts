/**
 * Theme Store
 * Manages current theme selection with localStorage persistence
 */

import { create } from 'zustand'
import { DEFAULT_THEME_ID, ThemeConfig, getThemeConfig } from '@config/themes'

interface ThemeStore {
  currentThemeId: string
  currentTheme: ThemeConfig
  setTheme: (themeId: string) => void
  loadTheme: () => void
}

const THEME_STORAGE_KEY = 'fishing:theme'

export const useThemeStore = create<ThemeStore>((set) => ({
  currentThemeId: DEFAULT_THEME_ID,
  currentTheme: getThemeConfig(DEFAULT_THEME_ID),

  setTheme: (themeId: string) => {
    const theme = getThemeConfig(themeId)
    set({
      currentThemeId: themeId,
      currentTheme: theme,
    })
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, themeId)
    }
  },

  loadTheme: () => {
    if (typeof window === 'undefined') return
    const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME_ID
    const theme = getThemeConfig(savedThemeId)
    set({
      currentThemeId: savedThemeId,
      currentTheme: theme,
    })
  },
}))
