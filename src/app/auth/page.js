'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const fieldClassName = 'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    email: '',
    password: '',
    username: '',
    full_name: '',
  })

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              username: form.username,
              full_name: form.full_name,
            },
          },
        })

        if (error) {
          setMessage(error.message)
          return
        }

        if (data.user && !data.session) {
          setMessage('Account created. Check your email to confirm your account before signing in.')
          return
        }

        setMessage('Account created. You are now signed in.')
        router.push('/')
        return
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })

      if (error) {
        setMessage(error.message)
        return
      }

      if (!data?.session) {
        setMessage('Sign-in completed, but no active session was found. Check your email if confirmation is required.')
        return
      }

      router.push('/')
    } catch (error) {
      console.error('Auth submit error:', error)
      setMessage(error?.message ?? 'Could not sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#050505_0px,#050505_104px,#f5f5f5_104px,#f5f5f5_100%)] px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_34%),linear-gradient(180deg,rgba(17,24,39,0.98)_0%,rgba(8,8,8,0.98)_100%)] px-7 py-8 text-white shadow-[0_24px_80px_rgba(2,8,23,0.35)]">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              Social tournament accounts
            </div>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Create your player identity.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65 md:text-base">
              Sign in to manage your own tournaments, browse public ones from other organizers,
              and join public events as a participant.
            </p>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.7fr]">
          <section className="rounded-[32px] border border-black/5 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)] md:p-10">
            <div className="mb-6 flex gap-3">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`rounded-full px-4 py-2 text-sm font-medium transition duration-200 ${
                  mode === 'login' ? 'bg-gray-950 text-white' : 'border border-gray-200 text-gray-600'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`rounded-full px-4 py-2 text-sm font-medium transition duration-200 ${
                  mode === 'signup' ? 'bg-gray-950 text-white' : 'border border-gray-200 text-gray-600'
                }`}
              >
                Create account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'signup' && (
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Username</label>
                    <input
                      name="username"
                      required
                      value={form.username}
                      onChange={handleChange}
                      className={fieldClassName}
                      placeholder="tournamentfan"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Full name</label>
                    <input
                      name="full_name"
                      required
                      value={form.full_name}
                      onChange={handleChange}
                      className={fieldClassName}
                      placeholder="Alex Example"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className={fieldClassName}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className={fieldClassName}
                  placeholder="At least 6 characters"
                />
              </div>

              {message && (
                <p className="rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm text-cyan-700">
                  {message}
                </p>
              )}

              <div className="flex gap-4">
                <Link
                  href="/"
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-center font-semibold text-gray-700 transition duration-200 hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow-sm"
                >
                  Back
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-cyan-500 hover:shadow-md disabled:opacity-60"
                >
                  {loading ? 'Working...' : mode === 'signup' ? 'Create account' : 'Sign in'}
                </button>
              </div>
            </form>
          </section>

          <aside className="space-y-4">
            <div className="rounded-[28px] border border-black/5 bg-white/90 p-6 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">What you unlock</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-gray-500">
                <li>Create tournaments that are tied to your account.</li>
                <li>Keep some tournaments public and others private.</li>
                <li>Join public tournaments from other organizers.</li>
                <li>See your own and joined tournaments separately on the dashboard.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
