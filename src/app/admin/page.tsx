'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PageShell from '@/components/layout/PageShell'
import { useAuth } from '@/components/auth/AuthProvider'
import { getErrorMessage } from '@/lib/errors'
import { supabase } from '@/lib/supabase'
import type { Profile, Team, Tournament } from '@/lib/types'

interface AdminDashboardStats {
  tournamentsTotal: number
  tournamentsOpen: number
  tournamentsLive: number
  tournamentsFinished: number
  tournamentsPublic: number
  tournamentsPrivate: number
  tournamentModes: Record<'group' | 'knockout' | 'both', number>
  participantsTotal: number
  matchesTotal: number
  teamsTotal: number
  profilesTotal: number
  adminsTotal: number
}

const emptyStats: AdminDashboardStats = {
  tournamentsTotal: 0,
  tournamentsOpen: 0,
  tournamentsLive: 0,
  tournamentsFinished: 0,
  tournamentsPublic: 0,
  tournamentsPrivate: 0,
  tournamentModes: {
    group: 0,
    knockout: 0,
    both: 0,
  },
  participantsTotal: 0,
  matchesTotal: 0,
  teamsTotal: 0,
  profilesTotal: 0,
  adminsTotal: 0,
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'Unknown date'

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Unknown date'

  return new Intl.DateTimeFormat('en-CH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed)
}

export default function AdminPage() {
  const router = useRouter()
  const { isAuthenticated, isAdmin, loading: authLoading, profile } = useAuth()
  const [stats, setStats] = useState<AdminDashboardStats>(emptyStats)
  const [recentTournaments, setRecentTournaments] = useState<Tournament[]>([])
  const [recentProfiles, setRecentProfiles] = useState<Profile[]>([])
  const [recentTeams, setRecentTeams] = useState<Team[]>([])
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [dashboardError, setDashboardError] = useState('')

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

  useEffect(() => {
    if (authLoading || !isAuthenticated || !isAdmin) return

    async function loadDashboard() {
      try {
        setDashboardLoading(true)
        setDashboardError('')

        const [
          tournamentsCountResult,
          participantsCountResult,
          matchesCountResult,
          teamsCountResult,
          profilesCountResult,
          adminsCountResult,
          tournamentSummaryResult,
          recentTournamentsResult,
          recentProfilesResult,
          recentTeamsResult,
        ] = await Promise.all([
          supabase.from('tournaments').select('*', { count: 'exact', head: true }),
          supabase.from('participants').select('*', { count: 'exact', head: true }),
          supabase.from('matches').select('*', { count: 'exact', head: true }),
          supabase.from('teams').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
          supabase.from('tournaments').select('id, status, is_public, mode'),
          supabase.from('tournaments').select('*').order('created_at', { ascending: false }).limit(5),
          supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(5),
          supabase.from('teams').select('*').order('created_at', { ascending: false }).limit(5),
        ])

        const firstError =
          tournamentsCountResult.error ||
          participantsCountResult.error ||
          matchesCountResult.error ||
          teamsCountResult.error ||
          profilesCountResult.error ||
          adminsCountResult.error ||
          tournamentSummaryResult.error ||
          recentTournamentsResult.error ||
          recentProfilesResult.error ||
          recentTeamsResult.error

        if (firstError) throw firstError

        const tournamentSummary = ((tournamentSummaryResult.data ?? []) as Array<Pick<Tournament, 'status' | 'is_public' | 'mode'>>)

        setStats({
          tournamentsTotal: tournamentsCountResult.count ?? 0,
          tournamentsOpen: tournamentSummary.filter((entry) => (entry.status ?? 'open') === 'open').length,
          tournamentsLive: tournamentSummary.filter((entry) => entry.status === 'live').length,
          tournamentsFinished: tournamentSummary.filter((entry) => entry.status === 'finished').length,
          tournamentsPublic: tournamentSummary.filter((entry) => entry.is_public !== false).length,
          tournamentsPrivate: tournamentSummary.filter((entry) => entry.is_public === false).length,
          tournamentModes: {
            group: tournamentSummary.filter((entry) => entry.mode === 'group').length,
            knockout: tournamentSummary.filter((entry) => entry.mode === 'knockout').length,
            both: tournamentSummary.filter((entry) => entry.mode === 'both').length,
          },
          participantsTotal: participantsCountResult.count ?? 0,
          matchesTotal: matchesCountResult.count ?? 0,
          teamsTotal: teamsCountResult.count ?? 0,
          profilesTotal: profilesCountResult.count ?? 0,
          adminsTotal: adminsCountResult.count ?? 0,
        })

        setRecentTournaments(((recentTournamentsResult.data ?? []) as Tournament[]))
        setRecentProfiles(((recentProfilesResult.data ?? []) as Profile[]))
        setRecentTeams(((recentTeamsResult.data ?? []) as Team[]))
      } catch (error) {
        setDashboardError(getErrorMessage(error, 'Could not load the admin dashboard.'))
      } finally {
        setDashboardLoading(false)
      }
    }

    void loadDashboard()
  }, [authLoading, isAdmin, isAuthenticated])

  const systemCards = useMemo(
    () => [
      {
        label: 'Supabase',
        title: 'Database-backed admin metrics',
        detail: 'Live counts come from tournaments, profiles, participants, matches, and teams.',
      },
      {
        label: 'Vercel Analytics',
        title: 'Installed in app layout',
        detail: 'Analytics is enabled in the root layout. Direct Vercel usage metrics can be added later via API integration.',
      },
      {
        label: 'Speed Insights',
        title: 'Installed in app layout',
        detail: 'Speed Insights is active. We can later connect richer deploy/runtime signals if you want true Vercel dashboard data.',
      },
    ],
    [],
  )

  if (authLoading) {
    return (
      <PageShell contentClassName="max-w-5xl">
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
    <PageShell contentClassName="max-w-6xl">
      <section className="app-card rounded-[32px] p-8 md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="app-eyebrow">Admin</p>
            <h1 className="app-text-primary mt-3 text-3xl font-semibold tracking-tight">Admin dashboard</h1>
            <p className="app-text-secondary mt-3 max-w-3xl text-sm">
              Global platform overview for Tournamount. This page now surfaces real app stats and recent records;
              destructive moderation actions can be added next.
            </p>
          </div>
          <span className="app-chip-info rounded-full px-3 py-1 text-xs font-semibold">
            Signed in as {profile?.username || profile?.full_name || 'admin'}
          </span>
        </div>

        {dashboardError ? (
          <div className="app-banner-danger mt-6 rounded-2xl px-4 py-3 text-sm">
            {dashboardError}
            <div className="mt-2 text-xs opacity-80">
              If you just added the admin role feature, make sure <code>supabase/admin-role.sql</code> has been run in Supabase.
            </div>
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <section className="app-card-elevated rounded-[24px] p-5">
            <p className="app-eyebrow">Tournaments</p>
            <p className="app-text-primary mt-3 text-3xl font-semibold">{dashboardLoading ? '...' : stats.tournamentsTotal}</p>
            <p className="app-text-secondary mt-2 text-sm">
              {dashboardLoading ? 'Loading overview...' : `${stats.tournamentsOpen} open, ${stats.tournamentsLive} live, ${stats.tournamentsFinished} finished`}
            </p>
          </section>

          <section className="app-card-elevated rounded-[24px] p-5">
            <p className="app-eyebrow">Accounts</p>
            <p className="app-text-primary mt-3 text-3xl font-semibold">{dashboardLoading ? '...' : stats.profilesTotal}</p>
            <p className="app-text-secondary mt-2 text-sm">
              {dashboardLoading ? 'Loading overview...' : `${stats.adminsTotal} admin account${stats.adminsTotal === 1 ? '' : 's'}`}
            </p>
          </section>

          <section className="app-card-elevated rounded-[24px] p-5">
            <p className="app-eyebrow">Participants</p>
            <p className="app-text-primary mt-3 text-3xl font-semibold">{dashboardLoading ? '...' : stats.participantsTotal}</p>
            <p className="app-text-secondary mt-2 text-sm">
              {dashboardLoading ? 'Loading overview...' : `${stats.matchesTotal} saved bracket match${stats.matchesTotal === 1 ? '' : 'es'}`}
            </p>
          </section>

          <section className="app-card-elevated rounded-[24px] p-5">
            <p className="app-eyebrow">Teams</p>
            <p className="app-text-primary mt-3 text-3xl font-semibold">{dashboardLoading ? '...' : stats.teamsTotal}</p>
            <p className="app-text-secondary mt-2 text-sm">
              {dashboardLoading ? 'Loading overview...' : `${stats.tournamentsPublic} public vs ${stats.tournamentsPrivate} private tournaments`}
            </p>
          </section>
        </div>

        <div className="mt-8 grid gap-4 xl:grid-cols-[1.3fr_1fr]">
          <section className="app-card-elevated rounded-[28px] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="app-eyebrow">Distribution</p>
                <h2 className="app-text-primary mt-2 text-xl font-semibold tracking-tight">Platform breakdown</h2>
              </div>
              <span className="app-chip rounded-full px-3 py-1 text-xs font-semibold">
                Live app data
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[20px] border border-[color:var(--border-subtle)] bg-[var(--surface-base)] p-4">
                <p className="app-eyebrow">Modes</p>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="app-text-secondary">Knockout</span>
                    <span className="app-text-primary font-semibold">{dashboardLoading ? '...' : stats.tournamentModes.knockout}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="app-text-secondary">Group</span>
                    <span className="app-text-primary font-semibold">{dashboardLoading ? '...' : stats.tournamentModes.group}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="app-text-secondary">Both</span>
                    <span className="app-text-primary font-semibold">{dashboardLoading ? '...' : stats.tournamentModes.both}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[20px] border border-[color:var(--border-subtle)] bg-[var(--surface-base)] p-4">
                <p className="app-eyebrow">Visibility</p>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="app-text-secondary">Public</span>
                    <span className="app-text-primary font-semibold">{dashboardLoading ? '...' : stats.tournamentsPublic}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="app-text-secondary">Private</span>
                    <span className="app-text-primary font-semibold">{dashboardLoading ? '...' : stats.tournamentsPrivate}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="app-card-elevated rounded-[28px] p-6">
            <p className="app-eyebrow">System health</p>
            <h2 className="app-text-primary mt-2 text-xl font-semibold tracking-tight">Integrations overview</h2>
            <div className="mt-6 space-y-4">
              {systemCards.map((card) => (
                <article key={card.label} className="rounded-[20px] border border-[color:var(--border-subtle)] bg-[var(--surface-base)] p-4">
                  <p className="app-eyebrow">{card.label}</p>
                  <h3 className="app-text-primary mt-2 text-base font-semibold">{card.title}</h3>
                  <p className="app-text-secondary mt-2 text-sm">{card.detail}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-8 grid gap-4 xl:grid-cols-3">
          <section className="app-card-elevated rounded-[28px] p-6">
            <p className="app-eyebrow">Recent tournaments</p>
            <h2 className="app-text-primary mt-2 text-xl font-semibold tracking-tight">Latest created</h2>
            <div className="mt-5 space-y-3">
              {dashboardLoading ? (
                <p className="app-text-secondary text-sm">Loading tournaments...</p>
              ) : recentTournaments.length > 0 ? (
                recentTournaments.map((tournament) => (
                  <article key={tournament.id} className="rounded-[20px] border border-[color:var(--border-subtle)] bg-[var(--surface-base)] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="app-text-primary text-sm font-semibold">{tournament.name}</p>
                        <p className="app-text-secondary mt-1 text-xs">
                          {tournament.mode} • {tournament.is_public === false ? 'Private' : 'Public'}
                        </p>
                      </div>
                      <span className="app-chip rounded-full px-2.5 py-1 text-[11px] font-semibold">
                        {tournament.status ?? 'open'}
                      </span>
                    </div>
                    <p className="app-text-muted mt-3 text-xs">{formatDate(tournament.created_at)}</p>
                  </article>
                ))
              ) : (
                <p className="app-text-secondary text-sm">No tournaments found.</p>
              )}
            </div>
          </section>

          <section className="app-card-elevated rounded-[28px] p-6">
            <p className="app-eyebrow">Recent accounts</p>
            <h2 className="app-text-primary mt-2 text-xl font-semibold tracking-tight">Latest profiles</h2>
            <div className="mt-5 space-y-3">
              {dashboardLoading ? (
                <p className="app-text-secondary text-sm">Loading profiles...</p>
              ) : recentProfiles.length > 0 ? (
                recentProfiles.map((entry) => (
                  <article key={entry.id} className="rounded-[20px] border border-[color:var(--border-subtle)] bg-[var(--surface-base)] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="app-text-primary text-sm font-semibold">{entry.username || entry.full_name || entry.email || 'User'}</p>
                        <p className="app-text-secondary mt-1 text-xs">{entry.email || 'No email stored'}</p>
                      </div>
                      <span className="app-chip-info rounded-full px-2.5 py-1 text-[11px] font-semibold">
                        {entry.role ?? 'user'}
                      </span>
                    </div>
                    <p className="app-text-muted mt-3 text-xs">{formatDate(entry.created_at)}</p>
                  </article>
                ))
              ) : (
                <p className="app-text-secondary text-sm">No profiles found.</p>
              )}
            </div>
          </section>

          <section className="app-card-elevated rounded-[28px] p-6">
            <p className="app-eyebrow">Recent teams</p>
            <h2 className="app-text-primary mt-2 text-xl font-semibold tracking-tight">Latest team records</h2>
            <div className="mt-5 space-y-3">
              {dashboardLoading ? (
                <p className="app-text-secondary text-sm">Loading teams...</p>
              ) : recentTeams.length > 0 ? (
                recentTeams.map((team) => (
                  <article key={team.id} className="rounded-[20px] border border-[color:var(--border-subtle)] bg-[var(--surface-base)] p-4">
                    <p className="app-text-primary text-sm font-semibold">{team.name}</p>
                    <p className="app-text-secondary mt-1 text-xs">
                      {team.member_names.length} member{team.member_names.length === 1 ? '' : 's'}
                    </p>
                    <p className="app-text-muted mt-3 text-xs">{formatDate(team.created_at)}</p>
                  </article>
                ))
              ) : (
                <p className="app-text-secondary text-sm">No teams found.</p>
              )}
            </div>
          </section>
        </div>
      </section>
    </PageShell>
  )
}
