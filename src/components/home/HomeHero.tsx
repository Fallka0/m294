import BlurText from '@/components/react-bits/BlurText'
import ShinyText from '@/components/react-bits/ShinyText'
import { getDisplayTournamentStatus } from '@/lib/tournaments'
import type { Tournament } from '@/lib/types'

interface HomeHeroProps {
  tournaments: Tournament[]
}

export default function HomeHero({ tournaments }: HomeHeroProps) {
  const stats = [
    { label: 'Total', value: tournaments.length },
    { label: 'Open', value: tournaments.filter((tournament) => getDisplayTournamentStatus(tournament.status) === 'open').length },
    { label: 'Live', value: tournaments.filter((tournament) => getDisplayTournamentStatus(tournament.status) === 'live').length },
  ]

  return (
    <section className="hero-surface relative overflow-hidden rounded-[32px] border border-black/5 bg-[radial-gradient(circle_at_top,rgba(8,145,178,0.12),transparent_34%),linear-gradient(180deg,#ffffff_0%,#f7f7f7_100%)] px-7 py-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-black px-3 py-1 text-xs font-medium text-white">
        <span className="h-2 w-2 rounded-full bg-cyan-400" />
        Tournament overview
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_0.9fr] lg:items-end">
        <div>
          <BlurText
            text="Tournament control, without the chaos."
            delay={40}
            className="hero-title text-4xl font-semibold tracking-tight text-gray-950 md:text-5xl"
          />
          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-500">
            Keep your tournaments organized with a cleaner dashboard, clearer status tracking,
            and fast access to brackets, participants, and edits.
          </p>
          <div className="mt-5 text-sm font-medium text-gray-500">
            <ShinyText
              text="Built for quick updates, smooth handovers, and less messy tournament admin."
              speed={3}
              className="text-sm"
              color="#6b7280"
              shineColor="#111827"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-black/5 bg-white/90 px-4 py-5 text-center shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
              <p className="text-2xl font-semibold tracking-tight text-gray-950">{stat.value}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.24em] text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
