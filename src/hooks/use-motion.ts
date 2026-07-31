'use client'

/**
 * Shared motion hooks — taste-skill §5.D compliant.
 * No window scroll listeners, no rAF loops touching React state.
 * Continuous values flow through Motion values; discrete state
 * changes are threshold-based so React re-renders only on crossings.
 */
import { useEffect, useRef, useState } from 'react'
import { useReducedMotion, useScroll, useMotionValueEvent } from 'framer-motion'

/**
 * SSR-safe wrapper around framer-motion's useReducedMotion.
 * Always returns a boolean (never null) so motion guards stay simple.
 */
export function useReducedMotionGuard(): boolean {
  return useReducedMotion() ?? false
}

/**
 * One-shot IntersectionObserver for scroll-triggered reveals and counters.
 * Disconnects after the first intersection; falls back to "visible" when
 * IntersectionObserver is unavailable (legacy browsers, test environments).
 */
export function useInViewOnce<T extends HTMLElement = HTMLDivElement>(
  threshold = 0.3,
  rootMargin = '0px',
) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (inView) return
    const element = ref.current
    if (!element) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true)
            observer.disconnect()
            break
          }
        }
      },
      { threshold, rootMargin },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [inView, threshold, rootMargin])

  return { ref, inView } as const
}

/**
 * Threshold boolean driven by Motion's useScroll (batched, passive).
 * Replaces window.addEventListener('scroll') patterns: React state only
 * toggles when the scroll position crosses the threshold, never per frame.
 */
export function useScrollThreshold(threshold = 50): boolean {
  const { scrollY } = useScroll()
  const [passed, setPassed] = useState(false)

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setPassed((prev) => {
      const next = latest > threshold
      return prev === next ? prev : next
    })
  })

  return passed
}
