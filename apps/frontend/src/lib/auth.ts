import Cookies from 'js-cookie'
import { z } from 'zod'

// Base API URL from environment
const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.24.177:5000/api'

// Auth types
export interface User {
  id: string
  username: string
  name: string
  role: 'ADMIN' | 'USER'
}

export interface AuthResponse {
  token: string
  refreshToken: string
  user: User
}

// Login request schema
const LoginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
})

// Signup request schema
const SignupSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  name: z.string().min(1),
  role: z.enum(['ADMIN', 'USER']).default('USER'),
})

// API calls
// Transform backend responses to match frontend's AuthResponse format

function transformLoginResponse(data: {
  token: string
  role: string
  userId: string
  name: string
  refreshToken: string
}): AuthResponse {
  return {
    token: data.token,
    refreshToken: data.refreshToken,
    user: {
      id: data.userId,
      username: '', // Backend doesn't return username on login - we'll get it from JWT if needed
      name: data.name,
      role: data.role as 'ADMIN' | 'USER',
    },
  }
}

function transformRefreshResponse(data: {
  token: string
  refreshToken: string
  user: { id: string; username: string; name: string; role: string }
}): AuthResponse {
  return {
    token: data.token,
    refreshToken: data.refreshToken,
    user: {
      ...data.user,
      role: data.user.role as 'ADMIN' | 'USER',
    },
  }
}

export const authAPI = {
  login: async (
    credentials: z.infer<typeof LoginSchema>,
  ): Promise<AuthResponse> => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })
    if (!res.ok) {
      const error = await res
        .json()
        .catch(() => ({ error: 'Invalid credentials' }))
      throw new Error(error.error || 'Invalid credentials')
    }
    const data = await res.json()
    return transformLoginResponse(data)
  },

  signup: async (data: z.infer<typeof SignupSchema>): Promise<AuthResponse> => {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Signup failed' }))
      throw new Error(error.error || 'Signup failed')
    }
    const responseData = await res.json()
    return transformLoginResponse(responseData)
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) throw new Error('Session expired')
    const data = await res.json()
    return transformRefreshResponse(data)
  },

  logout: async (refreshToken: string): Promise<void> => {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    // Clear local cookies/storage
    Cookies.remove('auth_token')
    localStorage.removeItem('refresh_token')
  },

  // Attach auth token to fetch requests
  attachAuthToken: (headers: Headers) => {
    const token = Cookies.get('auth_token')
    if (token) headers.set('Authorization', `Bearer ${token}`)
    return headers
  },
}
