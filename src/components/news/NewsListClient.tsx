'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, MagnifyingGlass, Newspaper } from '@phosphor-icons/react'
import EyebrowTag from '@/components/ui/EyebrowTag'
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
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function HeroCard({ article, lang, newsT }: { article: ArticleData; lang: string; newsT: Record<string, string> }) {
  const translation = article.translations?.tr || { title: '', excerpt: '', content: '', keywords: [] }

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.7, ease }}
    >
      <Link
        href={`/${lang}/haberler/${article.slug}`}
        className="group relative block w-full rounded-3xl overflow-hidden bg-zinc-900"
      >
        <div className="relative aspect-[21/9] md:aspect-[2.4/1] w-full overflow-hidden">
          <Image
            src={article.featuredImage?.url || '/images/placeholder.jpg'}
            alt={article.featuredImage?.altText || translation.title}
            fill
            priority
            className="object-cover transition-transform duration-700 will-change-transform group-hover:scale-[1.03]"
            style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/30 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 lg:p-14">
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center gap-3">
              {article.tags?.[0] && (
                <EyebrowTag variant="light">{article.tags[0]}</EyebrowTag>
              )}
              <span className="font-mono text-[11px] text-white/50 tracking-wide">
                {formatDate(article.publishedAt || article.createdAt)}
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white leading-[1.15] tracking-tight line-clamp-2">
              {translation.title}
            </h2>

            <p className="text-sm md:text-base text-white/60 line-clamp-2 leading-relaxed max-w-xl">
              {translation.excerpt}
            </p>

            <span
              className="inline-flex items-center gap-2 text-sm font-medium text-white/80 transition-all duration-700 group-hover:text-white group-hover:gap-3"
              style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
            >
              {newsT.readMore || 'Devamını Oku'}
              <ArrowRight size={16} weight="light" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function ArticleCard({
  article,
  lang,
  newsT,
  index,
  variant = 'default',
}: {
  article: ArticleData
  lang: string
  newsT: Record<string, string>
  index: number
  variant?: 'large' | 'default'
}) {
  const translation = article.translations?.tr || { title: '', excerpt: '', content: '', keywords: [] }
  const isLarge = variant === 'large'

  return (
    <motion.li
      initial={{ opacity: 0, y: 28, filter: 'blur(4px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay: index * 0.08, ease }}
    >
      <Link
        href={`/${lang}/haberler/${article.slug}`}
        className={cn(
          'group flex flex-col h-full rounded-3xl overflow-hidden border border-zinc-200/60 bg-white',
          'shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_-15px_rgba(0,52,80,0.12)]',
          'transition-all duration-700',
          'hover:border-zinc-300/80'
        )}
        style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
      >
        <div className={cn(
          'relative w-full overflow-hidden bg-zinc-100',
          isLarge ? 'aspect-[4/3]' : 'aspect-[16/10]'
        )}>
          <Image
            src={article.featuredImage?.url || '/images/placeholder.jpg'}
            alt={article.featuredImage?.altText || translation.title}
            fill
            className="object-cover transition-transform duration-700 will-change-transform group-hover:scale-[1.04]"
            style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
            sizes={isLarge ? '(max-width: 768px) 100vw, 55vw' : '(max-width: 768px) 100vw, 45vw'}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </div>

        <div className={cn('flex flex-col flex-grow', isLarge ? 'p-7' : 'p-5 md:p-6')}>
          <div className="flex items-center gap-3 mb-3">
            {article.tags?.[0] && (
              <EyebrowTag>{article.tags[0]}</EyebrowTag>
            )}
            <span className="font-mono text-[11px] text-zinc-400 tracking-wide">
              {formatDate(article.publishedAt || article.createdAt)}
            </span>
          </div>

          <h2 className={cn(
            'font-semibold text-zinc-900 leading-snug tracking-tight line-clamp-2 mb-2',
            'transition-colors duration-700 group-hover:text-[#003450]',
            isLarge ? 'text-xl md:text-2xl' : 'text-lg'
          )}
            style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
          >
            {translation.title}
          </h2>

          <p className={cn(
            'text-zinc-500 line-clamp-3 flex-grow leading-relaxed',
            isLarge ? 'text-sm md:text-base' : 'text-sm'
          )}>
            {translation.excerpt}
          </p>

          <div className="pt-4 mt-auto">
            <span
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#003450] transition-all duration-700 group-hover:gap-2.5"
              style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
            >
              {newsT.readMore || 'Devamını Oku'}
              <ArrowRight size={14} weight="light" />
            </span>
          </div>
        </div>
      </Link>
    </motion.li>
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
}: NewsListClientProps) {
  const [featured, ...rest] = articles

  return (
    <div className="space-y-10">
      {/* Search + Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease }}
        className="flex flex-col md:flex-row gap-4 justify-between items-center rounded-2xl border border-zinc-200/60 bg-white/80 backdrop-blur-sm p-4 md:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
      >
        <form className="relative w-full md:w-80 group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <MagnifyingGlass
              size={18}
              weight="light"
              className="text-zinc-400 transition-colors duration-700 group-focus-within:text-[#003450]"
              style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
            />
          </div>
          <input
            type="text"
            name="search"
            placeholder={newsT.searchPlaceholder || 'Haberlerde ara...'}
            defaultValue={search}
            className={cn(
              'block w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-zinc-900 placeholder-zinc-400',
              'border border-zinc-200 bg-zinc-50/50',
              'focus:outline-none focus:ring-2 focus:ring-[#003450]/20 focus:border-[#003450]/40',
              'transition-all duration-700'
            )}
            style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
          />
        </form>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center md:justify-end">
            <Link
              href={`/${lang}/haberler`}
              className={cn(
                'px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-700',
                !tag
                  ? 'bg-[#003450] text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800'
              )}
              style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
            >
              {commonT.all || 'Tümü'}
            </Link>
            {allTags.map((t) => (
              <Link
                key={t}
                href={`/${lang}/haberler?tag=${encodeURIComponent(t)}`}
                className={cn(
                  'px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-700',
                  tag === t
                    ? 'bg-[#003450] text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800'
                )}
                style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
              >
                {t}
              </Link>
            ))}
          </div>
        )}
      </motion.div>

      {/* Results Info */}
      {(search || tag) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-sm text-zinc-400 flex items-center gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#003450]" />
          {search && <span>&ldquo;{search}&rdquo; {newsT.forQuery || 'için'}</span>}
          {tag && <span>&ldquo;{tag}&rdquo; {newsT.inTag || 'etiketinde'}</span>}
          <strong className="text-zinc-600">
            {(newsT.resultsFound || '{count} sonuç bulundu').replace('{count}', String(total))}
          </strong>
        </motion.div>
      )}

      {/* Articles */}
      {articles.length > 0 ? (
        <>
          {/* Featured hero card */}
          {featured && page === 1 && !search && !tag && (
            <HeroCard article={featured} lang={lang} newsT={newsT} />
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
                  />
                </div>
              )
            })}
          </ul>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.nav
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease }}
              aria-label="Sayfalama"
              className="flex justify-center items-center gap-2 pt-4"
            >
              {page > 1 && (
                <Link
                  href={`/${lang}/haberler?page=${page - 1}${search ? `&search=${search}` : ''}${tag ? `&tag=${tag}` : ''}`}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-white border border-zinc-200 text-zinc-600 hover:border-[#003450]/40 hover:text-[#003450] transition-all duration-700 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                  style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
                >
                  {commonT.previous || 'Önceki'}
                </Link>
              )}

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/${lang}/haberler?page=${p}${search ? `&search=${search}` : ''}${tag ? `&tag=${tag}` : ''}`}
                  className={cn(
                    'w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-700',
                    p === page
                      ? 'bg-[#003450] text-white shadow-sm'
                      : 'bg-white border border-zinc-200 text-zinc-500 hover:border-[#003450]/40 hover:text-[#003450] shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                  )}
                  style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
                >
                  {p}
                </Link>
              ))}

              {page < totalPages && (
                <Link
                  href={`/${lang}/haberler?page=${page + 1}${search ? `&search=${search}` : ''}${tag ? `&tag=${tag}` : ''}`}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-white border border-zinc-200 text-zinc-600 hover:border-[#003450]/40 hover:text-[#003450] transition-all duration-700 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                  style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
                >
                  {commonT.next || 'Sonraki'}
                </Link>
              )}
            </motion.nav>
          )}
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease }}
          className="text-center py-20 rounded-3xl border border-dashed border-zinc-200 bg-white"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-100 text-zinc-400 mb-4">
            <Newspaper size={28} weight="light" />
          </div>
          <h3 className="text-lg font-medium text-zinc-900 mb-1">
            {newsT.noResults || 'Sonuç Bulunamadı'}
          </h3>
          <p className="text-zinc-500 text-sm mb-6">
            {newsT.noResultsDescription || 'Aradığınız kriterlere uygun haber bulunamadı.'}
          </p>
          <Link
            href={`/${lang}/haberler`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-[#003450] text-white hover:bg-[#003450]/90 transition-all duration-700 shadow-sm"
            style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
          >
            {newsT.showAll || 'Tüm Haberleri Göster'}
          </Link>
        </motion.div>
      )}
    </div>
  )
}
