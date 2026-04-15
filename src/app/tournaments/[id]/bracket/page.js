'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'

export default function BracketPage() {
  const { id } = useParams()
  const router = useRouter()
  const [matches, setMatches] = useState([])
  const [participants, setParticipants] = useState([])
  const [tournament, setTournament] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editMatch, setEditMatch] = useState(null)
  const [scores, setScores] = useState({ score_a: '', score_b: '' })

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    const { data: t } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', id)
      .single()

    const { data: p } = await supabase
      .from('participants')
      .select('*')
      .eq('tournament_id', id)

    const { data: m } = await supabase
      .from('matches')
      .select('*')
      .eq('tournament_id', id)
      .order('round', { ascending: true })

    setTournament(t)
    setParticipants(p || [])
    setMatches(m || [])
    setLoading(false)
  }

  const generateBracket = async () => {
    if (!confirm('Spielplan generieren? Bestehende Matches werden gelÃ¶scht.')) return

    // Bestehende Matches lÃ¶schen
    await supabase.from('matches').delete().eq('tournament_id', id)

    // Teilnehmer zufÃ¤llig mischen
    const shuffled = [...participants].sort(() => Math.random() - 0.5)
    const newMatches = []

    for (let i = 0; i < shuffled.length - 1; i += 2) {
      newMatches.push({
        tournament_id: id,
        participant_a: shuffled[i].id,
        participant_b: shuffled[i + 1]?.id || null,
        round: 1,
      })
    }

    await supabase.from('matches').insert(newMatches)
    fetchAll()
  }

  const getName = (participantId) => {
    if (!participantId) return 'Freilos'
    return participants.find(p => p.id === participantId)?.name || '?'
  }

  const openEdit = (match) => {
    setEditMatch(match)
    setScores({
      score_a: match.score_a ?? '',
      score_b: match.score_b ?? '',
    })
  }

  const saveResult = async () => {
    const score_a = parseInt(scores.score_a)
    const score_b = parseInt(scores.score_b)
    const winner = score_a > score_b
      ? editMatch.participant_a
      : editMatch.participant_b

    await supabase.from('matches').update({
      score_a,
      score_b,
      winner,
    }).eq('id', editMatch.id)

    setEditMatch(null)
    fetchAll()
  }

  if (loading) return <p className="p-10 text-gray-500">Laden...</p>

  const rounds = [...new Set(matches.map(m => m.round))].sort()

  return (
    <main className="max-w-3xl mx-auto px-6 py-10 text-gray-900">
      <div className="flex justify-between items-center mb-8">
        <div>
          <button
            onClick={() => router.push(`/tournaments/${id}`)}
            className="text-sm text-gray-400 hover:text-gray-600 mb-2 block"
          >
            â† ZurÃ¼ck
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{tournament?.name}</h1>
          <p className="text-gray-500 text-sm">Spielplan</p>
        </div>
        <button
          onClick={generateBracket}
          className="bg-blue-700 text-white rounded-lg px-4 py-2 text-sm cursor-pointer transition duration-200 hover:bg-blue-800 hover:-translate-y-0.5 hover:shadow-md"
        >
          {matches.length > 0 ? 'Neu generieren' : 'Spielplan generieren'}
        </button>
      </div>

      {matches.length === 0 && (
        <p className="text-gray-400">Noch kein Spielplan generiert.</p>
      )}

      {rounds.map(round => (
        <div key={round} className="mb-8">
          <h2 className="text-lg font-semibold mb-3 text-gray-900">Runde {round}</h2>
          <div className="flex flex-col gap-3">
            {matches.filter(m => m.round === round).map(match => (
              <div
                key={match.id}
                className="border rounded-xl px-5 py-4 flex justify-between items-center"
              >
                <div className="flex items-center gap-4 text-gray-900">
                  <span className={`font-medium ${match.winner === match.participant_a ? 'text-blue-700' : ''}`}>
                    {getName(match.participant_a)}
                  </span>
                  <span className="text-gray-400 text-sm">vs</span>
                  <span className={`font-medium ${match.winner === match.participant_b ? 'text-blue-700' : ''}`}>
                    {getName(match.participant_b)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {match.score_a !== null && match.score_b !== null && (
                    <span className="text-gray-500 text-sm font-mono">
                      {match.score_a} : {match.score_b}
                    </span>
                  )}
                  <button
                    onClick={() => openEdit(match)}
                    className="text-sm border rounded-lg px-3 py-1 cursor-pointer transition duration-200 hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    {match.winner ? 'Bearbeiten' : 'Ergebnis'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Ergebnis Modal */}
      {editMatch && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl border border-gray-100 text-gray-900">
            <h2 className="text-xl font-bold mb-6 text-center text-gray-900">Ergebnis eintragen</h2>

            <div className="flex items-center gap-4 justify-center mb-6">
              <div className="text-center flex-1">
                <p className="text-sm font-medium text-gray-700 mb-2">{getName(editMatch.participant_a)}</p>
                <input
                  type="number"
                  min={0}
                  value={scores.score_a}
                  onChange={(e) => setScores({ ...scores, score_a: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-center text-xl font-bold text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
              <span className="text-gray-400 font-bold">:</span>
              <div className="text-center flex-1">
                <p className="text-sm font-medium text-gray-700 mb-2">{getName(editMatch.participant_b)}</p>
                <input
                  type="number"
                  min={0}
                  value={scores.score_b}
                  onChange={(e) => setScores({ ...scores, score_b: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-center text-xl font-bold text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditMatch(null)}
                className="flex-1 border rounded-lg px-4 py-2 text-gray-700 cursor-pointer transition duration-200 hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-sm"
              >
                Abbrechen
              </button>
              <button
                onClick={saveResult}
                className="flex-1 bg-blue-700 text-white rounded-lg px-4 py-2 cursor-pointer transition duration-200 hover:bg-blue-800 hover:-translate-y-0.5 hover:shadow-md"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
