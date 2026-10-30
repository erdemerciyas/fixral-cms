'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useAppTranslations } from '@/hooks/useAppTranslations'
import { useFx } from '../FxData'
import { HeroStage } from '../FxVisuals'
import { ArrowRight } from '../FxIcons'

/**
 * Anasayfa hero — tez cümlesi + 3D FX işareti + teknik resim anteti.
 * Metinler ve antet panelden (Site İçeriği → Anasayfa hero) gelir.
 * "Slider kayıtlarını göster" açıksa aktif slider kayıtları (yalnız TR) metin
 * alanında sırayla döner; 3D sahne sabit kalır.
 */
export default function HeroSection({ lang, onQuote }: { lang: string; onQuote?: () => void }) {
  const { t } = useAppTranslations('fx')
  const fx = useFx(lang)
  const h = fx.hero
  const useSlider = fx.site.hero.useSlider && fx.L === 'tr'
  const allSlides = fx.data.meta.slides
  const slides = useMemo(() => (useSlider ? allSlides.filter((s) => s.title || s.description) : []), [useSlider, allSlides])
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (slides.length < 2 || paused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setTimeout(() => setI((n) => (n + 1) % slides.length), Math.max(3000, slides[i % slides.length]?.duration || 5000))
    return () => window.clearTimeout(id)
  }, [slides, i, paused])

  const slide = slides.length ? slides[i % slides.length] : null
  const eyebrow = slide?.badge || h.eyebrow
  const lede = slide ? slide.description || slide.subtitle : h.lede

  return (
    <section className="fx-hero public-theme public-dark" aria-labelledby="fx-hero-title">
      <div className="fx-hero__grid" aria-hidden="true" />
      <div className="fx-wrap">
        <div className="fx-hero__in">
          {/* Fareyle/odakla metin dönüşü duraklar (WCAG 2.2.2) — etkileşimli öğe değil */}
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
          <div className="fx-hero__copy" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
            <p className="fx-eyebrow fx-rv">{eyebrow}</p>
            <h1 className="fx-display fx-rv fx-rv-2" id="fx-hero-title" aria-live={slides.length > 1 ? 'polite' : undefined}>
              {slide ? slide.title : <>{h.titleA} <em>{h.titleB}</em></>}
            </h1>
            {lede && <p className="fx-lede fx-rv fx-rv-3">{lede}</p>}
            <div className="fx-hero__ctas fx-rv fx-rv-4">
              {slide?.buttonText && slide.buttonLink ? (
                <Link className="fx-btn fx-btn--primary" href={slide.buttonLink.startsWith('/') && !/^\/(tr|es)(\/|$)/.test(slide.buttonLink) ? `/${lang}${slide.buttonLink}` : slide.buttonLink}>
                  {slide.buttonText} <ArrowRight />
                </Link>
              ) : onQuote ? (
                <button type="button" className="fx-btn fx-btn--primary" onClick={onQuote}>
                  {h.ctaQuote} <ArrowRight />
                </button>
              ) : (
                <Link className="fx-btn fx-btn--primary" href={`/${lang}/contact`}>
                  {h.ctaQuote} <ArrowRight />
                </Link>
              )}
              <Link className="fx-btn fx-btn--ghost" href={`/${lang}/portfolio`}>{h.ctaProjects}</Link>
              <Link className="fx-btn fx-btn--ghost" href={`/${lang}/software`}>{h.ctaSoftware}</Link>
            </div>
            {slides.length > 1 && (
              <div className="fx-hero__dots" role="tablist" aria-label={t('hero.slidesLabel')}>
                {slides.map((s, n) => (
                  <button key={n} type="button" role="tab" aria-selected={n === i % slides.length} aria-label={`${n + 1} / ${slides.length}: ${s.title}`} onClick={() => setI(n)} />
                ))}
              </div>
            )}
          </div>
          <HeroStage label={t('hero.stageLabel')} />
        </div>
        <div className="fx-hero__foot">
          {fx.site.titleblock.length > 0 && (
            <dl className="fx-titleblock" aria-label={t('hero.tbLabel')}>
              {fx.site.titleblock.map((c, n) => (
                <div key={n}><dt>{c.label[fx.L]}</dt><dd>{c.value}</dd></div>
              ))}
            </dl>
          )}
          <span className="fx-tag">{t('hero.drag')}</span>
        </div>
      </div>
    </section>
  )
}
