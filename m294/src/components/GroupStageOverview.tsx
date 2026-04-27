import type { Match } from '@/lib/types'
import type { GroupStageGroup } from '@/lib/bracket'

interface GroupStageOverviewProps {
  groups: GroupStageGroup[]
  matchFormatLabel: string
  onMatchClick?: (match: Match) => void
  locked?: boolean
}

export default function GroupStageOverview({
  groups,
  matchFormatLabel,
  onMatchClick,
  locked = false,
}: GroupStageOverviewProps) {
  if (groups.length === 0) {
    return (
      <div className="app-empty-state rounded-[24px] px-6 py-8 text-center">
        Generate the tournament to create the groups and fixtures.
      </div>
    )
  }

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      {groups.map((group) => (
        <section key={group.label} className="app-card-elevated rounded-[24px] p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="app-eyebrow">{group.label}</p>
              <h3 className="app-text-primary mt-2 text-xl font-semibold tracking-tight">
                {group.participantIds.length} teams
              </h3>
            </div>
            <span className="app-chip rounded-full px-3 py-1 text-xs font-semibold">{matchFormatLabel}</span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[color:var(--border-subtle)]">
            <table className="w-full text-left text-sm">
              <thead className="app-muted-panel">
                <tr className="app-text-muted">
                  <th className="px-4 py-3 font-semibold">Team</th>
                  <th className="px-3 py-3 font-semibold">W</th>
                  <th className="px-3 py-3 font-semibold">L</th>
                  <th className="px-3 py-3 font-semibold">Diff</th>
                </tr>
              </thead>
              <tbody>
                {group.standings.map((row, index) => (
                  <tr key={row.participantId} className="border-t border-[color:var(--border-subtle)]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="app-chip rounded-full px-2.5 py-1 text-xs font-semibold">#{index + 1}</span>
                        <span className="app-text-primary font-medium">{row.name}</span>
                      </div>
                    </td>
                    <td className="app-text-primary px-3 py-3 font-medium">{row.wins}</td>
                    <td className="app-text-secondary px-3 py-3">{row.losses}</td>
                    <td className="app-text-secondary px-3 py-3">{row.differential >= 0 ? `+${row.differential}` : row.differential}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 space-y-3">
            {group.matches.map((match) => {
              const canEdit = !locked && Boolean(match.participant_a) && Boolean(match.participant_b) && onMatchClick

              return (
                <button
                  key={match.id}
                  type="button"
                  onClick={() => {
                    if (canEdit && onMatchClick) onMatchClick(match)
                  }}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition duration-200 ${
                    canEdit
                      ? 'app-card hover:-translate-y-0.5 hover:shadow-sm'
                      : 'app-card-elevated cursor-default'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="app-text-primary font-medium">
                        {(group.standings.find((row) => row.participantId === match.participant_a)?.name ?? 'TBD')} vs{' '}
                        {(group.standings.find((row) => row.participantId === match.participant_b)?.name ?? 'TBD')}
                      </p>
                      <p className="app-text-muted mt-1 text-xs uppercase tracking-[0.18em]">Round {match.round}</p>
                    </div>
                    <div className="text-right">
                      {match.score_a !== null && match.score_b !== null ? (
                        <p className="app-text-primary font-semibold">
                          {match.score_a} : {match.score_b}
                        </p>
                      ) : (
                        <p className="app-text-muted text-sm">Pending</p>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}

