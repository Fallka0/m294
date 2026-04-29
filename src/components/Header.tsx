'use client'

import Image from 'next/image'
import Link from 'next/link'
import HeaderAction from '@/components/header/HeaderAction'
import { useAuth } from '@/components/auth/AuthProvider'
import { useTheme } from '@/components/theme/ThemeProvider'

export default function Header() {
  const { isAuthenticated, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="app-header sticky top-0 z-40 transition-colors duration-300">
      <div className="mx-auto flex min-h-[88px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3 text-[var(--header-text)]">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--header-border)] bg-[var(--header-pill)] transition-colors duration-300">
            <Image src="/trophy.svg" alt="" width={20} height={20} className="theme-icon h-5 w-5" aria-hidden="true" />
          </div>
          <div className="leading-tight">
            <span className="block text-lg font-semibold tracking-tight">Tournament</span>
            <span className="block text-xs text-[var(--header-subtext)]">Planary tournaments, brackets, teams and events</span>
          </div>
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <nav className="flex items-center gap-2 sm:gap-3">
            <HeaderAction href="/">Home</HeaderAction>
            <HeaderAction href="/teams">Teams</HeaderAction>
            {isAuthenticated ? <HeaderAction href="/profile">Profile</HeaderAction> : <HeaderAction href="/auth">Sign in</HeaderAction>}
            {isAuthenticated ? (
              <HeaderAction onClick={signOut}>Log out</HeaderAction>
            ) : (
              <HeaderAction href="/tournaments/new" variant="primary">
                Create
              </HeaderAction>
            )}
          </nav>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="rounded-full border border-[color:var(--header-border)] bg-[var(--header-pill)] p-2.5 text-[var(--header-text-muted)] transition duration-200 hover:scale-[1.04] hover:border-[color:var(--accent-border)]"
          >
            {theme === 'dark' ? (
              <Image src="/sun.svg" alt="" width={20} height={20} className="theme-icon h-5 w-5" aria-hidden="true" />
            ) : (
              <Image src="/moon.svg" alt="" width={20} height={20} className="theme-icon h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
