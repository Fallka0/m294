import type { CSSProperties } from 'react'
import { findGameSportOption } from '@/lib/game-sports'

interface GameSportIconProps {
  value: string
  className?: string
  iconClassName?: string
}

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(' ')
}

function getFallbackInitials(value: string) {
  const letters = value
    .trim()
    .split(/\s+/)
    .map((part) => part.replace(/[^a-z0-9]/gi, '').slice(0, 1))
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return letters || '?'
}

export default function GameSportIcon({ value, className, iconClassName }: GameSportIconProps) {
  const option = findGameSportOption(value)

  if (!option) {
    return (
      <span
        className={joinClasses(
          'app-icon-token inline-flex h-11 w-11 items-center justify-center rounded-2xl text-xs font-semibold uppercase tracking-[0.16em]',
          className,
        )}
      >
        {getFallbackInitials(value)}
      </span>
    )
  }

  const Icon = option.icon
  const style = {
    color: option.color,
    backgroundColor: `${option.color}18`,
  } as CSSProperties

  return (
    <span
      className={joinClasses('app-icon-token inline-flex h-11 w-11 items-center justify-center rounded-2xl', className)}
      style={style}
      aria-hidden="true"
    >
      <Icon className={joinClasses('h-5 w-5', iconClassName)} />
    </span>
  )
}
