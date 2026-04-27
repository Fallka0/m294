'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import GameSportIcon from '@/components/game-sports/GameSportIcon'
import GroupStageOverview from '@/components/GroupStageOverview'
import TournamentBracket from '@/components/TournamentBracket'
import FadeContent from '@/components/react-bits/FadeContent'
import BlurText from '@/components/react-bits/BlurText'
import { useAuth } from '@/components/auth/AuthProvider'
import { getErrorMessage } from '@/lib/errors'
import { supabase } from '@/lib/supabase'
import { buildBracketProgressionChanges, createInitialBracketMatches, getScoreValidationMessage, getTournamentStructure } from '@/lib/bracket'
import { detailStatusBanner, entryTypeLabel, getDisplayTournamentStatus, matchFormatLabel, modeLabel, normalizeTournament } from '@/lib/tournaments'
import type { Match, Participant, ScoreFormValues, Team, Tournament } from '@/lib/types'

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
  const [scoreError, setScoreError] = useState('')
  const [joining, setJoining] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [joinMessage, setJoinMessage] = useState('')
  const [joinMessageTone, setJoinMessageTone] = useState<'error' | 'success' | 'info'>('info')
  const [pageError, setPageError] = useState('')
  const [availableTeams, setAvailableTeams] = useState<Team[]>([])
  const [selectedTeamId, setSelectedTeamId] = useState('')

  useEffect(() => {
    void fetchData()
  }, [id])

  useEffect(() => {
    async function fetchTeams() {
      if (!user || tournament?.entry_type !== 'team') {
        setAvailableTeams([])
        setSelectedTeamId('')
        return
      }

      try {
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setAvailableTeams(((data ?? []) as Team[]))
      } catch (error) {
        setJoinMessage(getErrorMessage(error, 'Could not load your teams.'))
        setJoinMessageTone('error')
        setAvailableTeams([])
      }
    }

    void fetchTeams()
  }, [tournament?.entry_type, user])

  const fetchData = async () => {
    try {
      setLoading(true)
      setPageError('')

      const [{ data: tournamentData, error: tournamentError }, { data: participantData, error: participantError }, { data: matchData, error: matchError }] =
        await Promise.all([
          supabase.from('tournaments').select('*').eq('id', id).single(),
          supabase.from('participants').select('*').eq('tournament_id', id).order('created_at', { ascending: true }),
          supabase.from('matches').select('*').eq('tournament_id', id).order('round', { ascending: true }).order('created_at', { ascending: true }),
        ])

      if (tournamentError) throw tournamentError
      if (participantError) throw participantError
      if (matchError) throw matchError

      const baseTournament = tournamentData ? normalizeTournament(tournamentData as Tournament) : null
      let ownerName = baseTournament?.owner_name ?? null

      if (baseTournament?.owner_id) {
        const { data: ownerProfile, error: ownerProfileError } = await supabase
          .from('profiles')
          .select('username, full_name')
          .eq('id', baseTournament.owner_id)
          .maybeSingle()

        if (ownerProfileError) throw ownerProfileError

        ownerName =
          (ownerProfile as { username?: string | null; full_name?: string | null } | null)?.full_name ||
          (ownerProfile as { username?: string | null; full_name?: string | null } | null)?.username ||
          ownerName
      }

      setTournament(baseTournament ? { ...baseTournament, owner_name: ownerName ?? 'Community organizer' } : null)
      setParticipants((participantData as Participant[] | null) ?? [])
      setMatches((matchData as Match[] | null) ?? [])
    } catch (error) {
      setPageError(getErrorMessage(error, 'Could not load this tournament right now.'))
      setTournament(null)
      setParticipants([])
      setMatches([])
    } finally {
      setLoading(false)
    }
  }

  const currentStatus = getDisplayTournamentStatus(tournament?.status ?? 'open')
  const isOwner = Boolean(user && tournament?.owner_id === user.id)
  const isJoined = Boolean(user && participants.some((participant) => participant.user_id === user.id))
  const isTeamTournament = tournament?.entry_type === 'team'
  const requiredTeamSize = tournament?.team_size ?? 2
  const matchingTeams = availableTeams.filter((team) => team.member_names.length === requiredTeamSize)
  const selectedTeam = matchingTeams.find((team) => team.id === selectedTeamId) ?? null
  const entryCountLabel = isTeamTournament ? 'teams' : 'participants'
  const singularEntryLabel = isTeamTournament ? 'team' : 'participant'
  const isFull = Boolean(tournament && participants.length >= tournament.max_participants)
  const canJoin = Boolean(
    tournament && tournament.is_public !== false && currentStatus === 'open' && !isOwner && !isJoined && !isFull,
  )
  const structure = useMemo(
    () => (tournament ? getTournamentStructure(tournament.mode, tournament.group_count ?? 1, participants, matches) : null),
    [matches, participants, tournament],
  )
  const rounds = useMemo(
    () =>
      structure
        ? [...new Set(structure.knockoutMatches.map((match) => match.round))].sort((left, right) => left - right)
        : [],
    [structure],
  )
  const knockoutParticipants = useMemo(() => {
    if (!structure) return participants

    const participantIds = new Set(
      structure.knockoutMatches.flatMap((match) => [match.participant_a, match.participant_b]).filter(Boolean) as string[],
    )

    return participants.filter((participant) => participantIds.has(participant.id))
  }, [participants, structure])
  const canGenerateKnockoutOnly =
    tournament?.mode === 'both' &&
    Boolean(structure?.isGroupStageComplete) &&
    (structure?.knockoutMatches.length ?? 0) === 0 &&
    matches.length > 0

  useEffect(() => {
    if (!isTeamTournament) {
      setSelectedTeamId('')
      return
    }

    if (matchingTeams.length === 0) {
      setSelectedTeamId('')
      return
    }

    if (!matchingTeams.some((team) => team.id === selectedTeamId)) {
      setSelectedTeamId(matchingTeams[0].id)
    }
  }, [isTeamTournament, matchingTeams, selectedTeamId])

  const addParticipant = async () => {
    if (!tournament || !isOwner || !newName.trim()) return
    if (participants.length >= tournament.max_participants) {
      setJoinMessage('Max participants reached.')
      setJoinMessageTone('error')
      return
    }

    try {
      setJoinMessage('')
      const { error } = await supabase.from('participants').insert([{ tournament_id: id, name: newName.trim() }])
      if (error) throw error

      setNewName('')
      setJoinMessage(`Added ${isTeamTournament ? 'team' : 'participant'}.`)
      setJoinMessageTone('success')
      await fetchData()
    } catch (error) {
      setJoinMessage(getErrorMessage(error, 'Could not add the participant.'))
      setJoinMessageTone('error')
    }
  }

  const removeParticipant = async (participantId: string) => {
    if (!isOwner) return
    try {
      setJoinMessage('')
      const { error } = await supabase.from('participants').delete().eq('id', participantId)
      if (error) throw error
      setJoinMessage(`Removed ${isTeamTournament ? 'team' : 'participant'}.`)
      setJoinMessageTone('success')
      await fetchData()
    } catch (error) {
      setJoinMessage(getErrorMessage(error, 'Could not remove the participant.'))
      setJoinMessageTone('error')
    }
  }

  const deleteTournament = async () => {
    if (!isOwner) return
    if (!confirm('Delete this tournament?')) return
    try {
      setJoinMessage('')
      const { error } = await supabase.from('tournaments').delete().eq('id', id)
      if (error) throw error
      router.push('/')
    } catch (error) {
      setJoinMessage(getErrorMessage(error, 'Could not delete this tournament.'))
      setJoinMessageTone('error')
    }
  }

  const generateBracket = async () => {
    if (!tournament || !isOwner) return
    const confirmationMessage = canGenerateKnockoutOnly
      ? `Generate the knockout bracket from the ${structure?.qualifiedParticipantIds.length ?? 0} qualified teams?`
      : 'Generate bracket? Existing matches will be deleted.'
    if (!confirm(confirmationMessage)) return

    try {
      setJoinMessage('')
      if (canGenerateKnockoutOnly) {
        const { updates, inserts } = buildBracketProgressionChanges(
          id,
          matches,
          tournament.mode,
          tournament.group_count ?? 1,
          participants,
        )

        if (updates.length > 0) {
          throw new Error('Unexpected match updates were returned while generating the knockout bracket.')
        }

        if (inserts.length === 0) {
          throw new Error('No knockout matches could be generated from the completed group stage.')
        }

        const { error: insertError } = await supabase.from('matches').insert(inserts)
        if (insertError) throw insertError
      } else {
        const { error: deleteError } = await supabase.from('matches').delete().eq('tournament_id', id)
        if (deleteError) throw deleteError

        const newMatches = createInitialBracketMatches(
          id,
          participants.map((participant) => participant.id),
          tournament.mode,
          tournament.group_count ?? 1,
        )

        if (newMatches.length > 0) {
          const { error: insertError } = await supabase.from('matches').insert(newMatches)
          if (insertError) throw insertError
        }
      }

      setJoinMessage(canGenerateKnockoutOnly ? 'Knockout bracket generated.' : 'Bracket updated.')
      setJoinMessageTone('success')
      await fetchData()
    } catch (error) {
      setJoinMessage(getErrorMessage(error, 'Could not generate the bracket.'))
      setJoinMessageTone('error')
    }
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
    if (!editMatch || !isOwner || !tournament) return

    const validationMessage = getScoreValidationMessage(scores.score_a, scores.score_b, tournament.match_format ?? 'bo1')
    if (validationMessage) {
      setScoreError(validationMessage)
      return
    }

    const scoreA = Number.parseInt(scores.score_a, 10)
    const scoreB = Number.parseInt(scores.score_b, 10)
    const winner = scoreA > scoreB ? editMatch.participant_a : editMatch.participant_b

    try {
      const { error: updateError } = await supabase.from('matches').update({ score_a: scoreA, score_b: scoreB, winner }).eq('id', editMatch.id)
      if (updateError) throw updateError

      const updatedMatches = matches.map((match) =>
        match.id === editMatch.id ? { ...match, score_a: scoreA, score_b: scoreB, winner } : match,
      )
      const { updates, inserts } = buildBracketProgressionChanges(
        id,
        updatedMatches,
        tournament.mode,
        tournament.group_count ?? 1,
        participants,
      )

      const updateResults = await Promise.all(
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

      const failedUpdate = updateResults.find((result) => result.error)
      if (failedUpdate?.error) throw failedUpdate.error

      if (inserts.length > 0) {
        const { error: insertError } = await supabase.from('matches').insert(inserts)
        if (insertError) throw insertError
      }

      setEditMatch(null)
      setScoreError('')
      setJoinMessage('Result saved.')
      setJoinMessageTone('success')
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('tournament_id', id)
        .order('round', { ascending: true })
        .order('created_at', { ascending: true })
      if (matchError) throw matchError

      setMatches((matchData as Match[] | null) ?? [])
    } catch (error) {
      setJoinMessage(getErrorMessage(error, 'Could not save the result.'))
      setJoinMessageTone('error')
    }
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
    if (isTeamTournament && !selectedTeam) {
      setJoinMessage(`Choose a team with exactly ${requiredTeamSize} players before registering.`)
      setJoinMessageTone('error')
      return
    }

    setJoining(true)
    const displayName = profile?.username || profile?.full_name || user.email?.split('@')[0] || 'Player'

    try {
      const { error } = await supabase.from('participants').insert([
        {
          tournament_id: id,
          name: isTeamTournament ? selectedTeam?.name ?? 'Team' : displayName,
          user_id: user.id,
          team_id: isTeamTournament ? selectedTeam?.id ?? null : null,
        },
      ])
      if (error) throw error

      await fetchData()
      setJoinMessage('You joined the tournament.')
      setJoinMessageTone('success')
    } catch (error) {
      setJoinMessage(getErrorMessage(error, 'Could not join this tournament.'))
      setJoinMessageTone('error')
    } finally {
      setJoining(false)
    }
  }

  const leaveTournament = async () => {
    if (!user || !isJoined) return
    if (!confirm('Are you sure you want to leave this tournament?')) return

    setJoinMessage('')
    setLeaving(true)

    try {
      const { error } = await supabase
        .from('participants')
        .delete()
        .eq('tournament_id', id)
        .eq('user_id', user.id)
      if (error) throw error

      await fetchData()
      setJoinMessage('You left the tournament.')
      setJoinMessageTone('success')
    } catch (error) {
      setJoinMessage(getErrorMessage(error, 'Could not leave this tournament.'))
      setJoinMessageTone('error')
    } finally {
      setLeaving(false)
    }
  }

  if (loading) return <p className="app-text-secondary p-10">Loading...</p>
  if (pageError) return <p className="app-text-secondary p-10">{pageError}</p>
  if (!tournament) return <p className="app-text-secondary p-10">Tournament not found.</p>

  const banner = detailStatusBanner[currentStatus]
  const stageDescription =
    tournament.mode === 'group'
      ? 'Generate groups, report results, and track standings in one place.'
      : tournament.mode === 'both'
        ? 'Play the group stage first, then move qualified teams into the knockout bracket.'
        : 'Generate matches and update results without leaving this page.'

  return (
    <main className="page-shell min-h-screen transition-colors duration-300">
      <FadeContent initialOpacity={0} duration={0.6} ease="ease-out">
        <div className="mx-auto max-w-6xl px-6 pt-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/80 transition duration-200 hover:text-white">
            <Image src="/arrow-left.svg" alt="" width={16} height={16} className="h-4 w-4" aria-hidden="true" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <div className="mx-auto mt-4 max-w-6xl px-6">
          <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_34%),linear-gradient(180deg,rgba(17,24,39,0.98)_0%,rgba(8,8,8,0.98)_100%)] px-7 py-8 text-white shadow-[0_24px_80px_rgba(2,8,23,0.35)]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className={`inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] ${banner.className}`}>
                  {banner.label}
                </div>
                <BlurText text={tournament.name} delay={25} className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-5xl" />
                <div className="mt-4">
                  {tournament.owner_id ? (
                    <Link
                      href={isOwner ? '/profile' : `/organizers/${tournament.owner_id}`}
                      className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 transition duration-200 hover:bg-white/10 hover:text-white"
                    >
                      Created by {isOwner ? 'you' : tournament.owner_name || 'Community organizer'}
                    </Link>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85">
                      Created by Community organizer
                    </span>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-sm text-white/80">
                  <span className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                    <GameSportIcon value={tournament.sport} className="h-8 w-8 rounded-xl border-white/10" iconClassName="h-4 w-4" />
                    <span>{tournament.sport}</span>
                  </span>
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2">{modeLabel[tournament.mode]}</span>
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2">{matchFormatLabel[tournament.match_format ?? 'bo1']}</span>
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2">{entryTypeLabel[tournament.entry_type ?? 'solo']}</span>
                  {isTeamTournament && (
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2">{requiredTeamSize} players per team</span>
                  )}
                  {(tournament.mode === 'group' || tournament.mode === 'both') && (
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2">
                      {tournament.group_count ?? 1} group{(tournament.group_count ?? 1) === 1 ? '' : 's'}
                    </span>
                  )}
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2">
                    {participants.length}/{tournament.max_participants} {entryCountLabel}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2">
                    {tournament.is_public === false ? 'Private' : 'Public'}
                  </span>
                </div>
                {tournament.description && <p className="mt-5 max-w-2xl text-sm leading-7 text-white/80">{tournament.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3 lg:w-[320px]">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/65">Stage</p>
                  <p className="mt-2 text-lg font-semibold text-white">{banner.label}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/65">Matches</p>
                  <p className="mt-2 text-lg font-semibold text-white">{matches.length}</p>
                </div>
                <div className="col-span-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/65">Organizer</p>
                  {tournament.owner_id ? (
                    <Link
                      href={isOwner ? '/profile' : `/organizers/${tournament.owner_id}`}
                      className="mt-2 inline-flex text-lg font-semibold text-white transition duration-200 hover:text-cyan-300"
                    >
                      {isOwner ? 'You' : tournament.owner_name || 'Community organizer'}
                    </Link>
                  ) : (
                    <p className="mt-2 text-lg font-semibold text-white">Community organizer</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="mx-auto mt-6 grid max-w-6xl grid-cols-1 gap-6 px-6 pb-10 lg:grid-cols-3">
          <div className="app-card-strong rounded-[28px] p-6">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="app-eyebrow">Overview</p>
                <h2 className="app-text-primary mt-2 text-2xl font-semibold tracking-tight">{tournament.name}</h2>
              </div>

              {isOwner && (
                <button
                  onClick={() => router.push(`/tournaments/${id}/edit`)}
                  className="app-button-secondary app-text-muted rounded-full p-2 transition duration-200 hover:-translate-y-0.5 hover:text-[var(--text-primary)]"
                >
                  <Image src="/edit.svg" alt="" width={18} height={18} className="theme-icon h-[18px] w-[18px]" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div>
                <p className="app-text-muted text-xs uppercase tracking-[0.2em]">Game / Sport</p>
                <p className="app-text-primary inline-flex items-center gap-3 font-semibold">
                  <GameSportIcon value={tournament.sport} className="h-9 w-9 rounded-xl" iconClassName="h-4 w-4" />
                  <span>{tournament.sport}</span>
                </p>
              </div>
              <div>
                <p className="app-text-muted text-xs uppercase tracking-[0.2em]">Mode</p>
                <p className="app-text-primary">{modeLabel[tournament.mode]}</p>
              </div>
              <div>
                <p className="app-text-muted text-xs uppercase tracking-[0.2em]">Series</p>
                <p className="app-text-primary">{matchFormatLabel[tournament.match_format ?? 'bo1']}</p>
              </div>
              <div>
                <p className="app-text-muted text-xs uppercase tracking-[0.2em]">Entry Type</p>
                <p className="app-text-primary">{entryTypeLabel[tournament.entry_type ?? 'solo']}</p>
              </div>
              {isTeamTournament && (
                <div>
                  <p className="app-text-muted text-xs uppercase tracking-[0.2em]">Team Size</p>
                  <p className="app-text-primary">{requiredTeamSize} players</p>
                </div>
              )}
              <div>
                <p className="app-text-muted text-xs uppercase tracking-[0.2em]">{isTeamTournament ? 'Teams' : 'Participants'}</p>
                <p className="app-text-primary inline-flex items-center gap-2">
                  <Image src="/team.svg" alt="" width={18} height={18} className="theme-icon h-[18px] w-[18px]" aria-hidden="true" />
                  {participants.length}/{tournament.max_participants}
                </p>
              </div>
                <div>
                  <p className="app-text-muted text-xs uppercase tracking-[0.2em]">Creator</p>
                  {tournament.owner_id ? (
                  <Link
                    href={isOwner ? '/profile' : `/organizers/${tournament.owner_id}`}
                    className="app-text-primary font-semibold transition duration-200 hover:text-cyan-600"
                  >
                    {isOwner ? 'You' : tournament.owner_name || 'Community organizer'}
                  </Link>
                ) : (
                  <p className="app-text-primary font-semibold">Community organizer</p>
                )}
              </div>
              {(tournament.mode === 'group' || tournament.mode === 'both') && (
                <div>
                  <p className="app-text-muted text-xs uppercase tracking-[0.2em]">Groups</p>
                  <p className="app-text-primary">{tournament.group_count ?? 1}</p>
                </div>
              )}
            </div>

            <div className="mb-3 inline-flex items-center gap-2">
              <Image src="/team.svg" alt="" width={18} height={18} className="theme-icon h-[18px] w-[18px]" aria-hidden="true" />
              <span className="app-text-primary font-bold">{isTeamTournament ? 'Registered Teams' : 'Participants'}</span>
            </div>

            <ul className="mb-4 flex flex-col gap-2">
              {participants.map((participant, index) => (
                <li key={participant.id} className="app-accent-panel flex justify-between rounded-2xl px-4 py-3">
                  <span className="app-text-primary">
                    {index + 1}. {participant.name}
                  </span>
                  {isOwner && (
                    <button
                      onClick={() => removeParticipant(participant.id)}
                      className="transition duration-200 hover:-translate-y-0.5 hover:opacity-80"
                    >
                      <Image src="/cross.svg" alt="Remove participant" width={14} height={14} className="theme-icon h-3.5 w-3.5" />
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
                  className="app-input flex-1 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder={isTeamTournament ? 'Add team' : 'Add participant'}
                />
                <button
                  onClick={addParticipant}
                  className="app-button-primary rounded-xl px-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  +
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {canJoin && isTeamTournament && (
                  <>
                    <label className="block">
                      <span className="app-text-primary mb-2 block text-sm font-semibold">Choose your team</span>
                      <select
                        value={selectedTeamId}
                        onChange={(event) => {
                          setSelectedTeamId(event.target.value)
                          setJoinMessage('')
                        }}
                        className="app-input w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        disabled={joining || matchingTeams.length === 0}
                      >
                        {matchingTeams.length === 0 ? (
                          <option value="">No team matches this roster size</option>
                        ) : (
                          matchingTeams.map((team) => (
                            <option key={team.id} value={team.id}>
                              {team.name} ({team.member_names.length} players)
                            </option>
                          ))
                        )}
                      </select>
                    </label>
                    <p className="app-text-secondary text-sm">
                      Team tournaments require exactly {requiredTeamSize} players per roster.
                    </p>
                    {matchingTeams.length === 0 && (
                      <Link
                        href="/teams"
                        className="app-button-secondary block rounded-xl px-4 py-3 text-center text-sm font-semibold transition duration-200 hover:-translate-y-0.5"
                      >
                        Create a team first
                      </Link>
                    )}
                  </>
                )}
                {canJoin && (
                  <button
                    onClick={joinTournament}
                    disabled={joining || (isTeamTournament && !selectedTeam)}
                    className="app-button-primary w-full rounded-xl px-4 py-3 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                  >
                    {joining ? (isTeamTournament ? 'Registering team...' : 'Joining...') : isTeamTournament ? 'Register Team' : 'Join Tournament'}
                  </button>
                )}
                {isJoined && (
                  <>
                    <div className="app-banner-success rounded-2xl px-4 py-3 text-sm font-medium">
                      You already joined this tournament as a {singularEntryLabel}.
                    </div>
                    <button
                      onClick={leaveTournament}
                      disabled={leaving}
                      className="app-button-secondary w-full rounded-xl px-4 py-3 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
                    >
                      {leaving ? 'Leaving...' : 'Leave Tournament'}
                    </button>
                  </>
                )}
                {isFull && !isOwner && (
                  <div className="app-banner-warning rounded-2xl px-4 py-3 text-sm font-medium">
                    This tournament is already full.
                  </div>
                )}
                {joinMessage && (
                  <div className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                    joinMessageTone === 'error'
                      ? 'app-banner-danger'
                      : joinMessageTone === 'success'
                        ? 'app-banner-success'
                        : 'app-banner-info'
                  }`}>
                    {joinMessage}
                  </div>
                )}
                {!isAuthenticated && tournament.is_public !== false && (
                  <Link
                    href="/auth"
                    className="app-button-secondary block rounded-xl px-4 py-3 text-center text-sm font-semibold transition duration-200 hover:-translate-y-0.5"
                  >
                    Sign in to join
                  </Link>
                )}
              </div>
            )}

            {isOwner && (
              <button
                onClick={deleteTournament}
                className="app-banner-danger mt-6 w-full rounded-xl px-4 py-3 text-sm font-medium transition duration-200 hover:-translate-y-0.5 hover:shadow-sm"
              >
                Delete Tournament
              </button>
            )}
          </div>

          <div className="app-card-strong lg:col-span-2 rounded-[28px] p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="app-eyebrow">Bracket</p>
                <h2 className="app-text-primary mt-2 text-2xl font-semibold tracking-tight">Tournament Bracket</h2>
                <p className="app-text-secondary mt-2 text-sm">{stageDescription}</p>
              </div>
              {isOwner && participants.length >= 2 && (
                <button
                  onClick={generateBracket}
                  className="app-button-primary rounded-xl px-4 py-2 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  {canGenerateKnockoutOnly
                    ? 'Generate Knockout Bracket'
                    : matches.length > 0
                      ? 'Regenerate'
                      : tournament.mode === 'knockout'
                        ? 'Generate Bracket'
                        : 'Generate Stage'}
                </button>
              )}
            </div>

            {matches.length > 0 && structure ? (
              <div className="space-y-6">
                {(tournament.mode === 'group' || tournament.mode === 'both') && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="app-eyebrow">Group Stage</p>
                        <h3 className="app-text-primary mt-2 text-xl font-semibold tracking-tight">Standings and fixtures</h3>
                      </div>
                      <span className="app-chip rounded-full px-3 py-1 text-xs font-semibold">
                        {matchFormatLabel[tournament.match_format ?? 'bo1']}
                      </span>
                    </div>
                    <GroupStageOverview
                      groups={structure.groups}
                      matchFormatLabel={matchFormatLabel[tournament.match_format ?? 'bo1']}
                      onMatchClick={isOwner ? openEdit : undefined}
                      locked={!isOwner}
                    />
                  </div>
                )}

                {tournament.mode !== 'group' && (
                  structure.knockoutMatches.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="app-eyebrow">Knockout Stage</p>
                          <h3 className="app-text-primary mt-2 text-xl font-semibold tracking-tight">Elimination bracket</h3>
                        </div>
                        {tournament.mode === 'both' && structure.isGroupStageComplete && (
                          <span className="app-chip-info rounded-full px-3 py-1 text-xs font-semibold">
                            {structure.qualifiedParticipantIds.length} teams qualified
                          </span>
                        )}
                      </div>
                      <TournamentBracket
                        matches={structure.knockoutMatches}
                        participants={knockoutParticipants}
                        rounds={rounds}
                        mode={tournament.mode}
                        onMatchClick={isOwner ? openEdit : undefined}
                        locked={!isOwner}
                      />
                    </div>
                  ) : tournament.mode === 'both' ? (
                    <div className="app-empty-state rounded-[24px] px-6 py-8 text-center">
                      {structure.isGroupStageComplete
                        ? `${structure.qualifiedParticipantIds.length} teams qualified from the group stage. Generate the knockout bracket to continue.`
                        : 'Finish the group-stage matches to unlock the knockout bracket.'}
                    </div>
                  ) : null
                )}
              </div>
            ) : (
              <div className="app-empty-state rounded-[24px] px-6 py-10 text-center">
                Add at least 2 participants, then generate the {tournament.mode === 'knockout' ? 'bracket' : 'tournament stage'}.
              </div>
            )}
          </div>
        </div>
      </FadeContent>

      {editMatch && isOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="app-card w-full max-w-sm rounded-2xl p-8 shadow-xl">
            <h2 className="app-text-primary mb-2 text-xl font-bold">Enter Result</h2>
            <p className="app-text-secondary mb-4 text-sm">
              {getName(editMatch.participant_a)} vs {getName(editMatch.participant_b)}
            </p>
            <p className="app-text-muted mb-4 text-xs uppercase tracking-[0.22em]">
              {matchFormatLabel[tournament.match_format ?? 'bo1']}
            </p>

            <div className="mb-6 flex gap-4">
              <input
                type="number"
                min={0}
                value={scores.score_a}
                onChange={(event) => setScores((current) => ({ ...current, score_a: event.target.value }))}
                className="app-input w-full rounded-lg px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <input
                type="number"
                min={0}
                value={scores.score_b}
                onChange={(event) => setScores((current) => ({ ...current, score_b: event.target.value }))}
                className="app-input w-full rounded-lg px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            {scoreError && <p className="app-banner-warning mb-4 rounded-xl px-4 py-3 text-sm">{scoreError}</p>}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditMatch(null)
                  setScoreError('')
                }}
                className="app-button-secondary flex-1 rounded-lg py-3 font-medium transition duration-200 hover:-translate-y-0.5"
              >
                Cancel
              </button>
              <button
                onClick={saveResult}
                className="app-button-primary flex-1 rounded-lg py-3 font-semibold transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
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
