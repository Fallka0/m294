import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Geist_Mono, Manrope, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import AppBackgroundVeil from '@/components/AppBackgroundVeil'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { ThemeProvider } from '@/components/theme/ThemeProvider'

const bodyFont = Manrope({
  variable: '--font-app-body',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-app-mono',
  subsets: ['latin'],
})

const headingFont = Space_Grotesk({
  variable: '--font-app-heading',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Tournament',
    template: '%s | Tournament',
  },
  description: 'Tournament by Planary helps you manage gaming and sports tournaments without the chaos.',
}

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="de" suppressHydrationWarning className={`${bodyFont.variable} ${headingFont.variable} ${geistMono.variable}`}>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <AuthProvider>
            <AppBackgroundVeil />
            <div className="app-shell flex min-h-screen flex-col">
              <Header />
              <div className="relative z-10 flex-1">{children}</div>
              <Footer />
            </div>
            <Analytics />
            <SpeedInsights />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
