'use client'

import type { ChangeEvent, FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import PageShell from '@/components/layout/PageShell'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { getTeamSizeLabel, normalizeTeam, parseTeamMembers, stringifyTeamMembers } from '@/lib/teams'
import type { Team } from '@/lib/types'

interface TeamFormValues {
  name: string
  tag: string
  description: string
  member_names: string
}

const fieldClassName =
  'app-input w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400'

export default function TeamsPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null)
  const [form, setForm] = useState<TeamFormValues>({
    name: '',
    tag: '',
    description: '',
    member_names: '',
  })

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
      member_names: '',
    })
    setEditingTeamId(null)
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setMessage('')
    setForm((current) => ({ ...current, [name]: value }))
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

    const payload = {
      owner_id: user.id,
      name: form.name.trim(),
      tag: form.tag.trim(),
      description: form.description.trim(),
      member_names: members,
    }

    const query = editingTeamId
      ? supabase.from('teams').update(payload).eq('id', editingTeamId).eq('owner_id', user.id)
      : supabase.from('teams').insert([payload])

    const { error } = await query

    if (error) {
      setMessage(error.message)
    } else {
      setMessage(editingTeamId ? 'Team updated.' : 'Team created.')
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
      member_names: stringifyTeamMembers(team.member_names),
    })
    setMessage('')
  }

  const handleDelete = async (teamId: string) => {
    if (!user) return
    if (!confirm('Delete this team?')) return

    const { error } = await supabase.from('teams').delete().eq('id', teamId).eq('owner_id', user.id)

    if (error) {
      setMessage(error.message)
      return
    }

    if (editingTeamId === teamId) {
      resetForm()
    }
    setMessage('Team deleted.')
    await fetchTeams()
  }

  if (authLoading || !isAuthenticated) {
    return <p className="app-text-secondary p-10">Loading...</p>
  }

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
              <p className="app-banner-info rounded-2xl px-4 py-3 text-sm">
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
                disabled={saving}
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
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="app-text-primary text-xl font-semibold tracking-tight">{team.name}</h3>
                      {team.tag && <span className="app-chip rounded-full px-3 py-1 text-xs font-semibold">{team.tag}</span>}
                      <span className="app-chip-info rounded-full px-3 py-1 text-xs font-semibold">{getTeamSizeLabel(team)}</span>
                    </div>
                    {team.description && <p className="app-text-secondary mt-3 text-sm leading-6">{team.description}</p>}
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
