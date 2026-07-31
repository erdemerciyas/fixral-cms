'use client'

/**
 * StatsCounter — DataStat bandı, gerçek mühendislik birimleriyle.
 * 4 metrik: yıl deneyim (+), tamamlanan proje (+), üretim toleransı (±mm),
 * tarama çözünürlüğü (µm). Count-up DataStat içinde (useInViewOnce + rAF,
 * reduced-motion'da anında hedef değer). Etiketler i18n'den (home.stats.*).
 */
import { DataStat, MeasureRule } from '@/components/ui'
import { useAppTranslations } from '@/hooks/useAppTranslations'

export default function StatsCounter() {
  const { t } = useAppTranslations('home')

  const stats = [
    { value: new Date().getFullYear() - 2018, suffix: '+', label: t('stats.experience') },
    { value: 150, suffix: '+', label: t('stats.projects') },
    { value: 0.05, prefix: '±', suffix: ' mm', decimals: 2, label: t('stats.tolerance') },
    { value: 20, suffix: ' µm', label: t('stats.resolution') },
  ]

  return (
    <section className="relative py-16 md:py-20" aria-label={t('stats.label')}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Üst ölçü çizgisi — monospace etiketli */}
        <MeasureRule ticks="sparse" label={t('stats.label')} labelPosition="start" className="mb-10 md:mb-12" />

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 md:gap-12">
          {stats.map((stat) => (
            <DataStat
              key={stat.label}
              value={stat.value}
              prefix={stat.prefix}
              suffix={stat.suffix}
              decimals={stat.decimals}
              label={stat.label}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
