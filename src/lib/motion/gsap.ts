'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'

let pluginsRegistered = false

export function registerGsapPlugins(): void {
  if (pluginsRegistered || typeof window === 'undefined') return
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother)
  pluginsRegistered = true
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useGsapScope<T extends HTMLElement = HTMLDivElement>() {
  const scopeRef = useRef<T>(null)

  useEffect(() => {
    registerGsapPlugins()
  }, [])

  return scopeRef
}

export function useGsapEffect(
  setup: (scope: HTMLElement) => void | (() => void),
  deps: React.DependencyList = []
): React.RefObject<HTMLDivElement | null> {
  const scopeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prefersReducedMotion() || !scopeRef.current) return
    registerGsapPlugins()
    const ctx = gsap.context(() => {
      if (scopeRef.current) setup(scopeRef.current)
    }, scopeRef)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return scopeRef
}

export { gsap, ScrollTrigger, ScrollSmoother }
