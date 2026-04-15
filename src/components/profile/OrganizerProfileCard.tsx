import Link from 'next/link'
import type { Profile } from '@/lib/types'

interface OrganizerProfileCardProps {
  profile: Profile
  editable?: boolean
}

function normalizeUrl(url?: string | null) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}

export default function OrganizerProfileCard({
  profile,
  editable = false,
}: OrganizerProfileCardProps) {
  const displayName = profile.full_name || profile.username || 'Organizer'
  const socials = [
    { label: 'Website', href: normalizeUrl(profile.website_url) },
    { label: 'X', href: normalizeUrl(profile.x_url) },
    { label: 'GitHub', href: normalizeUrl(profile.github_url) },
  ].filter((item) => item.href)

  return (
    <section className="overflow-hidden rounded-[32px] border border-black/5 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div
        className="h-40 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.28),transparent_45%),linear-gradient(135deg,#111827_0%,#0f172a_55%,#164e63_100%)]"
        style={profile.banner_url ? { backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.65), rgba(8,145,178,0.3)), url(${profile.banner_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      />
      <div className="px-6 pb-6">
        <div className="-mt-10 flex items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-3xl border-4 border-white bg-[linear-gradient(135deg,#111827_0%,#0891b2_100%)] text-2xl font-semibold text-white shadow-lg"
              style={profile.avatar_url ? { backgroundImage: `url(${profile.avatar_url})`, backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent' } : undefined}
            >
              {displayName.slice(0, 1).toUpperCase()}
            </div>
            <div className="pb-1">
              <p className="text-2xl font-semibold tracking-tight text-gray-950">{displayName}</p>
              <p className="mt-1 text-sm text-gray-500">@{profile.username || 'organizer'}</p>
            </div>
          </div>
          {editable && (
            <span className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Editable
            </span>
          )}
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
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition duration-200 hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow-sm"
              >
                {social.label}
              </Link>
            ))
          ) : (
            <span className="rounded-full border border-dashed border-black/10 px-4 py-2 text-sm text-gray-400">
              No social links yet
            </span>
          )}
        </div>
      </div>
    </section>
  )
}
