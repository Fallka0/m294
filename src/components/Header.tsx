'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import { useTheme } from '@/components/theme/ThemeProvider'

export default function Header() {
  const { isAuthenticated, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [isHovered, setIsHovered] = useState(false)

  return (
    <header className="site-header-bar">
      <div className="site-header">
        <Link className="brand" href="/" aria-label="Tournament Home">
          <div className="brand-logo-shell">
            <Image src="/trophy.svg" alt="" width={24} height={24} className="theme-icon" aria-hidden="true" />
          </div>
          <span className="brand-wordmark">Tournament</span>
        </Link>

        <nav className="site-nav" aria-label="Primary Navigation">
          <Link href="/">Home</Link>
          <Link href="/teams">Teams</Link>
          {isAuthenticated ? <Link href="/profile">Profile</Link> : <Link href="/auth">Sign in</Link>}
          {isAuthenticated ? (
            <button type="button" className="site-nav-button" onClick={signOut}>
              Log out
            </button>
          ) : (
            <Link href="/tournaments/new">Create</Link>
          )}
        </nav>

        <button
          type="button"
          className="theme-toggle-btn"
          onClick={toggleTheme}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-label="Toggle Theme"
        >
          <Image
            src={theme === 'dark' ? '/sun.svg' : '/moon.svg'}
            alt=""
            width={24}
            height={24}
            className={`theme-icon${isHovered ? ' is-hovered' : ''}`}
            aria-hidden="true"
          />
        </button>
      </div>
    </header>
  )
}
