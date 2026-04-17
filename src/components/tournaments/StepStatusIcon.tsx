interface StepStatusIconProps {
  className?: string
}

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export default function StepStatusIcon({ className }: StepStatusIconProps) {
  return (
    <span
      className={joinClasses(
        'inline-flex h-6 w-6 items-center justify-center rounded-full border border-[color:var(--success-border)] bg-[color:var(--success-soft)] text-[color:var(--success-text)]',
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M3.5 8.25L6.5 11.25L12.5 5.25"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}
