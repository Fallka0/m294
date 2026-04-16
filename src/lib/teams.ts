import type { Team } from '@/lib/types'

export function normalizeTeam(raw: Partial<Team>): Team {
  return {
    id: raw.id ?? '',
    owner_id: raw.owner_id ?? '',
    name: raw.name ?? '',
    tag: raw.tag ?? '',
    description: raw.description ?? '',
    avatar_url: raw.avatar_url ?? '',
    banner_url: raw.banner_url ?? '',
    member_names: Array.isArray(raw.member_names) ? raw.member_names.filter(Boolean) : [],
    created_at: raw.created_at ?? null,
  }
}

export function parseTeamMembers(value: string) {
  return value
    .split('\n')
    .map((member) => member.trim())
    .filter(Boolean)
}

export function stringifyTeamMembers(memberNames: string[]) {
  return memberNames.join('\n')
}

export function getTeamSizeLabel(team: Team) {
  return `${team.member_names.length} player${team.member_names.length === 1 ? '' : 's'}`
}
