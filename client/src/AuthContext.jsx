import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext()
export function useAuth() { return useContext(AuthContext) }

const BASE = '/api'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('admin_token'))
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  const checkAuth = useCallback(async () => {
    if (!token) {
      setAuthenticated(false)
      setLoading(false)
      return
    }
    try {
      const res = await fetch(`${BASE}/auth/check`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setAuthenticated(data.authenticated)
    } catch {
      setAuthenticated(false)
    }
    setLoading(false)
  }, [token])

  useEffect(() => { checkAuth() }, [checkAuth])

  const login = async (password) => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || '登录失败')
    localStorage.setItem('admin_token', data.token)
    setToken(data.token)
    setAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('admin_token')
    setToken(null)
    setAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ token, authenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
