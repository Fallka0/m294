import Image from 'next/image'
import Link from 'next/link'
import SpotlightCard from '@/components/SpotlightCard'

const statusConfig = {
  open: { label: 'Open', className: 'bg-green-500 text-white' },
  live: { label: 'Live', className: 'bg-cyan-400 text-white' },
  finished: { label: 'Finished', className: 'bg-gray-200 text-gray-500' },
}

const modeLabel = {
  knockout: 'Knockout',
  group: 'Group Phase',
  both: 'Both',
}

export default function HomeTournamentCard({ tournament }) {
  const status = statusConfig[tournament.status ?? 'open'] ?? statusConfig.open

  return (
    <Link href={`/tournaments/${tournament.id}`}>
      <SpotlightCard
        className="h-full cursor-pointer border border-black/5 bg-white/90 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-1"
        spotlightColor="rgba(8, 145, 178, 0.12)"
      >
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

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Image src="/calendar.svg" alt="" width={18} height={18} className="h-[18px] w-[18px]" aria-hidden="true" />
            <span>{new Date(tournament.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Image src="/team.svg" alt="" width={18} height={18} className="h-[18px] w-[18px]" aria-hidden="true" />
            <span>{tournament.current_participants ?? 0} / {tournament.max_participants} participants</span>
          </div>
        </div>
      </SpotlightCard>
    </Link>
  )
}
