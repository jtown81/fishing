/**
 * Zustand store for angler profile state.
 */
import { create } from 'zustand'
import type { Angler, AnglerAppearance } from '@models/tournament'
import {
  getAllAnglers,
  createAngler as serviceCreate,
  updateAngler as serviceUpdate,
  deleteAngler as serviceDelete,
  linkAnglerToTeam as serviceLink,
  unlinkAppearance as serviceUnlink
} from './angler-service'

interface AnglerStore {
  anglers: Angler[]
  isLoading: boolean
  error: string | null

  loadAnglers: () => Promise<void>
  createAngler: (data: Omit<Angler, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Angler>
  updateAngler: (angler: Angler) => Promise<void>
  deleteAngler: (id: string) => Promise<void>
  linkToTeam: (anglerId: string, tournamentId: string, teamId: string, teamNumber: number) => Promise<AnglerAppearance>
  unlinkAppearance: (appearanceId: string) => Promise<void>
}

export const useAnglerStore = create<AnglerStore>((set) => ({
  anglers: [],
  isLoading: false,
  error: null,

  loadAnglers: async () => {
    set({ isLoading: true, error: null })
    try {
      const anglers = await getAllAnglers()
      set({ anglers })
    } catch (err) {
      set({ error: String(err) })
    } finally {
      set({ isLoading: false })
    }
  },

  createAngler: async (data) => {
    const angler = await serviceCreate(data)
    set((s) => ({ anglers: [...s.anglers, angler] }))
    return angler
  },

  updateAngler: async (angler) => {
    await serviceUpdate(angler)
    set((s) => ({
      anglers: s.anglers.map((a) => (a.id === angler.id ? { ...angler, updatedAt: new Date() } : a))
    }))
  },

  deleteAngler: async (id) => {
    await serviceDelete(id)
    set((s) => ({ anglers: s.anglers.filter((a) => a.id !== id) }))
  },

  linkToTeam: async (anglerId, tournamentId, teamId, teamNumber) => {
    return serviceLink(anglerId, tournamentId, teamId, teamNumber)
  },

  unlinkAppearance: async (appearanceId) => {
    await serviceUnlink(appearanceId)
    // Caller refreshes appearance lists as needed
  }
}))
