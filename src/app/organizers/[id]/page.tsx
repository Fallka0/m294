'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import GameSportIcon from '@/components/game-sports/GameSportIcon'
import PageShell from '@/components/layout/PageShell'
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

  if (loading) return <p className="app-text-secondary p-10">Loading...</p>
  if (!profile) return <p className="app-text-secondary p-10">Organizer not found.</p>

  return (
    <PageShell>
      <Link href="/" className="app-link-muted text-sm transition duration-200">
        Back to Dashboard
      </Link>

      <OrganizerProfileCard profile={profile} />

      <section className="app-card rounded-[32px] p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="app-eyebrow">Organizer feed</p>
            <h2 className="app-text-primary mt-2 text-2xl font-semibold tracking-tight">Public tournaments</h2>
          </div>
          <span className="app-chip rounded-full px-3 py-1 text-xs font-medium">
            {tournaments.length} listed
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {tournaments.map((tournament) => (
            <Link
              key={tournament.id}
              href={`/tournaments/${tournament.id}`}
              className="app-card-elevated block rounded-2xl px-5 py-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-sm"
            >
              <p className="app-text-primary text-lg font-semibold">{tournament.name}</p>
              <p className="app-text-secondary mt-2 flex items-center gap-3 text-sm">
                <GameSportIcon value={tournament.sport} className="h-9 w-9 rounded-xl" iconClassName="h-4 w-4" />
                <span>{tournament.sport} • {tournament.date}</span>
              </p>
            </Link>
          ))}
          {tournaments.length === 0 && (
            <div className="app-empty-state rounded-2xl px-5 py-8 text-sm">
              No public tournaments yet.
            </div>
          )}
        </div>
      </section>
    </PageShell>
  )
}
