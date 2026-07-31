'use client'

/**
 * PortfolioHorizontalShowcase — precision kit dilinde portfolyo vitrini.
 * Yatay showcase (grid) korunur; kartlara scan-line hover overlay ve
 * monospace metadata satırı eklendi (yöntem=kategori, müşteri, yıl —
 * mevcut API alanlarından, uydurma veri yok). Hairline border, flat kart.
 * Animasyonlar motion preset'leri üzerinden; veri akışı korunur:
 * /api/public/portfolio?limit=8
 */
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { m } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useLocale } from '@/hooks/useLocale'
import { useAppTranslations } from '@/hooks/useAppTranslations'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonGrid } from '@/components/ui/skeletons'
import { TechLabel, useMotionPresets } from '@/components/ui'

interface Category {
  _id: string
  name: string
  slug: string
}

interface PortfolioProject {
  _id: string
  title: string
  slug: string
  description: string
  coverImage: string
  categories?: Category[]
  category?: Category
  client?: string
  completionDate?: string
  featured?: boolean
}

/* Teknik kart kabuğu — hizmet grid'i ile aynı dil */
const CARD_SHELL = cn(
  'group flex h-full flex-col overflow-hidden rounded-sm',
  'border border-border bg-card',
  'transition-[border-color,box-shadow] duration-200 ease-out',
  'hover:border-primary/40 hover:shadow-md',
  'motion-reduce:transition-none',
  'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
  'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
)

export default function PortfolioHorizontalShowcase() {
  const lang = useLocale()
  const { t } = useAppTranslations('home')
  const { staggerContainer, staggerItem } = useMotionPresets()
  const [projects, setProjects] = useState<PortfolioProject[]>([])
  const [loading, setLoading] = useState(true)

  /* ─── Project fetch ─── */
  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch('/api/public/portfolio?limit=8')
        if (!res.ok) throw new Error('Failed to fetch portfolio')
        const data = await res.json()
        setProjects(Array.isArray(data) ? data : data.data || data.items || [])
      } catch {
        setProjects([])
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  if (loading) {
    return (
      <section className="py-16 md:py-24" aria-label={t('portfolio.title')}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 space-y-3">
            <div className="h-6 w-24 animate-pulse rounded-sm bg-muted" />
            <div className="h-10 w-80 animate-pulse rounded-sm bg-muted" />
          </div>
          <SkeletonGrid
            count={8}
            label={t('portfolio.loading')}
            className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          />
        </div>
      </section>
    )
  }

  if (!projects.length) {
    return (
      <section className="py-16 md:py-24" aria-label={t('portfolio.title')}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader title={t('portfolio.title')} />
          <EmptyState
            title={t('portfolio.empty')}
            description={t('portfolio.emptyDescription')}
            action={
              <Link
                href={`/${lang}/contact`}
                className="inline-flex items-center gap-2 rounded-xs bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {t('portfolio.emptyCta')}
              </Link>
            }
          />
        </div>
      </section>
    )
  }

  const getCategoryLabel = (p: PortfolioProject) => {
    if (p.categories && p.categories.length > 0) return p.categories.map((c) => c.name).join(', ')
    if (p.category) return p.category.name
    return null
  }

  const getYear = (date?: string) => {
    if (!date) return null
    const year = new Date(date).getFullYear()
    return Number.isNaN(year) ? null : String(year)
  }

  return (
    <section className="relative bg-background py-20 md:py-28" aria-label={t('portfolio.title')}>
      {/* Bölüm ayırıcı hairline */}
      <div className="absolute inset-x-0 top-0 h-px bg-border" aria-hidden="true" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 max-w-3xl md:mb-20">
          <TechLabel index={3} marker="crosshair" as="p" className="mb-5">
            {t('portfolio.eyebrow')}
          </TechLabel>
          <h2 className="section-title">{t('portfolio.title')}</h2>
        </div>

        {/* Kart grid'i — mobile 2 / tablet 3 / desktop 4 */}
        <m.ul
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
        >
          {projects.map((project, index) => {
            const method = getCategoryLabel(project)
            const year = getYear(project.completionDate)

            return (
              <m.li key={project._id} variants={staggerItem} className="h-full">
                <Link
                  href={`/${lang}/portfolio/${project.slug || project._id}`}
                  className={CARD_SHELL}
                >
                  {/* Kapak görseli + scan-line hover */}
                  <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
                    {project.coverImage ? (
                      <Image
                        src={project.coverImage}
                        alt={project.title}
                        fill
                        priority={index === 0}
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="blueprint-grid absolute inset-0 bg-secondary" aria-hidden="true" />
                    )}

                    {/* Scan-line overlay — yalnızca hover'da görünür, reduced-motion'da gizli */}
                    <span
                      className="scan-line opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                      aria-hidden="true"
                    />

                    {/* Öne çıkan etiketi */}
                    {project.featured && (
                      <span className="absolute left-2 top-2 rounded-xs bg-primary px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-primary-foreground">
                        {t('portfolio.featured')}
                      </span>
                    )}
                  </div>

                  {/* Metin bloğu */}
                  <div className="flex flex-1 flex-col gap-2 border-t border-border p-4">
                    <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground transition-colors duration-200 group-hover:text-primary motion-reduce:transition-none md:text-base">
                      {project.title}
                    </h3>

                    {/* Monospace metadata — yöntem / müşteri / yıl (mevcut alanlardan) */}
                    <dl className="mt-auto flex flex-col gap-1 pt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {method && (
                        <div className="flex items-baseline justify-between gap-2">
                          <dt className="shrink-0">{t('portfolio.method')}</dt>
                          <dd className="truncate text-right">{method}</dd>
                        </div>
                      )}
                      {project.client && (
                        <div className="flex items-baseline justify-between gap-2">
                          <dt className="shrink-0">{t('portfolio.client')}</dt>
                          <dd className="truncate text-right">{project.client}</dd>
                        </div>
                      )}
                      {year && (
                        <div className="flex items-baseline justify-between gap-2">
                          <dt className="shrink-0">{t('portfolio.year')}</dt>
                          <dd className="tabular-nums">{year}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </Link>
              </m.li>
            )
          })}
        </m.ul>

        {/* CTA */}
        <div className="mt-10 md:mt-14">
          <Link
            href={`/${lang}/portfolio`}
            className={cn(
              'group inline-flex items-center gap-2 rounded-xs px-6 py-3 text-sm font-medium',
              'border border-border bg-card text-foreground',
              'hover:border-primary/40 hover:text-primary',
              'transition-[color,border-color] duration-200 motion-reduce:transition-none',
              'focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            )}
          >
            <span>{t('portfolio.viewAll')}</span>
            <ArrowRight
              size={14}
              className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  )
}
