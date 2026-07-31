/**
 * TechLabel — monospace uppercase micro-label ("01 / TARAMA" pattern).
 * The precision-kit replacement for pill-style eyebrows: flat, technical,
 * tracking-wide Geist Mono text with an optional numeric index and an
 * optional crosshair (+) or tick marker. Server-component safe.
 * Also exported as `Eyebrow` for call sites that read better that way.
 */
import { type ElementType, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type TechLabelMarker = 'crosshair' | 'tick' | 'none'

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

export function TechLabel({
  children,
  index,
  marker = 'none',
  as: Comp = 'span',
  className,
}: TechLabelProps) {
  const formattedIndex =
    typeof index === 'number' ? String(index).padStart(2, '0') : index

  return (
    <Comp
      className={cn(
        'inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground',
        className,
      )}
    >
      {marker === 'crosshair' && (
        <span aria-hidden className="text-brand-primary">
          +
        </span>
      )}
      {marker === 'tick' && (
        <span aria-hidden className="h-3 w-px shrink-0 bg-brand-primary" />
      )}
      {formattedIndex !== undefined && (
        <>
          <span className="text-ink/70">{formattedIndex}</span>
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
