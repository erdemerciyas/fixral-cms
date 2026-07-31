'use client'

import { m, useReducedMotion, type Variants } from 'framer-motion'
import { type ReactNode, useMemo } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  as?: 'div' | 'section' | 'article' | 'ul' | 'li'
  /** Enable stagger animation for children */
  stagger?: boolean
  /** Stagger delay between children (seconds) */
  staggerDelay?: number
  /** Initial delay before animation starts (seconds) */
  delay?: number
  /** Enable blur → sharp transition */
  blur?: boolean
  /** Only animate once */
  once?: boolean
}

export function ScrollReveal({
  children,
  className,
  as = 'div',
  stagger = false,
  staggerDelay = 0.08,
  delay = 0,
  blur = true,
  once = true,
}: ScrollRevealProps) {
  const prefersReducedMotion = useReducedMotion()

  const Component = m[as] as typeof m.div

  const containerVariants: Variants = useMemo(
    () => ({
      hidden: {},
      visible: {
        transition: {
          staggerChildren: staggerDelay,
          delayChildren: delay,
        },
      },
    }),
    [staggerDelay, delay],
  )

  const itemVariants: Variants = useMemo(
    () => ({
      hidden: {
        opacity: 0,
        y: 24,
        ...(blur ? { filter: 'blur(4px)' } : {}),
      },
      visible: {
        opacity: 1,
        y: 0,
        ...(blur ? { filter: 'blur(0px)' } : {}),
        transition: {
          duration: prefersReducedMotion ? 0.01 : 0.7,
          ease: [0.32, 0.72, 0, 1],
        },
      },
    }),
    [blur, prefersReducedMotion],
  )

  if (prefersReducedMotion) {
    return <Component className={className}>{children}</Component>
  }

  if (stagger) {
    return (
      <Component
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, margin: '-60px' }}
        className={className}
      >
        {children}
      </Component>
    )
  }

  return (
    <Component
      initial={{
        opacity: 0,
        y: 24,
        ...(blur ? { filter: 'blur(4px)' } : {}),
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        ...(blur ? { filter: 'blur(0px)' } : {}),
      }}
      viewport={{ once, margin: '-60px' }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.32, 0.72, 0, 1],
      }}
      className={className}
    >
      {children}
    </Component>
  )
}

export function ScrollRevealItem({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const prefersReducedMotion = useReducedMotion()

  const itemVariants: Variants = useMemo(
    () => ({
      hidden: {
        opacity: 0,
        y: 24,
        filter: 'blur(4px)',
      },
      visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: {
          duration: prefersReducedMotion ? 0.01 : 0.7,
          ease: [0.32, 0.72, 0, 1],
        },
      },
    }),
    [prefersReducedMotion],
  )

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <m.div variants={itemVariants} className={className}>
      {children}
    </m.div>
  )
}
