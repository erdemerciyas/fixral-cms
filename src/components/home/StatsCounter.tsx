'use client'

/**
 * StatsCounter — Animasyonlu istatistik bandı.
 * 4 istatistik: Yıllık Deneyim, Tamamlanan Proje, Mutlu Müşteri, Uzman Ekip.
 * Count-up via Motion animate() on a MotionValue (no rAF loops touching React state).
 * useInViewOnce one-shot IntersectionObserver fires animation once.
 * font-mono tabular-nums per taste-skill §6.7.
 */
import { useEffect } from 'react'
import { m, animate, useMotionValue, useTransform, useReducedMotion } from 'framer-motion'
import { useInViewOnce } from '@/hooks/use-motion'

interface StatItem {
  value: number
  suffix: string
  label: string
}

const STATS: StatItem[] = [
  { value: new Date().getFullYear() - 2018, suffix: '+', label: 'Yıllık Deneyim' },
  { value: 150, suffix: '+', label: 'Tamamlanan Proje' },
  { value: 80, suffix: '+', label: 'Mutlu Müşteri' },
  { value: 25, suffix: '+', label: 'Uzman Ekip' },
]

function CountUpNumber({ stat }: { stat: StatItem }) {
  const reducedMotion = useReducedMotion()
  const { ref, inView } = useInViewOnce<HTMLSpanElement>(0.3)
  const mv = useMotionValue(reducedMotion ? stat.value : 0)
  const rounded = useTransform(mv, (v) => Math.round(v))

  useEffect(() => {
    if (reducedMotion) {
      mv.set(stat.value)
      return
    }
    if (!inView) return
    const controls = animate(mv, stat.value, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
    })
    return () => controls.stop()
  }, [inView, reducedMotion, stat.value, mv])

  return (
    <span ref={ref} className="tabular-nums font-mono">
      {reducedMotion ? stat.value : <m.span>{rounded}</m.span>}
      {stat.suffix}
    </span>
  )
}

export default function StatsCounter() {
  return (
    <section className="relative py-16 md:py-20" aria-label="İstatistikler">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-sm border border-border bg-card">
          <div className="py-12 md:py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div
                    className="text-4xl md:text-5xl font-bold mb-2 text-accent-foreground"
                    style={{ letterSpacing: '-0.03em' }}
                  >
                    <CountUpNumber stat={stat} />
                  </div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
