'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import HeaderAction from '@/components/header/HeaderAction'
import { useTheme } from '@/components/theme/ThemeProvider'

export default function Header() {
  const { user, profile, isAuthenticated, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const displayName = profile?.username || profile?.full_name || user?.email?.split('@')[0] || 'Account'

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  const handleThemeToggle = () => {
    toggleTheme()
  }

  const handleSignOut = () => {
    closeMobileMenu()
    signOut()
  }

  return (
    <header className="app-header sticky top-0 z-40 border-b border-[color:var(--header-border)] bg-[var(--header-bg)] backdrop-blur-xl transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 text-[var(--header-text)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--header-border)] bg-[var(--header-pill)] transition-colors duration-300">
            <Image src="/trophy.svg" alt="" width={20} height={20} className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="leading-tight">
            <span className="block text-lg font-semibold tracking-tight">TournamentHub</span>
            <span className="block text-xs text-[var(--header-subtext)]">Run tournaments with less friction</span>
          </div>
        </Link>
        <div className="hidden md:flex items-center gap-3">
          <button
            type="button"
            onClick={handleThemeToggle}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="rounded-full border border-[color:var(--header-border)] p-2.5 text-[var(--header-text-muted)] transition duration-200 hover:border-[color:var(--header-text-muted)] hover:bg-[var(--header-pill)]"
          >
            {theme === 'dark' ? (
              <Image src="/sun.svg" alt="" width={20} height={20} className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Image src="/moon.svg" alt="" width={20} height={20} className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
          {isAuthenticated ? (
            <>
              <HeaderAction href="/tournaments/new" variant="primary">
                Create Tournament
              </HeaderAction>
              <HeaderAction href="/profile" className="hidden bg-[var(--header-pill)] md:block">
                @{displayName}
              </HeaderAction>
              <HeaderAction onClick={signOut}>
                Sign out
              </HeaderAction>
            </>
          ) : (
            <>
              <HeaderAction href="/auth">
                Sign in
              </HeaderAction>
              <HeaderAction href="/auth" variant="primary">
                Create account
              </HeaderAction>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          aria-expanded={isMobileMenuOpen}
          aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="flex md:hidden h-11 w-11 items-center justify-center rounded-full border border-[color:var(--header-border)] bg-[var(--header-pill)] text-[var(--header-text)] transition duration-200 hover:border-[color:var(--header-text-muted)] hover:bg-[var(--header-pill)]/80"
        >
          {isMobileMenuOpen ? (
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 stroke-current" fill="none" strokeWidth="2">
              <path d="M6 6L18 18M18 6L6 18" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 stroke-current" fill="none" strokeWidth="2">
              <path d="M4 7H20M4 12H20M4 17H20" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>
      {isMobileMenuOpen ? (
        <div className="border-t border-[color:var(--header-border)] bg-[var(--header-bg)] md:hidden">
          <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3 rounded-3xl border border-[color:var(--header-border)] bg-[var(--header-pill)] p-4">
              <button
                type="button"
                onClick={handleThemeToggle}
                className="flex items-center justify-between rounded-2xl border border-[color:var(--header-border)] px-4 py-3 text-left text-sm font-medium text-[var(--header-text)] transition duration-200 hover:border-[color:var(--header-text-muted)] hover:bg-[var(--header-pill)]/80"
              >
                <span>{theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}</span>
                {theme === 'dark' ? (
                  <Image src="/sun.svg" alt="" width={20} height={20} className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Image src="/moon.svg" alt="" width={20} height={20} className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
              {isAuthenticated ? (
                <>
                  <Link
                    href="/tournaments/new"
                    onClick={closeMobileMenu}
                    className="cursor-pointer rounded-2xl border border-[color:var(--accent-border)] bg-[var(--accent-solid)] px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--accent-glow)]"
                  >
                    Create Tournament
                  </Link>
                  <Link
                    href="/profile"
                    onClick={closeMobileMenu}
                    className="rounded-2xl border border-[color:var(--header-border)] px-4 py-3 text-sm font-medium text-[var(--header-text-muted)] transition duration-200 hover:border-[color:var(--header-text-muted)] hover:bg-[var(--header-pill)]"
                  >
                    @{displayName}
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="rounded-2xl border border-[color:var(--header-border)] px-4 py-3 text-left text-sm font-medium text-[var(--header-text-muted)] transition duration-200 hover:border-[color:var(--header-text-muted)] hover:bg-[var(--header-pill)]"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth"
                    onClick={closeMobileMenu}
                    className="rounded-2xl border border-[color:var(--header-border)] px-4 py-3 text-sm font-medium text-[var(--header-text-muted)] transition duration-200 hover:border-[color:var(--header-text-muted)] hover:bg-[var(--header-pill)]"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth"
                    onClick={closeMobileMenu}
                    className="cursor-pointer rounded-2xl border border-[color:var(--accent-border)] bg-[var(--accent-solid)] px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--accent-glow)]"
                  >
                    Create account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}
