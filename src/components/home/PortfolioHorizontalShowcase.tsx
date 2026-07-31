'use client'

/**
 * PortfolioHorizontalShowcase — Printables model-kart deseninde portfolyo grid'i.
 * Kart: kapak görseli (4:3) → başlık → kategori/tarih meta satırı.
 * Flat kart (rounded-sm, hairline border), hover'da -translate-y-0.5 + shadow-lg.
 * Grid: mobile 2 / tablet 3 / desktop 4 kolon, gap-4.
 *
 * Sadeleştirme (Faz 5): GSAP ScrollTrigger pin/scrub yatay pan ve mobil
 * scroll-snap carousel kaldırıldı; yerine tek responsive kart grid'i geldi.
 * Veri akışı korunur: /api/public/portfolio?limit=8
 */
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocale } from '@/hooks/useLocale'
import { TextReveal } from '@/components/ui/TextReveal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonGrid } from '@/components/ui/skeletons'
import { RevealStagger } from '@/components/ui/RevealStagger'

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

/* Printables kart kabuğu — ServicesBentoGrid ile aynı dil */
const CARD_SHELL = cn(
  'group flex h-full flex-col overflow-hidden rounded-sm',
  'border border-border bg-card',
  'transition-[transform,box-shadow,border-color] duration-200 ease-out',
  'hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg',
  'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
  'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
  'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
)

export default function PortfolioHorizontalShowcase() {
  const lang = useLocale()
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
      <section className="py-16 md:py-24" aria-label="Portfolyo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 space-y-3">
            <div className="w-24 h-6 rounded-sm bg-muted animate-pulse" />
            <div className="w-80 h-10 rounded-sm bg-muted animate-pulse" />
          </div>
          <SkeletonGrid
            count={8}
            label="Projeler yükleniyor"
            className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          />
        </div>
      </section>
    )
  }

  if (!projects.length) {
    return (
      <section className="py-16 md:py-24" aria-label="Portfolyo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title={<TextReveal>Öne Çıkan Projeler</TextReveal>} />
          <EmptyState
            title="Henüz proje bulunmuyor"
            description="Proje talebi için iletişime geçebilirsiniz."
            action={
              <Link
                href={`/${lang}/contact`}
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Proje talebi bırakın
              </Link>
            }
          />
        </div>
      </section>
    )
  }

  const getCategoryLabel = (p: PortfolioProject) => {
    if (p.categories && p.categories.length > 0) return p.categories.map(c => c.name).join(', ')
    if (p.category) return p.category.name
    return 'Genel'
  }

  const formatDate = (date?: string) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'es-ES', {
      year: 'numeric',
      month: 'short',
    })
  }

  return (
    <section className="relative py-20 md:py-28 bg-background" aria-label="Portfolyo">
      {/* Bölüm ayırıcı hairline */}
      <div className="absolute top-0 inset-x-0 h-px bg-border" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Portfolyo"
          title={<TextReveal>Öne Çıkan Projeler</TextReveal>}
        />

        {/* Kart grid'i — mobile 2 / tablet 3 / desktop 4 */}
        <RevealStagger
          staggerDelay={0.06}
          offset={16}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          itemClassName="h-full"
        >
          {projects.map((project, index) => (
            <Link
              key={project._id}
              href={`/${lang}/portfolio/${project.slug || project._id}`}
              className={CARD_SHELL}
            >
              {/* Kapak görseli */}
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
                  <div className="absolute inset-0 bg-accent" aria-hidden="true" />
                )}

                {/* Öne çıkan etiketi */}
                {project.featured && (
                  <span className="absolute left-2 top-2 rounded-sm bg-primary px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary-foreground">
                    Öne Çıkan
                  </span>
                )}
              </div>

              {/* Metin bloğu */}
              <div className="flex flex-1 flex-col gap-1.5 p-4">
                <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground transition-colors duration-200 group-hover:text-primary motion-reduce:transition-none md:text-base">
                  {project.title}
                </h3>
                <p className="line-clamp-1 text-sm text-muted-foreground">
                  {getCategoryLabel(project)}
                </p>

                {/* Meta satırı: müşteri / tamamlanma tarihi */}
                <div className="mt-auto flex items-center justify-between gap-2 pt-2 text-xs text-muted-foreground">
                  <span className="truncate">{project.client || ''}</span>
                  <span className="shrink-0 tabular-nums">{formatDate(project.completionDate)}</span>
                </div>
              </div>
            </Link>
          ))}
        </RevealStagger>

        {/* CTA */}
        <div className="mt-10 md:mt-14">
          <Link
            href={`/${lang}/portfolio`}
            className={cn(
              'group inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium',
              'border border-border bg-card text-foreground',
              'hover:bg-accent hover:text-accent-foreground hover:border-primary/40',
              'transition-[background-color,color,border-color] duration-200 motion-reduce:transition-none',
              'focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            )}
          >
            <span>Tüm Projeler</span>
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
