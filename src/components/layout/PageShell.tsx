import type { ReactNode } from 'react'

interface PageShellProps {
  children: ReactNode
  className?: string
  contentClassName?: string
}

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export default function PageShell({ children, className, contentClassName }: PageShellProps) {
  return (
    <main className={joinClasses('page-shell min-h-screen px-4 py-8 sm:px-6 sm:py-10 transition-colors duration-300', className)}>
      <div className={joinClasses('mx-auto flex max-w-[1180px] flex-col gap-8', contentClassName)}>
        {children}
      </div>
    </main>
  )
}
