import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { http } from '../api/http'
import type { UserProfile } from '../types/domain'

interface AuthState {
  user: UserProfile | null
  accessToken: string | null
  loading: boolean
  // actions
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  setSession: (accessToken: string, user: UserProfile) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      loading: true,

      setSession: (accessToken, user) => {
        set({ accessToken, user, loading: false })
      },

      clearSession: () => {
        set({ accessToken: null, user: null, loading: false })
      },

      login: async (email, password) => {
        const { data } = await http.post('/auth/login', { email, password })
        const { accessToken, user } = data.data
        set({ accessToken, user, loading: false })
      },

      signup: async (email, password, name) => {
        const { data } = await http.post('/auth/signup', { email, password, name })
        const { accessToken, user } = data.data
        set({ accessToken, user, loading: false })
      },

      logout: async () => {
        try {
          await http.post('/auth/logout')
        } finally {
          set({ accessToken: null, user: null, loading: false })
        }
      },

      refreshUser: async () => {
        try {
          set({ loading: true })
          const { data } = await http.get('/auth/me')
          set({ user: data.data.user, loading: false })
        } catch {
          set({ accessToken: null, user: null, loading: false })
        }
      },
    }),
    {
      name: 'lockbox-auth-v2',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
    },
  ),
)
