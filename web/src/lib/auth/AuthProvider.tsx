'use client'

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  api,
  type AuthUser,
  setAuthToken,
  clearAuthToken,
  getAuthToken,
  ApiError,
} from '@/lib/api/client'

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName?: string) => Promise<void>
  logout: () => void
  error: string | null
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/login', '/register']

// Routes that should redirect to /app if already authenticated
const AUTH_ROUTES = ['/login', '/register']

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isAuthenticated = user !== null

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken()

      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const userData = await api.auth.me()
        setUser(userData)
      } catch (err) {
        // Token is invalid, clear it
        clearAuthToken()
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Route protection
  useEffect(() => {
    if (isLoading) return

    const isPublicRoute = PUBLIC_ROUTES.some(
      (route) => pathname === route || pathname.startsWith('/app/onboarding')
    )
    const isAuthRoute = AUTH_ROUTES.includes(pathname)

    // Redirect to login if trying to access protected route while not authenticated
    if (!isAuthenticated && !isPublicRoute && pathname.startsWith('/app')) {
      router.push('/login')
      return
    }

    // Redirect to app if trying to access auth routes while authenticated
    if (isAuthenticated && isAuthRoute) {
      router.push('/app')
      return
    }
  }, [isAuthenticated, isLoading, pathname, router])

  const login = useCallback(async (email: string, password: string) => {
    setError(null)
    setIsLoading(true)

    try {
      const response = await api.auth.login(email, password)
      setAuthToken(response.access_token)

      const userData = await api.auth.me()
      setUser(userData)

      router.push('/app')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred')
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const register = useCallback(async (
    email: string,
    password: string,
    displayName?: string
  ) => {
    setError(null)
    setIsLoading(true)

    try {
      await api.auth.register({ email, password, display_name: displayName })

      // Auto-login after registration
      const loginResponse = await api.auth.login(email, password)
      setAuthToken(loginResponse.access_token)

      const userData = await api.auth.me()
      setUser(userData)

      router.push('/app/onboarding')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred')
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const logout = useCallback(() => {
    clearAuthToken()
    setUser(null)
    router.push('/')
  }, [router])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
