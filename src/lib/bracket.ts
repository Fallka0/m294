import type { Match } from '@/lib/types'

type MatchUpdate = Pick<Match, 'id' | 'participant_a' | 'participant_b' | 'score_a' | 'score_b' | 'winner'>
type MatchInsert = Pick<Match, 'tournament_id' | 'participant_a' | 'participant_b' | 'round'>

function compareMatchesByCreation(left: Match, right: Match) {
  if (left.created_at && right.created_at && left.created_at !== right.created_at) {
    return new Date(left.created_at).getTime() - new Date(right.created_at).getTime()
  }

  return left.id.localeCompare(right.id)
}

function findSourceMatchIndex(previousRoundMatches: Match[], participantId: string | null) {
  if (!participantId) return -1

  const winnerIndex = previousRoundMatches.findIndex((match) => match.winner === participantId)
  if (winnerIndex >= 0) return winnerIndex

  return previousRoundMatches.findIndex(
    (match) => match.participant_a === participantId || match.participant_b === participantId,
  )
}

function getBracketSlotIndex(match: Match, previousRoundMatches: Match[]) {
  const sourceIndices = [match.participant_a, match.participant_b]
    .map((participantId) => findSourceMatchIndex(previousRoundMatches, participantId))
    .filter((index) => index >= 0)

  if (sourceIndices.length === 0) {
    return Number.POSITIVE_INFINITY
  }

  return Math.floor(Math.min(...sourceIndices) / 2)
}

export function sortMatchesForBracket(matches: Match[]) {
  const matchesByRound = matches.reduce<Map<number, Match[]>>((map, match) => {
    const current = map.get(match.round) ?? []
    current.push(match)
    map.set(match.round, current)
    return map
  }, new Map())
  const orderedRounds = [...matchesByRound.keys()].sort((left, right) => left - right)
  const orderedMatchesByRound = new Map<number, Match[]>()

  orderedRounds.forEach((round) => {
    const currentRoundMatches = [...(matchesByRound.get(round) ?? [])]

    if (round === 1) {
      orderedMatchesByRound.set(round, currentRoundMatches.sort(compareMatchesByCreation))
      return
    }

    const previousRoundMatches = orderedMatchesByRound.get(round - 1) ?? []
    const orderedRoundMatches = currentRoundMatches
      .map((match) => ({
        match,
        slotIndex: getBracketSlotIndex(match, previousRoundMatches),
      }))
      .sort((left, right) => {
        if (left.slotIndex !== right.slotIndex) {
          return left.slotIndex - right.slotIndex
        }

        return compareMatchesByCreation(left.match, right.match)
      })
      .map(({ match }) => match)

    orderedMatchesByRound.set(round, orderedRoundMatches)
  })

  return orderedRounds.flatMap((round) => orderedMatchesByRound.get(round) ?? [])
}

function buildRoundMap(matches: Match[]) {
  return sortMatchesForBracket(matches).reduce<Map<number, Match[]>>((map, match) => {
    const current = map.get(match.round) ?? []
    current.push(match)
    map.set(match.round, current)
    return map
  }, new Map())
}

export function createInitialBracketMatches(tournamentId: string, participantIds: string[]): MatchInsert[] {
  const shuffled = [...participantIds].sort(() => Math.random() - 0.5)

  return Array.from({ length: Math.ceil(shuffled.length / 2) }, (_, index) => ({
    tournament_id: tournamentId,
    participant_a: shuffled[index * 2] ?? null,
    participant_b: shuffled[index * 2 + 1] ?? null,
    round: 1,
  }))
}

export function getScoreValidationMessage(scoreA: string, scoreB: string) {
  if (scoreA.trim() === '' || scoreB.trim() === '') {
    return 'Enter both scores before saving.'
  }

  const parsedScoreA = Number.parseInt(scoreA, 10)
  const parsedScoreB = Number.parseInt(scoreB, 10)

  if (Number.isNaN(parsedScoreA) || Number.isNaN(parsedScoreB)) {
    return 'Scores must be valid numbers.'
  }

  if (parsedScoreA < 0 || parsedScoreB < 0) {
    return 'Scores cannot be negative.'
  }

  if (parsedScoreA === parsedScoreB) {
    return 'A winner is required, so tied scores are not supported here.'
  }

  return null
}

export function buildBracketProgressionChanges(tournamentId: string, matches: Match[]) {
  const orderedMatches = sortMatchesForBracket(matches)
  const rounds = buildRoundMap(orderedMatches)
  const updates: MatchUpdate[] = []
  const inserts: MatchInsert[] = []
  const maxRound = Math.max(...orderedMatches.map((match) => match.round), 0)

  for (let round = 1; round <= maxRound; round += 1) {
    const currentRoundMatches = rounds.get(round) ?? []
    if (currentRoundMatches.length === 0) continue

    const nextRoundNumber = round + 1
    const allWinnersKnown = currentRoundMatches.every((match) => match.winner !== null)
    const expectedNextRoundSize = Math.ceil(currentRoundMatches.length / 2)
    const nextRoundMatches = rounds.get(nextRoundNumber) ?? []

    if (nextRoundMatches.length === 0) {
      if (!allWinnersKnown || currentRoundMatches.length <= 1) continue

      const nextRound = Array.from({ length: expectedNextRoundSize }, (_, index) => ({
        tournament_id: tournamentId,
        participant_a: currentRoundMatches[index * 2]?.winner ?? null,
        participant_b: currentRoundMatches[index * 2 + 1]?.winner ?? null,
        round: nextRoundNumber,
      }))

      inserts.push(...nextRound)
      rounds.set(
        nextRoundNumber,
        nextRound.map((match, index) => ({
          id: `generated-${nextRoundNumber}-${index}`,
          tournament_id: match.tournament_id,
          participant_a: match.participant_a,
          participant_b: match.participant_b,
          round: match.round,
          score_a: null,
          score_b: null,
          winner: null,
        })),
      )
      continue
    }

    nextRoundMatches.forEach((match, index) => {
      const expectedParticipantA = currentRoundMatches[index * 2]?.winner ?? null
      const expectedParticipantB = currentRoundMatches[index * 2 + 1]?.winner ?? null
      const currentWinnerStillValid =
        match.winner !== null && [expectedParticipantA, expectedParticipantB].includes(match.winner)

      const scoreA = currentWinnerStillValid ? match.score_a : null
      const scoreB = currentWinnerStillValid ? match.score_b : null
      const winner = currentWinnerStillValid ? match.winner : null

      if (
        match.participant_a !== expectedParticipantA ||
        match.participant_b !== expectedParticipantB ||
        match.score_a !== scoreA ||
        match.score_b !== scoreB ||
        match.winner !== winner
      ) {
        updates.push({
          id: match.id,
          participant_a: expectedParticipantA,
          participant_b: expectedParticipantB,
          score_a: scoreA,
          score_b: scoreB,
          winner,
        })

        nextRoundMatches[index] = {
          ...match,
          participant_a: expectedParticipantA,
          participant_b: expectedParticipantB,
          score_a: scoreA,
          score_b: scoreB,
          winner,
        }
      }
    })

    rounds.set(nextRoundNumber, nextRoundMatches)
  }

  return { updates, inserts }
}
