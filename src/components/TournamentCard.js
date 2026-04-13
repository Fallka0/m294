import Link from 'next/link'

const statusColor = {
  open: 'bg-green-100 text-green-700',
  live: 'bg-yellow-100 text-yellow-700',
  finished: 'bg-gray-100 text-gray-500',
}

const statusLabel = {
  open: 'Offen',
  live: 'Live',
  finished: 'Abgeschlossen',
}

export default function TournamentCard({ tournament }) {
  return (
    <Link href={`/tournaments/${tournament.id}`}>
      <div className="border rounded-xl p-5 hover:shadow-md transition cursor-pointer bg-white">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-lg font-semibold">{tournament.name}</h2>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[tournament.status]}`}>
            {statusLabel[tournament.status]}
          </span>
        </div>
        <p className="text-sm text-gray-500">{tournament.sport}</p>
        <p className="text-sm text-gray-400 mt-1">{tournament.date}</p>
        <p className="text-sm text-gray-400">Max. {tournament.max_participants} Teilnehmer</p>
      </div>
    </Link>
  )
}