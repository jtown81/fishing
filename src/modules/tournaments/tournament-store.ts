/**
 * Zustand store for tournament state and operations
 */

import { create } from 'zustand'
import { db } from '@db/database'
import type { Tournament } from '@models/tournament'
import { enqueueMutation } from '@modules/sync/sync-engine'
import { useSubscriptionStore } from '@modules/subscription'
import { useRoleStore } from '@modules/roles'

interface TournamentStore {
  // State
  currentTournament: Tournament | null
  tournaments: Tournament[]
  isLoading: boolean

  // Actions
  setCurrentTournament: (tournament: Tournament | null) => void
  loadTournaments: () => Promise<void>
  createTournament: (tournament: Omit<Tournament, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Tournament>
  updateTournament: (tournament: Tournament) => Promise<void>
  deleteTournament: (id: string) => Promise<void>
}

export const useTournamentStore = create<TournamentStore>((set) => ({
  currentTournament: null,
  tournaments: [],
  isLoading: false,

  setCurrentTournament: (tournament) => set({ currentTournament: tournament }),

  loadTournaments: async () => {
    set({ isLoading: true })
    try {
      const tournaments = await db.tournaments.toArray()
      set({ tournaments })
    } finally {
      set({ isLoading: false })
    }
  },

  createTournament: async (tournament) => {
    // Enforce Free tier limit: max 1 tournament
    const { tier } = useSubscriptionStore.getState()
    const existingCount = await db.tournaments.count()
    if (tier === 'free' && existingCount >= 1) {
      throw new Error('FREE_TIER_LIMIT')
    }

    const now = new Date()
    const newTournament: Tournament = {
      id: `tournament-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...tournament,
      createdAt: now,
      updatedAt: now
    }

    await db.tournaments.add(newTournament)
    set((state) => ({
      tournaments: [...state.tournaments, newTournament]
    }))

    enqueueMutation({
      entityType: 'tournament',
      entityId: newTournament.id,
      action: 'upsert',
      payload: newTournament,
      timestamp: new Date()
    }).catch(() => {})

    return newTournament
  },

  updateTournament: async (tournament) => {
    const updated = {
      ...tournament,
      updatedAt: new Date()
    }

    await db.tournaments.put(updated)
    set((state) => ({
      tournaments: state.tournaments.map(t =>
        t.id === tournament.id ? updated : t
      ),
      currentTournament:
        state.currentTournament?.id === tournament.id
          ? updated
          : state.currentTournament
    }))

    enqueueMutation({
      entityType: 'tournament',
      entityId: updated.id,
      action: 'upsert',
      payload: updated,
      timestamp: new Date()
    }).catch(() => {})
  },

  deleteTournament: async (id) => {
    // Only the owner (or local-only users with no role set) can delete
    const { currentRole } = useRoleStore.getState()
    if (currentRole !== null && currentRole !== 'owner') {
      throw new Error('Only the tournament owner can delete it')
    }

    await db.tournaments.delete(id)
    set((state) => ({
      tournaments: state.tournaments.filter(t => t.id !== id),
      currentTournament:
        state.currentTournament?.id === id ? null : state.currentTournament
    }))

    enqueueMutation({
      entityType: 'tournament',
      entityId: id,
      action: 'delete',
      payload: {},
      timestamp: new Date()
    }).catch(() => {})
  }
}))
