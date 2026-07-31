'use client'

/**
 * RevealStagger — canonical taste-skill §5.C scroll-reveal stagger.
 * Lightweight alternative to GSAP for "items appear as they enter viewport".
 * Each direct child animates with an index-based delay; under reduced motion
 * the container renders statically with no animation wrappers.
 */
import { Children, type ReactNode } from 'react'
import { m } from 'framer-motion'
import { useReducedMotionGuard } from '@/hooks/use-motion'
import { cn } from '@/lib/utils'

interface RevealStaggerProps {
  children: ReactNode
  className?: string
  /** Delay between items in seconds (default 0.06) */
  staggerDelay?: number
  /** Initial vertical offset in px (default 24) */
  offset?: number
  /** className applied to every animated item wrapper (e.g. 'h-full' in grids) */
  itemClassName?: string
}

const EASE_SPRING: [number, number, number, number] = [0.16, 1, 0.3, 1]

export function RevealStagger({
  children,
  className,
  staggerDelay = 0.06,
  offset = 24,
  itemClassName,
}: RevealStaggerProps) {
  const reducedMotion = useReducedMotionGuard()

  if (reducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <div className={className}>
      {Children.map(children, (child, index) => (
        <m.div
          className={cn(itemClassName)}
          initial={{ opacity: 0, y: offset }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 0.6,
            delay: index * staggerDelay,
            ease: EASE_SPRING,
          }}
        >
          {child}
        </m.div>
      ))}
    </div>
  )
}
