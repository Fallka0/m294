'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import GroupStageOverview from '@/components/GroupStageOverview'
import TournamentBracket from '@/components/TournamentBracket'
import { supabase } from '@/lib/supabase'
import { buildBracketProgressionChanges, createInitialBracketMatches, getScoreValidationMessage, getTournamentStructure } from '@/lib/bracket'
import { matchFormatLabel, modeLabel, normalizeTournament } from '@/lib/tournaments'
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
  const [scoreError, setScoreError] = useState('')

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

    setTournament(tournamentData ? normalizeTournament(tournamentData as Tournament) : null)
    setParticipants((participantData as Participant[] | null) ?? [])
    setMatches((matchData as Match[] | null) ?? [])
    setLoading(false)
  }

  const structure = useMemo(
    () => (tournament ? getTournamentStructure(tournament.mode, tournament.group_count ?? 1, participants, matches) : null),
    [matches, participants, tournament],
  )

  const generateBracket = async () => {
    if (!tournament) return
    if (!confirm('Generate bracket? Existing matches will be deleted.')) return

    await supabase.from('matches').delete().eq('tournament_id', id)

    const newMatches = createInitialBracketMatches(
      id,
      participants.map((participant) => participant.id),
      tournament.mode,
      tournament.group_count ?? 1,
    )

    if (newMatches.length > 0) {
      await supabase.from('matches').insert(newMatches)
    }
    await fetchAll()
  }

  const getName = (participantId: string | null) => {
    if (!participantId) return 'Bye'
    return participants.find((participant) => participant.id === participantId)?.name || '?'
  }

  const openEdit = (match: Match) => {
    setEditMatch(match)
    setScoreError('')
    setScores({
      score_a: match.score_a?.toString() ?? '',
      score_b: match.score_b?.toString() ?? '',
    })
  }

  const saveResult = async () => {
    if (!editMatch) return

    const validationMessage = getScoreValidationMessage(scores.score_a, scores.score_b, tournament?.match_format ?? 'bo1')
    if (validationMessage) {
      setScoreError(validationMessage)
      return
    }

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

    const updatedMatches = matches.map((match) =>
      match.id === editMatch.id ? { ...match, score_a: scoreA, score_b: scoreB, winner } : match,
    )
    const { updates, inserts } = buildBracketProgressionChanges(
      id,
      updatedMatches,
      tournament?.mode ?? 'knockout',
      tournament?.group_count ?? 1,
      participants,
    )

    await Promise.all(
      updates.map((match) =>
        supabase
          .from('matches')
          .update({
            participant_a: match.participant_a,
            participant_b: match.participant_b,
            score_a: match.score_a,
            score_b: match.score_b,
            winner: match.winner,
          })
          .eq('id', match.id),
      ),
    )

    if (inserts.length > 0) {
      await supabase.from('matches').insert(inserts)
    }

    setEditMatch(null)
    setScoreError('')
    await fetchAll()
  }

  if (loading) return <p className="app-text-secondary p-10">Laden...</p>

  const rounds =
    structure ? [...new Set(structure.knockoutMatches.map((match) => match.round))].sort((left, right) => left - right) : []
  const knockoutParticipants = useMemo(() => {
    if (!structure) return participants

    const participantIds = new Set(
      structure.knockoutMatches.flatMap((match) => [match.participant_a, match.participant_b]).filter(Boolean) as string[],
    )

    return participants.filter((participant) => participantIds.has(participant.id))
  }, [participants, structure])

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
          <p className="text-sm text-white/80">
            {tournament ? `${modeLabel[tournament.mode]} - ${matchFormatLabel[tournament.match_format ?? 'bo1']}` : 'Bracket'}
          </p>
          </div>
          <button
            onClick={generateBracket}
            className="app-button-primary rounded-lg px-4 py-2 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
          {matches.length > 0 ? 'Regenerate' : tournament?.mode === 'knockout' ? 'Generate Bracket' : 'Generate Stage'}
          </button>
        </div>

      {matches.length === 0 && <p className="app-empty-state rounded-2xl px-5 py-4 text-sm">No stage generated yet.</p>}

      {matches.length > 0 && structure && (
        <div className="space-y-6">
          {(tournament?.mode === 'group' || tournament?.mode === 'both') && (
            <GroupStageOverview
              groups={structure.groups}
              matchFormatLabel={matchFormatLabel[tournament?.match_format ?? 'bo1']}
              onMatchClick={openEdit}
            />
          )}

          {tournament?.mode !== 'group' &&
            (structure.knockoutMatches.length > 0 ? (
              <TournamentBracket matches={structure.knockoutMatches} participants={knockoutParticipants} rounds={rounds} onMatchClick={openEdit} />
            ) : (
              <div className="app-empty-state rounded-2xl px-5 py-4 text-sm">
                {structure.isGroupStageComplete
                  ? 'Knockout matches will appear after the qualifying teams are seeded.'
                  : 'Finish the group stage to unlock the knockout bracket.'}
              </div>
            ))}
        </div>
      )}

      {editMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="app-card w-full max-w-sm rounded-2xl p-8 shadow-xl">
            <h2 className="app-text-primary mb-6 text-center text-xl font-bold">Enter result</h2>
            <p className="app-text-muted mb-4 text-center text-xs uppercase tracking-[0.2em]">
              {matchFormatLabel[tournament?.match_format ?? 'bo1']}
            </p>

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

            {scoreError && <p className="app-banner-warning mb-4 rounded-xl px-4 py-3 text-sm">{scoreError}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditMatch(null)
                  setScoreError('')
                }}
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
