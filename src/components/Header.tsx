'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
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
            className="rounded-full border border-[color:var(--header-border)] px-4 py-2 text-sm font-medium text-[var(--header-text-muted)] transition duration-200 hover:border-[color:var(--header-text-muted)] hover:bg-[var(--header-pill)]"
          >
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          {isAuthenticated ? (
            <>
              <Link
                href="/profile"
                className="rounded-full border border-[color:var(--header-border)] px-4 py-2 text-sm font-medium text-[var(--header-text-muted)] transition duration-200 hover:border-[color:var(--header-text-muted)] hover:bg-[var(--header-pill)]"
              >
                Profile
              </Link>
              <Link
                href="/tournaments/new"
                className="cursor-pointer rounded-full border border-[color:var(--accent-border)] bg-[var(--accent-solid)] px-5 py-2.5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(124,58,237,0.28)]"
              >
                Create Tournament
              </Link>
              <div className="hidden rounded-full border border-[color:var(--header-border)] bg-[var(--header-pill)] px-4 py-2 text-sm text-[var(--header-text-muted)] md:block">
                @{displayName}
              </div>
              <button
                type="button"
                onClick={signOut}
                className="rounded-full border border-[color:var(--header-border)] px-4 py-2 text-sm font-medium text-[var(--header-text-muted)] transition duration-200 hover:border-[color:var(--header-text-muted)] hover:bg-[var(--header-pill)]"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth"
                className="rounded-full border border-[color:var(--header-border)] px-4 py-2 text-sm font-medium text-[var(--header-text-muted)] transition duration-200 hover:border-[color:var(--header-text-muted)] hover:bg-[var(--header-pill)]"
              >
                Sign in
              </Link>
              <Link
                href="/auth"
                className="cursor-pointer rounded-full border border-[color:var(--accent-border)] bg-[var(--accent-solid)] px-5 py-2.5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(124,58,237,0.28)]"
              >
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
