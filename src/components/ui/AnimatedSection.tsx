'use client'

/**
 * AnimatedSection — Scroll-triggered section animasyon wrapper.
 * whileInView ile viewport'a girdiğinde animasyon tetikler.
 * direction prop'u ile animasyon yönü belirlenebilir.
 */
import { forwardRef, type ReactNode, useMemo } from 'react'
import { m, useReducedMotion, type Variants } from 'framer-motion'
import { cn } from '@/lib/utils'

type Direction = 'up' | 'left' | 'right' | 'scale'

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  /** Animasyon başlangıç gecikmesi (saniye) */
  delay?: number
  /** Animasyon yönü */
  direction?: Direction
  /** Viewport tetikleme eşiği */
  threshold?: number
  /** ARIA role */
  role?: string
  /** ARIA label */
  'aria-label'?: string
}

const PREMIUM_EASING = [0.32, 0.72, 0, 1] as const
const DURATION = 0.7

function buildVariants(direction: Direction, reduced: boolean): Variants {
  if (reduced) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    }
  }

  const initial: { opacity: number; filter: string; x?: number; y?: number; scale?: number } = { opacity: 0, filter: 'blur(4px)' }

  switch (direction) {
    case 'up':
      initial.y = 40
      break
    case 'left':
      initial.x = -40
      break
    case 'right':
      initial.x = 40
      break
    case 'scale':
      initial.scale = 0.95
      break
  }

  return {
    hidden: initial,
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: DURATION,
        ease: PREMIUM_EASING,
      },
    },
  }
}

export const AnimatedSection = forwardRef<HTMLElement, AnimatedSectionProps>(
  function AnimatedSection(
    {
      children,
      className,
      style,
      delay = 0,
      direction = 'up',
      threshold = 0.2,
      role,
      ...ariaProps
    },
    ref,
  ) {
    const reducedMotion = useReducedMotion() ?? false

    const variants = useMemo(
      () => buildVariants(direction, reducedMotion),
      [direction, reducedMotion],
    )

    return (
      <m.section
        ref={ref}
        variants={variants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: threshold }}
        transition={{ delay: reducedMotion ? 0 : delay }}
        className={cn(className)}
        style={style}
        role={role}
        {...ariaProps}
      >
        {children}
      </m.section>
    )
  },
)
