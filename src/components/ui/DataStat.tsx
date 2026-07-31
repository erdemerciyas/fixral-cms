'use client'

/**
 * DataStat — monospace count-up metric with a unit affix (µm, mm, %, +).
 * Counting starts once the element enters the viewport (useInViewOnce);
 * under prefers-reduced-motion the final value renders immediately.
 * The count-up runs on rAF with easeOutCubic and always lands exactly
 * on the target value.
 */
import { useEffect, useState } from 'react'
import { useInViewOnce, useReducedMotionGuard } from '@/hooks/use-motion'
import { cn } from '@/lib/utils'

interface DataStatProps {
  /** Target numeric value */
  value: number
  /** Unit rendered after the number (µm, mm, %, +) */
  suffix?: string
  /** Symbol rendered before the number (±, <) */
  prefix?: string
  /** Monospace micro-label under the number */
  label?: string
  /** Fraction digits (default 0) */
  decimals?: number
  /** Count-up duration in seconds (default 1.4) */
  duration?: number
  className?: string
}

export function DataStat({
  value,
  suffix,
  prefix,
  label,
  decimals = 0,
  duration = 1.4,
  className,
}: DataStatProps) {
  const reducedMotion = useReducedMotionGuard()
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.4)
  const [counted, setCounted] = useState(0)

  useEffect(() => {
    if (reducedMotion || !inView) return

    let frame = 0
    const start = performance.now()
    const total = Math.max(duration, 0.001) * 1000

    const tick = (now: number) => {
      const t = Math.min((now - start) / total, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setCounted(t < 1 ? value * eased : value)
      if (t < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, reducedMotion, value, duration])

  // Reduced motion: skip the count-up entirely and render the target value.
  const display = reducedMotion ? value : counted

  return (
    <div ref={ref} className={cn('flex flex-col gap-1.5', className)}>
      <span className="font-mono text-3xl font-medium tabular-nums leading-none text-ink md:text-4xl">
        {prefix}
        {display.toFixed(decimals)}
        {suffix && <span className="text-brand-primary">{suffix}</span>}
      </span>
      {label && (
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
      )}
    </div>
  )
}
