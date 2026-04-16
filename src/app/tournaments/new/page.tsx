'use client'

import type { ChangeEvent, FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import TournamentForm from '@/components/tournaments/TournamentForm'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { encodeTournamentDescription, sanitizeGroupCount } from '@/lib/tournament-settings'
import type { TournamentFormValues } from '@/lib/types'

type TournamentFormErrors = Partial<Record<'name' | 'sport' | 'mode' | 'group_count' | 'max_participants' | 'date', string>>

export default function NewTournament() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<TournamentFormErrors>({})
  const [form, setForm] = useState<TournamentFormValues>({
    name: '',
    sport: '',
    mode: 'knockout',
    group_count: 2,
    match_format: 'bo1',
    max_participants: 8,
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

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    const nextValue =
      name === 'is_public' ? value === 'true' : name === 'max_participants' || name === 'group_count' ? Number(value) : value

    setMessage('')
    setErrors((current) => ({ ...current, [name]: undefined }))
    setForm((current) => ({ ...current, [name]: nextValue }))
  }

  const validateForm = () => {
    const nextErrors: TournamentFormErrors = {}

    if (!form.name.trim()) nextErrors.name = 'Tournament name is required.'
    if (!form.sport) nextErrors.sport = 'Please select a sport.'
    if (!form.mode) nextErrors.mode = 'Please choose a mode.'
    if (!form.date) nextErrors.date = 'Tournament date is required.'
    if (!Number(form.max_participants) || Number(form.max_participants) < 2) {
      nextErrors.max_participants = 'Maximum participants must be at least 2.'
    }
    if ((form.mode === 'group' || form.mode === 'both') && Number(form.max_participants) / sanitizeGroupCount(form.group_count, form.mode, Number(form.max_participants)) < 2) {
      nextErrors.group_count = 'Groups need at least 2 teams each with the current participant cap.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user) {
      router.push('/auth')
      return
    }

    if (!validateForm()) {
      setMessage('Please fill in all required fields before saving the tournament.')
      return
    }

    setLoading(true)
    setMessage('')

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
      }),
      is_public: form.is_public,
      owner_id: user.id,
    }

    const { error } = await supabase.from('tournaments').insert([tournamentPayload])

    if (error) {
      setMessage(error.message)
    } else {
      router.push('/')
    }

    setLoading(false)
  }

  if (authLoading || !isAuthenticated) return <p className="app-text-secondary p-10">Loading...</p>

  return (
    <TournamentForm
      title="Create Tournament"
      subtitle="Set up the basics and start adding participants."
      form={form}
      errors={errors}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={() => router.push('/')}
      submitting={loading}
      submitLabel="Save Tournament"
      submitLoadingLabel="Saving..."
      feedbackMessage={message}
      feedbackTone="error"
    />
  )
}
