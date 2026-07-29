import { cn } from "@/lib/utils"

/**
 * Shimmer efektli skeleton — nihai içeriğin şeklini taklit eder.
 * `prefers-reduced-motion` durumunda shimmer devre dışı kalır (globals.css).
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "skeleton-shimmer animate-pulse rounded-md bg-muted",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
