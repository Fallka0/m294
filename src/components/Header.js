import Image from 'next/image'
import Link from 'next/link'

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050505]/90 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
            <Image src="/trophy.svg" alt="" width={20} height={20} className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="leading-tight">
            <span className="block text-lg font-semibold tracking-tight">TournamentHub</span>
            <span className="block text-xs text-white/45">Run tournaments with less friction</span>
          </div>
        </Link>
        <Link
          href="/tournaments/new"
          className="rounded-full border border-white/15 bg-white px-5 py-2.5 text-sm font-semibold text-gray-950 cursor-pointer transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(255,255,255,0.16)]"
        >
          Create Tournament
        </Link>
      </div>
    </header>
  )
}
