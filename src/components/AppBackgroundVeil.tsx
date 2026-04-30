'use client'

import DarkVeil from '@/components/DarkVeil'
import { useTheme } from '@/components/theme/ThemeProvider'

export default function AppBackgroundVeil() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {isDark ? (
        <div className="absolute inset-0 opacity-82">
          <DarkVeil
            hueShift={118}
            noiseIntensity={0.014}
            scanlineIntensity={0.032}
            scanlineFrequency={0.78}
            speed={0.26}
            warpAmount={0.1}
            resolutionScale={1}
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.08),transparent_34%),radial-gradient(circle_at_left,rgba(110,231,183,0.08),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.04))]" />
      )}
      <div
        className={`absolute inset-0 transition-colors duration-500 ${
          isDark
            ? 'bg-[radial-gradient(circle_at_top_right,rgba(110,231,183,0.22),transparent_40%),radial-gradient(circle_at_left,rgba(167,243,208,0.14),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(52,211,153,0.1),transparent_24%),linear-gradient(180deg,rgba(13,29,24,0.02),rgba(13,29,24,0.08))]'
            : 'bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_40%),radial-gradient(circle_at_left,rgba(110,231,183,0.1),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(167,243,208,0.1),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(244,252,248,0.08))]'
        }`}
      />
    </div>
  )
}
