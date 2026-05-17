'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Hydrate auth state from localStorage on mount
    useAuthStore.getState().hydrate()
  }, [])

  return <>{children}</>
}
