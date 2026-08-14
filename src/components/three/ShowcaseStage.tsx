'use client'

import { useReducedMotionGuard } from '@/hooks/use-motion'
import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { gsap, registerGsapPlugins } from '@/lib/motion/gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const ModelCanvas = dynamic(() => import('./ShowcaseModelCanvas'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-secondary animate-pulse" aria-hidden="true" />
  ),
})

interface ShowcaseStageProps {
  className?: string
  posterUrl?: string
}

export function ShowcaseStage({ className, posterUrl }: ShowcaseStageProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const progressRef = useRef(0)
  const [modelUrl, setModelUrl] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const reducedMotion = useReducedMotionGuard()

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    fetch('/api/public/3dmodels?limit=1')
      .then((r) => r.json())
      .then((data) => {
        const first = data?.models?.[0]?.url ?? data?.[0]?.url
        if (first) setModelUrl(first)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (reducedMotion || isMobile || !sectionRef.current) return
    registerGsapPlugins()
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=150%',
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          progressRef.current = self.progress
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [reducedMotion, isMobile])

  const showCanvas = !reducedMotion && !isMobile && modelUrl

  return (
    <section
      ref={sectionRef}
      className={`relative min-h-[100dvh] w-full overflow-hidden bg-background ${className ?? ''}`}
      aria-label="3D showcase"
    >
      {showCanvas ? (
        <ModelCanvas modelUrl={modelUrl} progressRef={progressRef} />
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage: posterUrl
              ? `url(${posterUrl})`
              : 'linear-gradient(135deg, var(--surface-2) 0%, var(--surface-3) 100%)',
          }}
          aria-hidden="true"
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
    </section>
  )
}
