'use client'

/**
 * Precision-kit motion presets — shared entrance patterns for Phase 4/5.
 * Duration/easing live here as token-like constants so every section
 * animates with the same voice. Variant factories take a `reduced` flag;
 * the useMotionPresets() hook wires that flag from use-motion.ts so
 * prefers-reduced-motion collapses every preset to instant opacity-only.
 * Independent of AnimatedSection — consume with `m.*` + variants.
 */
import { useMemo } from 'react'
import { type Variants } from 'framer-motion'
import { useReducedMotionGuard } from '@/hooks/use-motion'

/* ── Motion tokens ── */
export const MOTION_DURATION = {
  fast: 0.4,
  base: 0.6,
  slow: 0.9,
} as const

export const MOTION_EASE = {
  /** Signature entrance ease — fast start, precise settle */
  precision: [0.16, 1, 0.3, 1],
  /** Standard in/out for hovers and small shifts */
  standard: [0.32, 0.72, 0, 1],
} as const

export const MOTION_STAGGER = 0.08

/** Reduced-motion collapse: opacity-only, effectively instant. */
const REDUCED_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0 } },
}

/* ── Variant factories (hidden/visible keys, whileInView-compatible) ── */

/** Fade + rise entrance; the default precision-kit reveal. */
export function fadeUp(reduced: boolean, offset = 24): Variants {
  if (reduced) return REDUCED_VARIANTS
  return {
    hidden: { opacity: 0, y: offset },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: MOTION_DURATION.base, ease: MOTION_EASE.precision },
    },
  }
}

/** Clip-path wipe from bottom edge — for media and hero panels. */
export function clipReveal(reduced: boolean): Variants {
  if (reduced) return REDUCED_VARIANTS
  return {
    hidden: { opacity: 0, clipPath: 'inset(0 0 100% 0)' },
    visible: {
      opacity: 1,
      clipPath: 'inset(0 0 0% 0)',
      transition: { duration: MOTION_DURATION.slow, ease: MOTION_EASE.precision },
    },
  }
}

/** Parent orchestrator: pair with staggerItem on children. */
export function staggerContainer(
  reduced: boolean,
  stagger = MOTION_STAGGER,
  delayChildren = 0,
): Variants {
  if (reduced) return REDUCED_VARIANTS
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren },
    },
  }
}

/** Child of staggerContainer — inherits timing from the parent. */
export function staggerItem(reduced: boolean, offset = 20): Variants {
  if (reduced) return REDUCED_VARIANTS
  return {
    hidden: { opacity: 0, y: offset },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: MOTION_DURATION.base, ease: MOTION_EASE.precision },
    },
  }
}

/**
 * One-stop hook: reads prefers-reduced-motion once and returns every
 * preset already collapsed when needed, plus the raw `reduced` flag.
 */
export function useMotionPresets() {
  const reduced = useReducedMotionGuard()

  return useMemo(
    () => ({
      reduced,
      fadeUp: fadeUp(reduced),
      clipReveal: clipReveal(reduced),
      staggerContainer: staggerContainer(reduced),
      staggerItem: staggerItem(reduced),
    }),
    [reduced],
  )
}
