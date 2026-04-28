import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="relative z-10 mt-auto border-t border-[color:var(--border-subtle)] bg-[color:var(--surface-elevated)]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 text-sm text-[color:var(--text-secondary)] sm:px-8 md:flex-row md:items-center md:justify-between">
        <p className="inline-flex items-center gap-2 text-center md:text-left">
          <span>Tournamount is part of the Planary product family.</span>
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 md:justify-end">
          <a
            className="font-semibold text-[color:var(--text-primary)] transition duration-200 hover:text-[color:var(--accent-strong)]"
            href="https://planary.ch"
            rel="noreferrer"
            target="_blank"
          >
            planary.ch
          </a>
          <a
            className="font-semibold text-[color:var(--text-primary)] transition duration-200 hover:text-[color:var(--accent-strong)]"
            href="https://wishlist.planary.ch"
            rel="noreferrer"
            target="_blank"
          >
            wishlist.planary.ch
          </a>
          <a
            className="font-semibold text-[color:var(--text-primary)] transition duration-200 hover:text-[color:var(--accent-strong)]"
            href="https://tournament.planary.ch"
            rel="noreferrer"
            target="_blank"
          >
            tournament.planary.ch
          </a>
          <Link
            href="/impressum"
            className="font-medium text-[color:var(--text-primary)] transition duration-200 hover:text-[color:var(--accent-strong)]"
          >
            Impressum
          </Link>
        </div>
      </div>
    </footer>
  )
}
