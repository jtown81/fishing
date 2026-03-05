/**
 * Zustand store for weigh-in state and operations
 */

import { create } from 'zustand'
import { db } from '@db/database'
import type { WeighIn } from '@models/tournament'

interface WeighInStore {
  // State
  weighIns: WeighIn[]
  isLoading: boolean

  // Actions
  loadWeighIns: (tournamentId: string) => Promise<void>
  addWeighIn: (weighIn: Omit<WeighIn, 'id' | 'createdAt' | 'updatedAt'>) => Promise<WeighIn>
  updateWeighIn: (weighIn: WeighIn) => Promise<void>
  deleteWeighIn: (id: string) => Promise<void>
  getTeamWeighIns: (teamId: string, day?: 1 | 2) => WeighIn[]
}

export const useWeighInStore = create<WeighInStore>((set, get) => ({
  weighIns: [],
  isLoading: false,

  loadWeighIns: async (tournamentId) => {
    set({ isLoading: true })
    try {
      const weighIns = await db.weighIns
        .where('tournamentId')
        .equals(tournamentId)
        .toArray()
      set({ weighIns })
    } finally {
      set({ isLoading: false })
    }
  },

  addWeighIn: async (weighIn) => {
    const now = new Date()
    const newWeighIn: WeighIn = {
      id: `weighin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...weighIn,
      timestamp: weighIn.timestamp || now,
      createdAt: now,
      updatedAt: now
    }

    await db.weighIns.add(newWeighIn)
    set((state) => ({
      weighIns: [...state.weighIns, newWeighIn]
    }))

    return newWeighIn
  },

  updateWeighIn: async (weighIn) => {
    const updated = {
      ...weighIn,
      updatedAt: new Date()
    }

    await db.weighIns.put(updated)
    set((state) => ({
      weighIns: state.weighIns.map(w =>
        w.id === weighIn.id ? updated : w
      )
    }))
  },

  deleteWeighIn: async (id) => {
    await db.weighIns.delete(id)
    set((state) => ({
      weighIns: state.weighIns.filter(w => w.id !== id)
    }))
  },

  getTeamWeighIns: (teamId, day) => {
    const { weighIns } = get()
    return weighIns.filter(
      w => w.teamId === teamId && (!day || w.day === day)
    )
  }
}))
