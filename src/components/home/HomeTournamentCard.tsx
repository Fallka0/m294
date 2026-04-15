import Image from 'next/image'
import Link from 'next/link'
import SpotlightCard from '@/components/SpotlightCard'
import { formatTournamentDate, getDisplayTournamentStatus, modeLabel, statusConfig } from '@/lib/tournaments'
import type { Tournament } from '@/lib/types'

interface HomeTournamentCardProps {
  tournament: Tournament
  isOwner?: boolean
  isJoined?: boolean
}

export default function HomeTournamentCard({
  tournament,
  isOwner = false,
  isJoined = false,
}: HomeTournamentCardProps) {
  const status = statusConfig[getDisplayTournamentStatus(tournament.status)]

  return (
    <Link href={`/tournaments/${tournament.id}`}>
      <SpotlightCard
        className="home-tournament-card app-card-elevated h-full cursor-pointer p-5 transition duration-200 hover:-translate-y-1"
        spotlightColor="rgba(8, 145, 178, 0.12)"
      >
        <div className="mb-3 flex items-start justify-between">
          <div className="pr-2">
            <h2 className="text-lg font-bold leading-tight text-gray-900">
              {tournament.name}
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
                {status.label}
              </span>
              <span className="rounded-full border border-[color:var(--border-subtle)] px-3 py-1 text-xs font-medium text-gray-500">
                {tournament.is_public ? 'Public' : 'Private'}
              </span>
              {isOwner && (
                <span className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">
                  Owner
                </span>
              )}
              {isJoined && !isOwner && (
                <span className="rounded-full border border-green-100 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                  Joined
                </span>
              )}
            </div>
          </div>
        </div>

        <p className="mb-3 text-sm font-semibold text-gray-700">
          {tournament.sport}
          <span className="font-normal text-gray-400"> - {modeLabel[tournament.mode]}</span>
        </p>

        <p className="mb-4 text-sm text-gray-500">
          Created by <span className="font-medium text-gray-700">{isOwner ? 'you' : tournament.owner_name || 'Community organizer'}</span>
        </p>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Image src="/calendar.svg" alt="" width={18} height={18} className="theme-icon h-[18px] w-[18px]" aria-hidden="true" />
            <span>{formatTournamentDate(tournament.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Image src="/team.svg" alt="" width={18} height={18} className="theme-icon h-[18px] w-[18px]" aria-hidden="true" />
            <span>{tournament.current_participants ?? 0} / {tournament.max_participants} participants</span>
          </div>
        </div>
      </SpotlightCard>
    </Link>
  )
}
