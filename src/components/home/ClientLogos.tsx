'use client'

/**
 * ClientLogos — monospace yetkinlik ticker'ı (capabilities strip).
 * Sektör ikon bandı yerine precision kit dilinde teknik yetkinlik listesi:
 * 3D TARAMA / TERSİNE MÜHENDİSLİK / FDM / SLA / SLS / CMM…
 * MarqueeStrip sonsuz kaydırır (reduced-motion'da durur); etiketler i18n'den,
 * ayraç crosshair (+) turuncu tek aksan olarak kalır. Dekoratif: aria-hidden.
 */
import { MarqueeStrip } from '@/components/ui/MarqueeStrip'
import { useAppTranslations } from '@/hooks/useAppTranslations'

/* i18n anahtar sırası — home.capabilities.* */
const CAPABILITY_KEYS = [
  'scan',
  'reverse',
  'fdm',
  'sla',
  'sls',
  'cmm',
  'cad',
  'prototype',
  'quality',
] as const

export default function ClientLogos() {
  const { t } = useAppTranslations('home')

  return (
    <div className="py-6 md:py-8" aria-hidden="true">
      <MarqueeStrip speed={40} pauseOnHover>
        {CAPABILITY_KEYS.map((key) => (
          <div key={key} className="flex shrink-0 select-none items-center gap-8">
            <span className="whitespace-nowrap font-mono text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
              {t(`capabilities.${key}`)}
            </span>
            <span className="font-mono text-xs text-primary" aria-hidden="true">
              +
            </span>
          </div>
        ))}
      </MarqueeStrip>
    </div>
  )
}
