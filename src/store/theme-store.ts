/**
 * Theme Store
 * Manages current theme and season selection with localStorage persistence
 */

import { create } from 'zustand'
import { DEFAULT_THEME_ID, ThemeConfig, getThemeConfig } from '@config/themes'
import { SeasonId } from '@config/seasons'

interface ThemeStore {
  currentThemeId: string
  currentTheme: ThemeConfig
  currentSeasonId: SeasonId
  setTheme: (themeId: string) => void
  setSeason: (seasonId: SeasonId) => void
  loadTheme: () => void
}

const THEME_STORAGE_KEY = 'fishing:theme'
const SEASON_STORAGE_KEY = 'fishing:season'

export const useThemeStore = create<ThemeStore>((set) => ({
  currentThemeId: DEFAULT_THEME_ID,
  currentTheme: getThemeConfig(DEFAULT_THEME_ID),
  currentSeasonId: 'auto',

  setTheme: (themeId: string) => {
    const theme = getThemeConfig(themeId)
    set({
      currentThemeId: themeId,
      currentTheme: theme,
      currentSeasonId: 'auto', // Reset season when theme changes
    })
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, themeId)
      localStorage.setItem(SEASON_STORAGE_KEY, 'auto')
    }
  },

  setSeason: (seasonId: SeasonId) => {
    set({ currentSeasonId: seasonId })
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(SEASON_STORAGE_KEY, seasonId)
    }
  },

  loadTheme: () => {
    if (typeof window === 'undefined') return
    const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME_ID
    const savedSeasonId = (localStorage.getItem(SEASON_STORAGE_KEY) || 'auto') as SeasonId
    const theme = getThemeConfig(savedThemeId)
    set({
      currentThemeId: savedThemeId,
      currentTheme: theme,
      currentSeasonId: savedSeasonId,
    })
  },
}))
