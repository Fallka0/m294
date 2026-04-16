import { describe, expect, it } from 'vitest'
import { formatTournamentDate, getDisplayTournamentStatus, normalizeTournament } from '@/lib/tournaments'
import type { Tournament } from '@/lib/types'

function createTournament(overrides: Partial<Tournament> = {}): Tournament {
  return {
    id: overrides.id ?? 'tournament-1',
    name: overrides.name ?? 'Spring Cup',
    sport: overrides.sport ?? 'Football',
    mode: overrides.mode ?? 'knockout',
    max_participants: overrides.max_participants ?? 8,
    date: overrides.date ?? '2026-04-16',
    status: overrides.status ?? null,
    description: overrides.description ?? null,
    is_public: overrides.is_public ?? null,
    owner_id: overrides.owner_id ?? null,
    owner_name: overrides.owner_name ?? null,
    created_at: overrides.created_at ?? null,
    current_participants: overrides.current_participants,
  }
}

describe('normalizeTournament', () => {
  it('fills safe defaults for nullable fields used by the UI', () => {
    const normalized = normalizeTournament(createTournament())

    expect(normalized.status).toBe('open')
    expect(normalized.is_public).toBe(true)
    expect(normalized.current_participants).toBe(0)
    expect(normalized.description).toBe('')
  })

  it('preserves existing values when they are already present', () => {
    const normalized = normalizeTournament(
      createTournament({
        status: 'live',
        is_public: false,
        current_participants: 6,
        description: 'Quarter-finals in progress',
      }),
    )

    expect(normalized.status).toBe('live')
    expect(normalized.is_public).toBe(false)
    expect(normalized.current_participants).toBe(6)
    expect(normalized.description).toBe('Quarter-finals in progress')
  })
})

describe('formatTournamentDate', () => {
  it('formats dates in the expected dashboard style', () => {
    expect(formatTournamentDate('2026-04-16')).toBe('Apr 16, 2026')
  })
})

describe('getDisplayTournamentStatus', () => {
  it('falls back to open when status is missing', () => {
    expect(getDisplayTournamentStatus(null)).toBe('open')
  })

  it('returns the existing status when present', () => {
    expect(getDisplayTournamentStatus('finished')).toBe('finished')
  })
})
