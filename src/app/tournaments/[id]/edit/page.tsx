'use client'

import type { ChangeEvent, FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import TournamentForm from '@/components/tournaments/TournamentForm'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { encodeTournamentDescription, normalizeTournamentSettings, sanitizeGroupCount, sanitizeTeamSize } from '@/lib/tournament-settings'
import type { Tournament, TournamentFormValues } from '@/lib/types'

export default function EditTournament() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState<TournamentFormValues>({
    name: '',
    sport: '',
    mode: 'knockout',
    group_count: 2,
    match_format: 'bo1',
    entry_type: 'solo',
    team_size: 2,
    max_participants: '',
    date: '',
    status: 'open',
    description: '',
    is_public: true,
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (!user || !isAuthenticated) return
    const currentUser = user

    async function fetchTournament() {
      const { data } = await supabase.from('tournaments').select('*').eq('id', id).single()
      const tournament = data ? normalizeTournamentSettings(data as Tournament) : null

      if (tournament?.owner_id && tournament.owner_id !== currentUser.id) {
        router.push(`/tournaments/${id}`)
        return
      }

      if (tournament) {
        setForm({
          name: tournament.name,
          sport: tournament.sport,
          mode: tournament.mode,
          group_count: tournament.group_count ?? 2,
          match_format: tournament.match_format ?? 'bo1',
          entry_type: tournament.entry_type ?? 'solo',
          team_size: tournament.team_size ?? 2,
          max_participants: tournament.max_participants,
          date: tournament.date,
          status: tournament.status ?? 'open',
          description: tournament.description ?? '',
          is_public: tournament.is_public ?? true,
        })
      }

      setLoading(false)
    }

    void fetchTournament()
  }, [id, isAuthenticated, router, user])

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    const nextValue =
      name === 'is_public' ? value === 'true' : name === 'max_participants' || name === 'group_count' ? Number(value) : value

    setMessage('')
    setForm((current) => ({ ...current, [name]: nextValue }))
  }

  const handleSportChange = (value: string) => {
    setMessage('')
    setForm((current) => ({ ...current, sport: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    if (!form.sport.trim()) {
      setMessage('Please choose or enter a game or sport.')
      setSaving(false)
      return
    }
    if ((form.mode === 'group' || form.mode === 'both') && Number(form.max_participants) / sanitizeGroupCount(form.group_count, form.mode, Number(form.max_participants)) < 2) {
      setMessage('Groups need at least 2 teams each with the current participant cap.')
      setSaving(false)
      return
    }
    if (form.entry_type === 'team' && sanitizeTeamSize(form.team_size, form.entry_type) < 2) {
      setMessage('Team tournaments require at least 2 players per team.')
      setSaving(false)
      return
    }

    const tournamentPayload = {
      name: form.name,
      sport: form.sport,
      mode: form.mode,
      max_participants: Number(form.max_participants),
      date: form.date,
      status: form.status,
      description: encodeTournamentDescription({
        description: form.description,
        mode: form.mode,
        maxParticipants: Number(form.max_participants),
        groupCount: form.group_count,
        matchFormat: form.match_format,
        entryType: form.entry_type,
        teamSize: form.team_size,
      }),
      is_public: form.is_public,
    }

    const { error } = await supabase.from('tournaments').update(tournamentPayload).eq('id', id)

    if (error) {
      setMessage(error.message)
    } else {
      router.push(`/tournaments/${id}`)
    }

    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm('Delete this tournament?')) return
    await supabase.from('tournaments').delete().eq('id', id)
    router.push('/')
  }

  if (authLoading || !isAuthenticated) return <p className="app-text-secondary p-10">Loading...</p>
  if (loading) return <p className="app-text-secondary p-10">Laden...</p>

  return (
    <TournamentForm
      title="Edit Tournament"
      subtitle="Update settings, participant limits, and current tournament status."
      form={form}
      onChange={handleChange}
      onSportChange={handleSportChange}
      onSubmit={handleSubmit}
      onCancel={() => router.push(`/tournaments/${id}`)}
      onDelete={handleDelete}
      submitting={saving}
      submitLabel="Save Changes"
      submitLoadingLabel="Saving..."
      showStatus
      feedbackMessage={message}
      feedbackTone="error"
    />
  )
}
