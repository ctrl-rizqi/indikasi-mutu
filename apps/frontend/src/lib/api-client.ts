import Cookies from 'js-cookie'
import { authAPI } from './auth'
import { useAuthStore } from '../store/authStore'

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

/**
 * Authenticated fetch wrapper that:
 * - Attaches auth token from cookies
 * - Handles 401 with automatic token refresh
 * - Retries the original request after refresh
 */
export async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  // Get token from cookie
  const token = Cookies.get('auth_token')

  const headers: HeadersInit = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  // If 401, try to refresh token
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refresh_token')

    if (refreshToken) {
      try {
        const newTokens = await authAPI.refreshToken(refreshToken)

        // Update stores
        Cookies.set('auth_token', newTokens.token, {
          secure: true,
          sameSite: 'strict',
          expires: 1 / 144,
        })
        localStorage.setItem('refresh_token', newTokens.refreshToken)

        // Update auth store
        useAuthStore.getState().refreshAuthToken()

        // Retry with new token
        const newToken = newTokens.token
        const retryHeaders: HeadersInit = {
          ...options.headers,
          Authorization: `Bearer ${newToken}`,
        }

        response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers: retryHeaders,
        })
      } catch (refreshError) {
        // Refresh failed - logout
        useAuthStore.getState().logout()
        throw new Error('Session expired. Please login again.')
      }
    } else {
      // No refresh token - logout
      useAuthStore.getState().logout()
      throw new Error('Session expired. Please login again.')
    }
  }

  return response
}

export { API_BASE_URL }
