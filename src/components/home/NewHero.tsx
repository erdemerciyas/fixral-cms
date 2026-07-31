'use client'

/**
 * NewHero — Printables tarzı boxed banner carousel.
 * Kutulu görsel (rounded-md) + koyu scrim (rgba(0,0,0,0.74)) + büyük tipografi + CTA.
 * Kontroller: sol/sağ ok navigasyonu, altta dot indicator.
 *
 * Sadeleştirme (Faz 5): mouse-parallax, 3D sahne, drag spring geri bildirimi ve
 * grain overlay kaldırıldı. Yalnızca slide fade geçişi + içerik fade/slide kaldı.
 * Autoplay prefers-reduced-motion'a saygılı: reduced-motion'da hiç çalışmaz.
 * Slider verisi /api/public/slider'dan gelmeye devam eder.
 * Named export: `export const NewHero`
 */
import { useCallback, useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useReducedMotion } from 'framer-motion'
import HeroContent, { type HeroSlideData } from './HeroContent'
import { cn } from '@/lib/utils'

/* ─── Autoplay sabitleri ─── */
const DEFAULT_DURATION = 5000 // ms — slide başına varsayılan süre
const RESUME_DELAY = 4000 // ms — etkileşim sonrası autoplay'e dönüş

/* ─── Swipe eşiği ─── */
const SWIPE_COMMIT = 60 // px — slide değişimi için gereken mesafe

/* ─── Görsel üzeri koyu scrim — metin okunabilirliği (Printables banner) ─── */
const SCRIM_GRADIENT =
  'linear-gradient(90deg, rgba(0,0,0,0.74) 0%, rgba(0,0,0,0.62) 45%, rgba(0,0,0,0.32) 100%)'

/* ─── Ok butonu: token tabanlı chip, hover'da turuncu dolgu ─── */
const ARROW_BUTTON = cn(
  'inline-flex h-10 w-10 items-center justify-center rounded-full',
  'border border-border bg-background/85 text-foreground backdrop-blur-sm',
  'hover:bg-primary hover:text-primary-foreground hover:border-primary',
  'transition-[background-color,color,border-color] duration-200 motion-reduce:transition-none',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
)

/* ─── Default slide (API yokken) ─── */
const DEFAULT_SLIDES: HeroSlideData[] = [
  {
    id: 'default-1',
    title: 'Mühendislikte Sınırsız Hassasiyet',
    subtitle: 'Endüstriyel Çözümler',
    description:
      '3D tarama, tersine mühendislik ve prototipleme ile projelerinize ölçülebilir değer katın.',
    ctaText: 'Projeleri İncele',
    ctaLink: '/portfolio',
  },
]

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

function mapApiToSlide(item: SliderApiResponse): HeroSlideData & { image?: string; duration?: number } {
  return {
    id: item.id,
    title: item.title || DEFAULT_SLIDES[0].title,
    subtitle: item.subtitle,
    description: item.description,
    ctaText: item.buttonText || 'Projeleri İncele',
    ctaLink: item.buttonLink || '/portfolio',
    badge: item.badge,
    image: item.imageUrl,
    duration: item.duration,
  }
}

export const NewHero = () => {
  const reducedMotion = useReducedMotion() ?? false

  /* ─── Slider state ─── */
  const [slides, setSlides] = useState<(HeroSlideData & { image?: string; duration?: number })[]>(
    DEFAULT_SLIDES,
  )
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [interactionPaused, setInteractionPaused] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  /* Fetch slider data */
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
    <header
      className={cn(
        'relative isolate overflow-hidden rounded-md border border-border',
        'min-h-[440px] sm:min-h-[520px] lg:min-h-[600px]',
        hasImage ? 'bg-muted' : 'bg-secondary',
      )}
      role="banner"
      aria-label="Ana hero bölümü"
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
        <div
          className="absolute inset-0"
          style={{ background: SCRIM_GRADIENT }}
          aria-hidden="true"
        />
      )}

      {/* ── İçerik ── */}
      <HeroContent slide={currentSlideData} slideIndex={currentSlide} onImage={hasImage} />

      {/* ── Ok navigasyonu ── */}
      {showControls && (
        <>
          <div className="absolute inset-y-0 left-0 z-20 flex items-center pl-3 sm:pl-5">
            <button type="button" onClick={handlePrev} className={ARROW_BUTTON} aria-label="Önceki slayt">
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="absolute inset-y-0 right-0 z-20 flex items-center pr-3 sm:pr-5">
            <button type="button" onClick={handleNext} className={ARROW_BUTTON} aria-label="Sonraki slayt">
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
          aria-label="Hero slide seçimi"
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
                  isActive
                    ? 'w-8 bg-primary'
                    : hasImage
                      ? 'w-2 bg-white/40 hover:bg-white/70'
                      : 'w-2 bg-foreground/25 hover:bg-foreground/50',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                )}
                role="tab"
                aria-selected={isActive}
                aria-label={`Slayt ${index + 1}`}
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
