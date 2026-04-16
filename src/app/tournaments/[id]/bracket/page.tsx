'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Match, Participant, ScoreFormValues, Tournament } from '@/lib/types'

export default function BracketPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [matches, setMatches] = useState<Match[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [loading, setLoading] = useState(true)
  const [editMatch, setEditMatch] = useState<Match | null>(null)
  const [scores, setScores] = useState<ScoreFormValues>({ score_a: '', score_b: '' })

  useEffect(() => {
    void fetchAll()
  }, [id])

  const fetchAll = async () => {
    const { data: tournamentData } = await supabase.from('tournaments').select('*').eq('id', id).single()
    const { data: participantData } = await supabase.from('participants').select('*').eq('tournament_id', id)
    const { data: matchData } = await supabase
      .from('matches')
      .select('*')
      .eq('tournament_id', id)
      .order('round', { ascending: true })

    setTournament((tournamentData as Tournament | null) ?? null)
    setParticipants((participantData as Participant[] | null) ?? [])
    setMatches((matchData as Match[] | null) ?? [])
    setLoading(false)
  }

  const generateBracket = async () => {
    if (!confirm('Generate bracket? Existing matches will be deleted.')) return

    await supabase.from('matches').delete().eq('tournament_id', id)

    const shuffled = [...participants].sort(() => Math.random() - 0.5)
    const newMatches = []

    for (let index = 0; index < shuffled.length - 1; index += 2) {
      newMatches.push({
        tournament_id: id,
        participant_a: shuffled[index].id,
        participant_b: shuffled[index + 1]?.id ?? null,
        round: 1,
      })
    }

    await supabase.from('matches').insert(newMatches)
    await fetchAll()
  }

  const getName = (participantId: string | null) => {
    if (!participantId) return 'Bye'
    return participants.find((participant) => participant.id === participantId)?.name || '?'
  }

  const openEdit = (match: Match) => {
    setEditMatch(match)
    setScores({
      score_a: match.score_a?.toString() ?? '',
      score_b: match.score_b?.toString() ?? '',
    })
  }

  const saveResult = async () => {
    if (!editMatch) return

    const scoreA = Number.parseInt(scores.score_a, 10)
    const scoreB = Number.parseInt(scores.score_b, 10)
    const winner = scoreA > scoreB ? editMatch.participant_a : editMatch.participant_b

    await supabase
      .from('matches')
      .update({
        score_a: scoreA,
        score_b: scoreB,
        winner,
      })
      .eq('id', editMatch.id)

    setEditMatch(null)
    await fetchAll()
  }

  if (loading) return <p className="app-text-secondary p-10">Laden...</p>

  const rounds = [...new Set(matches.map((match) => match.round))].sort((left, right) => left - right)

  return (
    <main className="page-shell min-h-screen px-6 py-10 transition-colors duration-300">
      <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push(`/tournaments/${id}`)}
            className="mb-2 block text-sm text-white/80 transition duration-200 hover:text-white"
          >
            Back
          </button>
          <h1 className="text-3xl font-bold text-white">{tournament?.name}</h1>
          <p className="text-sm text-white/80">Bracket</p>
        </div>
        <button
          onClick={generateBracket}
          className="app-button-primary rounded-lg px-4 py-2 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          {matches.length > 0 ? 'Regenerate' : 'Generate Bracket'}
        </button>
      </div>

      {matches.length === 0 && <p className="app-empty-state rounded-2xl px-5 py-4 text-sm">No bracket generated yet.</p>}

      {rounds.map((round) => (
        <div key={round} className="app-card mb-8 rounded-[28px] p-6">
          <h2 className="app-text-primary mb-3 text-lg font-semibold">Round {round}</h2>
          <div className="flex flex-col gap-3">
            {matches
              .filter((match) => match.round === round)
              .map((match) => (
                <div key={match.id} className="app-card-elevated flex items-center justify-between rounded-xl px-5 py-4">
                  <div className="app-text-primary flex items-center gap-4">
                    <span className={`font-medium ${match.winner === match.participant_a ? 'text-cyan-600' : ''}`}>
                      {getName(match.participant_a)}
                    </span>
                    <span className="app-text-muted text-sm">vs</span>
                    <span className={`font-medium ${match.winner === match.participant_b ? 'text-cyan-600' : ''}`}>
                      {getName(match.participant_b)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {match.score_a !== null && match.score_b !== null && (
                      <span className="app-text-secondary font-mono text-sm">
                        {match.score_a} : {match.score_b}
                      </span>
                    )}
                    <button
                      onClick={() => openEdit(match)}
                      className="app-button-secondary rounded-lg px-3 py-1 text-sm transition duration-200 hover:-translate-y-0.5"
                    >
                      {match.winner ? 'Edit' : 'Result'}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}

      {editMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="app-card w-full max-w-sm rounded-2xl p-8 shadow-xl">
            <h2 className="app-text-primary mb-6 text-center text-xl font-bold">Enter result</h2>

            <div className="mb-6 flex items-center justify-center gap-4">
              <div className="flex-1 text-center">
                <p className="app-text-primary mb-2 text-sm font-medium">{getName(editMatch.participant_a)}</p>
                <input
                  type="number"
                  min={0}
                  value={scores.score_a}
                  onChange={(event) => setScores((current) => ({ ...current, score_a: event.target.value }))}
                  className="app-input w-full rounded-lg px-3 py-2 text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
              <span className="app-text-muted font-bold">:</span>
              <div className="flex-1 text-center">
                <p className="app-text-primary mb-2 text-sm font-medium">{getName(editMatch.participant_b)}</p>
                <input
                  type="number"
                  min={0}
                  value={scores.score_b}
                  onChange={(event) => setScores((current) => ({ ...current, score_b: event.target.value }))}
                  className="app-input w-full rounded-lg px-3 py-2 text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditMatch(null)}
                className="app-button-secondary flex-1 rounded-lg px-4 py-2 transition duration-200 hover:-translate-y-0.5"
              >
                Cancel
              </button>
              <button
                onClick={saveResult}
                className="app-button-primary flex-1 rounded-lg px-4 py-2 transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </main>
  )
}
