'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ShowcaseStage } from '@/components/three/ShowcaseStage'
import { KineticHeadline } from '@/components/motion/KineticHeadline'
import { useReducedMotionGuard } from '@/hooks/use-motion'
import { useAppTranslations } from '@/hooks/useAppTranslations'
import { useLocale } from '@/hooks/useLocale'
import { cn } from '@/lib/utils'

interface SliderApiResponse {
  id: string
  title: string
  subtitle?: string
  description?: string
  buttonText?: string
  buttonLink?: string
  imageUrl?: string
}

const subscribeNoop = () => () => {}

export const NewHero = () => {
  const reducedMotion = useReducedMotionGuard()
  const { t } = useAppTranslations('home')
  const lang = useLocale()
  const isMounted = useSyncExternalStore(subscribeNoop, () => true, () => false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [ctaText, setCtaText] = useState('')
  const [ctaLink, setCtaLink] = useState(`/${lang}/portfolio`)
  const [posterUrl, setPosterUrl] = useState<string | undefined>()

  useEffect(() => {
    async function fetchSlides() {
      try {
        const res = await fetch('/api/public/slider')
        if (!res.ok) return
        const data: SliderApiResponse[] = await res.json()
        const first = data?.[0]
        if (first) {
          setTitle(first.title)
          setDescription(first.description || first.subtitle || '')
          setCtaText(first.buttonText || '')
          setCtaLink(first.buttonLink || `/${lang}/portfolio`)
          if (first.imageUrl) setPosterUrl(first.imageUrl)
        }
      } catch {
        /* defaults from i18n */
      }
    }
    fetchSlides()
  }, [lang])

  const displayTitle = title || t('hero.defaultTitle')
  const displayDescription = description || t('hero.defaultDescription')
  const displayCta = ctaText || t('hero.defaultCta')
  const displayCtaLink = ctaLink || `/${lang}/portfolio`

  return (
    <header
      className="relative isolate w-full min-h-[100dvh] overflow-hidden bg-background text-foreground border-b border-border"
      role="banner"
      aria-label={t('hero.carouselLabel')}
    >
      <ShowcaseStage posterUrl={posterUrl} className="absolute inset-0" />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-7xl flex-col justify-end px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          {isMounted && !reducedMotion ? (
            <KineticHeadline text={displayTitle} as="h1" />
          ) : (
            <h1 className="hero-title max-w-4xl leading-[1.1] pb-1">{displayTitle}</h1>
          )}

          <p className="mt-6 max-w-[58ch] text-base leading-relaxed text-muted-foreground md:text-lg">
            {displayDescription}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href={displayCtaLink}
              className="inline-flex items-center gap-2 bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {displayCta}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link
              href={`/${lang}/contact`}
              className="inline-flex items-center gap-2 border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              {t('hero.secondaryCta', { defaultValue: 'İletişim' })}
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export default NewHero
