/**
 * useThemeMessage Hook
 * Manages theme-aware message display with achievement tracking
 */

import { useState, useCallback } from 'react'
import { useThemeStore } from '@store/theme-store'
import {
  getDashboardMessage,
  getTournamentStartMessage,
  getEndOfDayMessage,
  getCongratulationsMessage,
  ThemeId,
} from '@data/theme-messaging'

export interface MessageState {
  message: string
  type: 'success' | 'info' | 'achievement'
  isVisible: boolean
}

export function useThemeMessage() {
  const { currentThemeId } = useThemeStore()
  const [messageState, setMessageState] = useState<MessageState>({
    message: '',
    type: 'info',
    isVisible: false,
  })

  const showMessage = useCallback(
    (message: string, type: 'success' | 'info' | 'achievement' = 'info') => {
      setMessageState({
        message,
        type,
        isVisible: true,
      })
    },
    []
  )

  const hideMessage = useCallback(() => {
    setMessageState((prev) => ({ ...prev, isVisible: false }))
  }, [])

  const showDashboardMessage = useCallback(() => {
    showMessage(getDashboardMessage(currentThemeId as ThemeId), 'info')
  }, [currentThemeId, showMessage])

  const showTournamentStart = useCallback(() => {
    showMessage(
      getTournamentStartMessage(currentThemeId as ThemeId),
      'success'
    )
  }, [currentThemeId, showMessage])

  const showEndOfDay = useCallback(() => {
    showMessage(getEndOfDayMessage(currentThemeId as ThemeId), 'info')
  }, [currentThemeId, showMessage])

  const showAchievement = useCallback(
    (
      type: 'newRecord' | 'bigCatch' | 'consistent' | 'improved' | 'teamwork'
    ) => {
      showMessage(
        getCongratulationsMessage(currentThemeId as ThemeId, type),
        'achievement'
      )
    },
    [currentThemeId, showMessage]
  )

  return {
    ...messageState,
    showMessage,
    hideMessage,
    showDashboardMessage,
    showTournamentStart,
    showEndOfDay,
    showAchievement,
  }
}
