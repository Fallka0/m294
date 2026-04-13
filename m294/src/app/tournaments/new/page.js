'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function NewTournament() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    sport: '',
    mode: 'knockout',
    max_participants: '',
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
    <main className="max-w-xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">Turnier erstellen</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="z.B. Sommer Cup 2025"
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
            placeholder="z.B. Fussball"
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
            placeholder="z.B. 8"
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

        <div className="flex gap-3 mt-2">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex-1 border rounded-lg px-4 py-2 hover:bg-gray-50"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-700 text-white rounded-lg px-4 py-2 hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? 'Speichern...' : 'Turnier erstellen'}
          </button>
        </div>
      </form>
    </main>
  )
}