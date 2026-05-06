import axios, { AxiosHeaders } from 'axios'
import { useAuthStore } from '../store/authStore'

const rawBaseUrl = import.meta.env.VITE_API_URL ?? ''
const apiBaseUrl = rawBaseUrl ? `${rawBaseUrl.replace(/\/+$/, '')}/api` : '/api'

export const http = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 10000,
})

http.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken
  if (accessToken) {
    const headers = AxiosHeaders.from(config.headers ?? {})
    headers.set('Authorization', `Bearer ${accessToken}`)
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
        
        // Save the refreshed token back to the store
        const currentUser = useAuthStore.getState().user
        if (currentUser) {
          useAuthStore.getState().setSession(newAccessToken, currentUser)
        }
        
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
