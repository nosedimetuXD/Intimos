import React, { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('intimos_user')
    return saved ? JSON.parse(saved) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('intimos_token'))
  const [totalPoints, setTotalPoints] = useState(0)
  const [monthPoints, setMonthPoints] = useState(0)
  const [level, setLevel] = useState('Semilla')
  const [loading, setLoading] = useState(true)

  const refreshProfile = async () => {
    if (!localStorage.getItem('intimos_token')) {
      setLoading(false)
      return
    }
    try {
      const res = await authApi.getMe()
      if (res && res.user) {
        setCurrentUser(res.user)
        setTotalPoints(res.total_points || 0)
        setMonthPoints(res.month_points || 0)
        setLevel(res.level || 'Semilla')
        localStorage.setItem('intimos_user', JSON.stringify(res.user))
      }
    } catch (err) {
      console.error('Error refreshing profile:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshProfile()
  }, [])

  const login = async (email, password) => {
    const res = await authApi.login(email, password)
    localStorage.setItem('intimos_token', res.token)
    localStorage.setItem('intimos_user', JSON.stringify(res.user))
    setToken(res.token)
    setCurrentUser(res.user)
    setTotalPoints(res.total_points || 0)
    setMonthPoints(res.month_points || 0)
    setLevel(res.level || 'Semilla')
    return res
  }

  const register = async (data) => {
    const res = await authApi.register(data)
    localStorage.setItem('intimos_token', res.token)
    localStorage.setItem('intimos_user', JSON.stringify(res.user))
    setToken(res.token)
    setCurrentUser(res.user)
    setTotalPoints(res.total_points || 0)
    setMonthPoints(res.month_points || 0)
    setLevel(res.level || 'Semilla')
    return res
  }

  const logout = () => {
    localStorage.removeItem('intimos_token')
    localStorage.removeItem('intimos_user')
    setToken(null)
    setCurrentUser(null)
    setTotalPoints(0)
    setMonthPoints(0)
    setLevel('Semilla')
  }

  const role = currentUser?.role || 'miembro'
  const isTeam = ['apoyo', 'apoyo2', 'pastoral', 'superadmin'].includes(role)
  const canManageUsers = ['apoyo2', 'pastoral', 'superadmin'].includes(role)
  const isPastoral = ['pastoral', 'superadmin'].includes(role)
  const isSuperAdmin = role === 'superadmin'

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        totalPoints,
        monthPoints,
        level,
        loading,
        isTeam,
        canManageUsers,
        isPastoral,
        isSuperAdmin,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
