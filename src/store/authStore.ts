import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { clearAuthSession } from '@/lib/authSession'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'student' | 'admin' | 'school_admin' | 'super_admin'
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setAccessToken: (token: string | null) => void
  setRefreshToken: (token: string | null) => void
  login: (user: User, accessToken: string, refreshToken: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  hydrate: () => void
}

const normalizeUser = (user: any): User | null => {
  if (!user || typeof user !== 'object') {
    return null
  }

  const role = String(user.role || 'student').toLowerCase()

  return {
    ...user,
    role: role as User['role'],
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: (user) => set({ user: normalizeUser(user), isAuthenticated: !!user }),
      setAccessToken: (accessToken) => set({ accessToken }),
      setRefreshToken: (refreshToken) => set({ refreshToken }),
      login: (user, accessToken, refreshToken) =>
        set({ user: normalizeUser(user), accessToken, refreshToken, isAuthenticated: true }),
      logout: () => {
        clearAuthSession()
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
      },
      setLoading: (isLoading) => set({ isLoading }),
      hydrate: () => {
        // Sync localStorage on mount
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('accessToken')
          const refresh = localStorage.getItem('refreshToken')
          const userStr = localStorage.getItem('user')
          
          if (token && userStr) {
            try {
              const user = normalizeUser(JSON.parse(userStr))
              if (user) {
                set({ 
                  accessToken: token, 
                  refreshToken: refresh,
                  user, 
                  isAuthenticated: true 
                })
              }
            } catch (e) {
              console.error('Failed to parse user from localStorage')
            }
          }
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
