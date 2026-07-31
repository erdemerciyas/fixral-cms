'use client'

/**
 * ServicesBentoGrid — Printables model-kart deseninde hizmet grid'i.
 * Kart: görsel/ikon bloğu → başlık → açıklama → etiket satırı.
 * Flat kart (rounded-sm, hairline border, gölgesiz), hover'da -translate-y-0.5 + shadow-lg.
 * Grid: mobile 2 / tablet 3 / desktop 4 kolon, gap-4.
 * RevealStagger ile scroll-reveal; EmptyState/SkeletonGrid ile loading/empty state.
 * Veri akışı korunur: /api/public/services?limit=6
 */
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { resolveIconForService } from '@/lib/icons'
import { TextReveal } from '@/components/ui/TextReveal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonGrid } from '@/components/ui/skeletons'
import { RevealStagger } from '@/components/ui/RevealStagger'
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

/* Printables kart kabuğu: flat, hover'da tek yumuşak lift */
const CARD_SHELL = cn(
  'group flex h-full flex-col overflow-hidden rounded-sm',
  'border border-border bg-card',
  'transition-[transform,box-shadow,border-color] duration-200 ease-out',
  'hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg',
  'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
)

/** Servis başlığından anchor slug'ı — mevcut link yapısı korunur */
const serviceAnchor = (title: string) =>
  title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '')

export default function ServicesBentoGrid() {
  const lang = useLocale()
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
      <section className="py-16 md:py-24" aria-label="Hizmetlerimiz">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 space-y-3">
            <div className="w-28 h-6 rounded-sm bg-muted animate-pulse" />
            <div className="w-80 h-10 rounded-sm bg-muted animate-pulse" />
          </div>
          <SkeletonGrid count={6} label="Hizmetler yükleniyor" />
        </div>
      </section>
    )
  }

  if (!services.length) {
    return (
      <section className="py-16 md:py-24" aria-label="Hizmetlerimiz">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title={<TextReveal>Sunduğumuz Çözümler</TextReveal>} />
          <EmptyState
            title="Henüz hizmet bulunmuyor"
            description="Proje talebi için iletişime geçebilirsiniz."
            action={
              <Link
                href={`/${lang}/contact`}
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200"
              >
                Proje talebi bırakın
              </Link>
            }
          />
        </div>
      </section>
    )
  }

  return (
    <section className="relative py-20 md:py-28 bg-background" aria-label="Hizmetlerimiz">
      {/* Bölüm ayırıcı hairline */}
      <div className="absolute top-0 inset-x-0 h-px bg-border" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Hizmetlerimiz"
          title={<TextReveal>Sunduğumuz Çözümler</TextReveal>}
        />

        {/* Kart grid'i — mobile 2 / tablet 3 / desktop 4 */}
        <RevealStagger
          staggerDelay={0.06}
          offset={16}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          itemClassName="h-full"
        >
          {services.map((service) => {
            const Icon = resolveIconForService(service.icon, service.title)

            return (
              <Link
                key={service._id}
                href={`/${lang}/services#${serviceAnchor(service.title)}`}
                className={CARD_SHELL}
              >
                {/* Görsel bloğu — 1:1, görsel yoksa dokulu ikon placeholder */}
                <div className="relative aspect-square w-full overflow-hidden bg-muted">
                  {service.image ? (
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-accent blueprint-grid">
                      {/* Köşe glow */}
                      <div
                        className="absolute -top-10 -right-10 h-28 w-28 rounded-full blur-2xl pointer-events-none"
                        style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.18) 0%, transparent 70%)' }}
                        aria-hidden="true"
                      />
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card shadow-sm transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none">
                        {Icon && <Icon className="h-8 w-8 text-primary" aria-hidden="true" />}
                      </div>
                    </div>
                  )}
                </div>

                {/* Metin bloğu */}
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h3 className="text-sm font-medium leading-snug text-foreground transition-colors duration-200 group-hover:text-primary motion-reduce:transition-none md:text-base">
                    {service.title}
                  </h3>
                  <div className="flex-1 text-sm leading-relaxed text-muted-foreground">
                    <HTMLContent content={service.description} truncate={80} className="line-clamp-2" />
                  </div>

                  {/* Meta satırı: ilk özellik etiketi + Detay */}
                  <div className="mt-1 flex items-center justify-between gap-2">
                    {service.features?.[0] ? (
                      <span className="truncate rounded-sm bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {service.features[0]}
                      </span>
                    ) : (
                      <span aria-hidden="true" />
                    )}
                    <span className="inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-accent-foreground">
                      Detay
                      <ArrowRight
                        size={13}
                        className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </RevealStagger>
      </div>
    </section>
  )
}
