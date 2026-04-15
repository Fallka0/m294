'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const sports = [
  'Football', 'Basketball', 'Tennis', 'Volleyball',
  'Cricket', 'Baseball', 'Hockey', 'Badminton', 'Table Tennis', 'Other'
]

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
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl p-10 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Tournament</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tournament Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="Enter tournament name"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          {/* Sport */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sport Type <span className="text-red-500">*</span>
            </label>
            <select
              name="sport"
              required
              value={form.sport}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="">Select a sport</option>
              {sports.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              name="date"
              type="date"
              required
              value={form.date}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          {/* Mode */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Mode <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col gap-3">
              {[
                { value: 'group', label: 'Group Phase' },
                { value: 'knockout', label: 'Knockout' },
                { value: 'both', label: 'Both' },
              ].map(option => (
                <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value={option.value}
                    checked={form.mode === option.value}
                    onChange={handleChange}
                    className="w-5 h-5 accent-gray-800"
                  />
                  <span className="text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Max Participants */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Max Participants
            </label>
            <input
              name="max_participants"
              type="number"
              required
              min={2}
              value={form.max_participants}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-2">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 font-semibold cursor-pointer transition duration-200 hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-cyan-400 text-white rounded-xl px-4 py-3 font-semibold cursor-pointer transition duration-200 hover:bg-cyan-500 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {loading ? 'Saving...' : 'Save Tournament'}
            </button>
          </div>

        </form>
      </div>
    </main>
  )
}