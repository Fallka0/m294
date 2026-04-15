'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext(null)

async function loadProfile(userId) {
  if (!userId) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  return data ?? null
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const bootstrap = async () => {
      const { data } = await supabase.auth.getSession()
      const currentSession = data.session ?? null
      const currentUser = currentSession?.user ?? null
      const currentProfile = currentUser ? await loadProfile(currentUser.id) : null

      if (!isMounted) return

      setSession(currentSession)
      setUser(currentUser)
      setProfile(currentProfile)
      setLoading(false)
    }

    bootstrap()

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      const nextUser = nextSession?.user ?? null
      const nextProfile = nextUser ? await loadProfile(nextUser.id) : null

      if (!isMounted) return

      setSession(nextSession ?? null)
      setUser(nextUser)
      setProfile(nextProfile)
      setLoading(false)
    })

    return () => {
      isMounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(() => ({
    session,
    user,
    profile,
    loading,
    isAuthenticated: Boolean(user),
    refreshProfile: async () => {
      if (!user) return null
      const nextProfile = await loadProfile(user.id)
      setProfile(nextProfile)
      return nextProfile
    },
    signOut: async () => {
      await supabase.auth.signOut()
    },
  }), [session, user, profile, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
