import type { SupabaseClient } from '@supabase/supabase-js'

export type ProfileMediaField = 'avatar_url' | 'banner_url'

const PROFILE_MEDIA_BUCKET = 'profile-media'
const MAX_UPLOAD_BYTES = 6 * 1024 * 1024

const mediaConfig: Record<
  ProfileMediaField,
  { width: number; height: number; label: string; helper: string }
> = {
  avatar_url: {
    width: 512,
    height: 512,
    label: 'Avatar',
    helper: 'Square images look best. The upload is resized to 512x512 WebP.',
  },
  banner_url: {
    width: 1600,
    height: 900,
    label: 'Banner',
    helper: 'Wide hero images look best. The upload is resized to 1600x900 WebP.',
  },
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Could not read the selected image.'))
    }

    image.src = objectUrl
  })
}

async function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Could not process the selected image.'))
        return
      }

      resolve(blob)
    }, type, quality)
  })
}

async function optimizeProfileMedia(file: File, field: ProfileMediaField): Promise<Blob> {
  const image = await loadImage(file)
  const { width, height } = mediaConfig[field]

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Could not prepare the image canvas.')
  }

  const sourceRatio = image.width / image.height
  const targetRatio = width / height

  let sx = 0
  let sy = 0
  let sw = image.width
  let sh = image.height

  if (sourceRatio > targetRatio) {
    sw = image.height * targetRatio
    sx = (image.width - sw) / 2
  } else {
    sh = image.width / targetRatio
    sy = (image.height - sh) / 2
  }

  context.drawImage(image, sx, sy, sw, sh, 0, 0, width, height)
  return canvasToBlob(canvas, 'image/webp', 0.86)
}

export function validateProfileMedia(file: File, field: ProfileMediaField): string | null {
  if (!file.type.startsWith('image/')) {
    return `${mediaConfig[field].label} must be an image file.`
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return `${mediaConfig[field].label} must be smaller than 6 MB before processing.`
  }

  return null
}

export async function uploadProfileMedia(
  supabase: SupabaseClient,
  userId: string,
  file: File,
  field: ProfileMediaField,
): Promise<string> {
  const optimized = await optimizeProfileMedia(file, field)
  const path = `${userId}/${field}.webp`

  const { error } = await supabase.storage.from(PROFILE_MEDIA_BUCKET).upload(path, optimized, {
    upsert: true,
    contentType: 'image/webp',
    cacheControl: '31536000',
  })

  if (error) {
    throw new Error(
      error.message.includes('Bucket not found')
        ? 'Profile media storage is not configured yet. Run the profile media SQL setup first.'
        : error.message,
    )
  }

  const { data } = supabase.storage.from(PROFILE_MEDIA_BUCKET).getPublicUrl(path)
  return `${data.publicUrl}?v=${Date.now()}`
}

export async function removeProfileMedia(
  supabase: SupabaseClient,
  userId: string,
  field: ProfileMediaField,
): Promise<void> {
  const { error } = await supabase.storage.from(PROFILE_MEDIA_BUCKET).remove([`${userId}/${field}.webp`])

  if (error && !error.message.toLowerCase().includes('not found')) {
    throw new Error(error.message)
  }
}

export function getProfileMediaHelper(field: ProfileMediaField): string {
  return mediaConfig[field].helper
}
