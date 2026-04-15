'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import HomeHero from '@/components/home/HomeHero'
import HomeTournamentCard from '@/components/home/HomeTournamentCard'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { normalizeTournament } from '@/lib/tournaments'
import type { Participant, Tournament, TournamentStatus } from '@/lib/types'

type Scope = 'explore' | 'my' | 'joined'
type Filter = 'all' | TournamentStatus

const EMPTY_UUID = '00000000-0000-0000-0000-000000000000'

export default function Home() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [scope, setScope] = useState<Scope>('explore')
  const [joinedTournamentIds, setJoinedTournamentIds] = useState<string[]>([])

  useEffect(() => {
    if (authLoading) return

    async function fetchTournaments() {
      setLoading(true)

      let tournamentQuery = supabase.from('tournaments').select('*').order('created_at', { ascending: false })

      if (user) {
        tournamentQuery = tournamentQuery.or(`is_public.eq.true,owner_id.eq.${user.id}`)
      } else {
        tournamentQuery = tournamentQuery.eq('is_public', true)
      }

      const { data, error } = await tournamentQuery

      if (error) {
        console.error('fetchTournaments error:', error)
        setLoading(false)
        return
      }

      const safeTournaments = ((data ?? []) as Tournament[]).map(normalizeTournament)
      setTournaments(safeTournaments)

      const tournamentIds = safeTournaments.map((tournament) => tournament.id)
      const { data: participantData, error: participantError } = await supabase
        .from('participants')
        .select('tournament_id, user_id')
        .in('tournament_id', tournamentIds.length > 0 ? tournamentIds : [EMPTY_UUID])

      if (participantError) {
        console.error('fetch participants error:', participantError)
        setLoading(false)
        return
      }

      const counts: Record<string, number> = {}
      const joinedIds: string[] = []

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
        })),
      )
      setLoading(false)
    }

    void fetchTournaments()
  }, [authLoading, user])

  const scopedTournaments = tournaments.filter((tournament) => {
    if (scope === 'my') return Boolean(user && tournament.owner_id === user.id)
    if (scope === 'joined') return joinedTournamentIds.includes(tournament.id)
    return true
  })

  const filteredTournaments =
    filter === 'all' ? scopedTournaments : scopedTournaments.filter((tournament) => tournament.status === filter)

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
    <main className="min-h-screen bg-[linear-gradient(180deg,#050505_0px,#050505_88px,#f5f5f5_88px,#f5f5f5_100%)] px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <HomeHero tournaments={tournaments} />

        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Browse</p>
            <div className="mt-2 flex items-center gap-3">
              <h2 className="text-2xl font-semibold tracking-tight text-gray-950">Tournaments</h2>
              <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-gray-500 shadow-sm">
                {filteredTournaments.length} shown
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
                    scope === item.key
                      ? 'border-cyan-300 bg-cyan-50 text-cyan-700'
                      : 'border-black/10 bg-white/90 text-gray-600 hover:bg-white'
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
                  className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
                    filter === item.key
                      ? 'border-gray-950 bg-gray-950 text-white'
                      : 'border-black/10 bg-white/90 text-gray-600 hover:bg-white'
                  }`}
                >
                  {item.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {loading && (
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="h-44 animate-pulse rounded-[28px] border border-black/5 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]"
              />
            ))}
          </div>
        )}

        {!loading && filteredTournaments.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 rounded-3xl border border-dashed border-black/10 bg-white/70 px-6 py-8 text-center text-gray-400"
          >
            Keine Turniere gefunden.
          </motion.p>
        )}

        <motion.div layout className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredTournaments.map((tournament, index) => (
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
      </div>
    </main>
  )
}
