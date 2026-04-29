'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { useTheme } from '@/components/theme/ThemeProvider'

export default function Header() {
  const { isAuthenticated, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [isHovered, setIsHovered] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Planary Home">
        <Image
          src={theme === 'dark' ? '/violetteOH.png' : '/blauOH.png'}
          alt="Planary"
          width={160}
          height={58}
          className="brand-logo"
          priority
        />
      </Link>

      <div className="header-actions">
        <button
          type="button"
          className={`menu-toggle-btn${isMenuOpen ? ' is-open' : ''}`}
          onClick={() => setIsMenuOpen((value) => !value)}
          aria-expanded={isMenuOpen}
          aria-controls="primary-navigation"
          aria-label="Toggle Navigation Menu"
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          id="primary-navigation"
          className={`site-nav${isMenuOpen ? ' is-open' : ''}`}
          aria-label="Primary Navigation"
        >
          <Link href="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link href="/teams" onClick={() => setIsMenuOpen(false)}>Teams</Link>
          {isAuthenticated ? (
            <Link href="/profile" onClick={() => setIsMenuOpen(false)}>Profile</Link>
          ) : (
            <Link href="/auth" onClick={() => setIsMenuOpen(false)}>Sign in</Link>
          )}
          {isAuthenticated ? (
            <button
              type="button"
              className="site-nav-button"
              onClick={() => {
                setIsMenuOpen(false)
                signOut()
              }}
            >
              Log out
            </button>
          ) : (
            <Link href="/tournaments/new" onClick={() => setIsMenuOpen(false)}>Create</Link>
          )}
        </nav>

        <button
          type="button"
          className="theme-toggle-btn"
          onClick={toggleTheme}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <Image
            src={
              theme === 'dark'
                ? (isHovered ? '/sunFull.svg' : '/sunEmpty.svg')
                : (isHovered ? '/moonFull.svg' : '/moonEmpty.svg')
            }
            alt=""
            width={24}
            height={24}
            className="theme-icon"
            aria-hidden="true"
          />
        </button>
      </div>
    </header>
  )
}
