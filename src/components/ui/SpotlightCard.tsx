'use client'

/**
 * SpotlightCard — surface illuminates under the cursor (spotlight border card).
 * Pointer position flows through Motion values into a gradient overlay, so
 * mousemove never triggers a React re-render. Under reduced motion the card
 * renders statically without the overlay and without pointer handlers.
 */
import { useCallback, type CSSProperties, type ReactNode } from 'react'
import { m, useMotionValue, useMotionTemplate } from 'framer-motion'
import { useReducedMotionGuard } from '@/hooks/use-motion'
import { cn } from '@/lib/utils'

interface SpotlightCardProps {
  children: ReactNode
  className?: string
  /** Spotlight tint (any CSS color). Defaults to Precision Azure at low alpha. */
  spotlightColor?: string
}

const OFFSCREEN = -500

export function SpotlightCard({
  children,
  className,
  spotlightColor = 'oklch(0.72 0.17 235 / 0.12)',
}: SpotlightCardProps) {
  const reducedMotion = useReducedMotionGuard()
  const mouseX = useMotionValue(OFFSCREEN)
  const mouseY = useMotionValue(OFFSCREEN)

  const background = useMotionTemplate`radial-gradient(320px circle at ${mouseX}px ${mouseY}px, var(--spotlight-color), transparent 70%)`

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      mouseX.set(e.clientX - rect.left)
      mouseY.set(e.clientY - rect.top)
    },
    [mouseX, mouseY],
  )

  const handleMouseLeave = useCallback(() => {
    mouseX.set(OFFSCREEN)
    mouseY.set(OFFSCREEN)
  }, [mouseX, mouseY])

  const overlayStyle = {
    background,
    '--spotlight-color': spotlightColor,
  } as unknown as CSSProperties

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-primary/20 bg-surface-primary',
        className,
      )}
      onMouseMove={reducedMotion ? undefined : handleMouseMove}
      onMouseLeave={reducedMotion ? undefined : handleMouseLeave}
    >
      {!reducedMotion && (
        <m.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={overlayStyle}
        />
      )}
      {children}
    </div>
  )
}
