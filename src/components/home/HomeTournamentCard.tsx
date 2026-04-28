import Image from 'next/image'
import Link from 'next/link'
import GameSportIcon from '@/components/game-sports/GameSportIcon'
import SpotlightCard from '@/components/SpotlightCard'
import { entryTypeLabel, formatTournamentDate, getDisplayTournamentStatus, modeLabel, statusConfig } from '@/lib/tournaments'
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
  const entryCountLabel = tournament.entry_type === 'team' ? 'teams' : 'participants'
  const summary = tournament.description?.trim() || 'Follow brackets, participants, and tournament progress from a cleaner shared dashboard.'

  return (
    <Link href={`/tournaments/${tournament.id}`}>
      <SpotlightCard
        className="home-tournament-card app-card-elevated h-full cursor-pointer rounded-[28px] p-6 transition duration-200 hover:-translate-y-1.5"
        spotlightColor="rgba(116, 201, 255, 0.16)"
      >
        <div className="mb-3 flex items-start justify-between">
          <div className="pr-2">
            <h2 className="app-text-primary text-xl font-semibold leading-tight tracking-tight">
              {tournament.name}
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
                {status.label}
              </span>
              <span className="app-chip rounded-full px-3 py-1 text-xs font-medium">
                {tournament.is_public ? 'Public' : 'Private'}
              </span>
              <span className="app-chip rounded-full px-3 py-1 text-xs font-medium">
                {entryTypeLabel[tournament.entry_type ?? 'solo']}
              </span>
              {tournament.entry_type === 'team' && (
                <span className="app-chip rounded-full px-3 py-1 text-xs font-medium">
                  {tournament.team_size ?? 2} per team
                </span>
              )}
              {isOwner && (
                <span className="app-chip-info rounded-full px-3 py-1 text-xs font-medium">
                  Owner
                </span>
              )}
              {isJoined && !isOwner && (
                <span className="app-chip-success rounded-full px-3 py-1 text-xs font-medium">
                  Joined
                </span>
              )}
            </div>
          </div>
        </div>

        <p className="app-text-secondary mb-5 line-clamp-3 text-sm leading-6">
          {summary}
        </p>

        <p className="app-text-primary mb-3 flex items-center gap-3 text-sm font-semibold">
          <GameSportIcon value={tournament.sport} className="h-9 w-9 rounded-xl" iconClassName="h-4 w-4" />
          <span>
            {tournament.sport}
            <span className="app-text-muted font-normal"> · {modeLabel[tournament.mode]}</span>
          </span>
        </p>

        <p className="app-text-secondary mb-4 text-sm">
          Created by <span className="app-text-primary font-medium">{isOwner ? 'you' : tournament.owner_name || 'Community organizer'}</span>
        </p>

        <div className="flex flex-col gap-2">
          <div className="app-text-secondary flex items-center gap-2 text-sm">
            <Image src="/calendar.svg" alt="" width={18} height={18} className="theme-icon h-[18px] w-[18px]" aria-hidden="true" />
            <span>{formatTournamentDate(tournament.date)}</span>
          </div>
          <div className="app-text-secondary flex items-center gap-2 text-sm">
            <Image src="/team.svg" alt="" width={18} height={18} className="theme-icon h-[18px] w-[18px]" aria-hidden="true" />
            <span>{tournament.current_participants ?? 0} / {tournament.max_participants} {entryCountLabel}</span>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-[color:var(--border-subtle)] pt-4">
          <span className="app-text-soft text-sm">Open tournament</span>
          <span className="text-lg text-[color:var(--accent-strong)]" aria-hidden="true">→</span>
        </div>
      </SpotlightCard>
    </Link>
  )
}
