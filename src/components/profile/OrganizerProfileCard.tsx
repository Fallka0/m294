import Link from 'next/link'
import type { Profile } from '@/lib/types'

function normalizeUrl(url?: string | null) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}

export default function OrganizerProfileCard({ profile }: { profile: Profile }) {
  const displayName = profile.full_name || profile.username || 'Organizer'
  const socials = [
    { label: 'Website', href: normalizeUrl(profile.website_url) },
    { label: 'X', href: normalizeUrl(profile.x_url) },
    { label: 'GitHub', href: normalizeUrl(profile.github_url) },
  ].filter((item) => item.href)

  return (
    <section className="app-card overflow-hidden rounded-[32px]">
      <div
        className="relative h-52 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.22),transparent_45%),linear-gradient(135deg,#e8f7fb_0%,#f5f8ff_55%,#f6fbff_100%)]"
        style={
          profile.banner_url
            ? {
                backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.16), rgba(15,23,42,0.12)), url(${profile.banner_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(15,23,42,0.28)_100%)]" />
      </div>
      <div className="px-6 pb-6">
        <div className="app-card-elevated -mt-16 rounded-[28px] p-6 backdrop-blur-sm">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <div
                  className="flex h-24 w-24 items-center justify-center rounded-[28px] border-4 border-[color:var(--surface)] bg-[linear-gradient(135deg,#111827_0%,#0891b2_100%)] text-3xl font-semibold text-white shadow-lg"
                  style={
                    profile.avatar_url
                      ? {
                          backgroundImage: `url(${profile.avatar_url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          color: 'transparent',
                        }
                      : undefined
                  }
                >
                  {displayName.slice(0, 1).toUpperCase()}
                </div>
                <div className="pb-1">
                  <p className="text-2xl font-semibold tracking-tight text-gray-950">{displayName}</p>
                  <p className="mt-1 text-sm text-gray-500">@{profile.username || 'organizer'}</p>
                </div>
              </div>

              <div className="rounded-full border border-[color:var(--border-subtle)] px-4 py-2 text-sm text-gray-500">
                {socials.length > 0 ? `${socials.length} link${socials.length === 1 ? '' : 's'}` : 'No links'}
              </div>
            </div>
          </div>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-gray-600">
            {profile.bio || 'This organizer has not added a bio yet.'}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {socials.length > 0 ? (
              socials.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  className="app-button-secondary rounded-full px-4 py-2 text-sm font-medium transition duration-200 hover:-translate-y-0.5"
                >
                  {social.label}
                </Link>
              ))
            ) : (
              <span className="app-empty-state rounded-full px-4 py-2 text-sm">
                No social links yet
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
