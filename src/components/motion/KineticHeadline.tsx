'use client'

import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion, registerGsapPlugins } from '@/lib/motion/gsap'
import { SplitText } from 'gsap/SplitText'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface KineticHeadlineProps {
  text: string
  as?: 'h1' | 'h2' | 'h3'
  className?: string
}

export function KineticHeadline({ text, as: Tag = 'h1', className }: KineticHeadlineProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prefersReducedMotion() || !containerRef.current) return
    registerGsapPlugins()
    gsap.registerPlugin(SplitText, ScrollTrigger)
    const el = containerRef.current.querySelector('[data-kinetic]')
    if (!el) return
    const split = new SplitText(el, { type: 'lines', linesClass: 'kinetic-line overflow-hidden' })
    gsap.from(split.lines, {
      y: '100%',
      opacity: 0,
      duration: 0.8,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    })
    return () => split.revert()
  }, [text])

  if (prefersReducedMotion()) {
    return <Tag className={`hero-title leading-[1.1] pb-1 ${className ?? ''}`}>{text}</Tag>
  }

  return (
    <div ref={containerRef}>
      <Tag data-kinetic className={`hero-title leading-[1.1] pb-1 ${className ?? ''}`}>
        {text}
      </Tag>
    </div>
  )
}
