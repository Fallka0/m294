'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import TournamentForm from '@/components/tournaments/TournamentForm'
import { useAuth } from '@/components/auth/AuthProvider'

export default function NewTournament() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    sport: '',
    mode: 'knockout',
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

  const handleChange = (e) => {
    const { name, value } = e.target
    const nextValue = name === 'is_public' ? value === 'true' : value
    setForm({ ...form, [name]: nextValue })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      router.push('/auth')
      return
    }
    setLoading(true)

    const { error } = await supabase.from('tournaments').insert([{
      ...form,
      owner_id: user.id,
    }])

    if (error) {
      alert('Fehler: ' + error.message)
    } else {
      router.push('/')
    }

    setLoading(false)
  }

  if (authLoading || !isAuthenticated) return <p className="p-10 text-gray-500">Loading...</p>

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
