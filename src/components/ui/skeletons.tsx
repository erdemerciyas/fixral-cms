/**
 * Layout-matching skeleton composites (taste-skill §4.5: skeletons must
 * match the final layout's shape). Built on the shimmer Skeleton primitive;
 * shimmer is disabled under prefers-reduced-motion via globals.css.
 */
import { Skeleton } from './skeleton'
import { cn } from '@/lib/utils'

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={cn('space-y-3', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-4', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  )
}

export function SkeletonCard({
  className,
  withMedia = true,
}: {
  className?: string
  withMedia?: boolean
}) {
  return (
    <div
      className={cn('rounded-sm border border-border bg-card p-6', className)}
      aria-hidden="true"
    >
      {withMedia && <Skeleton className="mb-5 h-40 w-full rounded-sm" />}
      <Skeleton className="mb-3 h-5 w-1/2" />
      <SkeletonText lines={2} />
    </div>
  )
}

export function SkeletonGrid({
  count = 6,
  className,
  label = 'Loading',
}: {
  count?: number
  className?: string
  /** Screen-reader status label; pass a translated string */
  label?: string
}) {
  return (
    <div
      className={cn('grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3', className)}
      role="status"
    >
      <span className="sr-only">{label}</span>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonHero({ className }: { className?: string }) {
  return (
    <div
      className={cn('flex min-h-[40dvh] flex-col justify-center gap-6', className)}
      aria-hidden="true"
    >
      <Skeleton className="h-6 w-32 rounded-xs" />
      <Skeleton className="h-12 w-2/3 max-w-xl" />
      <SkeletonText lines={2} className="max-w-xl" />
    </div>
  )
}
