'use client'

/**
 * ServicesBentoGrid — numaralı teknik hizmet kartları (precision kit).
 * Bento grid yapısı korunur: mobile 2 / tablet 3 / desktop 4 kolon, gap-4.
 * Kart: görsel/ikon bloğu → TechLabel index (01, 02…) → başlık → açıklama →
 * hover'da monospace spec satırı reveal (features). Hairline border, flat;
 * turuncu yalnızca aktif aksan (hover başlık + spec tick).
 * Animasyonlar motion preset'leri üzerinden (staggerContainer/Item).
 * Veri akışı korunur: /api/public/services?limit=6
 */
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { m } from 'framer-motion'
import { useLocale } from '@/hooks/useLocale'
import { useAppTranslations } from '@/hooks/useAppTranslations'
import { resolveIconForService } from '@/lib/icons'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonGrid } from '@/components/ui/skeletons'
import { TechLabel, useMotionPresets } from '@/components/ui'
import HTMLContent from '@/components/HTMLContent'
import { cn } from '@/lib/utils'

interface ServiceItem {
  _id: string
  title: string
  description: string
  image?: string
  icon?: string
  features?: string[]
}

/* Teknik kart kabuğu: flat, hairline; hover'da yalnızca border + başlık aksanı */
const CARD_SHELL = cn(
  'group flex h-full flex-col overflow-hidden rounded-sm',
  'border border-border bg-card',
  'transition-[border-color,box-shadow] duration-200 ease-out',
  'hover:border-primary/40 hover:shadow-md',
  'motion-reduce:transition-none',
  'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
  'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
)

/** Servis başlığından anchor slug'ı — mevcut link yapısı korunur */
const serviceAnchor = (title: string) =>
  title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '')

export default function ServicesBentoGrid() {
  const lang = useLocale()
  const { t } = useAppTranslations('home')
  const { staggerContainer, staggerItem } = useMotionPresets()
  const [services, setServices] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch('/api/public/services?limit=6')
        if (!res.ok) throw new Error('Failed to fetch services')
        const data = await res.json()
        setServices(Array.isArray(data) ? data : data.data || data.services || [])
      } catch {
        setServices([])
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [])

  if (loading) {
    return (
      <section className="py-16 md:py-24" aria-label={t('services.title')}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 space-y-3">
            <div className="h-6 w-28 animate-pulse rounded-sm bg-muted" />
            <div className="h-10 w-80 animate-pulse rounded-sm bg-muted" />
          </div>
          <SkeletonGrid count={6} label={t('services.loading')} />
        </div>
      </section>
    )
  }

  if (!services.length) {
    return (
      <section className="py-16 md:py-24" aria-label={t('services.title')}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader title={t('services.title')} />
          <EmptyState
            title={t('services.empty')}
            description={t('services.emptyDescription')}
            action={
              <Link
                href={`/${lang}/contact`}
                className="inline-flex items-center gap-2 rounded-xs bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
              >
                {t('services.emptyCta')}
              </Link>
            }
          />
        </div>
      </section>
    )
  }

  return (
    <section className="relative bg-background py-20 md:py-28" aria-label={t('services.title')}>
      {/* Bölüm ayırıcı hairline */}
      <div className="absolute inset-x-0 top-0 h-px bg-border" aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 max-w-3xl md:mb-20">
          <TechLabel index={1} marker="crosshair" as="p" className="mb-5">
            {t('services.eyebrow')}
          </TechLabel>
          <h2 className="section-title">{t('services.title')}</h2>
        </div>

        {/* Kart grid'i — mobile 2 / tablet 3 / desktop 4 */}
        <m.ul
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
        >
          {services.map((service, index) => {
            const Icon = resolveIconForService(service.icon, service.title)
            const specLine = service.features?.slice(0, 3).join(' · ')

            return (
              <m.li key={service._id} variants={staggerItem} className="h-full">
                <Link
                  href={`/${lang}/services#${serviceAnchor(service.title)}`}
                  className={CARD_SHELL}
                >
                  {/* Görsel bloğu — 1:1, görsel yoksa blueprint ikon placeholder */}
                  <div className="relative aspect-square w-full overflow-hidden bg-muted">
                    {service.image ? (
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="blueprint-grid absolute inset-0 flex items-center justify-center bg-secondary">
                        <div className="flex h-16 w-16 items-center justify-center rounded-sm border border-border bg-card">
                          {Icon && (
                            <Icon
                              className="h-8 w-8 text-muted-foreground transition-colors duration-200 group-hover:text-primary motion-reduce:transition-none"
                              aria-hidden="true"
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Metin bloğu */}
                  <div className="flex flex-1 flex-col gap-2 border-t border-border p-4">
                    {/* Numaralı teknik etiket */}
                    <TechLabel index={index + 1} as="p">
                      {t('services.eyebrow')}
                    </TechLabel>

                    <h3 className="text-sm font-medium leading-snug text-foreground transition-colors duration-200 group-hover:text-primary motion-reduce:transition-none md:text-base">
                      {service.title}
                    </h3>
                    <div className="flex-1 text-sm leading-relaxed text-muted-foreground">
                      <HTMLContent content={service.description} truncate={80} className="line-clamp-2" />
                    </div>

                    {/* Hover'da spec satırı reveal — grid-rows tekniği, motion-reduce'ta hep açık */}
                    {specLine && (
                      <div
                        className={cn(
                          'grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-300 ease-out',
                          'group-hover:grid-rows-[1fr] group-hover:opacity-100',
                          'group-focus-visible:grid-rows-[1fr] group-focus-visible:opacity-100',
                          'motion-reduce:grid-rows-[1fr] motion-reduce:opacity-100 motion-reduce:transition-none',
                        )}
                      >
                        <div className="overflow-hidden">
                          <p className="flex items-center gap-2 border-t border-border pt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                            <span aria-hidden="true" className="h-3 w-px shrink-0 bg-primary" />
                            <span className="truncate">{specLine}</span>
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Meta satırı */}
                    <div className="mt-1 flex items-center justify-end gap-2">
                      <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors duration-200 group-hover:text-primary motion-reduce:transition-none">
                        {t('services.detail')}
                        <ArrowRight
                          size={12}
                          className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                  </div>
                </Link>
              </m.li>
            )
          })}
        </m.ul>
      </div>
    </section>
  )
}
