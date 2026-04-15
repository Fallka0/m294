import Image from 'next/image'
import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-[#1a2744] sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-white text-xl font-bold">
          <Image src="/trophy.svg" alt="" width={24} height={24} className="h-6 w-6" aria-hidden="true" />
          <span>TournamentHub</span>
        </Link>
        <Link
          href="/tournaments/new"
          className="bg-cyan-400 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-cyan-500 transition"
        >
          Create Tournament
        </Link>
      </div>
    </header>
  )
}