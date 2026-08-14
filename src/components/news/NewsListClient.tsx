'use client'

import { m, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Search as MagnifyingGlass, Newspaper } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { cn } from '@/lib/utils'

const ease = [0.32, 0.72, 0, 1] as const

interface ArticleData {
  _id?: string
  slug: string
  tags?: string[]
  publishedAt?: Date | string
  createdAt: Date | string
  featuredImage?: { url: string; altText?: string }
  translations?: {
    tr?: { title: string; excerpt: string; content: string; keywords: string[] }
    es?: { title: string; excerpt: string; content: string; keywords: string[] }
  }
}

interface NewsListClientProps {
  articles: ArticleData[]
  lang: string
  search: string
  tag: string
  total: number
  page: number
  totalPages: number
  allTags: string[]
  newsT: Record<string, string>
  commonT: Record<string, string>
  locale?: 'tr' | 'es'
}

type TranslationEntry = { title: string; excerpt: string; content: string; keywords: string[] }
const EMPTY_TRANSLATION: TranslationEntry = { title: '', excerpt: '', content: '', keywords: [] }

function formatDate(date: Date | string, dateLocale: string) {
  return new Date(date).toLocaleDateString(dateLocale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function HeroCard({ article, lang, newsT, basePath, translationKey, dateLocale }: { article: ArticleData; lang: string; newsT: Record<string, string>; basePath: string; translationKey: 'tr' | 'es'; dateLocale: string }) {
  const translation = article.translations?.[translationKey] || EMPTY_TRANSLATION
  const prefersReduced = useReducedMotion()

  return (
    <m.div
      initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 32, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: prefersReduced ? 0.01 : 0.7, ease }}
    >
      <Link
        href={`/${lang}/${basePath}/${article.slug}`}
        className="group relative block w-full rounded-sm overflow-hidden bg-surface-tertiary border border-border"
      >
        <div className="relative aspect-21/9 md:aspect-[2.4/1] w-full overflow-hidden">
          <Image
            src={article.featuredImage?.url || '/images/placeholder.jpg'}
            alt={article.featuredImage?.altText || translation.title}
            fill
            priority
            className="object-cover transition-transform duration-700 will-change-transform group-hover:scale-[1.03]"
            style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-linear-to-t from-surface-tertiary/95 via-surface-tertiary/40 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-r from-surface-tertiary/30 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 lg:p-14">
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center gap-3">
              {article.tags?.[0] && (
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-primary">{article.tags[0]}</span>
              )}
              <span className="font-mono text-[11px] text-muted-foreground tracking-wide">
                {formatDate(article.publishedAt || article.createdAt, dateLocale)}
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground leading-[1.15] tracking-tight line-clamp-2">
              {translation.title}
            </h2>

            <p className="text-sm md:text-base text-muted-foreground line-clamp-2 leading-relaxed max-w-xl">
              {translation.excerpt}
            </p>

            <span
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-all duration-700 group-hover:text-foreground group-hover:gap-3"
              style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
            >
              {newsT.readMore || 'Devamını Oku'}
              <ArrowRight size={16} />
            </span>
          </div>
        </div>
      </Link>
    </m.div>
  )
}

function ArticleCard({
  article,
  lang,
  newsT,
  index,
  variant = 'default',
  basePath,
  translationKey,
  dateLocale,
}: {
  article: ArticleData
  lang: string
  newsT: Record<string, string>
  index: number
  variant?: 'large' | 'default'
  basePath: string
  translationKey: 'tr' | 'es'
  dateLocale: string
}) {
  const translation = article.translations?.[translationKey] || EMPTY_TRANSLATION
  const isLarge = variant === 'large'
  const prefersReduced = useReducedMotion()

  return (
    <m.li
      initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 28, filter: 'blur(4px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: prefersReduced ? 0.01 : 0.7, delay: prefersReduced ? 0 : index * 0.08, ease }}
    >
      <Link
        href={`/${lang}/${basePath}/${article.slug}`}
        className={cn(
          'group flex flex-col h-full rounded-sm overflow-hidden border border-border bg-card',
          'transition-[transform,box-shadow,border-color] duration-200 ease-out',
          'hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5',
          'motion-reduce:transition-none motion-reduce:hover:translate-y-0'
        )}
      >
        <div className={cn(
          'relative w-full overflow-hidden bg-surface-tertiary',
          isLarge ? 'aspect-4/3' : 'aspect-16/10'
        )}>
          <Image
            src={article.featuredImage?.url || '/images/placeholder.jpg'}
            alt={article.featuredImage?.altText || translation.title}
            fill
            className="object-cover transition-transform duration-700 will-change-transform group-hover:scale-[1.04]"
            style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
            sizes={isLarge ? '(max-width: 768px) 100vw, 55vw' : '(max-width: 768px) 100vw, 45vw'}
          />
          <div className="absolute inset-0 bg-linear-to-t from-[hsl(var(--scrim)/0.2)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </div>

        <div className={cn('flex flex-col grow', isLarge ? 'p-7' : 'p-5 md:p-6')}>
          <div className="flex items-center gap-3 mb-3">
            {article.tags?.[0] && (
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-primary">{article.tags[0]}</span>
            )}
            <span className="font-mono text-[11px] text-muted-foreground tracking-wide">
              {formatDate(article.publishedAt || article.createdAt, dateLocale)}
            </span>
          </div>

          <h2 className={cn(
            'font-semibold text-foreground leading-snug tracking-tight line-clamp-2 mb-2',
            'transition-colors duration-700 group-hover:text-accent-foreground',
            isLarge ? 'text-xl md:text-2xl' : 'text-lg'
          )}
            style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
          >
            {translation.title}
          </h2>

          <p className={cn(
            'text-muted-foreground line-clamp-3 grow leading-relaxed',
            isLarge ? 'text-sm md:text-base' : 'text-sm'
          )}>
            {translation.excerpt}
          </p>

          <div className="pt-4 mt-auto">
            <span
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-foreground transition-all duration-700 group-hover:gap-2.5"
              style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
            >
              {newsT.readMore || 'Devamını Oku'}
              <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </Link>
    </m.li>
  )
}

export default function NewsListClient({
  articles,
  lang,
  search,
  tag,
  total,
  page,
  totalPages,
  allTags,
  newsT,
  commonT,
  locale = 'tr',
}: NewsListClientProps) {
  const [featured, ...rest] = articles
  const basePath = locale === 'es' ? 'noticias' : 'haberler'
  const translationKey = locale
  const dateLocale = locale === 'es' ? 'es-ES' : 'tr-TR'

  return (
    <div className="space-y-10">
      {/* Search + Filters */}
      <ScrollReveal
        className={cn(
          'flex flex-col md:flex-row gap-4 justify-between items-center rounded-sm border border-border bg-surface-primary backdrop-blur-xs p-4 md:p-5 shadow-xs'
        )}
      >
        <form className="relative w-full md:w-80 group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <MagnifyingGlass
              size={18}
              className="text-muted-foreground transition-colors duration-700 group-focus-within:text-accent-foreground"
              style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
            />
          </div>
          <input
            type="text"
            name="search"
            placeholder={newsT.searchPlaceholder || 'Haberlerde ara...'}
            defaultValue={search}
            className={cn(
              'block w-full pl-10 pr-4 py-2.5 rounded-xs text-sm text-foreground placeholder:text-muted-foreground',
              'border border-border bg-surface-secondary',
              'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus:border-primary/40',
              'transition-[border-color,box-shadow] duration-200 motion-reduce:transition-none'
            )}
          />
        </form>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center md:justify-end">
            <Link
              href={`/${lang}/${basePath}`}
              className={cn(
                'px-4 py-1.5 rounded-xs text-xs font-medium tracking-wide transition-colors duration-200 motion-reduce:transition-none',
                !tag
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              {commonT.all || 'Tümü'}
            </Link>
            {allTags.map((t) => (
              <Link
                key={t}
                href={`/${lang}/${basePath}?tag=${encodeURIComponent(t)}`}
                className={cn(
                  'px-4 py-1.5 rounded-xs text-xs font-medium tracking-wide transition-colors duration-200 motion-reduce:transition-none',
                  tag === t
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {t}
              </Link>
            ))}
          </div>
        )}
      </ScrollReveal>

      {/* Results Info */}
      {(search || tag) && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-sm text-muted-foreground flex items-center gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          {search && <span>&ldquo;{search}&rdquo; {newsT.forQuery || 'için'}</span>}
          {tag && <span>&ldquo;{tag}&rdquo; {newsT.inTag || 'etiketinde'}</span>}
          <strong className="text-foreground">
            {(newsT.resultsFound || '{count} sonuç bulundu').replace('{count}', String(total))}
          </strong>
        </m.div>
      )}

      {/* Articles */}
      {articles.length > 0 ? (
        <>
          {/* Featured hero card */}
          {featured && page === 1 && !search && !tag && (
            <HeroCard article={featured} lang={lang} newsT={newsT} basePath={basePath} translationKey={translationKey} dateLocale={dateLocale} />
          )}

          {/* Asymmetric grid */}
          <ul className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-7">
            {(page === 1 && !search && !tag ? rest : articles).map((article, i) => {
              const isLeftLarge = i % 3 === 0
              return (
                <div
                  key={article._id || article.slug}
                  className={cn(
                    isLeftLarge ? 'md:col-span-7' : 'md:col-span-5'
                  )}
                >
                  <ArticleCard
                    article={article}
                    lang={lang}
                    newsT={newsT}
                    index={i}
                    variant={isLeftLarge ? 'large' : 'default'}
                    basePath={basePath}
                    translationKey={translationKey}
                    dateLocale={dateLocale}
                  />
                </div>
              )
            })}
          </ul>

          {/* Pagination */}
          {totalPages > 1 && (
            <m.nav
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease }}
              aria-label="Sayfalama"
              className="flex justify-center items-center gap-2 pt-4"
            >
              {page > 1 && (
                <Link
                  href={`/${lang}/${basePath}?page=${page - 1}${search ? `&search=${search}` : ''}${tag ? `&tag=${tag}` : ''}`}
                  className="px-4 py-1.5 rounded-xs text-sm font-medium bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200 motion-reduce:transition-none"
                >
                  {commonT.previous || 'Önceki'}
                </Link>
              )}

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/${lang}/${basePath}?page=${p}${search ? `&search=${search}` : ''}${tag ? `&tag=${tag}` : ''}`}
                  className={cn(
                    'w-10 h-10 flex items-center justify-center rounded-xs font-mono text-sm font-medium tabular-nums transition-colors duration-200 motion-reduce:transition-none',
                    p === page
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  {p}
                </Link>
              ))}

              {page < totalPages && (
                <Link
                  href={`/${lang}/${basePath}?page=${page + 1}${search ? `&search=${search}` : ''}${tag ? `&tag=${tag}` : ''}`}
                  className="px-4 py-1.5 rounded-xs text-sm font-medium bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200 motion-reduce:transition-none"
                >
                  {commonT.next || 'Sonraki'}
                </Link>
              )}
            </m.nav>
          )}
        </>
      ) : (
        <ScrollReveal
          className="text-center py-20 rounded-sm border border-dashed border-border bg-surface-primary"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-sm bg-surface-secondary border border-border text-primary mb-4">
            <Newspaper size={28} />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">
            {newsT.noResults || 'Sonuç Bulunamadı'}
          </h3>
          <p className="text-muted-foreground text-sm mb-6">
            {newsT.noResultsDescription || 'Aradığınız kriterlere uygun haber bulunamadı.'}
          </p>
          <Link
            href={`/${lang}/${basePath}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xs text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 shadow-xs motion-reduce:transition-none"
          >
            {newsT.showAll || 'Tüm Haberleri Göster'}
          </Link>
        </ScrollReveal>
      )}
    </div>
  )
}
