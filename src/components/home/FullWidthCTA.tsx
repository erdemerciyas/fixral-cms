'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { useAppTranslations } from '@/hooks/useAppTranslations'
import { Section } from '@/components/layout/Section'

export default function FullWidthCTA() {
  const lang = useLocale()
  const { t } = useAppTranslations('home')

  return (
    <Section variant="cta" band className="!py-20 md:!py-28">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="section-title mb-5 text-foreground">{t('cta.title')}</h2>
        <p className="section-subtitle mx-auto mb-10 md:mb-12">{t('cta.subtitle')}</p>
        <Link
          href={`/${lang}/contact`}
          className="group inline-flex items-center gap-3 bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-colors duration-200 hover:bg-primary/90 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span>{t('cta.button')}</span>
          <ArrowRight
            size={16}
            className="transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>
    </Section>
  )
}
