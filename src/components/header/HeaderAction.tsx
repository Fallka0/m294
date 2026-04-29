import type { ReactNode } from 'react'
import Link from 'next/link'

interface HeaderActionBaseProps {
  children: ReactNode
  className?: string
  variant?: 'primary' | 'secondary'
}

type HeaderActionProps =
  | (HeaderActionBaseProps & { href: string; onClick?: never; type?: never })
  | (HeaderActionBaseProps & { href?: never; onClick: () => void; type?: 'button' | 'submit' })

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(' ')
}

const variantClassNames = {
  primary:
    'rounded-[14px] border border-[color:var(--accent-border)] bg-[var(--accent-solid)] px-5 py-2.5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent-strong)] hover:shadow-[var(--accent-glow)]',
  secondary:
    'rounded-[14px] border border-[color:var(--header-border)] bg-[var(--header-pill)] px-4 py-2.5 text-sm font-medium text-[var(--header-text-muted)] transition duration-200 hover:-translate-y-0.5 hover:border-[color:var(--accent-border)] hover:text-[var(--header-text)]',
}

export default function HeaderAction(props: HeaderActionProps) {
  const { children, className, variant = 'secondary' } = props
  const actionClassName = joinClasses(variantClassNames[variant], className)

  if ('href' in props && props.href) {
    return (
      <Link href={props.href} className={actionClassName}>
        {children}
      </Link>
    )
  }

  return (
    <button type={props.type ?? 'button'} onClick={props.onClick} className={actionClassName}>
      {children}
    </button>
  )
}
