'use client'

/**
 * NewsEditorialGrid — Printables model-kart deseninde haber grid'i.
 * Kart: görsel (16/9) → başlık → tarih/etiket meta satırı.
 * Flat kart (rounded-sm, hairline border), hover'da -translate-y-0.5 + shadow-lg.
 * Grid: mobile 1-2 / tablet 2 / desktop 3 kolon, gap-6.
 *
 * Sadeleştirme (Faz 5): featured + stack asimetrik editorial düzeni yerine
 * eşit kartlardan oluşan tek grid geldi. Veri akışı korunur.
 */
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Calendar } from 'lucide-react'
import { useLocale } from '@/hooks/useLocale'
import { TextReveal } from '@/components/ui/TextReveal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonGrid } from '@/components/ui/skeletons'
import { RevealStagger } from '@/components/ui/RevealStagger'
import { cn } from '@/lib/utils'

interface NewsTranslation {
  title: string
  content: string
  excerpt: string
}

interface NewsItem {
  _id: string
  slug: string
  translations: Record<string, NewsTranslation>
  featuredImage?: { url: string; altText?: string }
  publishedAt?: string
  createdAt?: string
  tags?: string[]
}

/* Printables kart kabuğu — ServicesBentoGrid / portfolyo grid'i ile aynı dil */
const CARD_SHELL = cn(
  'group flex h-full flex-col overflow-hidden rounded-sm',
  'border border-border bg-card',
  'transition-[transform,box-shadow,border-color] duration-200 ease-out',
  'hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg',
  'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
)

export default function NewsEditorialGrid() {
  const lang = useLocale()
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch('/api/public/news?status=published&limit=3&sortBy=publishedAt&sortOrder=desc')
        if (!res.ok) throw new Error('Failed to fetch news')
        const data = await res.json()
        const items = data.data?.items || data.items || data.data || []
        setNews(Array.isArray(items) ? items : [])
      } catch {
        setNews([])
      } finally {
        setLoading(false)
      }
    }
    fetchNews()
  }, [])

  const getTranslation = (item: NewsItem): NewsTranslation => {
    return item.translations?.[lang] || item.translations?.tr || { title: '', content: '', excerpt: '' }
  }

  const formatDate = (date?: string) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'es-ES', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  }

  const getNewsUrl = (slug: string) =>
    lang === 'tr' ? `/tr/haberler/${slug}` : `/es/noticias/${slug}`

  if (loading) {
    return (
      <section className="py-16 md:py-24" aria-label="Haberler">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 space-y-3">
            <div className="w-20 h-6 rounded-sm bg-muted animate-pulse" />
            <div className="w-72 h-10 rounded-sm bg-muted animate-pulse" />
          </div>
          <SkeletonGrid count={3} label="Haberler yükleniyor" className="sm:grid-cols-2 lg:grid-cols-3" />
        </div>
      </section>
    )
  }

  if (!news.length) {
    return (
      <section className="py-16 md:py-24" aria-label="Haberler">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title={<TextReveal>Son Gelişmeler</TextReveal>} />
          <EmptyState title="Henüz haber bulunmuyor" />
        </div>
      </section>
    )
  }

  return (
    <section className="relative py-20 md:py-28 bg-background" aria-label="Haberler">
      {/* Bölüm ayırıcı hairline */}
      <div className="absolute top-0 inset-x-0 h-px bg-border" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Haberler"
          title={<TextReveal>Son Gelişmeler</TextReveal>}
        />

        {/* Kart grid'i */}
        <RevealStagger
          staggerDelay={0.08}
          offset={16}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          itemClassName="h-full"
        >
          {news.map((item, index) => {
            const t = getTranslation(item)
            return (
              <Link key={item._id} href={getNewsUrl(item.slug)} className={CARD_SHELL}>
                {/* Görsel */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                  {item.featuredImage?.url ? (
                    <Image
                      src={item.featuredImage.url}
                      alt={item.featuredImage.altText || t.title}
                      fill
                      priority={index === 0}
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-accent" aria-hidden="true" />
                  )}
                </div>

                {/* Metin bloğu */}
                <div className="flex flex-1 flex-col gap-2 p-4 md:p-5">
                  <h3 className="line-clamp-2 text-base font-medium leading-snug text-foreground transition-colors duration-200 group-hover:text-primary motion-reduce:transition-none">
                    {t.title}
                  </h3>
                  {t.excerpt && (
                    <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {t.excerpt}
                    </p>
                  )}

                  {/* Meta satırı: tarih + etiket */}
                  <div className="mt-auto flex items-center justify-between gap-2 pt-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar size={12} aria-hidden="true" />
                      <time dateTime={item.publishedAt || item.createdAt}>
                        {formatDate(item.publishedAt || item.createdAt)}
                      </time>
                    </span>
                    {item.tags?.[0] && (
                      <span className="truncate rounded-sm bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {item.tags[0]}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </RevealStagger>

        {/* CTA */}
        <div className="mt-10 md:mt-14">
          <Link
            href={`/${lang}/${lang === 'tr' ? 'haberler' : 'noticias'}`}
            className={cn(
              'group inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium',
              'border border-border bg-card text-foreground',
              'hover:bg-accent hover:text-accent-foreground hover:border-primary/40',
              'transition-[background-color,color,border-color] duration-200 motion-reduce:transition-none',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            )}
          >
            <span>Tüm Haberler</span>
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
