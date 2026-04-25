import { supabase } from '../lib/supabase'
import type { UserProfile } from '../types/domain'

export interface AuthPayload {
  name?: string
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  user: UserProfile
}

export async function signup(payload: AuthPayload): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        name: payload.name,
      },
    },
  })

  if (error) throw error
  if (!data.user || !data.session) throw new Error('Signup failed')

  return {
    accessToken: data.session.access_token,
    user: {
      id: data.user.id,
      email: data.user.email || '',
      name: data.user.user_metadata?.name || payload.name || 'User',
      plan: 'free',
      createdAt: data.user.created_at,
    },
  }
}

export async function login(payload: AuthPayload): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: payload.email,
    password: payload.password,
  })

  if (error) throw error
  if (!data.user || !data.session) throw new Error('Login failed')

  return {
    accessToken: data.session.access_token,
    user: {
      id: data.user.id,
      email: data.user.email || '',
      name: data.user.user_metadata?.name || 'User',
      plan: 'free',
      createdAt: data.user.created_at,
    },
  }
}

export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function me(): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  return {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.name || 'User',
    plan: 'free',
    createdAt: user.created_at,
  }
}
