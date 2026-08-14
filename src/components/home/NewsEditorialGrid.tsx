'use client'

/**
 * NewsEditorialGrid — precision kit dilinde editorial haber grid'i.
 * Kart: görsel (16/9) → başlık → özet → monospace tarih/etiket meta satırı.
 * Hairline border, flat kart; turuncu yalnızca hover başlık aksanı.
 * TR/ES route mantığına dokunulmadı (haberler/noticias). Animasyonlar
 * motion preset'leri üzerinden; veri akışı korunur: /api/public/news
 */
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { m } from 'framer-motion'
import { useLocale } from '@/hooks/useLocale'
import { useAppTranslations } from '@/hooks/useAppTranslations'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonGrid } from '@/components/ui/skeletons'
import { useMotionPresets } from '@/components/ui'
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

/* Teknik kart kabuğu — hizmet/portfolyo grid'leri ile aynı dil */
const CARD_SHELL = cn(
  'group flex h-full flex-col overflow-hidden rounded-sm',
  'border border-border bg-card',
  'transition-[border-color,box-shadow] duration-200 ease-out',
  'hover:border-primary/40 hover:shadow-md',
  'motion-reduce:transition-none',
  'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
  'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
)

export default function NewsEditorialGrid() {
  const lang = useLocale()
  const { t } = useAppTranslations('home')
  const { staggerContainer, staggerItem } = useMotionPresets()
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
      <section className="py-16 md:py-24" aria-label={t('news.title')}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 space-y-3">
            <div className="h-6 w-20 animate-pulse rounded-sm bg-muted" />
            <div className="h-10 w-72 animate-pulse rounded-sm bg-muted" />
          </div>
          <SkeletonGrid count={3} label={t('news.loading')} className="sm:grid-cols-2 lg:grid-cols-3" />
        </div>
      </section>
    )
  }

  if (!news.length) {
    return (
      <section className="py-16 md:py-24" aria-label={t('news.title')}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader title={t('news.title')} />
          <EmptyState title={t('news.empty')} />
        </div>
      </section>
    )
  }

  return (
    <section className="relative bg-background py-20 md:py-28" aria-label={t('news.title')}>
      {/* Bölüm ayırıcı hairline */}
      <div className="absolute inset-x-0 top-0 h-px bg-border" aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 max-w-3xl md:mb-20">
          <h2 className="section-title">{t('news.title')}</h2>
        </div>

        {/* Kart grid'i */}
        <m.ul
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {news.map((item, index) => {
            const translated = getTranslation(item)
            return (
              <m.li key={item._id} variants={staggerItem} className="h-full">
                <Link href={getNewsUrl(item.slug)} className={CARD_SHELL}>
                  {/* Görsel */}
                  <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    {item.featuredImage?.url ? (
                      <Image
                        src={item.featuredImage.url}
                        alt={item.featuredImage.altText || translated.title}
                        fill
                        priority={index === 0}
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-secondary" aria-hidden="true" />
                    )}
                  </div>

                  {/* Metin bloğu */}
                  <div className="flex flex-1 flex-col gap-2 border-t border-border p-4 md:p-5">
                    <h3 className="line-clamp-2 text-base font-medium leading-snug text-foreground transition-colors duration-200 group-hover:text-primary motion-reduce:transition-none">
                      {translated.title}
                    </h3>
                    {translated.excerpt && (
                      <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                        {translated.excerpt}
                      </p>
                    )}

                    {/* Monospace meta satırı: tarih + etiket */}
                    <div className="mt-auto flex items-center justify-between gap-2 pt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      <time dateTime={item.publishedAt || item.createdAt} className="tabular-nums">
                        {formatDate(item.publishedAt || item.createdAt)}
                      </time>
                      {item.tags?.[0] && (
                        <span className="inline-flex items-center gap-2 truncate">
                          <span aria-hidden="true" className="h-3 w-px shrink-0 bg-border-strong" />
                          {item.tags[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </m.li>
            )
          })}
        </m.ul>

        {/* CTA */}
        <div className="mt-10 md:mt-14">
          <Link
            href={`/${lang}/${lang === 'tr' ? 'haberler' : 'noticias'}`}
            className={cn(
              'group inline-flex items-center gap-2 rounded-xs px-6 py-3 text-sm font-medium',
              'border border-border bg-card text-foreground',
              'hover:border-primary/40 hover:text-primary',
              'transition-[color,border-color] duration-200 motion-reduce:transition-none',
              'focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            )}
          >
            <span>{t('news.viewAll')}</span>
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
