'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import HomeHero from '@/components/home/HomeHero'
import HomeTournamentCard from '@/components/home/HomeTournamentCard'
import { motion, AnimatePresence } from 'framer-motion'

export default function Home() {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetchTournaments = async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error) {
        setTournaments((data || []).map((tournament) => ({
          ...tournament,
          status: tournament.status ?? 'open',
        })))
      }
      setLoading(false)
    }
    fetchTournaments()
  }, [])

  const filtered = filter === 'all' ? tournaments : tournaments.filter((tournament) => tournament.status === filter)

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'open', label: 'Open' },
    { key: 'live', label: 'Live' },
    { key: 'finished', label: 'Finished' },
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
                {filtered.length} shown
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <motion.button
                key={f.key}
                onClick={() => setFilter(f.key)}
                whileTap={{ scale: 0.95 }}
                className={`rounded-full border px-4 py-2 text-sm font-medium cursor-pointer transition duration-200 hover:-translate-y-0.5 hover:shadow-sm
                  ${filter === f.key
                    ? 'border-gray-950 bg-gray-950 text-white'
                    : 'border-black/10 bg-white/90 text-gray-600 hover:bg-white'
                  }`}
              >
                {f.label}
              </motion.button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-[28px] border border-black/5 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]" />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
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
            {filtered.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <HomeTournamentCard tournament={t} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  )
}
