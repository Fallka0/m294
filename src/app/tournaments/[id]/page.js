'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'


export default function TournamentDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [tournament, setTournament] = useState(null)
  const [participants, setParticipants] = useState([])
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: t } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', id)
      .single()

    const { data: p } = await supabase
      .from('participants')
      .select('*')
      .eq('tournament_id', id)
      .order('created_at', { ascending: true })

    setTournament(t)
    setParticipants(p || [])
    setLoading(false)
  }

  const addParticipant = async () => {
    if (!newName.trim()) return

    if (participants.length >= tournament.max_participants) {
      alert('Maximale Teilnehmerzahl erreicht.')
      return
    }

    const { error } = await supabase.from('participants').insert([{
      tournament_id: id,
      name: newName.trim()
    }])

    if (!error) {
      setNewName('')
      fetchData()
    }
  }

  const removeParticipant = async (participantId) => {
    await supabase.from('participants').delete().eq('id', participantId)
    fetchData()
  }

  const deleteTournament = async () => {
    if (!confirm('Turnier wirklich löschen?')) return
    await supabase.from('tournaments').delete().eq('id', id)
    router.push('/')
  }

  if (loading) return <p className="p-10 text-gray-500">Laden...</p>
  if (!tournament) return <p className="p-10 text-gray-500">Turnier nicht gefunden.</p>

  const statusLabel = { open: 'Offen', live: 'Live', finished: 'Abgeschlossen' }
  const statusColor = {
    open: 'bg-green-100 text-green-700',
    live: 'bg-yellow-100 text-yellow-700',
    finished: 'bg-gray-100 text-gray-500'
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">{tournament.name}</h1>
          <p className="text-gray-500 mt-1">{tournament.sport} · {tournament.date}</p>
          <p className="text-gray-500 text-sm">
            Modus: {tournament.mode} · Max. {tournament.max_participants} Teilnehmer
          </p>
        </div>
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${statusColor[tournament.status]}`}>
          {statusLabel[tournament.status]}
        </span>
      </div>

{/* Aktionen */}
<div className="flex gap-3 mb-8">
  <button
    onClick={() => router.push(`/tournaments/${id}/edit`)}
    className="border rounded-lg px-4 py-2 text-sm hover:bg-gray-50"
  >
    Bearbeiten
  </button>
  <button
    onClick={deleteTournament}
    className="border border-red-300 text-red-600 rounded-lg px-4 py-2 text-sm hover:bg-red-50"
  >
    Löschen
  </button>
  {participants.length >= 2 && (
    <button
      onClick={() => router.push(`/tournaments/${id}/bracket`)}
      className="bg-blue-700 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-800"
    >
      Spielplan anzeigen
    </button>
  )}
</div>

      {/* Teilnehmer */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Teilnehmer ({participants.length}/{tournament.max_participants})
        </h2>

        {participants.length === 0 && (
          <p className="text-gray-400 text-sm mb-4">Noch keine Teilnehmer angemeldet.</p>
        )}

        <ul className="flex flex-col gap-2 mb-4">
          {participants.map((p) => (
            <li key={p.id} className="flex justify-between items-center border rounded-lg px-4 py-2">
              <span>{p.name}</span>
              <button
                onClick={() => removeParticipant(p.id)}
                className="text-red-400 hover:text-red-600 text-sm"
              >
                Entfernen
              </button>
            </li>
          ))}
        </ul>

        {/* Teilnehmer hinzufügen */}
        {participants.length < tournament.max_participants && (
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addParticipant()}
              placeholder="Name des Teilnehmers"
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
            />
            <button
              onClick={addParticipant}
              className="bg-blue-700 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-800"
            >
              Hinzufügen
            </button>
          </div>
        )}
      </div>

    </main>
  )
}