'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { gsap, prefersReducedMotion, registerGsapPlugins } from '@/lib/motion/gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface StickyStackProps {
  cards: ReactNode[]
  className?: string
}

export function StickyStack({ cards, className }: StickyStackProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prefersReducedMotion() || !ref.current) return
    registerGsapPlugins()
    const ctx = gsap.context(() => {
      const cardEls = gsap.utils.toArray<HTMLElement>('.stack-card')
      cardEls.forEach((card, i) => {
        if (i === cardEls.length - 1) return
        ScrollTrigger.create({
          trigger: card,
          start: 'top top',
          endTrigger: cardEls[cardEls.length - 1],
          end: 'top top',
          pin: true,
          pinSpacing: false,
        })
        gsap.to(card, {
          scale: 0.92,
          opacity: 0.55,
          ease: 'none',
          scrollTrigger: {
            trigger: cardEls[i + 1],
            start: 'top bottom',
            end: 'top top',
            scrub: true,
          },
        })
      })
    }, ref)
    return () => ctx.revert()
  }, [cards.length])

  if (prefersReducedMotion()) {
    return (
      <div className={className}>
        {cards.map((card, i) => (
          <div key={i} className="min-h-[60dvh] flex items-center justify-center py-16">
            {card}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div ref={ref} className={className}>
      {cards.map((card, i) => (
        <div
          key={i}
          className="stack-card sticky top-0 min-h-[100dvh] flex items-center justify-center"
        >
          {card}
        </div>
      ))}
    </div>
  )
}
