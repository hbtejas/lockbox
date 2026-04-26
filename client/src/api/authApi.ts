import type { UserProfile } from '../types/domain'
import { http } from './http'

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
  const { data } = await http.post('/auth/signup', {
    name: payload.name,
    email: payload.email,
    password: payload.password,
  })

  const result = data.data
  return {
    accessToken: result.accessToken,
    user: {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name || payload.name || 'User',
      plan: result.user.plan || 'free',
      createdAt: result.user.createdAt || result.user.created_at,
    },
  }
}

export async function login(payload: AuthPayload): Promise<AuthResponse> {
  const { data } = await http.post('/auth/login', {
    email: payload.email,
    password: payload.password,
  })

  const result = data.data
  return {
    accessToken: result.accessToken,
    user: {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name || 'User',
      plan: result.user.plan || 'free',
      createdAt: result.user.createdAt || result.user.created_at,
    },
  }
}

export async function logout() {
  await http.post('/auth/logout')
}

export async function me(): Promise<UserProfile | null> {
  try {
    const { data } = await http.get('/auth/me')
    if (!data.data) return null

    return {
      id: data.data.id,
      email: data.data.email,
      name: data.data.name || 'User',
      plan: data.data.plan || 'free',
      createdAt: data.data.createdAt || data.data.created_at,
    }
  } catch {
    return null
  }
}
