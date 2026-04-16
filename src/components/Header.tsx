'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import HeaderAction from '@/components/header/HeaderAction'
import { useTheme } from '@/components/theme/ThemeProvider'

export default function Header() {
  const { user, profile, isAuthenticated, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const displayName = profile?.username || profile?.full_name || user?.email?.split('@')[0] || 'Account'

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--header-border)] bg-[var(--header-bg)] backdrop-blur-xl transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 text-[var(--header-text)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--header-border)] bg-[var(--header-pill)] transition-colors duration-300">
            <Image src="/trophy.svg" alt="" width={20} height={20} className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="leading-tight">
            <span className="block text-lg font-semibold tracking-tight">TournamentHub</span>
            <span className="block text-xs text-[var(--header-subtext)]">Run tournaments with less friction</span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="rounded-full border border-[color:var(--header-border)] p-2.5 text-[var(--header-text-muted)] transition duration-200 hover:border-[color:var(--header-text-muted)] hover:bg-[var(--header-pill)]"
          >
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
                <path d="M12 18.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Zm0 3a1 1 0 0 1-1-1v-1.2a1 1 0 1 1 2 0v1.2a1 1 0 0 1-1 1Zm0-17a1 1 0 0 1-1-1V2.3a1 1 0 1 1 2 0v1.2a1 1 0 0 1-1 1Zm9.7 8.5a1 1 0 1 1 0 2h-1.2a1 1 0 1 1 0-2h1.2Zm-17 0a1 1 0 1 1 0 2H3.5a1 1 0 1 1 0-2h1.2Zm13.04 6.74a1 1 0 0 1-1.42 0l-.85-.85a1 1 0 0 1 1.42-1.42l.85.85a1 1 0 0 1 0 1.42Zm-10.61-10.6a1 1 0 0 1-1.42 0l-.85-.86a1 1 0 0 1 1.42-1.41l.85.85a1 1 0 0 1 0 1.42Zm0 10.6a1 1 0 0 1 0-1.42l.85-.85a1 1 0 0 1 1.42 1.42l-.85.85a1 1 0 0 1-1.42 0Zm10.61-10.6a1 1 0 0 1 0-1.42l.85-.85a1 1 0 1 1 1.42 1.41l-.85.86a1 1 0 0 1-1.42 0Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
                <path d="M20.76 15.17A8.24 8.24 0 0 1 8.83 3.24a.75.75 0 0 0-.97-.97A9.74 9.74 0 1 0 21.73 16.14a.75.75 0 0 0-.97-.97Z" />
              </svg>
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
      </div>
    </header>
  )
}
