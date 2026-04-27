'use client'

import BlurText from '@/components/react-bits/BlurText'
import ShinyText from '@/components/react-bits/ShinyText'
import { useTheme } from '@/components/theme/ThemeProvider'
import { getDisplayTournamentStatus } from '@/lib/tournaments'
import type { Tournament } from '@/lib/types'

interface HomeHeroProps {
  tournaments: Tournament[]
}

export default function HomeHero({ tournaments }: HomeHeroProps) {
  const { theme } = useTheme()
  const stats = [
    { label: 'Total', value: tournaments.length },
    { label: 'Open', value: tournaments.filter((tournament) => getDisplayTournamentStatus(tournament.status) === 'open').length },
    { label: 'Live', value: tournaments.filter((tournament) => getDisplayTournamentStatus(tournament.status) === 'live').length },
  ]

  return (
    <section className="hero-surface relative overflow-hidden rounded-[32px] border border-black/5 bg-[radial-gradient(circle_at_top,rgba(8,145,178,0.12),transparent_34%),linear-gradient(180deg,#ffffff_0%,#f7f7f7_100%)] px-7 py-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <div className="grid gap-8 lg:grid-cols-[1.6fr_0.9fr] lg:items-end">
        <div>
          <BlurText
            text="Tournament control, without the chaos."
            delay={40}
            className="hero-title text-4xl font-semibold tracking-tight text-gray-950 md:text-5xl"
          />
          <p className="hero-copy mt-4 max-w-2xl text-base leading-7 text-gray-500">
            Keep your tournaments organized with a cleaner dashboard, clearer status tracking,
            and fast access to brackets, participants, and edits.
          </p>
          <div className="mt-5 text-sm font-medium text-gray-500">
            <ShinyText
              text="Built for quick updates, smooth handovers, and less messy tournament admin."
              speed={3}
              className="hero-shiny text-sm"
              color={theme === 'dark' ? 'rgba(55, 65, 81, 0.84)' : '#6b7280'}
              shineColor="#111827"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="app-hero-stat-card rounded-2xl px-4 py-5 text-center">
              <p className="hero-stat-value text-2xl font-semibold tracking-tight text-gray-950">{stat.value}</p>
              <p className="hero-stat-label mt-1 text-xs uppercase tracking-[0.24em] text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
