'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import TournamentForm from '@/components/tournaments/TournamentForm'

export default function NewTournament() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    sport: '',
    mode: 'knockout',
    max_participants: 8,
    date: '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('tournaments').insert([form])

    if (error) {
      alert('Fehler: ' + error.message)
    } else {
      router.push('/')
    }

    setLoading(false)
  }

  return (
    <TournamentForm
      title="Create Tournament"
      subtitle="Set up the basics and start adding participants."
      form={form}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={() => router.push('/')}
      submitting={loading}
      submitLabel="Save Tournament"
      submitLoadingLabel="Saving..."
    />
  )
}
