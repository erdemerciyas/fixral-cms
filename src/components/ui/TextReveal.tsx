'use client'

/**
 * TextReveal — Karakter veya kelime bazlı metin animasyonu.
 * whileInView ile staggered reveal uygular.
 * prefers-reduced-motion desteği ile erişilebilir.
 */
import {
  forwardRef,
  useMemo,
} from 'react'
import { m, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

type RevealMode = 'char' | 'word'

interface TextRevealProps {
  /** Animasyon uygulanacak metin */
  children: string
  className?: string
  /** Animasyon modu: karakter veya kelime bazlı */
  mode?: RevealMode
  /** Her eleman arası gecikme (saniye) */
  stagger?: number
  /** Animasyon başlangıç gecikmesi (saniye) */
  delay?: number
  /** Blur miktarı (px) */
  blurAmount?: number
  /**
   * Kinetic mask reveal: her segment overflow-hidden bir maske içinden
   * yukarı kayar (y: 110% → 0). Sadece 'word' modunda önerilir.
   */
  mask?: boolean
}

const PREMIUM_EASING = [0.32, 0.72, 0, 1] as const
const DURATION = 0.5

export const TextReveal = forwardRef<HTMLSpanElement, TextRevealProps>(
  function TextReveal(
    {
      children,
      className,
      mode = 'char',
      stagger = 0.02,
      delay = 0,
      blurAmount = 4,
      mask = false,
    },
    ref,
  ) {
    const prefersReduced = useReducedMotion()

    // Split text into segments
    const segments = useMemo(() => {
      if (mode === 'word') {
        return children.split(/(\s+)/).filter(Boolean)
      }
      return Array.from(children)
    }, [children, mode])

    if (prefersReduced) {
      return (
        <span ref={ref} className={cn(className)} aria-label={children}>
          {children}
        </span>
      )
    }

    /* Kinetic word-mask: her kelime overflow-hidden maskede yukarı kayar */
    if (mask) {
      return (
        <span
          ref={ref}
          className={cn('inline-flex flex-wrap', className)}
          aria-label={children}
        >
          {segments.map((segment, i) =>
            /^\s+$/.test(segment) ? (
              <span key={`${i}-sp`} className="inline-block" style={{ whiteSpace: 'pre' }}>
                {segment}
              </span>
            ) : (
              <span key={`${i}-${segment}`} className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom">
                <m.span
                  className="inline-block will-change-transform"
                  initial={{ y: '115%' }}
                  whileInView={{ y: '0%' }}
                  viewport={{ once: true }}
                  transition={{
                    duration: DURATION + 0.15,
                    delay: delay + i * stagger,
                    ease: PREMIUM_EASING,
                  }}
                >
                  {segment}
                </m.span>
              </span>
            ),
          )}
        </span>
      )
    }

    return (
      <span
        ref={ref}
        className={cn('inline-flex flex-wrap', className)}
        aria-label={children}
      >
        {segments.map((segment, i) => (
          <m.span
            key={`${i}-${segment}`}
            className="inline-block"
            style={{ whiteSpace: segment === ' ' ? 'pre' : undefined }}
            initial={{
              opacity: 0,
              y: 10,
              filter: `blur(${blurAmount}px)`,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
            }}
            viewport={{ once: true }}
            transition={{
              duration: DURATION,
              delay: delay + i * stagger,
              ease: PREMIUM_EASING,
            }}
          >
            {segment}
          </m.span>
        ))}
      </span>
    )
  },
)
