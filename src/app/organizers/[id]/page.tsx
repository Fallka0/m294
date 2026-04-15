'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import OrganizerProfileCard from '@/components/profile/OrganizerProfileCard'
import { supabase } from '@/lib/supabase'
import { normalizeTournament } from '@/lib/tournaments'
import type { Profile, Tournament } from '@/lib/types'

export default function OrganizerPublicPage() {
  const { id } = useParams<{ id: string }>()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrganizer() {
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
      const { data: tournamentData } = await supabase
        .from('tournaments')
        .select('*')
        .eq('owner_id', id)
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      setProfile((profileData as Profile | null) ?? null)
      setTournaments(((tournamentData as Tournament[] | null) ?? []).map(normalizeTournament))
      setLoading(false)
    }

    void fetchOrganizer()
  }, [id])

  if (loading) return <p className="p-10 text-gray-500">Loading...</p>
  if (!profile) return <p className="p-10 text-gray-500">Organizer not found.</p>

  return (
    <main className="page-shell min-h-screen px-6 py-10 transition-colors duration-300">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <Link href="/" className="text-sm text-white/60 transition duration-200 hover:text-white">
          Back to Dashboard
        </Link>

        <OrganizerProfileCard profile={profile} />

        <section className="rounded-[32px] border border-black/5 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Organizer feed</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">Public tournaments</h2>
            </div>
            <span className="rounded-full border border-black/10 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-500">
              {tournaments.length} listed
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {tournaments.map((tournament) => (
              <Link
                key={tournament.id}
                href={`/tournaments/${tournament.id}`}
                className="rounded-2xl border border-black/5 bg-white px-5 py-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-sm"
              >
                <p className="text-lg font-semibold text-gray-950">{tournament.name}</p>
                <p className="mt-2 text-sm text-gray-500">
                  {tournament.sport} • {tournament.date}
                </p>
              </Link>
            ))}
            {tournaments.length === 0 && (
              <div className="rounded-2xl border border-dashed border-black/10 px-5 py-8 text-sm text-gray-400">
                No public tournaments yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
