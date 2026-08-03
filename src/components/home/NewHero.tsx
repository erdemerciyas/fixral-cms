'use client'

/**
 * NewHero — full-bleed precision engineering hero (dark-first).
 * Kutulu banner yerine tam genişlik grafit panel: `public-theme public-dark`
 * scope'u hero'yu her iki temada da dark tutar (tüm renkler token'dan).
 * BlueprintGrid zemin + sol metin/spec kolonu + sağda restrained 3D öğe
 * (HeroModelViewer, lg+). Slider API verisi başlık/CTA içeriğini beslemeye
 * devam eder; autoplay/ok/dot/swipe/klavye mantığı korunur ve
 * prefers-reduced-motion'da autoplay hiç çalışmaz.
 * Named export: `export const NewHero`
 */
import { useCallback, useEffect, useState, useRef, useSyncExternalStore } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import HeroContent, { type HeroSlideData } from './HeroContent'
import HeroModelViewer from './HeroModelViewer'
import { BlueprintGrid } from '@/components/ui'
import { useReducedMotionGuard } from '@/hooks/use-motion'
import { useAppTranslations } from '@/hooks/useAppTranslations'
import { cn } from '@/lib/utils'

/* ─── Autoplay sabitleri ─── */
const DEFAULT_DURATION = 5000 // ms — slide başına varsayılan süre
const RESUME_DELAY = 4000 // ms — etkileşim sonrası autoplay'e dönüş

/* ─── Swipe eşiği ─── */
const SWIPE_COMMIT = 60 // px — slide değişimi için gereken mesafe

/* ─── Görsel üzeri koyu scrim — metin okunabilirliği (--scrim token'ı) ─── */
const SCRIM_GRADIENT =
  'linear-gradient(90deg, hsl(var(--scrim) / 0.86) 0%, hsl(var(--scrim) / 0.72) 45%, hsl(var(--scrim) / 0.4) 100%)'

/* ─── Ok butonu: hairline chip, hover'da turuncu dolgu (kontrol radius 2px) ─── */
const ARROW_BUTTON = cn(
  'inline-flex h-10 w-10 items-center justify-center rounded-xs',
  'border border-border bg-background/90 text-foreground',
  'hover:bg-primary hover:text-primary-foreground hover:border-primary',
  'transition-[background-color,color,border-color] duration-200 motion-reduce:transition-none',
  'focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
  'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
)

/* ─── Slider API response shape ─── */
interface SliderApiResponse {
  id: string
  title: string
  subtitle?: string
  description?: string
  buttonText?: string
  buttonLink?: string
  badge?: string
  imageUrl?: string
  duration?: number
  order?: number
}

type HeroSlide = HeroSlideData & { image?: string; duration?: number }

function mapApiToSlide(item: SliderApiResponse): HeroSlide {
  return {
    id: item.id,
    title: item.title,
    subtitle: item.subtitle,
    description: item.description,
    ctaText: item.buttonText,
    ctaLink: item.buttonLink,
    badge: item.badge,
    image: item.imageUrl,
    duration: item.duration,
  }
}

// Mount bilgisini efekt olmadan türet (server'da false, client'ta true)
const subscribeNoop = () => () => {}

export const NewHero = () => {
  const reducedMotion = useReducedMotionGuard()
  const { t } = useAppTranslations('home')

  /* ─── Slider state — API yokken HeroContent i18n default'ları devrede ─── */
  const [slides, setSlides] = useState<HeroSlide[]>([{ id: 'default-1', title: '' }])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [interactionPaused, setInteractionPaused] = useState(false)
  // Mount bilgisini efekt olmadan türet (server'da false, client'ta true)
  const isMounted = useSyncExternalStore(subscribeNoop, () => true, () => false)

  /* Fetch slider data — veri akışı korunur: /api/public/slider */
  useEffect(() => {
    async function fetchSlides() {
      try {
        const res = await fetch('/api/public/slider')
        if (!res.ok) return
        const data: SliderApiResponse[] = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          setSlides(data.map(mapApiToSlide))
        }
      } catch {
        // keep defaults
      }
    }
    fetchSlides()
  }, [])

  /* ─── Autoplay: reduced-motion'da kapalı, hover/etkileşimde duraklar ─── */
  const hasMultiple = slides.length > 1
  const autoplayActive = hasMultiple && !reducedMotion && !isHovered && !interactionPaused

  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* Etkileşim (dot/ok/klavye/swipe) sonrası geçici duraklatma */
  const pauseTemporarily = useCallback(() => {
    setInteractionPaused(true)
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    resumeTimer.current = setTimeout(() => setInteractionPaused(false), RESUME_DELAY)
  }, [])

  useEffect(
    () => () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current)
    },
    [],
  )

  useEffect(() => {
    if (!autoplayActive) return
    const duration = slides[currentSlide]?.duration || DEFAULT_DURATION
    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, duration)
    return () => clearTimeout(timer)
  }, [autoplayActive, currentSlide, slides])

  /* ─── Slide navigation ─── */
  const step = useCallback(
    (direction: 1 | -1) => {
      setCurrentSlide((prev) => (prev + direction + slides.length) % slides.length)
    },
    [slides.length],
  )

  const goToSlide = useCallback(
    (index: number) => {
      setCurrentSlide(index)
      pauseTemporarily()
    },
    [pauseTemporarily],
  )

  const handlePrev = useCallback(() => {
    step(-1)
    pauseTemporarily()
  }, [step, pauseTemporarily])

  const handleNext = useCallback(() => {
    step(1)
    pauseTemporarily()
  }, [step, pauseTemporarily])

  /* ─── Keyboard navigation (arrow keys) ─── */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (!hasMultiple) return
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleNext()
      }
    },
    [hasMultiple, handlePrev, handleNext],
  )

  /* ─── Basit swipe: görsel geri bildirim yok, yalnızca slide değişimi ─── */
  const pointerStartX = useRef<number | null>(null)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerStartX.current = e.clientX
  }, [])

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const start = pointerStartX.current
      pointerStartX.current = null
      if (start === null || !hasMultiple) return
      const delta = e.clientX - start
      if (Math.abs(delta) > SWIPE_COMMIT) {
        step(delta < 0 ? 1 : -1)
        pauseTemporarily()
      }
    },
    [hasMultiple, step, pauseTemporarily],
  )

  /* Hover duraklatması yalnızca fare için — dokunmatikte yanlış tetiklenir */
  const handlePointerEnter = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') setIsHovered(true)
  }, [])

  const handlePointerLeave = useCallback(() => {
    pointerStartX.current = null
    setIsHovered(false)
  }, [])

  const currentSlideData = slides[currentSlide]
  const hasImage = Boolean(currentSlideData?.image)
  const showControls = hasMultiple && isMounted

  return (
    /* public-theme + public-dark: hero her iki temada da grafit dark scope */
    <header
      className={cn(
        'public-theme public-dark',
        'relative isolate w-full overflow-hidden bg-background text-foreground',
        'border-b border-border',
      )}
      role="banner"
      aria-label={t('hero.carouselLabel')}
      aria-roledescription="carousel"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onKeyDown={handleKeyDown}
    >
      {/* ── Görsel katmanı: tüm slide'lar yığılı, aktif olan fade ile öne gelir ── */}
      {slides.map((slide, index) =>
        slide.image ? (
          <div
            key={`bg-${slide.id}-${index}`}
            className={cn(
              'absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none',
              index === currentSlide ? 'opacity-100' : 'opacity-0',
            )}
            aria-hidden="true"
          >
            <Image
              src={slide.image}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
              /* Aktif ilk slide priority, sonrakiler lazy (Next.js varsayılanı) */
              priority={index === 0}
            />
          </div>
        ) : null,
      )}

      {/* ── Scrim: görsel üzerinde koyu karartma, metin kontrastı için ── */}
      {hasImage && (
        <div className="absolute inset-0" style={{ background: SCRIM_GRADIENT }} aria-hidden="true" />
      )}

      {/* ── Blueprint grid zemin — görselin/scrimin üstünde, içerik altında ── */}
      <BlueprintGrid density="coarse" opacity={hasImage ? 'faint' : 'subtle'} />

      {/* ── İçerik: sol metin + sağ 3D panel; pt-14 fixed header telafisi ── */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
        <div className="grid min-h-[560px] grid-cols-1 items-center gap-12 py-16 sm:py-20 lg:min-h-[640px] lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-16 lg:py-24">
          <HeroContent slide={currentSlideData} slideIndex={currentSlide} />

          {/* Sağ panel: restrained 3D öğe — yalnızca lg+ */}
          <div className="hidden lg:block">
            <HeroModelViewer />
          </div>
        </div>
      </div>

      {/* ── Ok navigasyonu ── */}
      {showControls && (
        <>
          <div className="absolute inset-y-0 left-0 z-20 flex items-center pl-3 sm:pl-5">
            <button
              type="button"
              onClick={handlePrev}
              className={ARROW_BUTTON}
              aria-label={t('hero.prevSlide')}
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="absolute inset-y-0 right-0 z-20 flex items-center pr-3 sm:pr-5">
            <button
              type="button"
              onClick={handleNext}
              className={ARROW_BUTTON}
              aria-label={t('hero.nextSlide')}
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        </>
      )}

      {/* ── Dot indicator: altta ortalı ── */}
      {showControls && (
        <div
          className="absolute bottom-5 left-0 right-0 z-20 flex items-center justify-center gap-2"
          role="tablist"
          aria-label={t('hero.tablistLabel')}
        >
          {slides.map((slide, index) => {
            const isActive = index === currentSlide
            return (
              <button
                key={`dot-${slide.id}-${index}`}
                type="button"
                onClick={() => goToSlide(index)}
                className={cn(
                  'h-1.5 rounded-full transition-[width,background-color] duration-300',
                  'motion-reduce:transition-none',
                  isActive ? 'w-8 bg-primary' : 'w-2 bg-foreground/25 hover:bg-foreground/50',
                  'focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
                  'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                )}
                role="tab"
                aria-selected={isActive}
                aria-label={t('hero.slideLabel', { index: index + 1 })}
              />
            )
          })}
        </div>
      )}

      {/* ── Ekran okuyucu için slide sayacı ── */}
      {showControls && (
        <span className="sr-only" aria-live="polite" aria-atomic="true">
          {currentSlide + 1} / {slides.length}
        </span>
      )}
    </header>
  )
}
