import type { MatchFormat, Tournament, TournamentMode } from '@/lib/types'

const SETTINGS_START = '<!-- tournament-settings:'
const SETTINGS_END = '-->'

interface StoredTournamentSettings {
  group_count?: number
  match_format?: MatchFormat
}

interface TournamentSettingsInput {
  description: string
  mode: TournamentMode
  maxParticipants: number
  groupCount: number | string
  matchFormat: MatchFormat
}

function getDefaultGroupCount(mode: TournamentMode, maxParticipants: number) {
  if (mode === 'knockout') return 1
  if (maxParticipants >= 8) return 2
  return 1
}

export function sanitizeGroupCount(groupCount: number | string | null | undefined, mode: TournamentMode, maxParticipants: number) {
  if (mode === 'knockout') return 1

  const parsed = Number(groupCount)
  const maxGroups = Math.max(1, Math.floor(Math.max(maxParticipants, 2) / 2))

  if (!Number.isFinite(parsed)) {
    return Math.min(getDefaultGroupCount(mode, maxParticipants), maxGroups)
  }

  return Math.min(Math.max(Math.floor(parsed), 1), maxGroups)
}

export function extractTournamentSettings(description: string | null | undefined) {
  if (!description) {
    return {
      cleanDescription: '',
      settings: {} as StoredTournamentSettings,
    }
  }

  if (!description.startsWith(SETTINGS_START)) {
    return {
      cleanDescription: description,
      settings: {} as StoredTournamentSettings,
    }
  }

  const settingsEndIndex = description.indexOf(SETTINGS_END)
  if (settingsEndIndex === -1) {
    return {
      cleanDescription: description,
      settings: {} as StoredTournamentSettings,
    }
  }

  const serializedSettings = description.slice(SETTINGS_START.length, settingsEndIndex)
  const remainingDescription = description.slice(settingsEndIndex + SETTINGS_END.length).trimStart()

  try {
    return {
      cleanDescription: remainingDescription,
      settings: JSON.parse(serializedSettings) as StoredTournamentSettings,
    }
  } catch {
    return {
      cleanDescription: remainingDescription,
      settings: {} as StoredTournamentSettings,
    }
  }
}

export function encodeTournamentDescription({
  description,
  mode,
  maxParticipants,
  groupCount,
  matchFormat,
}: TournamentSettingsInput) {
  const cleanDescription = description.trim()
  const payload: StoredTournamentSettings = {
    group_count: sanitizeGroupCount(groupCount, mode, maxParticipants),
    match_format: matchFormat,
  }

  return `${SETTINGS_START}${JSON.stringify(payload)}${SETTINGS_END}\n${cleanDescription}`.trim()
}

export function normalizeTournamentSettings(tournament: Tournament): Tournament {
  const { cleanDescription, settings } = extractTournamentSettings(tournament.description)

  return {
    ...tournament,
    description: cleanDescription,
    group_count: sanitizeGroupCount(settings.group_count, tournament.mode, tournament.max_participants),
    match_format: settings.match_format ?? 'bo1',
  }
}

