/**
 * ErrorState — inline, contextual error placeholder (taste-skill §4.5).
 * Uses role="alert" so assistive tech announces it; pass a retry action
 * when recovery is possible. Strings arrive via props for i18n.
 */
import { type ReactNode } from 'react'
import { TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  title: string
  description?: string
  /** Custom icon; defaults to TriangleAlert */
  icon?: ReactNode
  /** Optional recovery action (e.g. retry button) */
  action?: ReactNode
  className?: string
}

export function ErrorState({
  title,
  description,
  icon,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-destructive/25 bg-destructive/10 px-8 py-16 text-center',
        className,
      )}
    >
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10 text-destructive">
        {icon ?? <TriangleAlert size={24} aria-hidden="true" />}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
