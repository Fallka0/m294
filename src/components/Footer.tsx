function HeartIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 21s-6.716-4.438-9.192-8.11C.89 10.04 1.32 5.83 4.84 4.4c2.254-.916 4.473-.163 5.92 1.648C12.206 4.237 14.425 3.483 16.68 4.4c3.52 1.43 3.95 5.64 2.031 8.49C18.118 13.772 15.964 16.056 12 21Z"
        className="fill-current"
      />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="relative z-10 mt-auto border-t border-[color:var(--border-subtle)] bg-[color:var(--surface-elevated)]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-6 py-5 text-sm text-[color:var(--text-secondary)] sm:px-8">
        <p className="inline-flex items-center gap-2 text-center">
          <span>created with</span>
          <span className="text-[color:var(--danger-text)]">
            <HeartIcon />
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
