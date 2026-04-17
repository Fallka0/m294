'use client'

import type { ChangeEvent, FormEvent } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import PageShell from '@/components/layout/PageShell'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { getTeamMediaHelper, removeTeamMedia, uploadTeamMedia, validateTeamMedia } from '@/lib/team-media'
import { getTeamSizeLabel, normalizeTeam, parseTeamMembers, stringifyTeamMembers } from '@/lib/teams'
import type { Team } from '@/lib/types'

interface TeamFormValues {
  name: string
  tag: string
  description: string
  avatar_url: string
  banner_url: string
  member_names: string
}

type TeamMediaField = 'avatar_url' | 'banner_url'

const fieldClassName =
  'app-input w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400'

export default function TeamsPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageTone, setMessageTone] = useState<'error' | 'success' | 'info'>('info')
  const [uploadingField, setUploadingField] = useState<TeamMediaField | null>(null)
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null)
  const [form, setForm] = useState<TeamFormValues>({
    name: '',
    tag: '',
    description: '',
    avatar_url: '',
    banner_url: '',
    member_names: '',
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
    void fetchTeams()
  }, [user])

  const memberList = useMemo(() => parseTeamMembers(form.member_names), [form.member_names])

  const fetchTeams = async () => {
    if (!user) return
    setLoading(true)

    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    setTeams(((data ?? []) as Team[]).map(normalizeTeam))
    setLoading(false)
  }

  const resetForm = () => {
    setForm({
      name: '',
      tag: '',
      description: '',
      avatar_url: '',
      banner_url: '',
      member_names: '',
    })
    setEditingTeamId(null)
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setMessage('')
    setMessageTone('info')
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleImageUpload =
    (field: TeamMediaField) => async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file || !user) return

      const validationError = validateTeamMedia(file, field)
      if (validationError) {
        setMessage(validationError)
        setMessageTone('error')
        event.target.value = ''
        return
      }

      // New teams do not have a row id yet, so we create one first and reuse it
      // for both the storage path and the later insert.
      const teamId = editingTeamId ?? crypto.randomUUID()

      try {
        setUploadingField(field)
        const uploadedUrl = await uploadTeamMedia(supabase, user.id, teamId, file, field)
        setEditingTeamId((current) => current ?? teamId)
        setForm((current) => ({ ...current, [field]: uploadedUrl }))
        setMessage(`${field === 'avatar_url' ? 'Team avatar' : 'Team banner'} uploaded. Save your team to keep this change.`)
        setMessageTone('success')
      } catch (error) {
        console.error('team image upload error:', error)
        setMessage(error instanceof Error ? error.message : 'Could not upload the selected image.')
        setMessageTone('error')
      } finally {
        setUploadingField(null)
        event.target.value = ''
      }
    }

  const handleRemoveImage = async (field: TeamMediaField) => {
    if (!user || !editingTeamId) {
      setForm((current) => ({ ...current, [field]: '' }))
      return
    }

    try {
      setUploadingField(field)
      await removeTeamMedia(supabase, user.id, editingTeamId, field)
      setForm((current) => ({ ...current, [field]: '' }))
      setMessage(`${field === 'avatar_url' ? 'Team avatar' : 'Team banner'} removed. Save your team to keep this change.`)
      setMessageTone('info')
    } catch (error) {
      console.error('team image remove error:', error)
      setMessage(error instanceof Error ? error.message : 'Could not remove the selected image.')
      setMessageTone('error')
    } finally {
      setUploadingField(null)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user) return

    const members = parseTeamMembers(form.member_names)
    if (!form.name.trim()) {
      setMessage('Team name is required.')
      return
    }
    if (members.length < 2) {
      setMessage('Add at least 2 team members.')
      return
    }

    setSaving(true)
    setMessage('')
    setMessageTone('info')

    const payload = {
      id: editingTeamId ?? undefined,
      owner_id: user.id,
      name: form.name.trim(),
      tag: form.tag.trim(),
      description: form.description.trim(),
      avatar_url: form.avatar_url.trim(),
      banner_url: form.banner_url.trim(),
      member_names: members,
    }

    const query = editingTeamId
      ? supabase.from('teams').update(payload).eq('id', editingTeamId).eq('owner_id', user.id)
      : supabase.from('teams').insert([payload])

    const { error } = await query

    if (error) {
      setMessage(error.message)
      setMessageTone('error')
    } else {
      setMessage(editingTeamId ? 'Team updated.' : 'Team created.')
      setMessageTone('success')
      resetForm()
      await fetchTeams()
    }

    setSaving(false)
  }

  const handleEdit = (team: Team) => {
    setEditingTeamId(team.id)
    setForm({
      name: team.name,
      tag: team.tag ?? '',
      description: team.description ?? '',
      avatar_url: team.avatar_url ?? '',
      banner_url: team.banner_url ?? '',
      member_names: stringifyTeamMembers(team.member_names),
    })
    setMessage('')
    setMessageTone('info')
  }

  const handleDelete = async (teamId: string) => {
    if (!user) return
    if (!confirm('Delete this team?')) return

    const { error } = await supabase.from('teams').delete().eq('id', teamId).eq('owner_id', user.id)

    if (error) {
      setMessage(error.message)
      setMessageTone('error')
      return
    }

    if (editingTeamId === teamId) {
      resetForm()
    }
    setMessage('Team deleted.')
    setMessageTone('success')
    await fetchTeams()
  }

  if (authLoading || !isAuthenticated) {
    return <p className="app-text-secondary p-10">Loading...</p>
  }

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
          <h1 className="hero-title text-4xl font-semibold tracking-tight text-gray-950 md:text-5xl">Teams</h1>
          <p className="hero-copy mt-4 max-w-2xl text-sm leading-7 text-gray-500 md:text-base">
            Build reusable rosters for team tournaments, then register the whole squad with one click.
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <section className="app-card rounded-[32px] p-8 md:p-10">
          <div className="mb-6">
            <p className="app-eyebrow">Team Builder</p>
            <h2 className="app-text-primary mt-2 text-2xl font-semibold tracking-tight">
              {editingTeamId ? 'Edit team' : 'Create a team'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              {[
                {
                  field: 'avatar_url' as const,
                  title: 'Team avatar',
                  helper: getTeamMediaHelper('avatar_url'),
                  inputRef: avatarInputRef,
                  uploading: isUploadingAvatar,
                },
                {
                  field: 'banner_url' as const,
                  title: 'Team banner',
                  helper: getTeamMediaHelper('banner_url'),
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

            <div className="grid gap-5 md:grid-cols-[1fr_0.45fr]">
              <div>
                <label className="app-text-primary mb-2 block text-sm font-semibold">Team name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Thunder Wolves"
                  className={fieldClassName}
                />
              </div>
              <div>
                <label className="app-text-primary mb-2 block text-sm font-semibold">Tag</label>
                <input
                  name="tag"
                  value={form.tag}
                  onChange={handleChange}
                  placeholder="TW"
                  className={fieldClassName}
                />
              </div>
            </div>

            <div>
              <label className="app-text-primary mb-2 block text-sm font-semibold">Description</label>
              <textarea
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
                placeholder="Short team intro, history, or lineup notes."
                className={`${fieldClassName} resize-none`}
              />
            </div>

            <div>
              <label className="app-text-primary mb-2 block text-sm font-semibold">Members</label>
              <textarea
                name="member_names"
                rows={6}
                value={form.member_names}
                onChange={handleChange}
                placeholder={'One player per line\nAlex\nJordan\nSam'}
                className={`${fieldClassName} resize-none`}
              />
              <p className="app-text-secondary mt-2 text-sm">
                Add one player per line. Current roster: {memberList.length} player{memberList.length === 1 ? '' : 's'}.
              </p>
            </div>

            {message && (
              <p className={`rounded-2xl border px-4 py-3 text-sm ${messageClassName}`}>
                {message}
              </p>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={resetForm}
                className="app-button-secondary flex-1 rounded-xl px-4 py-3 font-semibold transition duration-200 hover:-translate-y-0.5"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={saving || isUploadingAvatar || isUploadingBanner}
                className="app-button-primary flex-1 rounded-xl px-4 py-3 font-semibold transition duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
              >
                {saving ? 'Saving...' : editingTeamId ? 'Save Team' : 'Create Team'}
              </button>
            </div>
          </form>
        </section>

        <section className="space-y-4">
          <div className="app-card-elevated rounded-[28px] p-6">
            <p className="app-eyebrow">Your teams</p>
            <h2 className="app-text-primary mt-2 text-2xl font-semibold tracking-tight">Roster library</h2>
            <p className="app-text-secondary mt-2 text-sm">
              Use these saved teams when joining team-based tournaments.
            </p>
          </div>

          {loading ? (
            <div className="app-card rounded-[28px] p-6">Loading teams...</div>
          ) : teams.length === 0 ? (
            <div className="app-empty-state rounded-[28px] px-6 py-10 text-center">
              No teams yet. Create your first roster to join team tournaments.
            </div>
          ) : (
            teams.map((team) => (
              <article key={team.id} className="app-card rounded-[28px] p-6">
                {team.banner_url ? (
                  <div
                    className="mb-5 h-32 rounded-[24px] border border-[color:var(--border-subtle)] bg-cover bg-center"
                    style={{ backgroundImage: `url(${team.banner_url})` }}
                  />
                ) : null}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-[color:var(--border-subtle)] bg-[var(--surface-muted)]">
                      {team.avatar_url ? (
                        <img src={team.avatar_url} alt={`${team.name} avatar`} className="h-full w-full object-cover" />
                      ) : (
                        <div className="app-text-primary flex h-full w-full items-center justify-center text-lg font-semibold">
                          {team.name.charAt(0).toUpperCase() || 'T'}
                        </div>
                      )}
                    </div>
                    <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="app-text-primary text-xl font-semibold tracking-tight">{team.name}</h3>
                      {team.tag && <span className="app-chip rounded-full px-3 py-1 text-xs font-semibold">{team.tag}</span>}
                      <span className="app-chip-info rounded-full px-3 py-1 text-xs font-semibold">{getTeamSizeLabel(team)}</span>
                    </div>
                    {team.description && <p className="app-text-secondary mt-3 text-sm leading-6">{team.description}</p>}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {team.member_names.map((member) => (
                    <span key={member} className="app-chip rounded-full px-3 py-1 text-xs font-medium">
                      {member}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleEdit(team)}
                    className="app-button-secondary flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition duration-200 hover:-translate-y-0.5"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(team.id)}
                    className="app-banner-danger flex-1 rounded-xl px-4 py-3 text-sm font-medium transition duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </PageShell>
  )
}
