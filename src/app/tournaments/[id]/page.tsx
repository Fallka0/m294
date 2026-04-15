'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import TournamentBracket from '@/components/TournamentBracket'
import FadeContent from '@/components/react-bits/FadeContent'
import BlurText from '@/components/react-bits/BlurText'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { detailStatusBanner, getDisplayTournamentStatus, modeLabel } from '@/lib/tournaments'
import type { Match, Participant, ScoreFormValues, Tournament } from '@/lib/types'

export default function TournamentDetail() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user, profile, isAuthenticated } = useAuth()

  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(true)
  const [editMatch, setEditMatch] = useState<Match | null>(null)
  const [scores, setScores] = useState<ScoreFormValues>({ score_a: '', score_b: '' })
  const [joining, setJoining] = useState(false)
  const [joinMessage, setJoinMessage] = useState('')

  useEffect(() => {
    void fetchData()
  }, [id])

  const fetchData = async () => {
    const { data: tournamentData } = await supabase.from('tournaments').select('*').eq('id', id).single()
    const { data: participantData } = await supabase
      .from('participants')
      .select('*')
      .eq('tournament_id', id)
      .order('created_at', { ascending: true })
    const { data: matchData } = await supabase
      .from('matches')
      .select('*')
      .eq('tournament_id', id)
      .order('round', { ascending: true })
      .order('created_at', { ascending: true })

    setTournament((tournamentData as Tournament | null) ?? null)
    setParticipants((participantData as Participant[] | null) ?? [])
    setMatches((matchData as Match[] | null) ?? [])
    setLoading(false)
  }

  const currentStatus = getDisplayTournamentStatus(tournament?.status ?? 'open')
  const isOwner = Boolean(user && tournament?.owner_id === user.id)
  const isJoined = Boolean(user && participants.some((participant) => participant.user_id === user.id))
  const isFull = Boolean(tournament && participants.length >= tournament.max_participants)
  const canJoin = Boolean(
    tournament && tournament.is_public !== false && currentStatus === 'open' && !isOwner && !isJoined && !isFull,
  )
  const rounds = useMemo(
    () => [...new Set(matches.map((match) => match.round))].sort((left, right) => left - right),
    [matches],
  )

  const addParticipant = async () => {
    if (!tournament || !isOwner || !newName.trim()) return
    if (participants.length >= tournament.max_participants) {
      alert('Max participants reached.')
      return
    }

    const { error } = await supabase.from('participants').insert([{ tournament_id: id, name: newName.trim() }])

    if (!error) {
      setNewName('')
      await fetchData()
    }
  }

  const removeParticipant = async (participantId: string) => {
    if (!isOwner) return
    await supabase.from('participants').delete().eq('id', participantId)
    await fetchData()
  }

  const deleteTournament = async () => {
    if (!isOwner) return
    if (!confirm('Delete this tournament?')) return
    await supabase.from('tournaments').delete().eq('id', id)
    router.push('/')
  }

  const generateBracket = async () => {
    if (!isOwner) return
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
    await fetchData()
  }

  const openEdit = (match: Match) => {
    setEditMatch(match)
    setScores({
      score_a: match.score_a?.toString() ?? '',
      score_b: match.score_b?.toString() ?? '',
    })
  }

  const saveResult = async () => {
    if (!editMatch || !isOwner) return

    const scoreA = Number.parseInt(scores.score_a, 10)
    const scoreB = Number.parseInt(scores.score_b, 10)
    const winner = scoreA > scoreB ? editMatch.participant_a : editMatch.participant_b

    await supabase.from('matches').update({ score_a: scoreA, score_b: scoreB, winner }).eq('id', editMatch.id)

    const currentRoundMatches = matches.filter((match) => match.round === editMatch.round)
    const updatedMatches = currentRoundMatches.map((match) => (match.id === editMatch.id ? { ...match, winner } : match))
    const allDone = updatedMatches.every((match) => match.winner !== null)

    if (allDone && updatedMatches.length > 1) {
      const winners = updatedMatches.map((match) => match.winner)
      const nextRound = editMatch.round + 1
      const nextRoundExists = matches.some((match) => match.round === nextRound)

      if (!nextRoundExists) {
        const nextMatches = []

        for (let index = 0; index < winners.length - 1; index += 2) {
          nextMatches.push({
            tournament_id: id,
            participant_a: winners[index],
            participant_b: winners[index + 1] ?? null,
            round: nextRound,
          })
        }

        await supabase.from('matches').insert(nextMatches)
      }
    }

    setEditMatch(null)
    const { data: matchData } = await supabase
      .from('matches')
      .select('*')
      .eq('tournament_id', id)
      .order('round', { ascending: true })
      .order('created_at', { ascending: true })

    setMatches((matchData as Match[] | null) ?? [])
  }

  const getName = (participantId: string | null) => {
    if (!participantId) return 'Bye'
    return participants.find((participant) => participant.id === participantId)?.name || '?'
  }

  const joinTournament = async () => {
    if (!tournament) return
    setJoinMessage('')

    if (!isAuthenticated) {
      router.push('/auth')
      return
    }

    if (!canJoin || !user) return

    setJoining(true)
    const displayName = profile?.username || profile?.full_name || user.email?.split('@')[0] || 'Player'
    const { error } = await supabase.from('participants').insert([
      {
        tournament_id: id,
        name: displayName,
        user_id: user.id,
      },
    ])

    if (!error) {
      await fetchData()
      setJoinMessage('You joined the tournament.')
    } else {
      setJoinMessage(error.message)
    }
    setJoining(false)
  }

  if (loading) return <p className="p-10 text-gray-500">Loading...</p>
  if (!tournament) return <p className="p-10 text-gray-500">Tournament not found.</p>

  const banner = detailStatusBanner[currentStatus]

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#050505_0px,#050505_104px,#f5f5f5_104px,#f5f5f5_100%)]">
      <FadeContent initialOpacity={0} duration={0.6} ease="ease-out">
        <div className="mx-auto max-w-6xl px-6 pt-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/60 transition duration-200 hover:text-white">
            <Image src="/arrow-left.svg" alt="" width={16} height={16} className="h-4 w-4" aria-hidden="true" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <div className="mx-auto mt-4 max-w-6xl px-6">
          <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_34%),linear-gradient(180deg,rgba(17,24,39,0.98)_0%,rgba(8,8,8,0.98)_100%)] px-7 py-8 text-white shadow-[0_24px_80px_rgba(2,8,23,0.35)]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className={`inline-flex rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] ${banner.className}`}>
                  {banner.label}
                </div>
                <BlurText text={tournament.name} delay={25} className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-5xl" />
                <div className="mt-4 flex flex-wrap gap-3 text-sm text-white/65">
                  <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">{tournament.sport}</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">{modeLabel[tournament.mode]}</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                    {participants.length}/{tournament.max_participants} participants
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                    {tournament.is_public === false ? 'Private' : 'Public'}
                  </span>
                </div>
                {tournament.description && <p className="mt-5 max-w-2xl text-sm leading-7 text-white/65">{tournament.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3 lg:w-[320px]">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/40">Stage</p>
                  <p className="mt-2 text-lg font-semibold text-white">{banner.label}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/40">Matches</p>
                  <p className="mt-2 text-lg font-semibold text-white">{matches.length}</p>
                </div>
                <div className="col-span-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/40">Organizer</p>
                  <p className="mt-2 text-lg font-semibold text-white">{isOwner ? 'You' : tournament.owner_name || 'Community organizer'}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="mx-auto mt-6 grid max-w-6xl grid-cols-1 gap-6 px-6 pb-10 lg:grid-cols-3">
          <div className="rounded-[28px] border border-black/5 bg-white/95 p-6 text-gray-900 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Overview</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">{tournament.name}</h2>
              </div>

              {isOwner && (
                <button
                  onClick={() => router.push(`/tournaments/${id}/edit`)}
                  className="cursor-pointer rounded-full border border-black/10 bg-white p-2 text-gray-400 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:text-gray-600"
                >
                  <Image src="/edit.svg" alt="" width={18} height={18} className="h-[18px] w-[18px]" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Sport</p>
                <p className="font-semibold text-gray-900">{tournament.sport}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Mode</p>
                <p className="text-gray-900">{modeLabel[tournament.mode]}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Participants</p>
                <p className="inline-flex items-center gap-2 text-gray-900">
                  <Image src="/team.svg" alt="" width={18} height={18} className="h-[18px] w-[18px]" aria-hidden="true" />
                  {participants.length}/{tournament.max_participants}
                </p>
              </div>
            </div>

            <div className="mb-3 inline-flex items-center gap-2">
              <Image src="/trophy.svg" alt="" width={18} height={18} className="h-[18px] w-[18px]" aria-hidden="true" />
              <span className="font-bold text-gray-950">Participants</span>
            </div>

            <ul className="mb-4 flex flex-col gap-2">
              {participants.map((participant, index) => (
                <li key={participant.id} className="flex justify-between rounded-2xl border border-cyan-100 bg-cyan-50/70 px-4 py-3">
                  <span className="text-gray-900">
                    {index + 1}. {participant.name}
                  </span>
                  {isOwner && (
                    <button
                      onClick={() => removeParticipant(participant.id)}
                      className="cursor-pointer transition duration-200 hover:-translate-y-0.5 hover:opacity-80"
                    >
                      <Image src="/cross.svg" alt="Remove participant" width={14} height={14} className="h-3.5 w-3.5" />
                    </button>
                  )}
                </li>
              ))}
            </ul>

            {isOwner ? (
              <div className="flex gap-2">
                <input
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      void addParticipant()
                    }
                  }}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="Add participant"
                />
                <button
                  onClick={addParticipant}
                  className="cursor-pointer rounded-xl bg-cyan-400 px-4 text-white transition duration-200 hover:-translate-y-0.5 hover:bg-cyan-500 hover:shadow-md"
                >
                  +
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {canJoin && (
                  <button
                    onClick={joinTournament}
                    disabled={joining}
                    className="w-full rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-cyan-500 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                  >
                    {joining ? 'Joining...' : 'Join Tournament'}
                  </button>
                )}
                {isJoined && (
                  <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                    You already joined this tournament.
                  </div>
                )}
                {isFull && !isOwner && (
                  <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                    This tournament is already full.
                  </div>
                )}
                {joinMessage && (
                  <div className="rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm font-medium text-cyan-700">
                    {joinMessage}
                  </div>
                )}
                {!isAuthenticated && tournament.is_public !== false && (
                  <Link
                    href="/auth"
                    className="block rounded-xl border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700 transition duration-200 hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow-sm"
                  >
                    Sign in to join
                  </Link>
                )}
              </div>
            )}

            {isOwner && (
              <button
                onClick={deleteTournament}
                className="mt-6 w-full cursor-pointer rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-500 transition duration-200 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 hover:shadow-sm"
              >
                Delete Tournament
              </button>
            )}
          </div>

          <div className="lg:col-span-2 rounded-[28px] border border-black/5 bg-white/95 p-6 text-gray-900 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Bracket</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">Tournament Bracket</h2>
                <p className="mt-2 text-sm text-gray-500">Generate matches and update results without leaving this page.</p>
              </div>
              {isOwner && participants.length >= 2 && (
                <button
                  onClick={generateBracket}
                  className="cursor-pointer rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-cyan-500 hover:shadow-md"
                >
                  {matches.length > 0 ? 'Regenerate' : 'Generate Bracket'}
                </button>
              )}
            </div>

            {matches.length > 0 ? (
              <TournamentBracket
                matches={matches}
                participants={participants}
                rounds={rounds}
                onMatchClick={isOwner ? openEdit : undefined}
                locked={!isOwner}
              />
            ) : (
              <div className="rounded-[24px] border border-dashed border-black/10 bg-gray-50 px-6 py-10 text-center text-gray-400">
                Add at least 2 participants, then generate the bracket.
              </div>
            )}
          </div>
        </div>
      </FadeContent>

      {editMatch && isOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-8 text-gray-900 shadow-xl">
            <h2 className="mb-2 text-xl font-bold text-gray-900">Enter Result</h2>
            <p className="mb-4 text-sm text-gray-500">
              {getName(editMatch.participant_a)} vs {getName(editMatch.participant_b)}
            </p>

            <div className="mb-6 flex gap-4">
              <input
                type="number"
                value={scores.score_a}
                onChange={(event) => setScores((current) => ({ ...current, score_a: event.target.value }))}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-lg font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <input
                type="number"
                value={scores.score_b}
                onChange={(event) => setScores((current) => ({ ...current, score_b: event.target.value }))}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-lg font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setEditMatch(null)}
                className="flex-1 cursor-pointer rounded-lg border border-gray-200 py-3 font-medium text-gray-700 transition duration-200 hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={saveResult}
                className="flex-1 cursor-pointer rounded-lg bg-cyan-400 py-3 font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-cyan-500 hover:shadow-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
