'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import TournamentBracket from '@/components/TournamentBracket'
import FadeContent from '@/components/react-bits/FadeContent'
import BlurText from '@/components/react-bits/BlurText'
import ShinyText from '@/components/react-bits/ShinyText'

export default function TournamentDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [tournament, setTournament] = useState(null)
  const [participants, setParticipants] = useState([])
  const [matches, setMatches] = useState([])
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(true)
  const [editMatch, setEditMatch] = useState(null)
  const [scores, setScores] = useState({ score_a: '', score_b: '' })

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const { data: t } = await supabase.from('tournaments').select('*').eq('id', id).single()
    const { data: p } = await supabase.from('participants').select('*').eq('tournament_id', id).order('created_at', { ascending: true })
    const { data: m } = await supabase.from('matches').select('*').eq('tournament_id', id)
      .order('round', { ascending: true })
      .order('created_at', { ascending: true })

    setTournament(t)
    setParticipants(p || [])
    setMatches(m || [])
    setLoading(false)
  }

  const addParticipant = async () => {
    if (!newName.trim()) return
    if (participants.length >= tournament.max_participants) {
      alert('Maximale Teilnehmerzahl erreicht.')
      return
    }

    const { error } = await supabase.from('participants').insert([
      { tournament_id: id, name: newName.trim() }
    ])

    if (!error) {
      setNewName('')
      fetchData()
    }
  }

  const removeParticipant = async (participantId) => {
    await supabase.from('participants').delete().eq('id', participantId)
    fetchData()
  }

  const deleteTournament = async () => {
    if (!confirm('Turnier wirklich lÃ¶schen?')) return
    await supabase.from('tournaments').delete().eq('id', id)
    router.push('/')
  }

  const generateBracket = async () => {
    if (!confirm('Spielplan generieren? Bestehende Matches werden gelÃ¶scht.')) return

    await supabase.from('matches').delete().eq('tournament_id', id)

    const shuffled = [...participants].sort(() => Math.random() - 0.5)
    const newMatches = []

    for (let i = 0; i < shuffled.length - 1; i += 2) {
      newMatches.push({
        tournament_id: id,
        participant_a: shuffled[i].id,
        participant_b: shuffled[i + 1]?.id || null,
        round: 1
      })
    }

    await supabase.from('matches').insert(newMatches)
    fetchData()
  }

  const openEdit = (match) => {
    setEditMatch(match)
    setScores({
      score_a: match.score_a ?? '',
      score_b: match.score_b ?? ''
    })
  }

  const saveResult = async () => {
    const score_a = parseInt(scores.score_a)
    const score_b = parseInt(scores.score_b)

    const winner = score_a > score_b
      ? editMatch.participant_a
      : editMatch.participant_b

    await supabase.from('matches')
      .update({ score_a, score_b, winner })
      .eq('id', editMatch.id)

    const currentRoundMatches = matches.filter(m => m.round === editMatch.round)
    const updatedMatches = currentRoundMatches.map(m =>
      m.id === editMatch.id ? { ...m, winner } : m
    )

    const allDone = updatedMatches.every(m => m.winner !== null)

    if (allDone && updatedMatches.length > 1) {
      const winners = updatedMatches.map(m => m.winner)
      const nextRound = editMatch.round + 1
      const nextRoundExists = matches.some(m => m.round === nextRound)

      if (!nextRoundExists) {
        const nextMatches = []

        for (let i = 0; i < winners.length - 1; i += 2) {
          nextMatches.push({
            tournament_id: id,
            participant_a: winners[i],
            participant_b: winners[i + 1] || null,
            round: nextRound,
          })
        }

        await supabase.from('matches').insert(nextMatches)
      }
    }

    setEditMatch(null)

    const { data: m } = await supabase
      .from('matches')
      .select('*')
      .eq('tournament_id', id)
      .order('round', { ascending: true })
      .order('created_at', { ascending: true })

    setMatches(m || [])
  }

  const getName = (participantId) => {
    if (!participantId) return 'Bye'
    return participants.find(p => p.id === participantId)?.name || '?'
  }

  if (loading) return <p className="p-10 text-gray-500">Laden...</p>
  if (!tournament) return <p className="p-10 text-gray-500">Turnier nicht gefunden.</p>

  const statusBanner = {
    open: { label: 'Registration Open', className: 'bg-green-400' },
    live: { label: 'Tournament in Progress', className: 'bg-cyan-500' },
    finished: { label: 'Tournament Finished', className: 'bg-gray-400' },
  }

  const modeLabel = { knockout: 'Knockout', group: 'Group Phase', both: 'Both' }
  const banner = statusBanner[tournament.status]
  const rounds = [...new Set(matches.map(m => m.round))].sort()

  return (
    <main className="min-h-screen bg-gray-100">

      <FadeContent initialOpacity={0} duration={0.6} easing="ease-out">

        <div className="max-w-6xl mx-auto px-6 pt-4">
          <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
            â† Back to Dashboard
          </Link>
        </div>

        <div className="max-w-6xl mx-auto px-6 mt-3">
          <div className={`${banner.className} rounded-2xl py-4 text-center text-white font-semibold text-lg`}>
            {banner.label}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 mt-5 pb-10 grid grid-cols-1 lg:grid-cols-3 gap-5">

          <div className="bg-white rounded-2xl p-6 border border-gray-100">

            <div className="flex justify-between items-start mb-5">

              <BlurText
                text={tournament.name}
                delay={25}
                className="text-2xl font-bold text-gray-900"
              />

              <button
                onClick={() => router.push(`/tournaments/${id}/edit`)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <Image src="/edit.svg" alt="" width={18} height={18} className="h-[18px] w-[18px]" aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-col gap-4 mb-6">
              <div>
                <p className="text-xs text-gray-400">Sport</p>
                <p className="font-semibold">{tournament.sport}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Mode</p>
                <p>{modeLabel[tournament.mode]}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Participants</p>
                <p className="inline-flex items-center gap-2"><Image src="/team.svg" alt="" width={18} height={18} className="h-[18px] w-[18px]" aria-hidden="true" />{participants.length}/{tournament.max_participants}</p>
              </div>
            </div>

            <h2 className="font-bold mb-3 inline-flex items-center gap-2">
              <Image src="/trophy.svg" alt="" width={18} height={18} className="h-[18px] w-[18px]" aria-hidden="true" />
              <span>Participants</span>
            </h2>

            <ul className="flex flex-col gap-2 mb-4">
              {participants.map((p, i) => (
                <li key={p.id} className="flex justify-between bg-blue-50 px-3 py-2 rounded-lg">
                  <span>{i + 1}. {p.name}</span>
                  <button onClick={() => removeParticipant(p.id)}>Ã—</button>
                </li>
              ))}
            </ul>

            <div className="flex gap-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addParticipant()}
                className="flex-1 border rounded-lg px-3 py-2 text-sm"
                placeholder="Add participant"
              />
              <button onClick={addParticipant} className="bg-cyan-400 text-white px-3 rounded-lg">
                +
              </button>
            </div>

            <button
              onClick={deleteTournament}
              className="w-full mt-6 text-red-400 text-sm"
            >
              Delete Tournament
            </button>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <BlurText
                text="Tournament Bracket"
                delay={25}
                className="text-2xl font-bold text-gray-900"
              />
              {participants.length >= 2 && (
                <button onClick={generateBracket} className="bg-cyan-400 text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-cyan-500 transition">
                  {matches.length > 0 ? 'Regenerate' : 'Generate Bracket'}
                </button>
              )}
            </div>

            {matches.length > 0 && (
              <TournamentBracket
                matches={matches}
                participants={participants}
                rounds={rounds}
                onMatchClick={openEdit}
              />
            )}

          </div>
        </div>
      </FadeContent>

      {editMatch && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl">

            <h2 className="text-xl font-bold mb-4">Enter Result</h2>

            <div className="flex gap-4 mb-6">
              <input
                type="number"
                value={scores.score_a}
                onChange={(e) => setScores({ ...scores, score_a: e.target.value })}
                className="w-full border rounded-lg p-2"
              />
              <input
                type="number"
                value={scores.score_b}
                onChange={(e) => setScores({ ...scores, score_b: e.target.value })}
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div className="flex gap-2">
              <button onClick={() => setEditMatch(null)} className="flex-1 border rounded-lg py-2">
                Cancel
              </button>
              <button onClick={saveResult} className="flex-1 bg-cyan-400 text-white rounded-lg">
                Save
              </button>
            </div>

          </div>
        </div>
      )}

    </main>
  )
}
