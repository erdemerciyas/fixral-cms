/**
 * BlueprintGrid — precision-engineering background grid (pure CSS).
 * Ultra-low-contrast hairline grid built from linear-gradients over
 * `--color-line` / `--color-border-strong`, so it adapts to light/dark
 * public themes automatically. Meant to be layered as an absolute overlay
 * inside hero/section bands; always aria-hidden and pointer-events-none.
 * Server-component safe — no inline styles, only static utility classes.
 */
import { cn } from '@/lib/utils'

type BlueprintGridDensity = 'fine' | 'normal' | 'coarse'
type BlueprintGridOpacity = 'faint' | 'subtle' | 'strong'

interface BlueprintGridProps {
  /** Minor cell size: fine 24px, normal 40px, coarse 64px (default 'normal') */
  density?: BlueprintGridDensity
  /** Overlay intensity (default 'subtle') */
  opacity?: BlueprintGridOpacity
  /** Draw a stronger major grid every 5 minor cells (default true) */
  major?: boolean
  className?: string
}

/* Hairline cross-grid images; size classes below set the cell rhythm. */
const MINOR_IMAGE =
  'bg-[image:linear-gradient(to_right,var(--color-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-line)_1px,transparent_1px)]'
const MAJOR_IMAGE =
  'bg-[image:linear-gradient(to_right,var(--color-border-strong)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border-strong)_1px,transparent_1px)]'

const MINOR_SIZE: Record<BlueprintGridDensity, string> = {
  fine: 'bg-[size:24px_24px]',
  normal: 'bg-[size:40px_40px]',
  coarse: 'bg-[size:64px_64px]',
}

/* Major cell = 5 × minor cell */
const MAJOR_SIZE: Record<BlueprintGridDensity, string> = {
  fine: 'bg-[size:120px_120px]',
  normal: 'bg-[size:200px_200px]',
  coarse: 'bg-[size:320px_320px]',
}

const OPACITY: Record<BlueprintGridOpacity, string> = {
  faint: 'opacity-25',
  subtle: 'opacity-45',
  strong: 'opacity-70',
}

export function BlueprintGrid({
  density = 'normal',
  opacity = 'subtle',
  major = true,
  className,
}: BlueprintGridProps) {
  return (
    <div
      aria-hidden
      data-testid="blueprint-grid"
      className={cn(
        'pointer-events-none absolute inset-0',
        OPACITY[opacity],
        className,
      )}
    >
      <div className={cn('absolute inset-0', MINOR_IMAGE, MINOR_SIZE[density])} />
      {major && (
        <div className={cn('absolute inset-0', MAJOR_IMAGE, MAJOR_SIZE[density])} />
      )}
    </div>
  )
}
