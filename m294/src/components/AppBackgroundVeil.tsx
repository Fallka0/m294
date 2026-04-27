'use client'

import DarkVeil from '@/components/DarkVeil'
import { useTheme } from '@/components/theme/ThemeProvider'

export default function AppBackgroundVeil() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0">
        <DarkVeil
          hueShift={isDark ? 0 : 40}
          noiseIntensity={isDark ? 0.024 : 0.012}
          scanlineIntensity={isDark ? 0.065 : 0.022}
          scanlineFrequency={isDark ? 1.18 : 0.72}
          speed={isDark ? 0.45 : 0.28}
          warpAmount={isDark ? 0.24 : 0.1}
          resolutionScale={1}
        />
      </div>
      <div
        className={`absolute inset-0 transition-colors duration-500 ${
          isDark
            ? 'bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.12),transparent_42%),linear-gradient(180deg,rgba(9,5,15,0.04),rgba(9,5,15,0.18))]'
            : 'bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.34),rgba(255,255,255,0.48))]'
        }`}
      />
    </div>
  )
}
