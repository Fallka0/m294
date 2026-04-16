import type { Tournament, TournamentEntryType, TournamentMode, TournamentStatus } from '@/lib/types'
import { normalizeTournamentSettings } from '@/lib/tournament-settings'

export const matchFormatLabel = {
  bo1: 'Best of 1',
  bo3: 'Best of 3',
  bo5: 'Best of 5',
} as const

export const entryTypeLabel: Record<TournamentEntryType, string> = {
  solo: 'Solo',
  team: 'Team',
}

export const statusConfig: Record<TournamentStatus, { label: string; className: string }> = {
  open: { label: 'Open', className: 'app-status-open' },
  live: { label: 'Live', className: 'app-status-live' },
  finished: { label: 'Finished', className: 'app-status-finished' },
}

export const detailStatusBanner: Record<TournamentStatus, { label: string; className: string }> = {
  open: { label: 'Registration Open', className: 'app-status-open' },
  live: { label: 'Tournament in Progress', className: 'app-status-live' },
  finished: { label: 'Tournament Finished', className: 'app-status-finished' },
}

export const modeLabel: Record<TournamentMode, string> = {
  knockout: 'Knockout',
  group: 'Group Phase',
  both: 'Both',
}

export const sports = [
  'Football',
  'Basketball',
  'Tennis',
  'Volleyball',
  'Cricket',
  'Baseball',
  'Hockey',
  'Badminton',
  'Table Tennis',
  'Other',
] as const

export const modeOptions: Array<{ value: TournamentMode; label: string }> = [
  { value: 'group', label: 'Group Phase' },
  { value: 'knockout', label: 'Knockout' },
  { value: 'both', label: 'Both' },
]

export const statusOptions: Array<{ value: TournamentStatus; label: string }> = [
  { value: 'open', label: 'Open' },
  { value: 'live', label: 'Live' },
  { value: 'finished', label: 'Finished' },
]

export function normalizeTournament(tournament: Tournament): Tournament {
  return normalizeTournamentSettings({
    ...tournament,
    status: tournament.status ?? 'open',
    is_public: tournament.is_public ?? true,
    current_participants: tournament.current_participants ?? 0,
    description: tournament.description ?? '',
  })
}

export function formatTournamentDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function getDisplayTournamentStatus(status: Tournament['status']): TournamentStatus {
  return status ?? 'open'
}
