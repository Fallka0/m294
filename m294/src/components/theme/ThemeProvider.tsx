'use client'

import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const STORAGE_KEY = 'tournamenthub-theme'
const EXPLICIT_CHOICE_KEY = 'tournamenthub-theme-explicit'

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getPreferredTheme(): Theme {
  if (typeof window === 'undefined') return 'light'

  const stored = window.localStorage.getItem(STORAGE_KEY)
  const hasExplicitChoice = window.localStorage.getItem(EXPLICIT_CHOICE_KEY) === 'true'
  const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname)

  if (stored === 'light' || stored === 'dark') {
    if (!hasExplicitChoice && isLocalhost) {
      return 'light'
    }

    return stored
  }

  return 'light'
}

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('light')

  useEffect(() => {
    const nextTheme = getPreferredTheme()
    setThemeState(nextTheme)
    if (typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
      const hasExplicitChoice = window.localStorage.getItem(EXPLICIT_CHOICE_KEY) === 'true'
      if (!hasExplicitChoice) {
        window.localStorage.setItem(STORAGE_KEY, nextTheme)
      }
    }
    document.documentElement.dataset.theme = nextTheme
  }, [])

  const setTheme = (nextTheme: Theme) => {
    setThemeState(nextTheme)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, nextTheme)
      window.localStorage.setItem(EXPLICIT_CHOICE_KEY, 'true')
    }
    document.documentElement.dataset.theme = nextTheme
  }

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
      setTheme,
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider')
  }

  return context
}
