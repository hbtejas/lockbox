import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '../store/authStore'

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'
const refreshUrl = `${apiBaseUrl}/auth/refresh`

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

export const http = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 10000,
})

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(refreshUrl, {}, { withCredentials: true, timeout: 10000 })
      .then((response) => {
        const accessToken = response?.data?.data?.accessToken as string | undefined
        const currentUser = useAuthStore.getState().user

        if (!accessToken) {
          return null
        }

        if (currentUser) {
          useAuthStore.getState().setSession(accessToken, currentUser)
        }

        return accessToken
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

http.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken
  if (accessToken) {
    const headers = AxiosHeaders.from(config.headers ?? {})
    headers.set('Authorization', `Bearer ${accessToken}`)
    config.headers = headers
  }

  return config
})

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined
    const status = error?.response?.status
    const requestUrl = String(originalRequest?.url ?? '')
    const isAuthRequest = requestUrl.includes('/auth/')

    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true

      const nextToken = await refreshAccessToken()
      if (nextToken) {
        const headers = AxiosHeaders.from(originalRequest.headers ?? {})
        headers.set('Authorization', `Bearer ${nextToken}`)
        originalRequest.headers = headers
        return http(originalRequest)
      }

      useAuthStore.getState().clearSession()
    }

    const message = error?.response?.data?.message ?? error?.message ?? 'Request failed'
    return Promise.reject(new Error(message))
  },
)
