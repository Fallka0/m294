'use client'

import { useDeferredValue, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import HomeHero from '@/components/home/HomeHero'
import PageShell from '@/components/layout/PageShell'
import HomeTournamentCard from '@/components/home/HomeTournamentCard'
import { useAuth } from '@/components/auth/AuthProvider'
import { getErrorMessage } from '@/lib/errors'
import { supabase } from '@/lib/supabase'
import { normalizeTournament } from '@/lib/tournaments'
import type { Participant, Tournament, TournamentStatus } from '@/lib/types'

type Scope = 'explore' | 'my' | 'joined'
type Filter = 'all' | TournamentStatus
type SortKey = 'newest' | 'soonest' | 'popular' | 'capacity'

const EMPTY_UUID = '00000000-0000-0000-0000-000000000000'

export default function Home() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [scope, setScope] = useState<Scope>('explore')
  const [searchQuery, setSearchQuery] = useState('')
  const [sportFilter, setSportFilter] = useState('all')
  const [sortBy, setSortBy] = useState<SortKey>('newest')
  const [joinedTournamentIds, setJoinedTournamentIds] = useState<string[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const deferredSearchQuery = useDeferredValue(searchQuery.trim().toLowerCase())
  const sports = [...new Set(tournaments.map((tournament) => tournament.sport).filter(Boolean))].sort((left, right) => left.localeCompare(right))

  useEffect(() => {
    if (authLoading) return

    async function fetchTournaments() {
      try {
        setLoading(true)
        setErrorMessage('')

        let tournamentQuery = supabase.from('tournaments').select('*').order('created_at', { ascending: false })

        if (user) {
          tournamentQuery = tournamentQuery.or(`is_public.eq.true,owner_id.eq.${user.id}`)
        } else {
          tournamentQuery = tournamentQuery.eq('is_public', true)
        }

        const { data, error } = await tournamentQuery
        if (error) throw error

        const safeTournaments = ((data ?? []) as Tournament[]).map(normalizeTournament)
        const tournamentIds = safeTournaments.map((tournament) => tournament.id)
        const ownerIds = [...new Set(safeTournaments.map((tournament) => tournament.owner_id).filter(Boolean))] as string[]

        const [{ data: participantData, error: participantError }, { data: profileData, error: profileError }] = await Promise.all([
          supabase
            .from('participants')
            .select('tournament_id, user_id')
            .in('tournament_id', tournamentIds.length > 0 ? tournamentIds : [EMPTY_UUID]),
          ownerIds.length > 0
            ? supabase.from('profiles').select('id, username, full_name').in('id', ownerIds)
            : Promise.resolve({ data: [], error: null }),
        ])

        if (participantError) throw participantError
        if (profileError) throw profileError

        const counts: Record<string, number> = {}
        const joinedIds: string[] = []
        const ownerNames = new Map(
          ((profileData ?? []) as Array<{ id: string; username: string | null; full_name: string | null }>).map((profile) => [
            profile.id,
            profile.full_name || profile.username || 'Organizer',
          ]),
        )

        ;((participantData ?? []) as Pick<Participant, 'tournament_id' | 'user_id'>[]).forEach((participant) => {
          counts[participant.tournament_id] = (counts[participant.tournament_id] ?? 0) + 1

          if (user && participant.user_id === user.id) {
            joinedIds.push(participant.tournament_id)
          }
        })

        setJoinedTournamentIds(joinedIds)
        setTournaments(
          safeTournaments.map((tournament) => ({
            ...tournament,
            current_participants: counts[tournament.id] ?? 0,
            owner_name: tournament.owner_id ? ownerNames.get(tournament.owner_id) ?? tournament.owner_name ?? 'Organizer' : 'Community organizer',
          })),
        )
      } catch (error) {
        setTournaments([])
        setJoinedTournamentIds([])
        setErrorMessage(getErrorMessage(error, 'Could not load tournaments right now.'))
      } finally {
        setLoading(false)
      }
    }

    void fetchTournaments()
  }, [authLoading, user])

  const scopedTournaments = tournaments.filter((tournament) => {
    if (scope === 'my') return Boolean(user && tournament.owner_id === user.id)
    if (scope === 'joined') return joinedTournamentIds.includes(tournament.id)
    return true
  })

  const statusFilteredTournaments =
    filter === 'all' ? scopedTournaments : scopedTournaments.filter((tournament) => tournament.status === filter)

  const searchedTournaments = statusFilteredTournaments.filter((tournament) => {
    const matchesSport = sportFilter === 'all' || tournament.sport === sportFilter
    const matchesQuery =
      deferredSearchQuery.length === 0 ||
      [tournament.name, tournament.sport, tournament.description ?? '']
        .join(' ')
        .toLowerCase()
        .includes(deferredSearchQuery)

    return matchesSport && matchesQuery
  })

  const visibleTournaments = [...searchedTournaments].sort((left, right) => {
    if (sortBy === 'soonest') return new Date(left.date).getTime() - new Date(right.date).getTime()
    if (sortBy === 'popular') return (right.current_participants ?? 0) - (left.current_participants ?? 0)
    if (sortBy === 'capacity') return Number(right.max_participants) - Number(left.max_participants)

    return new Date(right.created_at ?? 0).getTime() - new Date(left.created_at ?? 0).getTime()
  })

  const activeFilterCount = [
    scope !== 'explore',
    filter !== 'all',
    sportFilter !== 'all',
    deferredSearchQuery.length > 0,
  ].filter(Boolean).length

  const resultsLabel = loading
    ? 'Loading tournaments'
    : `${visibleTournaments.length} shown${activeFilterCount > 0 ? ` • ${activeFilterCount} active filters` : ''}`

  const clearFilters = () => {
    setSearchQuery('')
    setSportFilter('all')
    setSortBy('newest')
    setFilter('all')
    setScope('explore')
  }

  const filters: Array<{ key: Filter; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'open', label: 'Open' },
    { key: 'live', label: 'Live' },
    { key: 'finished', label: 'Finished' },
  ]

  const scopes: Array<{ key: Scope; label: string }> = [
    { key: 'explore', label: 'Explore' },
    ...(isAuthenticated
      ? [
          { key: 'my' as const, label: 'My tournaments' },
          { key: 'joined' as const, label: 'Joined' },
        ]
      : []),
  ]

  return (
    <PageShell contentClassName="max-w-6xl gap-0">
      <HomeHero tournaments={tournaments} />

      {errorMessage && (
        <div className="app-banner-danger mt-8 rounded-2xl px-4 py-3 text-sm">
          {errorMessage}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="app-eyebrow">Browse</p>
          <div className="mt-2 flex items-center gap-3">
            <h2 className="app-text-primary text-2xl font-semibold tracking-tight">Tournaments</h2>
            <span className="app-chip rounded-full px-3 py-1 text-xs font-medium">
              {resultsLabel}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:items-end">
          <div className="flex flex-wrap gap-2">
            {scopes.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setScope(item.key)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
                  scope === item.key ? 'app-chip-info' : 'app-button-secondary'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((item) => (
              <motion.button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                whileTap={{ scale: 0.95 }}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
                  filter === item.key ? 'app-chip-selected' : 'app-button-secondary'
                }`}
              >
                {item.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <section className="app-card mt-6 rounded-[28px] p-5">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr_auto]">
          <label className="block">
            <span className="app-text-primary mb-2 block text-sm font-semibold">Search</span>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by tournament, game, sport, or description"
              className="app-input w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </label>

          <label className="block">
            <span className="app-text-primary mb-2 block text-sm font-semibold">Game / Sport</span>
            <select
              value={sportFilter}
              onChange={(event) => setSportFilter(event.target.value)}
              className="app-input w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="all">All games & sports</option>
              {sports.map((sport) => (
                <option key={sport} value={sport}>
                  {sport}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="app-text-primary mb-2 block text-sm font-semibold">Sort</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortKey)}
              className="app-input w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="newest">Newest first</option>
              <option value="soonest">Soonest date</option>
              <option value="popular">Most joined</option>
              <option value="capacity">Largest capacity</option>
            </select>
          </label>

          <div className="flex items-end">
            <button
              type="button"
              onClick={clearFilters}
              className="app-button-secondary w-full rounded-xl px-4 py-3 text-sm font-semibold transition duration-200 hover:-translate-y-0.5"
            >
              Reset filters
            </button>
          </div>
        </div>

        <div className="app-text-secondary mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="app-chip rounded-full px-3 py-1">
            Scope: {scopes.find((item) => item.key === scope)?.label ?? 'Explore'}
          </span>
          <span className="app-chip rounded-full px-3 py-1">
            Status: {filters.find((item) => item.key === filter)?.label ?? 'All'}
          </span>
          <span className="app-chip rounded-full px-3 py-1">
            Game / Sport: {sportFilter === 'all' ? 'Any' : sportFilter}
          </span>
          <span className="app-chip rounded-full px-3 py-1">
            Sort: {sortBy === 'newest' ? 'Newest' : sortBy === 'soonest' ? 'Soonest' : sortBy === 'popular' ? 'Most joined' : 'Largest'}
          </span>
        </div>
      </section>

      {loading && (
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="app-card-strong h-44 animate-pulse rounded-[28px]"
            />
          ))}
        </div>
      )}

      {!loading && visibleTournaments.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="app-empty-state mt-8 rounded-3xl px-6 py-8 text-center"
        >
          No tournaments match the current filters. Try resetting filters or broadening your search.
        </motion.p>
      )}

      <motion.div layout className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visibleTournaments.map((tournament, index) => (
            <motion.div
              key={tournament.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <HomeTournamentCard
                tournament={tournament}
                isOwner={Boolean(user && tournament.owner_id === user.id)}
                isJoined={joinedTournamentIds.includes(tournament.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </PageShell>
  )
}
