'use client'

/**
 * HeroContent — Banner metin katmanı (Printables paradigması).
 * Sol hizalı büyük tipografi + CTA çifti. Görsel üzerindeyse metin beyaz,
 * görselsiz slide'da token tabanlı foreground renkleri kullanılır.
 *
 * Sadeleştirme (Faz 5): kinetic word-mask (TextReveal) ve MagneticButton
 * kaldırıldı; yalnızca slide değişiminde fade/slide animasyonu var.
 */
import { m, useReducedMotion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { cn } from '@/lib/utils'

export interface HeroSlideData {
  id: string
  title: string
  subtitle?: string
  description?: string
  ctaText?: string
  ctaLink?: string
  badge?: string
}

interface HeroContentProps {
  slide?: HeroSlideData
  slideIndex?: number
  /** Slide görsel üzerinde mi? (koyu scrim → beyaz tipografi) */
  onImage?: boolean
}

const PREMIUM_EASING = [0.32, 0.72, 0, 1] as const

export default function HeroContent({ slide, slideIndex = 0, onImage = false }: HeroContentProps) {
  const lang = useLocale()
  const reducedMotion = useReducedMotion()

  const title = slide?.title ?? 'Mühendislikte Sınırsız Hassasiyet'
  const subtitle = slide?.subtitle ?? 'Endüstriyel Çözümler'
  const description = slide?.description ??
    '3D tarama, tersine mühendislik ve prototipleme ile projelerinize ölçülebilir değer katın.'
  const ctaText = slide?.ctaText ?? 'Projeleri İncele'
  const ctaLink = slide?.ctaLink ?? `/${lang}/portfolio`
  const badge = slide?.badge

  return (
    <div className="relative z-10 flex min-h-[440px] w-full items-center py-24 sm:min-h-[520px] lg:min-h-[600px]">
      <div className="mx-auto w-full px-6 sm:px-10 lg:px-14">
        {/* Sol hizalı içerik bloğu — sağ yarı görsele bırakılır */}
        <div className="max-w-2xl">
          <AnimatePresence mode="wait">
            <m.div
              key={slideIndex}
              initial={reducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: reducedMotion ? 0 : 0.5, ease: PREMIUM_EASING }}
            >
              {/* Eyebrow tag */}
              <span
                className={cn(
                  'mb-5 inline-flex items-center gap-2 rounded-sm px-2.5 py-1',
                  'text-[11px] font-medium uppercase tracking-[0.16em]',
                  onImage
                    ? 'border border-white/25 bg-white/10 text-white'
                    : 'border border-border bg-accent text-accent-foreground',
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                {badge ?? subtitle}
              </span>

              {/* Başlık — 48-56px responsive */}
              <h1
                className={cn(
                  'mb-5 text-3xl font-bold leading-[1.1] tracking-tight',
                  'sm:text-4xl md:text-5xl lg:text-[56px]',
                  onImage ? 'text-white' : 'text-foreground',
                )}
              >
                {title}
              </h1>

              {/* Açıklama */}
              <p
                className={cn(
                  'mb-8 max-w-[60ch] text-base leading-relaxed md:text-lg',
                  onImage ? 'text-white/85' : 'text-muted-foreground',
                )}
              >
                {description}
              </p>

              {/* CTA çifti */}
              <nav
                className="flex flex-col items-start gap-3 sm:flex-row sm:items-center"
                aria-label="Hero eylem navigasyonu"
              >
                {/* Primary CTA — turuncu dolgu */}
                <Link
                  href={ctaLink}
                  className={cn(
                    'group inline-flex items-center gap-2 rounded-lg px-6 py-3',
                    'bg-primary text-sm font-medium text-primary-foreground',
                    'hover:bg-primary/90 active:scale-[0.98]',
                    'transition-[background-color,transform] duration-200 motion-reduce:transition-none',
                    'focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  )}
                >
                  <span>{ctaText}</span>
                  <ArrowRight
                    size={15}
                    className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                </Link>

                {/* İkincil CTA — outline */}
                <Link
                  href={`/${lang}/contact`}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium',
                    onImage
                      ? 'border border-white/40 text-white hover:bg-white/10'
                      : 'border border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground',
                    'active:scale-[0.98] transition-[background-color,color,border-color,transform] duration-200 motion-reduce:transition-none',
                    'focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  )}
                >
                  İletişime Geç
                </Link>
              </nav>
            </m.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
