import { create } from 'zustand'
import type { PlanTier, UserProfile } from '../types/domain'
import { me } from '../api/authApi'

interface AuthState {
  accessToken: string | null
  user: UserProfile | null
  initialized: boolean
  setSession: (accessToken: string, user: UserProfile) => void
  clearSession: () => void
  updatePlan: (plan: PlanTier) => void
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  initialized: false,
  setSession: (accessToken, user) => {
    set({ accessToken, user })
  },
  clearSession: () => {
    set({ accessToken: null, user: null })
  },
  updatePlan: (plan) =>
    set((state) => ({
      user: state.user ? { ...state.user, plan } : null,
    })),
  initialize: async () => {
    try {
      // Try to restore session by calling /auth/me with existing cookie
      const user = await me()
      if (user) {
        set({
          user,
          initialized: true,
        })
      } else {
        set({ initialized: true })
      }
    } catch {
      set({ initialized: true })
    }
  },
}))
