import PageHero from '@/components/layout/PageHero'

interface TournamentFormHeroProps {
  title: string
  subtitle?: string
  showStatus?: boolean
}

export default function TournamentFormHero({
  title,
  subtitle,
  showStatus = false,
}: TournamentFormHeroProps) {
  const highlights = [
    'Clean tournament setup',
    showStatus ? 'Status control included' : 'Ready to publish as open',
    'Matches the new dashboard style',
  ]

  return (
    <PageHero
      variant="dark"
      badge={
        <>
          <span className="h-2 w-2 rounded-full bg-cyan-400" />
          Tournament workflow
        </>
      }
      title={<h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{title}</h1>}
      description={subtitle}
      aside={
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
      }
    />
  )
}
