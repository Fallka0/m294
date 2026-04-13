import Link from 'next/link'

export default function Header() {
  return (
    <header className="border-b bg-white sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-700">
          🏆 TournamentHub
        </Link>
        <Link
          href="/tournaments/new"
          className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800"
        >
          + Turnier erstellen
        </Link>
      </div>
    </header>
  )
}