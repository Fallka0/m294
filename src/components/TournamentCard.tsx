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
      <div className="cursor-pointer rounded-2xl border border-gray-100 bg-white p-5 transition hover:shadow-md">
        <div className="mb-3 flex items-start justify-between">
          <h2 className="pr-2 text-lg font-bold leading-tight text-gray-900">
            {tournament.name}
          </h2>
          <span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
            {status.label}
          </span>
        </div>

        <p className="mb-3 text-sm font-semibold text-gray-700">
          {tournament.sport}
          <span className="font-normal text-gray-400"> - {modeLabel[tournament.mode]}</span>
        </p>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{formatTournamentDate(tournament.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{tournament.current_participants ?? '?'} / {tournament.max_participants} participants</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
