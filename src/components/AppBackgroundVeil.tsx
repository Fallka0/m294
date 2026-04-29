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
          noiseIntensity={isDark ? 0.022 : 0.006}
          scanlineIntensity={isDark ? 0.06 : 0.01}
          scanlineFrequency={isDark ? 1.16 : 0.55}
          speed={isDark ? 0.42 : 0.18}
          warpAmount={isDark ? 0.22 : 0.06}
          resolutionScale={1}
        />
      </div>
      <div
        className={`absolute inset-0 transition-colors duration-500 ${
          isDark
            ? 'bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.14),transparent_40%),radial-gradient(circle_at_left,rgba(116,201,255,0.08),transparent_36%),linear-gradient(180deg,rgba(9,5,15,0.03),rgba(9,5,15,0.14))]'
            : 'bg-[radial-gradient(circle_at_top_right,rgba(116,201,255,0.14),transparent_40%),radial-gradient(circle_at_left,rgba(139,92,246,0.08),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(255,214,153,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.12),rgba(245,250,255,0.16))]'
        }`}
      />
    </div>
  )
}
