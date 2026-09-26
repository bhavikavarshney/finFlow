import { useEffect, useState } from 'react'
import api from '../utils/api'
import { AuthContext } from './authContextValue'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('token')))

  useEffect(() => {
    let active = true
    const token = localStorage.getItem('token')

    if (!token) return () => { active = false }

    api.get('/auth/me')
      .then(({ data }) => { if (active) setUser(data.user) })
      .catch(() => { localStorage.removeItem('token') })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [])

  async function authenticate(endpoint, credentials) {
    const { data } = await api.post(endpoint, credentials)
    localStorage.setItem('token', data.token)
    setUser(data.user)
  }

  async function login(credentials) {
    await authenticate('/auth/login', credentials)
  }

  async function signup(details) {
    await authenticate('/auth/signup', details)
  }

  async function updateProfile(profile) {
    const { data } = await api.patch('/auth/profile', profile)
    setUser(data.user)
    return data.user
  }

  function logout() {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
