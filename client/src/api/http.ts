import axios, { AxiosHeaders } from 'axios'
import { useAuthStore } from '../store/authStore'

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

export const http = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 10000,
})

http.interceptors.request.use((config) => {
  const session = useAuthStore.getState().session
  if (session?.access_token) {
    const headers = AxiosHeaders.from(config.headers ?? {})
    headers.set('Authorization', `Bearer ${session.access_token}`)
    config.headers = headers
  }

  ;(config as any).metadata = { startTime: Date.now() }
  return config
})

http.interceptors.response.use(
  (response) => {
    const startTime = (response.config as any).metadata.startTime
    const duration = Date.now() - startTime
    console.log(`[Performance] ${response.config.method?.toUpperCase()} ${response.config.url} took ${duration}ms`)
    return response
  },
  async (error) => {
    const status = error?.response?.status
    const requestUrl = String(error.config?.url ?? '')
    const isAuthRequest = requestUrl.includes('/auth/')

    if (status === 401 && !isAuthRequest) {
      useAuthStore.getState().logout()
    }

    const message = error?.response?.data?.message ?? error?.message ?? 'Request failed'
    return Promise.reject(new Error(message))
  },
)
