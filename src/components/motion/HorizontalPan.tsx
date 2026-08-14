'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { gsap, prefersReducedMotion, registerGsapPlugins } from '@/lib/motion/gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface HorizontalPanProps {
  children: ReactNode
  className?: string
}

export function HorizontalPan({ children, className }: HorizontalPanProps) {
  const wrapRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (prefersReducedMotion() || !wrapRef.current) return
    registerGsapPlugins()
    const wrap = wrapRef.current
    const track = wrap.querySelector<HTMLElement>('.horizontal-track')
    if (!track) return
    const ctx = gsap.context(() => {
      const distance = track.scrollWidth - window.innerWidth
      gsap.to(track, {
        x: -distance,
        ease: 'none',
        scrollTrigger: {
          trigger: wrap,
          start: 'top top',
          end: () => `+=${distance}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })
    }, wrap)
    return () => ctx.revert()
  }, [children])

  if (prefersReducedMotion()) {
    return (
      <section className={className}>
        <div className="flex flex-col gap-8 py-16">{children}</div>
      </section>
    )
  }

  return (
    <section ref={wrapRef} className={`relative overflow-hidden ${className ?? ''}`}>
      <div className="horizontal-track flex h-[100dvh] items-center">{children}</div>
    </section>
  )
}
