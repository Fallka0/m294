'use client'

import type { ChangeEvent, FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import TournamentForm from '@/components/tournaments/TournamentForm'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import type { TournamentFormValues } from '@/lib/types'

export default function NewTournament() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState<TournamentFormValues>({
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

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    const nextValue =
      name === 'is_public' ? value === 'true' : name === 'max_participants' ? Number(value) : value

    setMessage('')
    setForm((current) => ({ ...current, [name]: nextValue }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user) {
      router.push('/auth')
      return
    }

    setLoading(true)
    setMessage('')

    const { error } = await supabase.from('tournaments').insert([
      {
        ...form,
        owner_id: user.id,
      },
    ])

    if (error) {
      setMessage(error.message)
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
      feedbackMessage={message}
      feedbackTone="error"
    />
  )
}
