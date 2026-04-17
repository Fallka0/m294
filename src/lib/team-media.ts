import type { SupabaseClient } from '@supabase/supabase-js'
import { getProfileMediaHelper, uploadProfileMedia, validateProfileMedia } from '@/lib/profile-media'

export type TeamMediaField = 'avatar_url' | 'banner_url'

const TEAM_MEDIA_BUCKET = 'profile-media'

export function getTeamMediaHelper(field: TeamMediaField) {
  return getProfileMediaHelper(field)
}

export function validateTeamMedia(file: File, field: TeamMediaField) {
  return validateProfileMedia(file, field)
}

export async function uploadTeamMedia(
  supabase: SupabaseClient,
  userId: string,
  teamId: string,
  file: File,
  field: TeamMediaField,
) {
  // Team media reuses the profile-media bucket, but each team gets its own folder.
  const uploadedUrl = await uploadProfileMedia(supabase, `${userId}/teams/${teamId}`, file, field)
  return uploadedUrl
}

export async function removeTeamMedia(
  supabase: SupabaseClient,
  userId: string,
  teamId: string,
  field: TeamMediaField,
) {
  const { error } = await supabase.storage.from(TEAM_MEDIA_BUCKET).remove([`${userId}/teams/${teamId}/${field}.webp`])

  if (error && !error.message.toLowerCase().includes('not found')) {
    throw new Error(error.message)
  }
}
