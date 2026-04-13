'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import TournamentCard from '@/components/TournamentCard'

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

      if (!error) setTournaments(data)
      setLoading(false)
    }

    fetchTournaments()
  }, [])

  const filtered = filter === 'all'
    ? tournaments
    : tournaments.filter(t => t.status === filter)

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'open', label: 'Open' },
    { key: 'live', label: 'Live' },
    { key: 'finished', label: 'Finished' },
  ]

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Tournaments</h1>

        {/* Filter */}
        <div className="flex gap-2 mb-8">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition
                ${filter === f.key
                  ? 'bg-gray-800 text-white border-gray-800'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading && <p className="text-gray-400">Laden...</p>}

        {!loading && filtered.length === 0 && (
          <p className="text-gray-400">Keine Turniere gefunden.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(t => (
            <TournamentCard key={t.id} tournament={t} />
          ))}
        </div>
      </div>
    </main>
  )
}