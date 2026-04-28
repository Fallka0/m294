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
    <section className="hero-surface relative overflow-hidden rounded-[32px] border border-[color:var(--border-subtle)] bg-[radial-gradient(circle_at_top_right,rgba(116,201,255,0.18),transparent_32%),radial-gradient(circle_at_left,rgba(139,92,246,0.08),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(244,248,252,0.98)_100%)] px-7 py-8 shadow-[0_20px_60px_rgba(116,201,255,0.12)]">
      <div className="grid gap-8 lg:grid-cols-[1.6fr_0.9fr] lg:items-end">
        <div>
          <BlurText
            text="Tournament control, with the same calm clarity as the rest of Planary."
            delay={40}
            className="hero-title text-4xl font-semibold tracking-tight text-[color:var(--text-primary)] md:text-5xl"
          />
          <p className="hero-copy mt-4 max-w-2xl text-base leading-7 text-[color:var(--text-secondary)]">
            Run tournaments with clearer status tracking, faster access to brackets and participants,
            and a visual language that now feels more clearly connected to Planary and Planary Wishlist.
          </p>
          <div className="mt-5 text-sm font-medium text-[color:var(--text-secondary)]">
            <ShinyText
              text="Built for smooth handovers, quick edits, and less messy tournament admin."
              speed={3}
              className="hero-shiny text-sm"
              color={theme === 'dark' ? 'rgba(209, 196, 247, 0.74)' : '#64758a'}
              shineColor={theme === 'dark' ? '#f5f3ff' : '#152235'}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="app-hero-stat-card rounded-2xl px-4 py-5 text-center">
              <p className="hero-stat-value text-2xl font-semibold tracking-tight text-[color:var(--text-primary)]">{stat.value}</p>
              <p className="hero-stat-label mt-1 text-xs uppercase tracking-[0.24em] text-[color:var(--text-muted)]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
