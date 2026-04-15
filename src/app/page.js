'use client'
import Image from 'next/image'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import SpotlightCard from '@/components/SpotlightCard'
import { motion, AnimatePresence } from 'framer-motion'

const statusConfig = {
  open: { label: 'Open', className: 'bg-green-500 text-white' },
  live: { label: 'Live', className: 'bg-cyan-400 text-white' },
  finished: { label: 'Finished', className: 'bg-gray-200 text-gray-500' },
}

const modeLabel = {
  knockout: 'Knockout',
  group: 'Group Phase',
  both: 'Both',
}

function TournamentCard({ tournament, index }) {
  const status = statusConfig[tournament.status]
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/tournaments/${tournament.id}`}>
        <SpotlightCard className="p-5 cursor-pointer h-full">
          <div className="flex justify-between items-start mb-3">
            <h2 className="text-lg font-bold text-gray-900 leading-tight pr-2">
              {tournament.name}
            </h2>
            <span className={`text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap ${status.className}`}>
              {status.label}
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-700 mb-3">
            {tournament.sport}
            <span className="text-gray-400 font-normal"> - {modeLabel[tournament.mode]}</span>
          </p>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Image src="/calendar.svg" alt="" width={18} height={18} className="h-[18px] w-[18px]" aria-hidden="true" />
              <span>{new Date(tournament.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Image src="/team.svg" alt="" width={18} height={18} className="h-[18px] w-[18px]" aria-hidden="true" />
              <span>{tournament.max_participants} participants max</span>
            </div>
          </div>
        </SpotlightCard>
      </Link>
    </motion.div>
  )
}

export default function Home() {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [titleVisible, setTitleVisible] = useState(false)

  useEffect(() => {
    const fetchTournaments = async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error) setTournaments(data)
      setLoading(false)
    }
    fetchTournaments()
    setTimeout(() => setTitleVisible(true), 100)
  }, [])

  const filtered = filter === 'all' ? tournaments : tournaments.filter(t => t.status === filter)

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'open', label: 'Open' },
    { key: 'live', label: 'Live' },
    { key: 'finished', label: 'Finished' },
  ]

  const titleWords = 'Tournaments'.split('')

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 flex overflow-hidden">
          {titleWords.map((char, i) => (
            <motion.span
              key={i}
              initial={{ filter: 'blur(10px)', opacity: 0, y: 10 }}
              animate={titleVisible ? { filter: 'blur(0px)', opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.04 }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </h1>

        <div className="flex gap-2 mb-8">
          {filters.map(f => (
            <motion.button
              key={f.key}
              onClick={() => setFilter(f.key)}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-full text-sm font-medium border cursor-pointer transition duration-200 hover:-translate-y-0.5 hover:shadow-sm
                ${filter === f.key
                  ? 'bg-gray-800 text-white border-gray-800'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
            >
              {f.label}
            </motion.button>
          ))}
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 h-36 animate-pulse border border-gray-100" />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-400"
          >
            Keine Turniere gefunden.
          </motion.p>
        )}

        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((t, i) => (
              <TournamentCard key={t.id} tournament={t} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  )
}