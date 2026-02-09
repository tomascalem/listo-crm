import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authApi, getAccessToken, clearTokens } from '../lib/api'

interface User {
  id: string
  email: string
  name: string
  avatar: string
  avatarUrl?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAccessToken()
      if (token) {
        try {
          const userData = await authApi.getCurrentUser()
          setUser(userData)
        } catch {
          // Token invalid or expired
          clearTokens()
        }
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const userData = await authApi.login(email, password)
    setUser(userData)
  }, [])

  const register = useCallback(async (email: string, password: string, name: string) => {
    const userData = await authApi.register(email, password, name)
    setUser(userData)
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
