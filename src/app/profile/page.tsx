'use client'

import type { ChangeEvent, FormEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import OrganizerProfileCard from '@/components/profile/OrganizerProfileCard'
import { useAuth } from '@/components/auth/AuthProvider'
import PageShell from '@/components/layout/PageShell'
import { getErrorMessage } from '@/lib/errors'
import { getProfileMediaHelper, removeProfileMedia, uploadProfileMedia, validateProfileMedia } from '@/lib/profile-media'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/lib/types'

interface ProfileFormValues {
  username: string
  full_name: string
  bio: string
  avatar_url: string
  banner_url: string
  website_url: string
  x_url: string
  github_url: string
}

type ProfileMediaField = 'avatar_url' | 'banner_url'
type FeedbackTone = 'error' | 'success' | 'info'

const fieldClassName =
  'app-input w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400'

export default function ProfilePage() {
  const router = useRouter()
  const { user, profile, isAuthenticated, loading: authLoading, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageTone, setMessageTone] = useState<FeedbackTone>('info')
  const [uploadingField, setUploadingField] = useState<ProfileMediaField | null>(null)
  const [form, setForm] = useState<ProfileFormValues>({
    username: '',
    full_name: '',
    bio: '',
    avatar_url: '',
    banner_url: '',
    website_url: '',
    x_url: '',
    github_url: '',
  })
  const avatarInputRef = useRef<HTMLInputElement | null>(null)
  const bannerInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (!user) return
    const currentUser = user

    async function fetchProfile() {
      try {
        setLoading(true)
        const { data, error } = await supabase.from('profiles').select('*').eq('id', currentUser.id).maybeSingle()
        if (error) throw error

        const currentProfile = (data as Profile | null) ?? profile

        setForm({
          username: currentProfile?.username ?? '',
          full_name: currentProfile?.full_name ?? '',
          bio: currentProfile?.bio ?? '',
          avatar_url: currentProfile?.avatar_url ?? '',
          banner_url: currentProfile?.banner_url ?? '',
          website_url: currentProfile?.website_url ?? '',
          x_url: currentProfile?.x_url ?? '',
          github_url: currentProfile?.github_url ?? '',
        })
      } catch (error) {
        setMessage(getErrorMessage(error, 'Could not load your profile.'))
        setMessageTone('error')
      } finally {
        setLoading(false)
      }
    }

    void fetchProfile()
  }, [profile, user])

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setMessage('')
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleImageUpload =
    (field: ProfileMediaField) => async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file || !user) return

      const validationError = validateProfileMedia(file, field)
      if (validationError) {
        setMessage(validationError)
        setMessageTone('error')
        event.target.value = ''
        return
      }

      try {
        setUploadingField(field)
        const uploadedUrl = await uploadProfileMedia(supabase, user.id, file, field)
        setForm((current) => ({ ...current, [field]: uploadedUrl }))
        setMessage(`${field === 'avatar_url' ? 'Avatar' : 'Banner'} uploaded. Save your profile to keep this change.`)
        setMessageTone('success')
      } catch (error) {
        console.error('image upload error:', error)
        setMessage(error instanceof Error ? error.message : 'Could not upload the selected image.')
        setMessageTone('error')
      } finally {
        setUploadingField(null)
        event.target.value = ''
      }
    }

  const handleRemoveImage = async (field: ProfileMediaField) => {
    if (!user) return

    try {
      setUploadingField(field)
      await removeProfileMedia(supabase, user.id, field)
      setForm((current) => ({ ...current, [field]: '' }))
      setMessage(`${field === 'avatar_url' ? 'Avatar' : 'Banner'} removed. Save your profile to keep this change.`)
      setMessageTone('info')
    } catch (error) {
      console.error('remove image error:', error)
      setMessage(error instanceof Error ? error.message : 'Could not remove the selected image.')
      setMessageTone('error')
    } finally {
      setUploadingField(null)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user) return

    setSaving(true)
    setMessage('')
    setMessageTone('info')

    const payload = {
      id: user.id,
      email: user.email ?? null,
      ...form,
    }

    try {
      const { error } = await supabase.from('profiles').upsert(payload)
      if (error) throw error

      await refreshProfile()
      setMessage('Profile updated.')
      setMessageTone('success')
    } catch (error) {
      setMessage(getErrorMessage(error, 'Could not save your profile.'))
      setMessageTone('error')
    }

    setSaving(false)
  }

  if (authLoading || loading || !isAuthenticated) {
    return <p className="app-text-secondary p-10">Loading...</p>
  }

  const previewProfile: Profile = {
    id: user?.id ?? 'preview',
    username: form.username,
    full_name: form.full_name,
    bio: form.bio,
    avatar_url: form.avatar_url,
    banner_url: form.banner_url,
    website_url: form.website_url,
    x_url: form.x_url,
    github_url: form.github_url,
  }

  const bioLength = form.bio.trim().length
  const isUploadingAvatar = uploadingField === 'avatar_url'
  const isUploadingBanner = uploadingField === 'banner_url'
  const messageClassName =
    messageTone === 'error'
      ? 'app-banner-danger'
      : messageTone === 'success'
        ? 'app-banner-success'
        : 'app-banner-info'

  return (
    <PageShell>
      <section className="hero-surface overflow-hidden rounded-[32px] border border-black/5 bg-[radial-gradient(circle_at_top,rgba(8,145,178,0.12),transparent_34%),linear-gradient(180deg,#ffffff_0%,#f7f7f7_100%)] px-7 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="max-w-2xl">
          <h1 className="hero-title text-4xl font-semibold tracking-tight text-gray-950 md:text-5xl">Profile</h1>
          <p className="hero-copy mt-4 max-w-2xl text-sm leading-7 text-gray-500 md:text-base">
            Update your photo, banner, bio, and links.
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="app-card rounded-[32px] p-8 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              <section className="space-y-5">
                <div>
                  <p className="app-eyebrow">Identity</p>
                  <h2 className="app-text-primary mt-2 text-2xl font-semibold tracking-tight">Public-facing basics</h2>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="app-text-primary mb-2 block text-sm font-semibold">Username</label>
                    <input name="username" value={form.username} onChange={handleChange} className={fieldClassName} placeholder="tournamentfan" />
                  </div>
                  <div>
                    <label className="app-text-primary mb-2 block text-sm font-semibold">Full name</label>
                    <input name="full_name" value={form.full_name} onChange={handleChange} className={fieldClassName} placeholder="Alex Example" />
                  </div>
                </div>

                <div>
                  <label className="app-text-primary mb-2 block text-sm font-semibold">Bio</label>
                  <textarea
                    name="bio"
                    rows={5}
                    value={form.bio}
                    onChange={handleChange}
                    className={`${fieldClassName} resize-none`}
                    placeholder="Tell players what kind of tournaments you run."
                  />
                  <div className="app-text-muted mt-2 flex items-center justify-between text-xs">
                    <span>Short bios make the public card easier to scan.</span>
                    <span>{bioLength} characters</span>
                  </div>
                </div>
              </section>

              <section className="space-y-5">
                <div>
                  <p className="app-eyebrow">Media</p>
                  <h2 className="app-text-primary mt-2 text-2xl font-semibold tracking-tight">Images</h2>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {[
                    {
                      field: 'avatar_url' as const,
                      title: 'Avatar',
                      helper: getProfileMediaHelper('avatar_url'),
                      inputRef: avatarInputRef,
                      uploading: isUploadingAvatar,
                    },
                    {
                      field: 'banner_url' as const,
                      title: 'Banner',
                      helper: getProfileMediaHelper('banner_url'),
                      inputRef: bannerInputRef,
                      uploading: isUploadingBanner,
                    },
                  ].map((item) => {
                    const imageUrl = form[item.field]

                    return (
                      <div key={item.field} className="app-muted-panel rounded-[24px] p-4">
                        <div
                          className={`overflow-hidden rounded-[20px] border border-[color:var(--border-subtle)] ${
                            item.field === 'avatar_url' ? 'aspect-square max-w-[240px]' : 'aspect-[16/9]'
                          }`}
                          style={
                            imageUrl
                              ? {
                                  backgroundImage: `url(${imageUrl})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                }
                              : undefined
                          }
                        >
                          {!imageUrl && (
                            <div className="app-text-secondary flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_45%),linear-gradient(135deg,rgba(255,255,255,0.7),rgba(240,249,255,0.9))] text-sm font-medium">
                              {item.title} preview
                            </div>
                          )}
                        </div>

                        <input
                          ref={item.inputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/avif"
                          onChange={handleImageUpload(item.field)}
                          className="hidden"
                        />

                        <div className="mt-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="app-text-primary text-sm font-semibold">{item.title}</p>
                            <span className="app-text-muted text-xs">{item.uploading ? 'Processing...' : 'Ready'}</span>
                          </div>
                          <p className="app-text-secondary mt-2 text-sm leading-6">{item.helper}</p>
                        </div>

                        <div className="mt-4 flex gap-3">
                          <button
                            type="button"
                            onClick={() => item.inputRef.current?.click()}
                            disabled={item.uploading}
                            className="app-button-primary flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
                          >
                            {item.uploading ? 'Uploading...' : imageUrl ? 'Replace image' : 'Upload image'}
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleRemoveImage(item.field)}
                            disabled={!imageUrl || item.uploading}
                            className="app-button-secondary rounded-xl px-4 py-3 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>

              <section className="space-y-5">
                <div>
                  <p className="app-eyebrow">Links</p>
                  <h2 className="app-text-primary mt-2 text-2xl font-semibold tracking-tight">Links</h2>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                  <div>
                    <label className="app-text-primary mb-2 block text-sm font-semibold">Website</label>
                    <input name="website_url" value={form.website_url} onChange={handleChange} className={fieldClassName} placeholder="your-site.com" />
                  </div>
                  <div>
                    <label className="app-text-primary mb-2 block text-sm font-semibold">X / Twitter</label>
                    <input name="x_url" value={form.x_url} onChange={handleChange} className={fieldClassName} placeholder="x.com/you" />
                  </div>
                  <div>
                    <label className="app-text-primary mb-2 block text-sm font-semibold">GitHub</label>
                    <input name="github_url" value={form.github_url} onChange={handleChange} className={fieldClassName} placeholder="github.com/you" />
                  </div>
                </div>
              </section>

              {message && (
                <p className={`rounded-2xl border px-4 py-3 text-sm ${messageClassName}`}>
                  {message}
                </p>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="app-button-secondary flex-1 rounded-xl px-4 py-3 font-semibold transition duration-200 hover:-translate-y-0.5"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={saving || isUploadingAvatar || isUploadingBanner}
                  className="app-button-primary flex-1 rounded-xl px-4 py-3 font-semibold transition duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
        </section>

        <OrganizerProfileCard profile={previewProfile} />
      </div>
    </PageShell>
  )
}
