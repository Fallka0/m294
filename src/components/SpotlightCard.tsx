import type { CSSProperties, MouseEvent, ReactNode } from 'react'
import { useRef } from 'react'

interface SpotlightCardProps {
  children: ReactNode
  className?: string
  spotlightColor?: string
}

export default function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(79, 195, 247, 0.15)',
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement | null>(null)

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const current = divRef.current
    if (!current) return
    const rect = current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    current.style.setProperty('--mouse-x', `${x}px`)
    current.style.setProperty('--mouse-y', `${y}px`)
    current.style.setProperty('--spotlight-color', spotlightColor)
  }

  const style: CSSProperties = {
    background:
      'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), var(--spotlight-color, transparent) 0%, transparent 60%), var(--spotlight-card-base, white)',
  }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden rounded-2xl border border-gray-100 bg-white transition-shadow hover:shadow-lg ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}
