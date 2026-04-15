export default function TournamentFormHero({
  title,
  subtitle,
  showStatus = false,
}) {
  const highlights = [
    'Clean tournament setup',
    showStatus ? 'Status control included' : 'Ready to publish as open',
    'Matches the new dashboard style',
  ]

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_34%),linear-gradient(180deg,rgba(17,24,39,0.98)_0%,rgba(8,8,8,0.98)_100%)] px-7 py-8 text-white shadow-[0_24px_80px_rgba(2,8,23,0.35)]">
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
        <span className="h-2 w-2 rounded-full bg-cyan-400" />
        Tournament workflow
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{title}</h1>
          {subtitle && (
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65 md:text-base">
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {highlights.map((highlight) => (
            <div
              key={highlight}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/80 backdrop-blur-sm"
            >
              {highlight}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
