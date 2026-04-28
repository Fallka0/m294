'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import HeaderAction from '@/components/header/HeaderAction'
import { useTheme } from '@/components/theme/ThemeProvider'

export default function Header() {
  const { profile, isAuthenticated, isAdmin, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isThemeHovered, setIsThemeHovered] = useState(false)
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false)
  const displayName = profile?.username || profile?.full_name || 'Account'
  const mobileAvatarLabel = (profile?.full_name || profile?.username || 'A').trim().charAt(0).toUpperCase()

  useEffect(() => {
    setAvatarLoadFailed(false)
  }, [profile?.avatar_url])

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  const handleSignOut = () => {
    closeMobileMenu()
    signOut()
  }

  return (
    <header className="app-header sticky top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="brand-lockup" aria-label="Tournament home">
          <div className="brand-mark">
            <Image src="/trophy.svg" alt="" width={20} height={20} className="theme-icon h-5 w-5" aria-hidden="true" />
          </div>
          <div className="leading-tight">
            <span className="block text-lg font-semibold tracking-tight text-[var(--header-text)]">Tournament</span>
            <span className="block text-xs text-[var(--header-subtext)]">Brackets, teams, and match-day flow</span>
          </div>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <nav className="header-nav" aria-label="Primary Navigation">
            <Link href="/">Home</Link>
            <Link href="/teams">Teams</Link>
            {isAuthenticated ? <Link href="/profile">Profile</Link> : <Link href="/auth">Sign in</Link>}
          </nav>

          <button
            type="button"
            className="theme-toggle-shell"
            onClick={toggleTheme}
            onMouseEnter={() => setIsThemeHovered(true)}
            onMouseLeave={() => setIsThemeHovered(false)}
            aria-label="Toggle Theme"
          >
            <Image
              src={theme === 'dark' ? '/sun.svg' : '/moon.svg'}
              alt=""
              width={20}
              height={20}
              className={`theme-icon h-5 w-5 transition-transform duration-200 ${isThemeHovered ? 'scale-110' : ''}`}
              aria-hidden="true"
            />
          </button>

          {isAuthenticated ? (
            <>
              <HeaderAction href="/tournaments/new" variant="primary">
                Create Tournament
              </HeaderAction>
              {isAdmin ? (
                <HeaderAction href="/admin" className="hidden bg-[var(--header-pill)] md:block">
                  Admin
                </HeaderAction>
              ) : null}
              <HeaderAction onClick={signOut}>Sign out</HeaderAction>
            </>
          ) : (
            <HeaderAction href="/auth" variant="primary">
              Create account
            </HeaderAction>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {isAuthenticated ? (
            <Link
              href="/profile"
              aria-label="Open profile"
              className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-[color:var(--header-border)] bg-[var(--header-pill)] text-sm font-semibold text-[var(--header-text)] transition duration-200 hover:border-[color:var(--header-text-muted)] hover:bg-[var(--header-pill)]/80"
            >
              {profile?.avatar_url && !avatarLoadFailed ? (
                <img
                  src={profile.avatar_url}
                  alt={`${displayName} profile picture`}
                  className="h-full w-full object-cover"
                  onError={() => setAvatarLoadFailed(true)}
                />
              ) : (
                <span>{mobileAvatarLabel}</span>
              )}
            </Link>
          ) : null}

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="theme-toggle-shell flex h-11 w-11 items-center justify-center"
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
      </div>

      {isMobileMenuOpen ? (
        <div className="border-t border-[color:var(--header-border)] bg-[var(--header-bg)] md:hidden">
          <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3 rounded-3xl border border-[color:var(--header-border)] bg-[var(--header-pill)] p-4">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center justify-between rounded-2xl border border-[color:var(--header-border)] px-4 py-3 text-left text-sm font-medium text-[var(--header-text)] transition duration-200 hover:border-[color:var(--header-text-muted)] hover:bg-[var(--header-pill)]/80"
              >
                <span>{theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}</span>
                <Image src={theme === 'dark' ? '/sun.svg' : '/moon.svg'} alt="" width={20} height={20} className="theme-icon h-5 w-5" aria-hidden="true" />
              </button>

              <Link
                href="/"
                onClick={closeMobileMenu}
                className="rounded-2xl border border-[color:var(--header-border)] px-4 py-3 text-sm font-medium text-[var(--header-text-muted)] transition duration-200 hover:border-[color:var(--header-text-muted)] hover:bg-[var(--header-pill)]"
              >
                Home
              </Link>
              <Link
                href="/teams"
                onClick={closeMobileMenu}
                className="rounded-2xl border border-[color:var(--header-border)] px-4 py-3 text-sm font-medium text-[var(--header-text-muted)] transition duration-200 hover:border-[color:var(--header-text-muted)] hover:bg-[var(--header-pill)]"
              >
                Teams
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    href="/tournaments/new"
                    onClick={closeMobileMenu}
                    className="cursor-pointer rounded-2xl border border-[color:var(--accent-border)] bg-[var(--accent-solid)] px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--accent-glow)]"
                  >
                    Create Tournament
                  </Link>
                  {isAdmin ? (
                    <Link
                      href="/admin"
                      onClick={closeMobileMenu}
                      className="rounded-2xl border border-[color:var(--header-border)] px-4 py-3 text-sm font-medium text-[var(--header-text-muted)] transition duration-200 hover:border-[color:var(--header-text-muted)] hover:bg-[var(--header-pill)]"
                    >
                      Admin
                    </Link>
                  ) : null}
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
