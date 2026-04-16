import type { ReactNode } from 'react'

interface PageHeroProps {
  title: ReactNode
  description?: ReactNode
  badge?: ReactNode
  aside?: ReactNode
  variant?: 'light' | 'dark'
  className?: string
  contentClassName?: string
  titleClassName?: string
  descriptionClassName?: string
}

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(' ')
}

export default function PageHero({
  title,
  description,
  badge,
  aside,
  variant = 'light',
  className,
  contentClassName,
  titleClassName,
  descriptionClassName,
}: PageHeroProps) {
  const isDark = variant === 'dark'

  return (
    <section className={joinClasses(isDark ? 'page-hero-dark' : 'page-hero-light', className)}>
      <div className={joinClasses(aside ? 'grid gap-8 lg:grid-cols-[1.4fr_0.8fr] lg:items-end' : 'max-w-2xl', contentClassName)}>
        <div>
          {badge && (
            <div className={joinClasses('mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium', isDark ? 'page-hero-badge-dark' : 'page-hero-badge-light')}>
              {badge}
            </div>
          )}
          <div className={joinClasses(isDark ? 'text-white' : 'hero-title text-gray-950', titleClassName)}>
            {title}
          </div>
          {description && (
            <div className={joinClasses('mt-4 max-w-2xl text-sm leading-7 md:text-base', isDark ? 'text-white/75' : 'hero-copy text-gray-500', descriptionClassName)}>
              {description}
            </div>
          )}
        </div>

        {aside && <div>{aside}</div>}
      </div>
    </section>
  )
}
