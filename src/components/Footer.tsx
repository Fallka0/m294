export default function Footer() {
  return (
    <footer className="relative z-10 mt-auto border-t border-[color:var(--border-subtle)] bg-[color:var(--surface-elevated)]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-6 py-5 text-sm text-[color:var(--text-secondary)] sm:px-8">
        <p className="inline-flex items-center gap-2 text-center">
          <span>created with</span>
          <span
            aria-label="heart"
            className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.95),rgba(255,255,255,0)_45%),linear-gradient(135deg,#fb7185_0%,#f43f5e_45%,#ec4899_100%)] text-sm shadow-[0_8px_20px_rgba(244,63,94,0.28)]"
            role="img"
          >
            💖
          </span>
          <span>by</span>
          <a
            className="font-semibold text-[color:var(--text-primary)] transition duration-200 hover:text-[color:var(--accent-strong)]"
            href="https://github.com/Planary"
            rel="noreferrer"
            target="_blank"
          >
            Planary
          </a>
        </p>
      </div>
    </footer>
  )
}
