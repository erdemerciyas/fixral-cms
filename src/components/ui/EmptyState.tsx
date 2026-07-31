/**
 * EmptyState — composed empty placeholder (taste-skill §4.5).
 * Indicates what is missing and how to populate it via an optional action.
 * Strings arrive via props so callers stay in charge of i18n.
 */
import { type ReactNode } from 'react'
import { PackageOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  title: string
  description?: string
  /** Custom icon; defaults to PackageOpen */
  icon?: ReactNode
  /** Optional action (link/button) shown below the copy */
  action?: ReactNode
  className?: string
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-secondary px-8 py-16 text-center',
        className,
      )}
    >
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-primary/15 bg-card text-primary">
        {icon ?? <PackageOpen size={24} aria-hidden="true" />}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
