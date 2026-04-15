'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import TournamentForm from '@/components/tournaments/TournamentForm'
import { useAuth } from '@/components/auth/AuthProvider'

export default function EditTournament() {
  const { id } = useParams()
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
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

    const fetchTournament = async () => {
      const { data } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single()

      if (data?.owner_id && data.owner_id !== user.id) {
        router.push(`/tournaments/${id}`)
        return
      }

      if (data) {
        setForm({
          name: data.name,
          sport: data.sport,
          mode: data.mode,
          max_participants: data.max_participants,
          date: data.date,
          status: data.status ?? 'open',
          description: data.description ?? '',
          is_public: data.is_public ?? true,
        })
      }

      setLoading(false)
    }

    fetchTournament()
  }, [id, router, user])

  const handleChange = (e) => {
    const { name, value } = e.target
    const nextValue = name === 'is_public' ? value === 'true' : value
    setForm({ ...form, [name]: nextValue })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from('tournaments')
      .update(form)
      .eq('id', id)

    if (error) {
      alert('Fehler: ' + error.message)
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
