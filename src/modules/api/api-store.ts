/**
 * Zustand store for API key management
 */

import { create } from 'zustand'
import { generateAPIKey, deleteAPIKey, listAPIKeys } from './api-service'
import type { APIKey } from './api-service'

interface APIStore {
  keys: APIKey[]
  isLoading: boolean
  error: string | null

  loadKeys: () => Promise<void>
  createKey: (name: string) => Promise<string>
  removeKey: (id: string) => Promise<void>
}

export const useAPIStore = create<APIStore>((set) => ({
  keys: [],
  isLoading: false,
  error: null,

  loadKeys: async () => {
    set({ isLoading: true, error: null })
    try {
      const keys = await listAPIKeys()
      set({ keys })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load API keys'
      set({ error: message })
    } finally {
      set({ isLoading: false })
    }
  },

  createKey: async (name: string) => {
    set({ isLoading: true, error: null })
    try {
      const key = await generateAPIKey(name)
      // Reload keys list
      const keys = await listAPIKeys()
      set({ keys })
      return key
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create API key'
      set({ error: message })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },

  removeKey: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await deleteAPIKey(id)
      // Reload keys list
      const keys = await listAPIKeys()
      set({ keys })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete API key'
      set({ error: message })
      throw err
    } finally {
      set({ isLoading: false })
    }
  }
}))
