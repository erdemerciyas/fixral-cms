/**
 * MeasureRule — tick-marked hairline divider with a ruler look.
 * Precision-kit replacement for plain SectionTransition hairlines:
 * a `--color-line` baseline with repeating tick marks and an optional
 * monospace label at the start/center/end. Vertical orientation is
 * supported for column gutters. Server-component safe (pure CSS,
 * no inline styles — tick patterns are static utility classes).
 */
import { cn } from '@/lib/utils'

type MeasureRuleTicks = 'sparse' | 'normal' | 'dense'
type MeasureRuleOrientation = 'horizontal' | 'vertical'

interface MeasureRuleProps {
  /** Tick spacing: sparse 32px, normal 16px, dense 8px (default 'normal') */
  ticks?: MeasureRuleTicks
  /** Optional monospace label rendered inline with the rule */
  label?: string
  /** Label placement along the rule (default 'center') */
  labelPosition?: 'start' | 'center' | 'end'
  /** Rule direction (default 'horizontal') */
  orientation?: MeasureRuleOrientation
  className?: string
}

const H_TICKS: Record<MeasureRuleTicks, string> = {
  sparse:
    'bg-[image:repeating-linear-gradient(to_right,var(--color-line)_0,var(--color-line)_1px,transparent_1px,transparent_32px)]',
  normal:
    'bg-[image:repeating-linear-gradient(to_right,var(--color-line)_0,var(--color-line)_1px,transparent_1px,transparent_16px)]',
  dense:
    'bg-[image:repeating-linear-gradient(to_right,var(--color-line)_0,var(--color-line)_1px,transparent_1px,transparent_8px)]',
}

const V_TICKS: Record<MeasureRuleTicks, string> = {
  sparse:
    'bg-[image:repeating-linear-gradient(to_bottom,var(--color-line)_0,var(--color-line)_1px,transparent_1px,transparent_32px)]',
  normal:
    'bg-[image:repeating-linear-gradient(to_bottom,var(--color-line)_0,var(--color-line)_1px,transparent_1px,transparent_16px)]',
  dense:
    'bg-[image:repeating-linear-gradient(to_bottom,var(--color-line)_0,var(--color-line)_1px,transparent_1px,transparent_8px)]',
}

export function MeasureRule({
  ticks = 'normal',
  label,
  labelPosition = 'center',
  orientation = 'horizontal',
  className,
}: MeasureRuleProps) {
  const vertical = orientation === 'vertical'

  const track = (
    <span
      aria-hidden
      className={cn(
        'flex-1 border-line',
        vertical ? cn('w-1.5 border-l', V_TICKS[ticks]) : cn('h-1.5 border-b', H_TICKS[ticks]),
      )}
    />
  )

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        'flex',
        vertical
          ? 'h-full min-h-16 w-fit flex-col items-start gap-2'
          : 'w-full items-end gap-3',
        className,
      )}
    >
      {label && labelPosition !== 'start' && track}
      {label ? (
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
      ) : (
        track
      )}
      {label && labelPosition !== 'end' && track}
    </div>
  )
}
