import { useRef } from 'react'

export default function SpotlightCard({ children, className = '', spotlightColor = 'rgba(79, 195, 247, 0.15)' }) {
  const divRef = useRef(null)

  const handleMouseMove = (e) => {
    const rect = divRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    divRef.current.style.setProperty('--mouse-x', `${x}px`)
    divRef.current.style.setProperty('--mouse-y', `${y}px`)
    divRef.current.style.setProperty('--spotlight-color', spotlightColor)
  }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden rounded-2xl border border-gray-100 bg-white transition-shadow hover:shadow-lg ${className}`}
      style={{
        background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), var(--spotlight-color, transparent) 0%, transparent 60%), white',
      }}
    >
      {children}
    </div>
  )
}