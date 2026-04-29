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

let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

function onRefreshed(token: string) {
  refreshSubscribers.map((cb) => cb(token))
  refreshSubscribers = []
}

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

http.interceptors.response.use(
  (response) => {
    const startTime = (response.config as any).metadata.startTime
    const duration = Date.now() - startTime
    console.log(`[Performance] ${response.config.method?.toUpperCase()} ${response.config.url} took ${duration}ms`)
    return response
  },
  async (error) => {
    const { config, response } = error
    const originalRequest = config
    const status = response?.status
    const requestUrl = String(originalRequest?.url ?? '')
    const isAuthRequest = requestUrl.includes('/auth/')

    if (status === 401 && !isAuthRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(http(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data } = await axios.post(
          `${apiBaseUrl}/auth/refresh`,
          {},
          { withCredentials: true }
        )
        const newAccessToken = data.data.accessToken
        
        // Update store with new token (if store supports it)
        // Since we migrated to Supabase earlier, but the user wants custom JWT now,
        // we might need to update the store again.
        
        onRefreshed(newAccessToken)
        isRefreshing = false

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return http(originalRequest)
      } catch (refreshError) {
        isRefreshing = false
        useAuthStore.getState().logout()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    const message = response?.data?.message ?? error?.message ?? 'Request failed'
    return Promise.reject(new Error(message))
  },
)
