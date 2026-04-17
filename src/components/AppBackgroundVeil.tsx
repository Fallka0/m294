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
          hueShift={isDark ? 292 : 188}
          noiseIntensity={isDark ? 0.02 : 0.008}
          scanlineIntensity={isDark ? 0.055 : 0.018}
          scanlineFrequency={isDark ? 1.15 : 0.6}
          speed={isDark ? 0.34 : 0.22}
          warpAmount={isDark ? 0.2 : 0.06}
          resolutionScale={1}
        />
      </div>
      <div
        className={`absolute inset-0 transition-colors duration-500 ${
          isDark
            ? 'bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.16),transparent_42%),linear-gradient(180deg,rgba(9,5,15,0.08),rgba(9,5,15,0.38))]'
            : 'bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.09),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.88))]'
        }`}
      />
    </div>
  )
}
