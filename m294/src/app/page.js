'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import TournamentCard from '@/components/TournamentCard'
import Link from 'next/link'

export default function Home() {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)

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

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Turniere</h1>
      </div>

      {loading && <p className="text-gray-500">Laden...</p>}

      {!loading && tournaments.length === 0 && (
        <p className="text-gray-500">Noch keine Turniere vorhanden.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map((t) => (
          <TournamentCard key={t.id} tournament={t} />
        ))}
      </div>
    </main>
  )
}