import Link from 'next/link'

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

export default function TournamentCard({ tournament }) {
  const status = statusConfig[tournament.status]

  return (
    <Link href={`/tournaments/${tournament.id}`}>
      <div className="bg-white rounded-2xl p-5 hover:shadow-md transition cursor-pointer border border-gray-100">
        <div className="flex justify-between items-start mb-3">
          <h2 className="text-lg font-bold text-gray-900 leading-tight pr-2">
            {tournament.name}
          </h2>
          <span className={`text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap ${status.className}`}>
            {status.label}
          </span>
        </div>

        <p className="text-sm font-semibold text-gray-700 mb-3">
          {tournament.sport}
          <span className="text-gray-400 font-normal"> • {modeLabel[tournament.mode]}</span>
        </p>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>📅</span>
            <span>{new Date(tournament.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>👥</span>
            <span>{tournament.current_participants ?? '?'} / {tournament.max_participants} participants</span>
          </div>
        </div>
      </div>
    </Link>
  )
}