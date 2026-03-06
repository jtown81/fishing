/**
 * Zustand store for team state and operations
 */

import { create } from 'zustand'
import { db } from '@db/database'
import type { Team } from '@models/tournament'
import { enqueueMutation } from '@modules/sync/sync-engine'

interface TeamStore {
  // State
  teams: Team[]
  isLoading: boolean

  // Actions
  loadTeams: (tournamentId: string) => Promise<void>
  addTeam: (team: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Team>
  updateTeam: (team: Team) => Promise<void>
  deleteTeam: (id: string) => Promise<void>
  upsertTeam: (team: Team) => void
  getTeamByNumber: (tournamentId: string, teamNumber: number) => Promise<Team | undefined>
}

export const useTeamStore = create<TeamStore>((set) => ({
  teams: [],
  isLoading: false,

  loadTeams: async (tournamentId) => {
    set({ isLoading: true })
    try {
      const teams = await db.teams.where('tournamentId').equals(tournamentId).toArray()
      set({ teams })
    } finally {
      set({ isLoading: false })
    }
  },

  addTeam: async (team) => {
    const now = new Date()
    const newTeam: Team = {
      id: `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...team,
      createdAt: now,
      updatedAt: now
    }

    await db.teams.add(newTeam)
    set((state) => ({
      teams: [...state.teams, newTeam]
    }))

    enqueueMutation({
      entityType: 'team',
      entityId: newTeam.id,
      action: 'upsert',
      payload: newTeam,
      timestamp: new Date()
    }).catch(() => {})

    return newTeam
  },

  updateTeam: async (team) => {
    const updated = {
      ...team,
      updatedAt: new Date()
    }

    await db.teams.put(updated)
    set((state) => ({
      teams: state.teams.map(t =>
        t.id === team.id ? updated : t
      )
    }))

    enqueueMutation({
      entityType: 'team',
      entityId: updated.id,
      action: 'upsert',
      payload: updated,
      timestamp: new Date()
    }).catch(() => {})
  },

  deleteTeam: async (id) => {
    await db.teams.delete(id)
    set((state) => ({
      teams: state.teams.filter(t => t.id !== id)
    }))

    enqueueMutation({
      entityType: 'team',
      entityId: id,
      action: 'delete',
      payload: {},
      timestamp: new Date()
    }).catch(() => {})
  },

  // Called by realtime subscription to merge remote team into local state
  upsertTeam: (team) => {
    set((state) => {
      const exists = state.teams.some(t => t.id === team.id)
      if (exists) {
        return { teams: state.teams.map(t => t.id === team.id ? team : t) }
      }
      return { teams: [...state.teams, team] }
    })
  },

  getTeamByNumber: async (tournamentId, teamNumber) => {
    return db.teams
      .where('tournamentId')
      .equals(tournamentId)
      .filter(t => t.teamNumber === teamNumber)
      .first()
  }
}))
