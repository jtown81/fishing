/**
 * Zustand store for authentication state.
 * Depends on auth-service which is a no-op when Supabase is unconfigured.
 */
import { create } from 'zustand'
import type { User, Session } from './auth-service'
import {
  getSession,
  signIn as serviceSignIn,
  signUp as serviceSignUp,
  signOut as serviceSignOut,
  onAuthChange
} from './auth-service'

interface AuthStore {
  user: User | null
  session: Session | null
  isLoading: boolean

  /** Restore session from storage and start the auth state listener. */
  initAuth: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  isLoading: false,

  initAuth: async () => {
    set({ isLoading: true })
    try {
      const session = await getSession()
      set({ session, user: session?.user ?? null })

      // Start auth state listener (runs for lifetime of app)
      onAuthChange((user, session) => {
        set({ user, session })
      })
    } finally {
      set({ isLoading: false })
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true })
    try {
      return await serviceSignIn(email, password)
    } finally {
      set({ isLoading: false })
    }
  },

  signUp: async (email, password) => {
    set({ isLoading: true })
    try {
      return await serviceSignUp(email, password)
    } finally {
      set({ isLoading: false })
    }
  },

  signOut: async () => {
    await serviceSignOut()
    set({ user: null, session: null })
  }
}))
