import type { IconType } from 'react-icons'
import {
  FaBaseballBatBall,
  FaBasketball,
  FaFutbol,
  FaHockeyPuck,
  FaKeyboard,
  FaTableTennisPaddleBall,
  FaVolleyball,
} from 'react-icons/fa6'
import { GiCricketBat, GiShuttlecock, GiTennisBall } from 'react-icons/gi'
import {
  SiCounterstrike,
  SiDota2,
  SiFortnite,
  SiLeagueoflegends,
  SiPubg,
  SiRoblox,
  SiValorant,
} from 'react-icons/si'

export type GameSportCategory = 'game' | 'sport'

export interface GameSportOption {
  value: string
  label: string
  description: string
  category: GameSportCategory
  icon: IconType
  color: string
  keywords?: string[]
}

export const OTHER_GAME_SPORT_VALUE = '__other__'

export const featuredGameOptions: GameSportOption[] = [
  {
    value: 'League of Legends',
    label: 'League of Legends',
    description: 'MOBA',
    category: 'game',
    icon: SiLeagueoflegends,
    color: '#C89B3C',
    keywords: ['lol'],
  },
  {
    value: 'Valorant',
    label: 'Valorant',
    description: 'Tactical shooter',
    category: 'game',
    icon: SiValorant,
    color: '#FF4655',
  },
  {
    value: 'Counter-Strike',
    label: 'Counter-Strike',
    description: 'FPS',
    category: 'game',
    icon: SiCounterstrike,
    color: '#F2A900',
    keywords: ['cs', 'cs2', 'counter strike 2'],
  },
  {
    value: 'Dota 2',
    label: 'Dota 2',
    description: 'MOBA',
    category: 'game',
    icon: SiDota2,
    color: '#D64045',
  },
  {
    value: 'Fortnite',
    label: 'Fortnite',
    description: 'Battle royale',
    category: 'game',
    icon: SiFortnite,
    color: '#2AA9FF',
  },
  {
    value: 'PUBG',
    label: 'PUBG',
    description: 'Battle royale',
    category: 'game',
    icon: SiPubg,
    color: '#F4B400',
  },
  {
    value: 'Roblox',
    label: 'Roblox',
    description: 'UGC platform',
    category: 'game',
    icon: SiRoblox,
    color: '#E2231A',
  },
]

export const featuredSportOptions: GameSportOption[] = [
  {
    value: 'Football',
    label: 'Football',
    description: 'Field sport',
    category: 'sport',
    icon: FaFutbol,
    color: '#16A34A',
    keywords: ['soccer'],
  },
  {
    value: 'Basketball',
    label: 'Basketball',
    description: 'Court sport',
    category: 'sport',
    icon: FaBasketball,
    color: '#EA580C',
  },
  {
    value: 'Tennis',
    label: 'Tennis',
    description: 'Racket sport',
    category: 'sport',
    icon: GiTennisBall,
    color: '#84CC16',
  },
  {
    value: 'Volleyball',
    label: 'Volleyball',
    description: 'Court sport',
    category: 'sport',
    icon: FaVolleyball,
    color: '#06B6D4',
  },
  {
    value: 'Cricket',
    label: 'Cricket',
    description: 'Bat-and-ball',
    category: 'sport',
    icon: GiCricketBat,
    color: '#F59E0B',
  },
  {
    value: 'Baseball',
    label: 'Baseball',
    description: 'Bat-and-ball',
    category: 'sport',
    icon: FaBaseballBatBall,
    color: '#EF4444',
  },
  {
    value: 'Hockey',
    label: 'Hockey',
    description: 'Ice or field',
    category: 'sport',
    icon: FaHockeyPuck,
    color: '#64748B',
  },
  {
    value: 'Badminton',
    label: 'Badminton',
    description: 'Racket sport',
    category: 'sport',
    icon: GiShuttlecock,
    color: '#14B8A6',
  },
  {
    value: 'Table Tennis',
    label: 'Table Tennis',
    description: 'Fast rally play',
    category: 'sport',
    icon: FaTableTennisPaddleBall,
    color: '#EC4899',
    keywords: ['ping pong', 'pingpong'],
  },
]

export const otherGameSportOption: GameSportOption = {
  value: OTHER_GAME_SPORT_VALUE,
  label: 'Other',
  description: 'Type any game or sport',
  category: 'sport',
  icon: FaKeyboard,
  color: '#8B5CF6',
}

export const allGameSportOptions = [...featuredGameOptions, ...featuredSportOptions]
const searchableGameSportOptions = [...allGameSportOptions, otherGameSportOption]

function normalizeGameSportValue(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '')
}

export function findGameSportOption(value: string | null | undefined) {
  if (!value) return null

  const normalizedValue = normalizeGameSportValue(value)

  return (
    searchableGameSportOptions.find((option) => {
      const matchesValue = normalizeGameSportValue(option.value) === normalizedValue
      const matchesKeyword = option.keywords?.some((keyword) => normalizeGameSportValue(keyword) === normalizedValue)
      return matchesValue || matchesKeyword
    }) ?? null
  )
}

export function isKnownGameSport(value: string | null | undefined) {
  return Boolean(findGameSportOption(value))
}
