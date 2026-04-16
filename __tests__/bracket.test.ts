import { describe, expect, it } from 'vitest'
import {
  applyBracketOrderMap,
  buildBracketOrderMap,
  buildBracketProgressionChanges,
  createInitialBracketMatches,
  getScoreValidationMessage,
  mergeMatchesWithSavedBracketOrder,
  sortMatchesForBracket,
} from '@/lib/bracket'
import type { Match } from '@/lib/types'

function createMatch(overrides: Partial<Match>): Match {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    tournament_id: overrides.tournament_id ?? 'tournament-1',
    participant_a: overrides.participant_a ?? null,
    participant_b: overrides.participant_b ?? null,
    round: overrides.round ?? 1,
    score_a: overrides.score_a ?? null,
    score_b: overrides.score_b ?? null,
    winner: overrides.winner ?? null,
    created_at: overrides.created_at ?? '2026-04-16T08:00:00.000Z',
  }
}

describe('createInitialBracketMatches', () => {
  it('creates first-round pairings for all participants and preserves byes when odd', () => {
    const matches = createInitialBracketMatches('t-1', ['a', 'b', 'c'])

    expect(matches).toHaveLength(2)
    expect(matches.every((match) => match.round === 1)).toBe(true)

    const participantIds = matches.flatMap((match) => [match.participant_a, match.participant_b]).filter(Boolean)
    expect(participantIds.sort()).toEqual(['a', 'b', 'c'])
    expect(matches.some((match) => match.participant_b === null)).toBe(true)
  })
})

describe('getScoreValidationMessage', () => {
  it('rejects missing, negative, invalid, and tied scores', () => {
    expect(getScoreValidationMessage('', '1')).toBe('Enter both scores before saving.')
    expect(getScoreValidationMessage('abc', '1')).toBe('Scores must be valid numbers.')
    expect(getScoreValidationMessage('-1', '1')).toBe('Scores cannot be negative.')
    expect(getScoreValidationMessage('2', '2')).toBe('A winner is required, so tied scores are not supported here.')
  })

  it('accepts valid scores with a clear winner', () => {
    expect(getScoreValidationMessage('3', '1')).toBeNull()
  })
})

describe('buildBracketProgressionChanges', () => {
  it('creates the next round when all winners in the current round are known', () => {
    const matches = [
      createMatch({
        id: 'm1',
        participant_a: 'p1',
        participant_b: 'p2',
        score_a: 3,
        score_b: 1,
        winner: 'p1',
        created_at: '2026-04-16T08:00:00.000Z',
      }),
      createMatch({
        id: 'm2',
        participant_a: 'p3',
        participant_b: 'p4',
        score_a: 0,
        score_b: 2,
        winner: 'p4',
        created_at: '2026-04-16T08:05:00.000Z',
      }),
    ]

    const { inserts, updates } = buildBracketProgressionChanges('t-1', matches)

    expect(updates).toEqual([])
    expect(inserts).toEqual([
      {
        tournament_id: 't-1',
        participant_a: 'p1',
        participant_b: 'p4',
        round: 2,
      },
    ])
  })

  it('updates downstream rounds and clears invalid saved winners when an earlier winner changes', () => {
    const matches = [
      createMatch({
        id: 'm1',
        participant_a: 'p1',
        participant_b: 'p2',
        score_a: 1,
        score_b: 3,
        winner: 'p2',
        created_at: '2026-04-16T08:00:00.000Z',
      }),
      createMatch({
        id: 'm2',
        participant_a: 'p3',
        participant_b: 'p4',
        score_a: 2,
        score_b: 0,
        winner: 'p3',
        created_at: '2026-04-16T08:05:00.000Z',
      }),
      createMatch({
        id: 'm3',
        participant_a: 'p1',
        participant_b: 'p3',
        round: 2,
        score_a: 3,
        score_b: 2,
        winner: 'p1',
        created_at: '2026-04-16T08:10:00.000Z',
      }),
    ]

    const { inserts, updates } = buildBracketProgressionChanges('t-1', matches)

    expect(inserts).toEqual([])
    expect(updates).toEqual([
      {
        id: 'm3',
        participant_a: 'p2',
        participant_b: 'p3',
        score_a: null,
        score_b: null,
        winner: null,
      },
    ])
  })

  it('keeps downstream slot assignments stable after restoring the visible order', () => {
    const visibleMatches = [
      createMatch({
        id: 'm1',
        participant_a: 'p1',
        participant_b: 'p2',
        score_a: 4,
        score_b: 1,
        winner: 'p1',
        created_at: '2026-04-16T08:00:00.000Z',
      }),
      createMatch({
        id: 'm2',
        participant_a: 'p3',
        participant_b: 'p4',
        score_a: 2,
        score_b: 0,
        winner: 'p3',
        created_at: '2026-04-16T08:05:00.000Z',
      }),
      createMatch({
        id: 'm3',
        participant_a: 'p5',
        participant_b: 'p6',
        score_a: 3,
        score_b: 0,
        winner: 'p5',
        created_at: '2026-04-16T08:10:00.000Z',
      }),
      createMatch({
        id: 'm4',
        participant_a: 'p7',
        participant_b: 'p8',
        score_a: 1,
        score_b: 2,
        winner: 'p8',
        created_at: '2026-04-16T08:15:00.000Z',
      }),
      createMatch({
        id: 'a-bottom-slot',
        participant_a: 'p5',
        participant_b: 'p8',
        round: 2,
        created_at: '2026-04-16T08:20:00.000Z',
      }),
      createMatch({
        id: 'z-top-slot',
        participant_a: 'p1',
        participant_b: 'p3',
        round: 2,
        created_at: '2026-04-16T08:20:00.000Z',
      }),
    ]

    const savedOrder = buildBracketOrderMap(sortMatchesForBracket(visibleMatches))
    const refetchedMatches = [visibleMatches[0], visibleMatches[1], visibleMatches[2], visibleMatches[3], visibleMatches[4], visibleMatches[5]]
      .reverse()
    const restoredMatches = applyBracketOrderMap(refetchedMatches, savedOrder)

    expect(restoredMatches.filter((match) => match.round === 2).map((match) => match.id)).toEqual(['z-top-slot', 'a-bottom-slot'])

    const updatedFirstMatch = restoredMatches.map((match) =>
      match.id === 'm1'
        ? {
            ...match,
            score_a: 1,
            score_b: 4,
            winner: 'p2',
          }
        : match,
    )

    const { updates } = buildBracketProgressionChanges('t-1', updatedFirstMatch)

    expect(updates).toContainEqual({
      id: 'z-top-slot',
      participant_a: 'p2',
      participant_b: 'p3',
      score_a: null,
      score_b: null,
      winner: null,
    })
  })

  it('preserves visible round order for existing matches after a refetch', () => {
    const previousMatches = [
      createMatch({
        id: 'top-slot',
        participant_a: 'p1',
        participant_b: 'p2',
        round: 1,
        created_at: '2026-04-16T08:00:00.000Z',
      }),
      createMatch({
        id: 'bottom-slot',
        participant_a: 'p3',
        participant_b: 'p4',
        round: 1,
        created_at: '2026-04-16T08:05:00.000Z',
      }),
    ]

    const refetchedMatches = [
      createMatch({
        id: 'bottom-slot',
        participant_a: 'p3',
        participant_b: 'p4',
        round: 1,
        score_a: 3,
        score_b: 1,
        winner: 'p3',
        created_at: '2026-04-16T08:05:00.000Z',
      }),
      createMatch({
        id: 'top-slot',
        participant_a: 'p1',
        participant_b: 'p2',
        round: 1,
        created_at: '2026-04-16T08:00:00.000Z',
      }),
    ]

    const mergedMatches = mergeMatchesWithSavedBracketOrder(previousMatches, refetchedMatches)

    expect(mergedMatches.map((match) => match.id)).toEqual(['top-slot', 'bottom-slot'])
  })

  it('applies a persisted bracket order map across refetched matches', () => {
    const visibleMatches = [
      createMatch({ id: 'top-slot', round: 1, created_at: '2026-04-16T08:00:00.000Z' }),
      createMatch({ id: 'bottom-slot', round: 1, created_at: '2026-04-16T08:05:00.000Z' }),
    ]

    const savedOrder = buildBracketOrderMap(visibleMatches)
    const refetchedMatches = [
      createMatch({ id: 'bottom-slot', round: 1, created_at: '2026-04-16T08:05:00.000Z' }),
      createMatch({ id: 'top-slot', round: 1, created_at: '2026-04-16T08:00:00.000Z' }),
    ]

    const appliedMatches = applyBracketOrderMap(refetchedMatches, savedOrder)

    expect(appliedMatches.map((match) => match.id)).toEqual(['top-slot', 'bottom-slot'])
  })

  it('builds progression from the current visible match order', () => {
    const matchesInVisibleOrder = [
      createMatch({
        id: 'visible-top-a',
        participant_a: 'p5',
        participant_b: 'p6',
        score_a: 2,
        score_b: 0,
        winner: 'p5',
        round: 1,
        created_at: '2026-04-16T08:10:00.000Z',
      }),
      createMatch({
        id: 'visible-top-b',
        participant_a: 'p7',
        participant_b: 'p8',
        score_a: 0,
        score_b: 2,
        winner: 'p8',
        round: 1,
        created_at: '2026-04-16T08:15:00.000Z',
      }),
      createMatch({
        id: 'visible-bottom-a',
        participant_a: 'p1',
        participant_b: 'p2',
        score_a: 3,
        score_b: 1,
        winner: 'p1',
        round: 1,
        created_at: '2026-04-16T08:00:00.000Z',
      }),
      createMatch({
        id: 'visible-bottom-b',
        participant_a: 'p3',
        participant_b: 'p4',
        score_a: 2,
        score_b: 0,
        winner: 'p3',
        round: 1,
        created_at: '2026-04-16T08:05:00.000Z',
      }),
    ]

    const { inserts } = buildBracketProgressionChanges('t-1', matchesInVisibleOrder)

    expect(inserts).toEqual([
      {
        tournament_id: 't-1',
        participant_a: 'p5',
        participant_b: 'p8',
        round: 2,
      },
      {
        tournament_id: 't-1',
        participant_a: 'p1',
        participant_b: 'p3',
        round: 2,
      },
    ])
  })
})
