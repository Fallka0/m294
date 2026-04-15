'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

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
        status: data.status,
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
    if (!confirm('Turnier wirklich löschen?')) return
    await supabase.from('tournaments').delete().eq('id', id)
    router.push('/')
  }

  if (loading) return <p className="p-10 text-gray-500">Laden...</p>

  return (
    <main className="max-w-xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">Turnier bearbeiten</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sportart</label>
          <input
            name="sport"
            required
            value={form.sport}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Modus</label>
          <select
            name="mode"
            value={form.mode}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="knockout">KO-Runde</option>
            <option value="group">Gruppenphase</option>
            <option value="both">Beides</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Max. Teilnehmer</label>
          <input
            name="max_participants"
            type="number"
            required
            min={2}
            value={form.max_participants}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Datum</label>
          <input
            name="date"
            type="date"
            required
            value={form.date}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="open">Offen</option>
            <option value="live">Live</option>
            <option value="finished">Abgeschlossen</option>
          </select>
        </div>

        <div className="flex gap-3 mt-2">
          <button
            type="button"
            onClick={() => router.push(`/tournaments/${id}`)}
            className="flex-1 border rounded-lg px-4 py-2 cursor-pointer transition duration-200 hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-sm"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-blue-700 text-white rounded-lg px-4 py-2 cursor-pointer transition duration-200 hover:bg-blue-800 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {saving ? 'Speichern...' : 'Speichern'}
          </button>
        </div>

        <div className="border-t pt-5 mt-2">
          <button
            type="button"
            onClick={handleDelete}
            className="w-full rounded-lg px-4 py-2 bg-red-50 border border-red-200 text-red-600 font-medium cursor-pointer transition duration-200 hover:bg-red-100 hover:border-red-300 hover:-translate-y-0.5 hover:shadow-sm"
          >
            Turnier löschen
          </button>
        </div>
      </form>
    </main>
  )
}