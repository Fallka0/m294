'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PageShell from '@/components/layout/PageShell'
import { useAuth } from '@/components/auth/AuthProvider'

export default function AdminPage() {
  const router = useRouter()
  const { isAuthenticated, isAdmin, loading: authLoading, profile } = useAuth()

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      router.replace('/auth')
      return
    }

    if (!isAdmin) {
      router.replace('/')
    }
  }, [authLoading, isAdmin, isAuthenticated, router])

  if (authLoading) {
    return (
      <PageShell contentClassName="max-w-4xl">
        <section className="app-card rounded-[32px] p-8 md:p-10">
          <p className="app-eyebrow">Admin</p>
          <h1 className="app-text-primary mt-3 text-3xl font-semibold tracking-tight">Checking access</h1>
          <p className="app-text-secondary mt-3 text-sm">Verifying your session and admin permissions.</p>
        </section>
      </PageShell>
    )
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <PageShell contentClassName="max-w-4xl">
        <section className="app-card rounded-[32px] p-8 md:p-10">
          <p className="app-eyebrow">Admin</p>
          <h1 className="app-text-primary mt-3 text-3xl font-semibold tracking-tight">Admin access required</h1>
          <p className="app-text-secondary mt-3 text-sm">
            This area is only available to accounts with the admin role.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/" className="app-button-secondary rounded-xl px-4 py-3 text-sm font-semibold">
              Back to dashboard
            </Link>
            {!isAuthenticated ? (
              <Link href="/auth" className="app-button-primary rounded-xl px-4 py-3 text-sm font-semibold">
                Sign in
              </Link>
            ) : null}
          </div>
        </section>
      </PageShell>
    )
  }

  return (
    <PageShell contentClassName="max-w-5xl">
      <section className="app-card rounded-[32px] p-8 md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="app-eyebrow">Admin</p>
            <h1 className="app-text-primary mt-3 text-3xl font-semibold tracking-tight">Admin dashboard</h1>
            <p className="app-text-secondary mt-3 max-w-2xl text-sm">
              This area is now protected. In the next step we can wire in full moderation actions for tournaments,
              users, teams, and profiles.
            </p>
          </div>
          <span className="app-chip-info rounded-full px-3 py-1 text-xs font-semibold">
            Signed in as {profile?.username || profile?.full_name || 'admin'}
          </span>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <section className="app-card-elevated rounded-[24px] p-5">
            <p className="app-eyebrow">Tournaments</p>
            <h2 className="app-text-primary mt-3 text-lg font-semibold">Global tournament controls</h2>
            <p className="app-text-secondary mt-2 text-sm">
              Next we can add search, audit information, and hard delete controls for every tournament.
            </p>
          </section>

          <section className="app-card-elevated rounded-[24px] p-5">
            <p className="app-eyebrow">Users</p>
            <h2 className="app-text-primary mt-3 text-lg font-semibold">Account moderation</h2>
            <p className="app-text-secondary mt-2 text-sm">
              This section will eventually manage profiles in the database and, later, Supabase auth accounts.
            </p>
          </section>

          <section className="app-card-elevated rounded-[24px] p-5">
            <p className="app-eyebrow">Teams</p>
            <h2 className="app-text-primary mt-3 text-lg font-semibold">Team oversight</h2>
            <p className="app-text-secondary mt-2 text-sm">
              We can add bulk cleanup and moderation tools here once the admin data actions are in place.
            </p>
          </section>
        </div>
      </section>
    </PageShell>
  )
}
