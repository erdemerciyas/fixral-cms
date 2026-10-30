/**
 * TechLabel — monospace uppercase micro-label ("01 / TARAMA" pattern).
 * Figma Fiducial: 6×6 empty square (1px stroke) replaces the old crosshair +.
 * `crosshair` is kept as an alias of `fiducial` so existing call sites match
 * the brand system without a mass rename.
 */
import { type ElementType, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type TechLabelMarker = 'crosshair' | 'fiducial' | 'tick' | 'none'

interface TechLabelProps {
  children: ReactNode
  /** Numeric index, rendered zero-padded ("01 / LABEL"); strings pass through */
  index?: number | string
  /** Leading marker glyph (default 'none') */
  marker?: TechLabelMarker
  /** Rendered element (default 'span') */
  as?: ElementType<{ className?: string; children?: ReactNode }>
  className?: string
}

function FiducialMark() {
  return (
    <span
      aria-hidden
      data-testid="fiducial"
      className="inline-block size-1.5 shrink-0 border border-current"
    />
  )
}

export function TechLabel({
  children,
  index,
  marker = 'none',
  as: Comp = 'span',
  className,
}: TechLabelProps) {
  const formattedIndex =
    typeof index === 'number' ? String(index).padStart(2, '0') : index
  const showFiducial = marker === 'fiducial' || marker === 'crosshair'

  return (
    <Comp
      className={cn(
        'inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase leading-4 tracking-[0.14em] text-muted-foreground',
        className,
      )}
    >
      {showFiducial && <FiducialMark />}
      {marker === 'tick' && (
        <span aria-hidden className="h-3 w-px shrink-0 bg-current" />
      )}
      {formattedIndex !== undefined && (
        <>
          <span className="tabular-nums text-ink/70">{formattedIndex}</span>
          <span aria-hidden className="text-muted-foreground/50">
            /
          </span>
        </>
      )}
      {children}
    </Comp>
  )
}

export { TechLabel as Eyebrow }
