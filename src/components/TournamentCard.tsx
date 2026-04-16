import Link from 'next/link'
import { formatTournamentDate, getDisplayTournamentStatus, modeLabel, statusConfig } from '@/lib/tournaments'
import type { Tournament } from '@/lib/types'

interface TournamentCardProps {
  tournament: Tournament
}

export default function TournamentCard({ tournament }: TournamentCardProps) {
  const status = statusConfig[getDisplayTournamentStatus(tournament.status)]

  return (
    <Link href={`/tournaments/${tournament.id}`}>
      <div className="app-card cursor-pointer rounded-2xl p-5 transition hover:shadow-md">
        <div className="mb-3 flex items-start justify-between">
          <h2 className="app-text-primary pr-2 text-lg font-bold leading-tight">
            {tournament.name}
          </h2>
          <span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
            {status.label}
          </span>
        </div>

        <p className="app-text-primary mb-3 text-sm font-semibold">
          {tournament.sport}
          <span className="app-text-muted font-normal"> - {modeLabel[tournament.mode]}</span>
        </p>

        <div className="flex flex-col gap-1">
          <div className="app-text-secondary flex items-center gap-2 text-sm">
            <span>{formatTournamentDate(tournament.date)}</span>
          </div>
          <div className="app-text-secondary flex items-center gap-2 text-sm">
            <span>{tournament.current_participants ?? '?'} / {tournament.max_participants} participants</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
