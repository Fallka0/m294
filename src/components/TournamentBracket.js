export default function TournamentBracket({ matches, participants, rounds, onMatchClick }) {
  const getName = (participantId) => {
    if (!participantId) return 'TBD'
    return participants.find(p => p.id === participantId)?.name || 'TBD'
  }

  const totalRounds = Math.ceil(Math.log2(participants.length))
  const allRounds = Array.from({ length: totalRounds }, (_, i) => i + 1)

  const MATCH_WIDTH = 200
  const MATCH_HEIGHT = 76
  const COL_GAP = 80
  const ROW_GAP = 24

  const getMatchesForRound = (round) => {
    const existing = matches.filter(m => m.round === round)
    const expectedCount = Math.pow(2, totalRounds - round)

    // Always return exactly expectedCount slots, filling with skeletons
    return Array.from({ length: expectedCount }, (_, i) => {
      return existing[i] || {
        id: `skeleton-${round}-${i}`,
        round,
        participant_a: null,
        participant_b: null,
        score_a: null,
        score_b: null,
        winner: null,
        isSkeleton: true,
      }
    })
  }

  const roundLabels = (round) => {
    if (totalRounds === 1) return 'Final'
    if (round === totalRounds) return 'Final'
    if (round === totalRounds - 1) return 'Semi-Finals'
    if (round === 1 && totalRounds > 2) return 'Quarter-Finals'
    return `Round ${round}`
  }

  const getMatchY = (round, matchIndex) => {
    const totalHeight = Math.pow(2, totalRounds - 1) * (MATCH_HEIGHT + ROW_GAP) - ROW_GAP
    const count = Math.pow(2, totalRounds - round)
    const spacing = totalHeight / count
    return 40 + matchIndex * spacing + spacing / 2 - MATCH_HEIGHT / 2
  }

  const getMatchX = (round) => (round - 1) * (MATCH_WIDTH + COL_GAP)

  const totalWidth = totalRounds * (MATCH_WIDTH + COL_GAP)
  const totalHeight = Math.pow(2, totalRounds - 1) * (MATCH_HEIGHT + ROW_GAP) + 40

  const lines = []
  allRounds.forEach((round) => {
    if (round === totalRounds) return
    const currentMatches = getMatchesForRound(round)
    currentMatches.forEach((match, i) => {
      const x1 = getMatchX(round) + MATCH_WIDTH
      const y1 = getMatchY(round, i) + MATCH_HEIGHT / 2
      const x2 = getMatchX(round + 1)
      const nextMatchIndex = Math.floor(i / 2)
      const y2 = getMatchY(round + 1, nextMatchIndex) + MATCH_HEIGHT / 2
      const midX = x1 + COL_GAP / 2
      lines.push({ x1, y1, x2, y2, midX, key: `line-${round}-${i}` })
    })
  })

  return (
    <div className="overflow-x-auto pb-4">
      <div style={{ position: 'relative', width: totalWidth, height: totalHeight + 10 }}>

        <svg style={{ position: 'absolute', top: 0, left: 0, width: totalWidth, height: totalHeight + 10, overflow: 'visible' }}>
          {lines.map(({ x1, y1, x2, y2, midX, key }) => (
            <path key={key} d={`M ${x1} ${y1} H ${midX} V ${y2} H ${x2}`} fill="none" stroke="#e5e7eb" strokeWidth="1.5" />
          ))}
        </svg>

        {allRounds.map((round) => (
          <div key={`label-${round}`} style={{ position: 'absolute', top: 0, left: getMatchX(round), width: MATCH_WIDTH, textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
            {roundLabels(round)}
          </div>
        ))}

        {allRounds.map((round) =>
          getMatchesForRound(round).map((match, matchIndex) => {
            const x = getMatchX(round)
            const y = getMatchY(round, matchIndex)
            const isSkeleton = match.isSkeleton
            const isClickable = !isSkeleton && match.participant_a && match.participant_b

            return (
              <div
                key={`slot-${round}-${matchIndex}`}
                onClick={() => isClickable && onMatchClick(match)}
                style={{
                  position: 'absolute',
                  left: x,
                  top: y,
                  width: MATCH_WIDTH,
                  height: MATCH_HEIGHT,
                  borderRadius: '12px',
                  border: isSkeleton ? '1px solid #f3f4f6' : '1px solid #e5e7eb',
                  overflow: 'hidden',
                  cursor: isClickable ? 'pointer' : 'default',
                  background: 'white',
                  transition: 'box-shadow 0.15s',
                }}
                onMouseEnter={e => { if (isClickable) e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
              >
                {/* Team A */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0 12px', height: '50%',
                  background: match.winner === match.participant_a && match.participant_a ? '#eff6ff' : 'white',
                  borderBottom: '1px solid #f3f4f6',
                }}>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: match.winner === match.participant_a && match.participant_a ? '700' : '400',
                    color: isSkeleton || !match.participant_a ? '#d1d5db' : match.winner === match.participant_a ? '#111827' : '#6b7280',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px',
                  }}>
                    {isSkeleton || !match.participant_a ? 'TBD' : getName(match.participant_a)}
                  </span>
                  {match.score_a !== null && !isSkeleton && (
                    <span style={{ fontSize: '13px', fontWeight: '700', color: match.winner === match.participant_a ? '#22d3ee' : '#d1d5db', marginLeft: '8px' }}>
                      {match.score_a}
                    </span>
                  )}
                </div>

                {/* Team B */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0 12px', height: '50%',
                  background: match.winner === match.participant_b && match.participant_b ? '#eff6ff' : 'white',
                }}>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: match.winner === match.participant_b && match.participant_b ? '700' : '400',
                    color: isSkeleton || !match.participant_b ? '#d1d5db' : match.winner === match.participant_b ? '#111827' : '#6b7280',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px',
                  }}>
                    {isSkeleton || !match.participant_b ? 'TBD' : getName(match.participant_b)}
                  </span>
                  {match.score_b !== null && !isSkeleton && (
                    <span style={{ fontSize: '13px', fontWeight: '700', color: match.winner === match.participant_b ? '#22d3ee' : '#d1d5db', marginLeft: '8px' }}>
                      {match.score_b}
                    </span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}