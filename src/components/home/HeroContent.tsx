'use client'

/**
 * HeroContent — full-bleed precision hero'nun metin katmanı.
 * TechLabel eyebrow + büyük Barlow başlık + açıklama + monospace spec satırı
 * (tolerans / tarama / format) + CTA çifti. Hero her zaman dark scope'ta
 * render edildiği için renkler doğrudan semantik token'lardan gelir.
 * Slide değişim animasyonu motion preset sabitleri üzerinden yürür.
 */
import { m, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { MOTION_DURATION, MOTION_EASE, TechLabel } from '@/components/ui'
import { useReducedMotionGuard } from '@/hooks/use-motion'
import { useLocale } from '@/hooks/useLocale'
import { useAppTranslations } from '@/hooks/useAppTranslations'
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
}

export default function HeroContent({ slide, slideIndex = 0 }: HeroContentProps) {
  const lang = useLocale()
  const reducedMotion = useReducedMotionGuard()
  const { t } = useAppTranslations('home')

  const title = slide?.title || t('hero.defaultTitle')
  const subtitle = slide?.subtitle || t('hero.defaultBadge')
  const description = slide?.description || t('hero.defaultDescription')
  const ctaText = slide?.ctaText || t('hero.defaultCta')
  const ctaLink = slide?.ctaLink || `/${lang}/portfolio`
  const badge = slide?.badge

  const specItems = [t('hero.specTolerance'), t('hero.specScan'), t('hero.specFormats')]

  return (
    <div className="max-w-2xl">
      <AnimatePresence mode="wait">
        <m.div
          key={slideIndex}
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? undefined : { opacity: 0, y: -12 }}
          transition={{
            duration: reducedMotion ? 0 : MOTION_DURATION.fast,
            ease: MOTION_EASE.precision,
          }}
        >
          {/* Eyebrow — monospace teknik etiket */}
          <TechLabel marker="crosshair" as="p" className="mb-6">
            {badge ?? subtitle}
          </TechLabel>

          {/* Başlık — büyük Barlow display */}
          <h1 className="mb-6 font-display text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl xl:text-[64px]">
            {title}
          </h1>

          {/* Açıklama */}
          <p className="mb-6 max-w-[58ch] text-base leading-relaxed text-muted-foreground md:text-lg">
            {description}
          </p>

          {/* Monospace spec satırı — hairline ayraçlı tolerans/format bandı */}
          <ul className="mb-10 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-border py-3">
            {specItems.map((item, i) => (
              <li
                key={item}
                className={cn(
                  'flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground',
                )}
              >
                {i > 0 && <span aria-hidden="true" className="h-3 w-px bg-border-strong" />}
                {item}
              </li>
            ))}
          </ul>

          {/* CTA çifti — kontrol radius'u 2px (rounded-xs) */}
          <nav className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            {/* Primary CTA — tek turuncu dolgu */}
            <Link
              href={ctaLink}
              className={cn(
                'group inline-flex items-center gap-2 rounded-xs px-6 py-3',
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

            {/* İkincil CTA — hairline outline */}
            <Link
              href={`/${lang}/contact`}
              className={cn(
                'inline-flex items-center gap-2 rounded-xs px-6 py-3 text-sm font-medium',
                'border border-border-strong text-foreground hover:border-primary/50 hover:text-primary',
                'active:scale-[0.98] transition-[color,border-color,transform] duration-200 motion-reduce:transition-none',
                'focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              )}
            >
              {t('hero.secondaryCta')}
            </Link>
          </nav>
        </m.div>
      </AnimatePresence>
    </div>
  )
}
