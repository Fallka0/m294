import type { BracketOrderMap } from '@/lib/bracket'

const BRACKET_ORDER_PREFIX = 'tournamenthub-bracket-order:'

function isBrowser() {
  return typeof window !== 'undefined'
}

function getBracketOrderKey(tournamentId: string) {
  return `${BRACKET_ORDER_PREFIX}${tournamentId}`
}

export function loadBracketOrder(tournamentId: string): BracketOrderMap | null {
  if (!isBrowser()) return null

  const rawValue = window.localStorage.getItem(getBracketOrderKey(tournamentId))
  if (!rawValue) return null

  try {
    const parsed = JSON.parse(rawValue) as BracketOrderMap
    return typeof parsed === 'object' && parsed !== null ? parsed : null
  } catch {
    window.localStorage.removeItem(getBracketOrderKey(tournamentId))
    return null
  }
}

export function saveBracketOrder(tournamentId: string, orderMap: BracketOrderMap) {
  if (!isBrowser()) return

  window.localStorage.setItem(getBracketOrderKey(tournamentId), JSON.stringify(orderMap))
}

export function clearBracketOrder(tournamentId: string) {
  if (!isBrowser()) return

  window.localStorage.removeItem(getBracketOrderKey(tournamentId))
}
