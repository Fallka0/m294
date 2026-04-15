'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import TournamentForm from '@/components/tournaments/TournamentForm'

export default function EditTournament() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    sport: '',
    mode: 'knockout',
    max_participants: '',
    date: '',
    status: 'open',
  })

  useEffect(() => {
    const fetchTournament = async () => {
      const { data } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single()

      if (data) setForm({
        name: data.name,
        sport: data.sport,
        mode: data.mode,
        max_participants: data.max_participants,
        date: data.date,
        status: data.status ?? 'open',
      })

      setLoading(false)
    }

    fetchTournament()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
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
