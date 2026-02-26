import Cookies from 'js-cookie';
import { z } from 'zod';

// Base API URL from environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Auth types
export interface User {
  id: string;
  username: string;
  name: string;
  role: 'ADMIN' | 'USER';
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

// Login request schema
const LoginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

// Signup request schema
const SignupSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  name: z.string().min(1),
  role: z.enum(['ADMIN', 'USER']).default('USER'),
});

// API calls
export const authAPI = {
  login: async (credentials: z.infer<typeof LoginSchema>): Promise<AuthResponse> => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) throw new Error('Invalid credentials');
    return res.json();
  },

  signup: async (data: z.infer<typeof SignupSchema>): Promise<AuthResponse> => {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Signup failed');
    return res.json();
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) throw new Error('Session expired');
    return res.json();
  },

  logout: async (refreshToken: string): Promise<void> => {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    // Clear local cookies/storage
    Cookies.remove('auth_token');
    localStorage.removeItem('refresh_token');
  },

  // Attach auth token to fetch requests
  attachAuthToken: (headers: Headers) => {
    const token = Cookies.get('auth_token');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
};