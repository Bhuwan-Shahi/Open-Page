'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'same-origin', // Ensure cookies are sent
        cache: 'no-store' // Don't cache this request
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      } else {
        // If response is not ok, user is not authenticated
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = (userData) => {
    setUser(userData)
  }

  const logout = async () => {
    try {
      // Clear user state immediately
      setUser(null)
      
      const response = await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'same-origin' // Ensure cookies are sent
      })
      
      if (response.ok) {
        window.location.href = '/' // Redirect to home page after logout
      } else {
        console.error('Logout request failed')
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Logout failed:', error)
      window.location.href = '/'
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuthStatus
  }

  return (
    <AuthContext.Provider value={value}>
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
