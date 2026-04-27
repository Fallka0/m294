import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="relative z-10 mt-auto border-t border-[color:var(--border-subtle)] bg-[color:var(--surface-elevated)]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-3 px-6 py-5 text-sm text-[color:var(--text-secondary)] sm:px-8">
        <p className="inline-flex flex-wrap items-center justify-center gap-2 text-center">
          <span>Tournament is part of</span>
          <a
            className="font-semibold text-[color:var(--text-primary)] transition duration-200 hover:text-[color:var(--accent-strong)]"
            href="https://github.com/Planary"
            rel="noreferrer"
            target="_blank"
          >
            Planary
          </a>
        </p>
        <Link
          href="/impressum"
          className="font-medium text-[color:var(--text-primary)] transition duration-200 hover:text-[color:var(--accent-strong)]"
        >
          Impressum
        </Link>
      </div>
    </footer>
  )
}
