'use client'

/**
 * FullWidthCTA — BlueprintGrid'li full-width dark panel.
 * Hero ile aynı yaklaşım: `public-theme public-dark` scope'u paneli her iki
 * temada da grafit dark tutar (tüm renkler token'dan). Tek turuncu CTA
 * (one CTA intent per page — "İletişime Geç"). Metinler i18n'den (home.cta.*).
 */
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { useAppTranslations } from '@/hooks/useAppTranslations'
import { BlueprintGrid, TechLabel } from '@/components/ui'
import { cn } from '@/lib/utils'

export default function FullWidthCTA() {
  const lang = useLocale()
  const { t } = useAppTranslations('home')

  return (
    /* public-theme + public-dark: panel her iki temada da grafit dark scope */
    <section
      className={cn(
        'public-theme public-dark',
        'relative isolate w-full overflow-hidden border-t border-border',
        'bg-background py-20 text-foreground md:py-28',
      )}
      aria-label={t('cta.title')}
    >
      {/* Blueprint zemin */}
      <BlueprintGrid density="coarse" opacity="subtle" />

      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <TechLabel marker="crosshair" as="p" className="mb-6 justify-center">
          {t('cta.eyebrow')}
        </TechLabel>

        <h2 className="section-title mb-5 text-foreground">{t('cta.title')}</h2>
        <p className="section-subtitle mx-auto mb-10 md:mb-12">{t('cta.subtitle')}</p>

        {/* Tek turuncu CTA */}
        <Link
          href={`/${lang}/contact`}
          className={cn(
            'group inline-flex items-center gap-3 rounded-xs bg-primary px-8 py-4',
            'text-base font-semibold text-primary-foreground',
            'transition-colors duration-200 hover:bg-primary/90 motion-reduce:transition-none',
            'focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
            'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          )}
        >
          <span>{t('cta.button')}</span>
          <ArrowRight
            size={16}
            className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
            aria-hidden="true"
          />
        </Link>
      </div>
    </section>
  )
}
