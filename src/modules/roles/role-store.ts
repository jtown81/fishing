/**
 * Zustand store for tournament role/member state.
 */
import { create } from 'zustand'
import type { TournamentMember, TournamentRole } from './role-service'
import {
  fetchTournamentMembers,
  inviteMember as serviceInvite,
  removeMember as serviceRemove,
  getCurrentRole
} from './role-service'
import { useAuthStore } from '@modules/auth'

interface RoleStore {
  members: TournamentMember[]
  currentRole: TournamentRole | null
  isLoading: boolean
  error: string | null

  loadMembers: (tournamentId: string) => Promise<void>
  inviteMember: (tournamentId: string, email: string, role: 'operator' | 'viewer') => Promise<{ error?: string }>
  removeMember: (tournamentId: string, userId: string) => Promise<{ error?: string }>
  reset: () => void
}

export const useRoleStore = create<RoleStore>((set) => ({
  members: [],
  currentRole: null,
  isLoading: false,
  error: null,

  loadMembers: async (tournamentId) => {
    set({ isLoading: true, error: null })
    try {
      const { session, user } = useAuthStore.getState()
      const [members, role] = await Promise.all([
        fetchTournamentMembers(session, tournamentId),
        user ? getCurrentRole(session, tournamentId, user.id) : Promise.resolve(null)
      ])
      set({ members, currentRole: role })
    } catch (err) {
      set({ error: String(err) })
    } finally {
      set({ isLoading: false })
    }
  },

  inviteMember: async (tournamentId, email, role) => {
    const { session } = useAuthStore.getState()
    const result = await serviceInvite(session, tournamentId, email, role)
    if (!result.error) {
      // Refresh members list
      const members = await fetchTournamentMembers(session, tournamentId)
      set({ members })
    }
    return result
  },

  removeMember: async (tournamentId, userId) => {
    const { session } = useAuthStore.getState()
    const result = await serviceRemove(session, tournamentId, userId)
    if (!result.error) {
      set((s) => ({ members: s.members.filter((m) => m.userId !== userId) }))
    }
    return result
  },

  reset: () => set({ members: [], currentRole: null, error: null })
}))
