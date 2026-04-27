'use client'

import type { ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { AuthContextValue, Profile } from '@/lib/types'

const AuthContext = createContext<AuthContextValue | null>(null)

async function loadProfile(userId: string): Promise<Profile | null> {
  if (!userId) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  return data ?? null
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      try {
        const nextUser = nextSession?.user ?? null
        const nextProfile = nextUser ? await loadProfile(nextUser.id) : null

        if (!isMounted) return

        setSession(nextSession ?? null)
        setUser(nextUser)
        setProfile(nextProfile)
      } catch (error) {
        console.error('Auth state change error:', error)
      } finally {
        if (!isMounted) return
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user,
    profile,
    loading,
    isAuthenticated: Boolean(user),
    isAdmin: profile?.role === 'admin',
    refreshProfile: async () => {
      if (!user) return null

      try {
        const nextProfile = await loadProfile(user.id)
        setProfile(nextProfile)
        return nextProfile
      } catch (error) {
        console.error('refreshProfile error:', error)
        return null
      }
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
