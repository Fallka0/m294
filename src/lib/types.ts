import type { Session, User } from '@supabase/supabase-js'

export type TournamentStatus = 'open' | 'live' | 'finished'
export type TournamentMode = 'group' | 'knockout' | 'both'

export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  created_at?: string | null
}

export interface Tournament {
  id: string
  name: string
  sport: string
  mode: TournamentMode
  max_participants: number
  date: string
  status: TournamentStatus | null
  description: string | null
  is_public: boolean | null
  owner_id: string | null
  owner_name?: string | null
  created_at?: string | null
  current_participants?: number
}

export interface Participant {
  id: string
  tournament_id: string
  name: string
  user_id: string | null
  created_at?: string | null
}

export interface Match {
  id: string
  tournament_id: string
  participant_a: string | null
  participant_b: string | null
  round: number
  score_a: number | null
  score_b: number | null
  winner: string | null
  created_at?: string | null
}

export interface MatchSlot extends Match {
  isSkeleton?: boolean
}

export interface TournamentFormValues {
  name: string
  sport: string
  mode: TournamentMode
  max_participants: number | string
  date: string
  status: TournamentStatus
  description: string
  is_public: boolean
}

export interface ScoreFormValues {
  score_a: string
  score_b: string
}

export interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  isAuthenticated: boolean
  refreshProfile: () => Promise<Profile | null>
  signOut: () => Promise<void>
}
