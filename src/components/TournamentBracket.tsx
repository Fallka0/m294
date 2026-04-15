import type { CSSProperties, MouseEvent } from 'react'
import type { Match, MatchSlot, Participant } from '@/lib/types'

interface TournamentBracketProps {
  matches: Match[]
  participants: Participant[]
  rounds: number[]
  onMatchClick?: (match: Match) => void
  locked?: boolean
}

const MATCH_WIDTH = 200
const MATCH_HEIGHT = 76
const COLUMN_GAP = 80
const ROW_GAP = 24

export default function TournamentBracket({
  matches,
  participants,
  rounds,
  onMatchClick,
  locked = false,
}: TournamentBracketProps) {
  const getName = (participantId: string | null) => {
    if (!participantId) return 'TBD'
    return participants.find((participant) => participant.id === participantId)?.name || 'TBD'
  }

  const totalRounds = Math.max(1, Math.ceil(Math.log2(Math.max(participants.length, 1))))
  const allRounds = Array.from({ length: totalRounds }, (_, index) => index + 1)

  const getMatchesForRound = (round: number): MatchSlot[] => {
    const existing = matches.filter((match) => match.round === round)
    const expectedCount = Math.pow(2, totalRounds - round)

    return Array.from({ length: expectedCount }, (_, index) => {
      return (
        existing[index] || {
          id: `skeleton-${round}-${index}`,
          tournament_id: '',
          round,
          participant_a: null,
          participant_b: null,
          score_a: null,
          score_b: null,
          winner: null,
          isSkeleton: true,
        }
      )
    })
  }

  const roundLabel = (round: number) => {
    if (totalRounds === 1 || round === totalRounds) return 'Final'
    if (round === totalRounds - 1) return 'Semi-Finals'
    if (round === 1 && totalRounds > 2) return 'Quarter-Finals'
    return `Round ${round}`
  }

  const getMatchY = (round: number, matchIndex: number) => {
    const totalHeight = Math.pow(2, totalRounds - 1) * (MATCH_HEIGHT + ROW_GAP) - ROW_GAP
    const count = Math.pow(2, totalRounds - round)
    const spacing = totalHeight / count
    return 40 + matchIndex * spacing + spacing / 2 - MATCH_HEIGHT / 2
  }

  const getMatchX = (round: number) => (round - 1) * (MATCH_WIDTH + COLUMN_GAP)

  const totalWidth = totalRounds * (MATCH_WIDTH + COLUMN_GAP)
  const totalHeight = Math.pow(2, totalRounds - 1) * (MATCH_HEIGHT + ROW_GAP) + 40

  const lines = allRounds.flatMap((round) => {
    if (round === totalRounds) return []

    return getMatchesForRound(round).map((_, index) => {
      const x1 = getMatchX(round) + MATCH_WIDTH
      const y1 = getMatchY(round, index) + MATCH_HEIGHT / 2
      const x2 = getMatchX(round + 1)
      const nextMatchIndex = Math.floor(index / 2)
      const y2 = getMatchY(round + 1, nextMatchIndex) + MATCH_HEIGHT / 2
      const midX = x1 + COLUMN_GAP / 2

      return { x1, y1, x2, y2, midX, key: `line-${round}-${index}` }
    })
  })

  const wrapperStyle: CSSProperties = {
    position: 'relative',
    width: totalWidth,
    height: totalHeight + 10,
  }

  const svgStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: totalWidth,
    height: totalHeight + 10,
    overflow: 'visible',
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div style={wrapperStyle} className={locked ? 'pointer-events-none grayscale opacity-50' : ''}>
        <svg style={svgStyle}>
          {lines.map(({ x1, y1, x2, y2, midX, key }) => (
            <path key={key} d={`M ${x1} ${y1} H ${midX} V ${y2} H ${x2}`} fill="none" stroke="var(--bracket-line)" strokeWidth="1.5" />
          ))}
        </svg>

        {allRounds.map((round) => (
          <div
            key={`label-${round}`}
            style={{
              position: 'absolute',
              top: 0,
              left: getMatchX(round),
              width: MATCH_WIDTH,
              textAlign: 'center',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--bracket-label)',
            }}
          >
            {roundLabel(round)}
          </div>
        ))}

        {allRounds.map((round) =>
          getMatchesForRound(round).map((match, matchIndex) => {
            const x = getMatchX(round)
            const y = getMatchY(round, matchIndex)
            const isSkeleton = Boolean(match.isSkeleton)
            const isClickable =
              !isSkeleton && Boolean(match.participant_a) && Boolean(match.participant_b) && typeof onMatchClick === 'function'

            const handleMouseEnter = (event: MouseEvent<HTMLDivElement>) => {
              if (isClickable) {
                event.currentTarget.style.boxShadow = 'var(--shadow-card-soft)'
              }
            }

            const handleMouseLeave = (event: MouseEvent<HTMLDivElement>) => {
              event.currentTarget.style.boxShadow = 'none'
            }

            return (
              <div
                key={`slot-${round}-${matchIndex}`}
                onClick={() => {
                  if (isClickable && onMatchClick) {
                    onMatchClick(match)
                  }
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{
                  position: 'absolute',
                  left: x,
                  top: y,
                  width: MATCH_WIDTH,
                  height: MATCH_HEIGHT,
                  borderRadius: '12px',
                  border: isSkeleton ? '1px solid var(--bracket-card-divider)' : '1px solid var(--bracket-card-border)',
                  overflow: 'hidden',
                  cursor: isClickable ? 'pointer' : 'default',
                  background: 'var(--bracket-card-bg)',
                  transition: 'box-shadow 0.15s',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0 12px',
                    height: '50%',
                    background: match.winner === match.participant_a && match.participant_a ? 'var(--bracket-card-bg-active)' : 'var(--bracket-card-bg)',
                    borderBottom: '1px solid var(--bracket-card-divider)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: match.winner === match.participant_a && match.participant_a ? 700 : 400,
                      color: isSkeleton || !match.participant_a ? 'var(--bracket-card-muted)' : match.winner === match.participant_a ? 'var(--bracket-card-text)' : 'var(--bracket-card-subtext)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '140px',
                    }}
                  >
                    {isSkeleton || !match.participant_a ? 'TBD' : getName(match.participant_a)}
                  </span>

                  {match.score_a !== null && !isSkeleton && (
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: match.winner === match.participant_a ? 'var(--bracket-card-score)' : 'var(--bracket-card-muted)',
                        marginLeft: '8px',
                      }}
                    >
                      {match.score_a}
                    </span>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0 12px',
                    height: '50%',
                    background: match.winner === match.participant_b && match.participant_b ? 'var(--bracket-card-bg-active)' : 'var(--bracket-card-bg)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: match.winner === match.participant_b && match.participant_b ? 700 : 400,
                      color: isSkeleton || !match.participant_b ? 'var(--bracket-card-muted)' : match.winner === match.participant_b ? 'var(--bracket-card-text)' : 'var(--bracket-card-subtext)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '140px',
                    }}
                  >
                    {isSkeleton || !match.participant_b ? 'TBD' : getName(match.participant_b)}
                  </span>

                  {match.score_b !== null && !isSkeleton && (
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: match.winner === match.participant_b ? 'var(--bracket-card-score)' : 'var(--bracket-card-muted)',
                        marginLeft: '8px',
                      }}
                    >
                      {match.score_b}
                    </span>
                  )}
                </div>
              </div>
            )
          }),
        )}
      </div>
    </div>
  )
}
