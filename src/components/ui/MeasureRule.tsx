/**
 * MeasureRule — Figma datum line: 1px baseline + 8px ticks every 32px,
 * 12px major ticks every 128px. Optional Geist Mono label.
 */
import { cn } from '@/lib/utils'

type MeasureRuleTicks = 'sparse' | 'normal' | 'dense'
type MeasureRuleOrientation = 'horizontal' | 'vertical'

interface MeasureRuleProps {
  /** Tick spacing: sparse 32px datum, normal 16px, dense 8px (default 'sparse' = brand datum) */
  ticks?: MeasureRuleTicks
  /** Optional monospace label rendered inline with the rule */
  label?: string
  /** Label placement along the rule (default 'center') */
  labelPosition?: 'start' | 'center' | 'end'
  /** Rule direction (default 'horizontal') */
  orientation?: MeasureRuleOrientation
  className?: string
}

const H_MINOR: Record<MeasureRuleTicks, string> = {
  sparse:
    'bg-[image:repeating-linear-gradient(to_right,var(--color-line)_0,var(--color-line)_1px,transparent_1px,transparent_32px)]',
  normal:
    'bg-[image:repeating-linear-gradient(to_right,var(--color-line)_0,var(--color-line)_1px,transparent_1px,transparent_16px)]',
  dense:
    'bg-[image:repeating-linear-gradient(to_right,var(--color-line)_0,var(--color-line)_1px,transparent_1px,transparent_8px)]',
}

const H_MAJOR: Record<MeasureRuleTicks, string> = {
  sparse:
    'bg-[image:repeating-linear-gradient(to_right,var(--color-line)_0,var(--color-line)_1px,transparent_1px,transparent_128px)]',
  normal:
    'bg-[image:repeating-linear-gradient(to_right,var(--color-line)_0,var(--color-line)_1px,transparent_1px,transparent_64px)]',
  dense:
    'bg-[image:repeating-linear-gradient(to_right,var(--color-line)_0,var(--color-line)_1px,transparent_1px,transparent_32px)]',
}

const V_MINOR: Record<MeasureRuleTicks, string> = {
  sparse:
    'bg-[image:repeating-linear-gradient(to_bottom,var(--color-line)_0,var(--color-line)_1px,transparent_1px,transparent_32px)]',
  normal:
    'bg-[image:repeating-linear-gradient(to_bottom,var(--color-line)_0,var(--color-line)_1px,transparent_1px,transparent_16px)]',
  dense:
    'bg-[image:repeating-linear-gradient(to_bottom,var(--color-line)_0,var(--color-line)_1px,transparent_1px,transparent_8px)]',
}

const V_MAJOR: Record<MeasureRuleTicks, string> = {
  sparse:
    'bg-[image:repeating-linear-gradient(to_bottom,var(--color-line)_0,var(--color-line)_1px,transparent_1px,transparent_128px)]',
  normal:
    'bg-[image:repeating-linear-gradient(to_bottom,var(--color-line)_0,var(--color-line)_1px,transparent_1px,transparent_64px)]',
  dense:
    'bg-[image:repeating-linear-gradient(to_bottom,var(--color-line)_0,var(--color-line)_1px,transparent_1px,transparent_32px)]',
}

export function MeasureRule({
  ticks = 'sparse',
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
        'relative flex-1',
        vertical ? 'w-3 min-h-16' : 'h-3 w-full',
      )}
    >
      <span
        className={cn(
          'absolute bg-line',
          vertical ? 'inset-y-0 left-0 w-px' : 'inset-x-0 bottom-0 h-px',
        )}
      />
      <span
        className={cn(
          'absolute',
          vertical
            ? cn('inset-y-0 left-0 w-2', V_MINOR[ticks])
            : cn('inset-x-0 bottom-0 h-2', H_MINOR[ticks]),
        )}
      />
      <span
        className={cn(
          'absolute',
          vertical
            ? cn('inset-y-0 left-0 w-3', V_MAJOR[ticks])
            : cn('inset-x-0 bottom-0 h-3', H_MAJOR[ticks]),
        )}
      />
    </span>
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
        <span className="shrink-0 font-mono text-[10px] uppercase leading-[14px] tracking-[0.14em] text-muted-foreground">
          {label}
        </span>
      ) : (
        track
      )}
      {label && labelPosition !== 'end' && track}
    </div>
  )
}
