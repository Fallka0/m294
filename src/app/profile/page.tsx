'use client'

import type { ChangeEvent, FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import OrganizerProfileCard from '@/components/profile/OrganizerProfileCard'
import { useAuth } from '@/components/auth/AuthProvider'
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

const fieldClassName =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400'

export default function ProfilePage() {
  const router = useRouter()
  const { user, profile, isAuthenticated, loading: authLoading, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
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

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (!user) return
    const currentUser = user

    async function fetchProfile() {
      const { data } = await supabase.from('profiles').select('*').eq('id', currentUser.id).maybeSingle()
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
      setLoading(false)
    }

    void fetchProfile()
  }, [profile, user])

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user) return

    setSaving(true)
    setMessage('')

    const payload = {
      id: user.id,
      email: user.email ?? null,
      ...form,
    }

    const { error } = await supabase.from('profiles').upsert(payload)

    if (error) {
      setMessage(error.message)
    } else {
      await refreshProfile()
      setMessage('Profile updated.')
    }

    setSaving(false)
  }

  if (authLoading || loading || !isAuthenticated) {
    return <p className="p-10 text-gray-500">Loading...</p>
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

  return (
    <main className="page-shell min-h-screen px-6 py-10 transition-colors duration-300">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_34%),linear-gradient(180deg,rgba(17,24,39,0.98)_0%,rgba(8,8,8,0.98)_100%)] px-7 py-8 text-white shadow-[0_24px_80px_rgba(2,8,23,0.35)]">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              Organizer identity
            </div>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Customize your organizer profile.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65 md:text-base">
              Add a banner, profile image, bio, and social links so players recognize your tournaments immediately.
            </p>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[32px] border border-black/5 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)] md:p-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Username</label>
                  <input name="username" value={form.username} onChange={handleChange} className={fieldClassName} placeholder="tournamentfan" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Full name</label>
                  <input name="full_name" value={form.full_name} onChange={handleChange} className={fieldClassName} placeholder="Alex Example" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Bio</label>
                <textarea
                  name="bio"
                  rows={4}
                  value={form.bio}
                  onChange={handleChange}
                  className={`${fieldClassName} resize-none`}
                  placeholder="Tell players what kind of tournaments you run."
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Avatar image URL</label>
                  <input name="avatar_url" value={form.avatar_url} onChange={handleChange} className={fieldClassName} placeholder="https://..." />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Banner image URL</label>
                  <input name="banner_url" value={form.banner_url} onChange={handleChange} className={fieldClassName} placeholder="https://..." />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Website</label>
                  <input name="website_url" value={form.website_url} onChange={handleChange} className={fieldClassName} placeholder="your-site.com" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">X / Twitter</label>
                  <input name="x_url" value={form.x_url} onChange={handleChange} className={fieldClassName} placeholder="x.com/you" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">GitHub</label>
                  <input name="github_url" value={form.github_url} onChange={handleChange} className={fieldClassName} placeholder="github.com/you" />
                </div>
              </div>

              {message && (
                <p className="rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm text-cyan-700">
                  {message}
                </p>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-3 font-semibold text-gray-700 transition duration-200 hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow-sm"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-cyan-500 hover:shadow-md disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </section>

          <OrganizerProfileCard profile={previewProfile} editable />
        </div>
      </div>
    </main>
  )
}
