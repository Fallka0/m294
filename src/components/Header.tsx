'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'

export default function Header() {
  const { user, profile, isAuthenticated, signOut } = useAuth()
  const displayName = profile?.username || profile?.full_name || user?.email?.split('@')[0] || 'Account'

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050505]/90 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
            <Image src="/trophy.svg" alt="" width={20} height={20} className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="leading-tight">
            <span className="block text-lg font-semibold tracking-tight">TournamentHub</span>
            <span className="block text-xs text-white/45">Run tournaments with less friction</span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                href="/tournaments/new"
                className="rounded-full border border-white/15 bg-white px-5 py-2.5 text-sm font-semibold text-gray-950 cursor-pointer transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(255,255,255,0.16)]"
              >
                Create Tournament
              </Link>
              <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 md:block">
                @{displayName}
              </div>
              <button
                type="button"
                onClick={signOut}
                className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white/80 transition duration-200 hover:border-white/20 hover:bg-white/5"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth"
                className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white/80 transition duration-200 hover:border-white/20 hover:bg-white/5"
              >
                Sign in
              </Link>
              <Link
                href="/auth"
                className="rounded-full border border-white/15 bg-white px-5 py-2.5 text-sm font-semibold text-gray-950 cursor-pointer transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(255,255,255,0.16)]"
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
