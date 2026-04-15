'use client'

import type { ChangeEvent, FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import TournamentForm from '@/components/tournaments/TournamentForm'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import type { Tournament, TournamentFormValues } from '@/lib/types'

export default function EditTournament() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<TournamentFormValues>({
    name: '',
    sport: '',
    mode: 'knockout',
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
      const tournament = data as Tournament | null

      if (tournament?.owner_id && tournament.owner_id !== currentUser.id) {
        router.push(`/tournaments/${id}`)
        return
      }

      if (tournament) {
        setForm({
          name: tournament.name,
          sport: tournament.sport,
          mode: tournament.mode,
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
      name === 'is_public' ? value === 'true' : name === 'max_participants' ? Number(value) : value

    setForm((current) => ({ ...current, [name]: nextValue }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)

    const { error } = await supabase.from('tournaments').update(form).eq('id', id)

    if (error) {
      alert(`Fehler: ${error.message}`)
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

  if (authLoading || !isAuthenticated) return <p className="p-10 text-gray-500">Loading...</p>
  if (loading) return <p className="p-10 text-gray-500">Laden...</p>

  return (
    <TournamentForm
      title="Edit Tournament"
      subtitle="Update settings, participant limits, and current tournament status."
      form={form}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={() => router.push(`/tournaments/${id}`)}
      onDelete={handleDelete}
      submitting={saving}
      submitLabel="Save Changes"
      submitLoadingLabel="Saving..."
      showStatus
    />
  )
}
