import { create } from 'zustand'
import { authAPI } from '../lib/auth'
import type { User } from '../lib/auth'
import Cookies from 'js-cookie'

interface AuthStore {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  login: (credentials: { username: string; password: string }) => Promise<void>
  signup: (data: {
    username: string
    password: string
    name: string
    role: 'ADMIN' | 'USER'
  }) => Promise<void>
  logout: () => void
  refreshAuthToken: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,

  login: async (credentials) => {
    const response = await authAPI.login(credentials)
    set({
      user: response.user,
      token: response.token,
      refreshToken: response.refreshToken,
      isAuthenticated: true,
    })
    // Store token in secure cookie
    Cookies.set('auth_token', response.token, {
      secure: true,
      sameSite: 'strict',
      expires: 1 / 144,
    }) // 10 minutes
    localStorage.setItem('refresh_token', response.refreshToken)
  },

  signup: async (data) => {
    const response = await authAPI.signup(data)
    set({
      user: response.user,
      token: response.token,
      refreshToken: response.refreshToken,
      isAuthenticated: true,
    })
    Cookies.set('auth_token', response.token, {
      secure: true,
      sameSite: 'strict',
      expires: 1 / 144,
    })
    localStorage.setItem('refresh_token', response.refreshToken)
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    if (refreshToken) await authAPI.logout(refreshToken)
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false })
    Cookies.remove('auth_token')
    localStorage.removeItem('refresh_token')
  },

  refreshAuthToken: async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) return get().logout()

    try {
      const response = await authAPI.refreshToken(refreshToken)
      set({
        token: response.token,
        refreshToken: response.refreshToken,
        user: response.user,
        isAuthenticated: true,
      })
      Cookies.set('auth_token', response.token, {
        secure: true,
        sameSite: 'strict',
        expires: 1 / 144,
      })
      localStorage.setItem('refresh_token', response.refreshToken)
    } catch (error) {
      get().logout()
    }
  },
}))
