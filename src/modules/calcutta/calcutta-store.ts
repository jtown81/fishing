/**
 * Zustand store for Calcutta state and operations
 */

import { create } from 'zustand'
import {
  generateCalcuttaGroups,
  updateGroupBuyer,
  type CalcuttaGroup
} from './calcutta-service'
import type { Team } from '@models/tournament'

interface CalcuttaStore {
  // State
  groups: CalcuttaGroup[]
  groupSize: 3 | 4
  tournamentId?: string

  // Actions
  generateGroups: (teams: Team[], groupSize: 3 | 4) => void
  updateBuyer: (groupId: string, buyer: string, amount: number) => void
  setGroups: (groups: CalcuttaGroup[]) => void
  clearGroups: () => void
  getGroup: (groupId: string) => CalcuttaGroup | undefined
}

export const useCalcuttaStore = create<CalcuttaStore>((set, get) => ({
  groups: [],
  groupSize: 4,
  tournamentId: undefined,

  generateGroups: (teams, groupSize) => {
    try {
      const newGroups = generateCalcuttaGroups(teams, groupSize)
      set({
        groups: newGroups,
        groupSize
      })
    } catch (error) {
      console.error('Failed to generate groups:', error)
    }
  },

  updateBuyer: (groupId, buyer, amount) => {
    set((state) => ({
      groups: state.groups.map(group =>
        group.id === groupId
          ? updateGroupBuyer(group, buyer, amount)
          : group
      )
    }))
  },

  setGroups: (groups) => {
    set({ groups })
  },

  clearGroups: () => {
    set({ groups: [] })
  },

  getGroup: (groupId) => {
    return get().groups.find(g => g.id === groupId)
  }
}))
