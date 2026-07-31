'use client'

/**
 * ProcessFlow — 4 adımlı süreç akışı: Tara → Modelle → Doğrula → Üret.
 * Desktop'ta yatay akış, adımlar arasında MeasureRule bağlayıcılar;
 * mobilde dikey akış (vertical MeasureRule). Her adım TechLabel ile
 * numaralı; metinler i18n'den (home.process.*). Statik içerik — API yok.
 * Animasyonlar motion preset'leri üzerinden (staggerContainer/Item).
 */
import { m } from 'framer-motion'
import { ScanLine, Box, BadgeCheck, Factory, type LucideIcon } from 'lucide-react'
import { MeasureRule, TechLabel, useMotionPresets } from '@/components/ui'
import { useAppTranslations } from '@/hooks/useAppTranslations'

/* i18n adım anahtarları — home.process.steps.* */
const STEPS: { key: string; icon: LucideIcon }[] = [
  { key: 'scan', icon: ScanLine },
  { key: 'model', icon: Box },
  { key: 'verify', icon: BadgeCheck },
  { key: 'produce', icon: Factory },
]

export default function ProcessFlow() {
  const { t } = useAppTranslations('home')
  const { staggerContainer, staggerItem } = useMotionPresets()

  return (
    <section className="relative bg-secondary py-20 md:py-28" aria-label={t('process.title')}>
      {/* Bölüm ayırıcı hairline */}
      <div className="absolute inset-x-0 top-0 h-px bg-border" aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 max-w-3xl md:mb-20">
          <TechLabel index={2} marker="crosshair" as="p" className="mb-5">
            {t('process.eyebrow')}
          </TechLabel>
          <h2 className="section-title">{t('process.title')}</h2>
          <p className="section-subtitle mt-5">{t('process.subtitle')}</p>
        </div>

        {/* Adım akışı — desktop yatay, mobil dikey */}
        <m.ol
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="flex flex-col gap-6 md:flex-row md:items-stretch md:gap-4"
        >
          {STEPS.map((step, index) => (
            <m.li
              key={step.key}
              variants={staggerItem}
              className="flex flex-col gap-6 md:flex-1 md:flex-row md:items-stretch md:gap-4"
            >
              {/* Adım kartı */}
              <div className="flex flex-1 flex-col gap-3 rounded-sm border border-border bg-card p-5">
                <div className="flex items-center justify-between gap-2">
                  <TechLabel index={index + 1} as="p">
                    {t('process.eyebrow')}
                  </TechLabel>
                  <step.icon
                    size={16}
                    className="shrink-0 text-muted-foreground"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  {t(`process.steps.${step.key}.title`)}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t(`process.steps.${step.key}.description`)}
                </p>
              </div>

              {/* Bağlayıcı MeasureRule — son adımdan sonra yok */}
              {index < STEPS.length - 1 && (
                <>
                  {/* Desktop: yatay bağlayıcı */}
                  <div className="hidden w-10 items-center self-center md:flex" aria-hidden="true">
                    <MeasureRule ticks="dense" />
                  </div>
                  {/* Mobil: dikey bağlayıcı */}
                  <div className="flex h-8 justify-center md:hidden" aria-hidden="true">
                    <MeasureRule ticks="dense" orientation="vertical" className="min-h-8" />
                  </div>
                </>
              )}
            </m.li>
          ))}
        </m.ol>
      </div>
    </section>
  )
}
