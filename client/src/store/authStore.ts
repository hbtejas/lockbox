import { create } from 'zustand'
import type { PlanTier, UserProfile } from '../types/domain'
import { supabase } from '../lib/supabase'

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
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      set({
        accessToken: session.access_token,
        user: {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || 'User',
          plan: 'free',
          createdAt: session.user.created_at,
          lastSignIn: session.user.last_sign_in_at,
        },
        initialized: true
      })
    } else {
      set({ initialized: true })
    }

    supabase.auth.onAuthStateChange((_, session) => {
      if (session) {
        set({
          accessToken: session.access_token,
          user: {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || 'User',
            plan: 'free',
            createdAt: session.user.created_at,
            lastSignIn: session.user.last_sign_in_at,
          },
        })
      } else {
        set({ accessToken: null, user: null })
      }
    })
  }
}))
