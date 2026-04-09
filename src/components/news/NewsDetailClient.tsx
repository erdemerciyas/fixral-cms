'use client'

import { motion, useScroll, useSpring } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { CalendarBlank, ArrowRight, ShareNetwork, ArrowLeft, User as UserIcon, Tag } from '@phosphor-icons/react'
import EyebrowTag from '@/components/ui/EyebrowTag'
import Breadcrumbs from '@/components/Breadcrumbs'
import { SITE_URL } from '@/lib/seo-utils'

const ease = [0.32, 0.72, 0, 1] as const

interface NewsDetailClientProps {
  lang: string
  news: {
    slug: string
    status: string
    tags?: string[]
    publishedAt?: string | Date
    createdAt: string | Date
    updatedAt: string | Date
    featuredImage?: { url: string; altText?: string }
    author?: { name?: string; email?: string }
    relatedPortfolioIds?: any[]
    relatedNewsIds?: any[]
  }
  translation: {
    title: string
    excerpt?: string
    content: string
    metaDescription?: string
    keywords?: string[]
  }
}

function ReadingProgressBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] bg-[#003450] origin-left z-50"
      style={{ scaleX }}
    />
  )
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function NewsDetailClient({ lang, news, translation }: NewsDetailClientProps) {
  const hasImage = !!news.featuredImage?.url

  return (
    <>
      <ReadingProgressBar />

      <div>
        {/* ─── HERO ─── */}
        <section className="relative w-full overflow-hidden bg-gradient-primary">
          {/* Mesh gradient orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-1/4 -right-1/4 w-[60%] h-[60%] rounded-full bg-white/[0.03] blur-[120px]" />
            <div className="absolute -bottom-1/4 -left-1/4 w-[50%] h-[50%] rounded-full bg-white/[0.05] blur-[100px]" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex items-end">
            <div className="w-full mx-auto px-6 sm:px-8 lg:px-16 pb-12 md:pb-16 pt-32 md:pt-40" style={{ maxWidth: '1400px' }}>
              <div className="max-w-3xl space-y-5">
                {/* Tags */}
                <motion.div
                  initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.7, delay: 0.15, ease }}
                  className="flex flex-wrap items-center gap-3"
                >
                  {news.tags?.map((t) => (
                    <EyebrowTag key={t} variant="light">{t}</EyebrowTag>
                  ))}
                </motion.div>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.8, delay: 0.25, ease }}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-semibold text-white leading-[1.1] tracking-tight"
                >
                  {translation.title}
                </motion.h1>

                {/* Excerpt */}
                {translation.excerpt && (
                  <motion.p
                    initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.7, delay: 0.35, ease }}
                    className="text-base md:text-lg text-white/60 leading-relaxed max-w-2xl"
                  >
                    {translation.excerpt}
                  </motion.p>
                )}

                {/* Meta row */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.45, ease }}
                  className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2"
                >
                  <div className="flex items-center gap-1.5 text-white/40">
                    <CalendarBlank size={15} weight="light" />
                    <time
                      dateTime={new Date(news.publishedAt || news.createdAt).toISOString()}
                      className="font-mono text-[13px] tracking-wide"
                    >
                      {formatDate(news.publishedAt || news.createdAt)}
                    </time>
                  </div>
                  {news.author?.name && (
                    <div className="flex items-center gap-1.5 text-white/40">
                      <UserIcon size={15} weight="light" />
                      <span className="text-white/55">{news.author.name}</span>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── BREADCRUMB ─── */}
        <div className="bg-zinc-50">
          <section className="mx-auto px-6 sm:px-8 lg:px-16 pt-6" style={{ maxWidth: '1400px' }}>
            <Breadcrumbs />
          </section>
        </div>

        {/* ─── ARTICLE BODY ─── */}
        <div className="bg-zinc-50">
        <div className="mx-auto px-6 sm:px-8 lg:px-16 py-12 md:py-16" style={{ maxWidth: '1400px' }}>

            {/* Featured Image (below hero) */}
            {hasImage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease }}
                className="relative w-full aspect-video mb-10 rounded-2xl overflow-hidden shadow-sm border border-zinc-200/60"
              >
                <Image
                  src={news.featuredImage!.url}
                  alt={news.featuredImage!.altText || translation.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 1152px"
                />
              </motion.div>
            )}

            {/* Article body */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, delay: 0.2, ease }}
              className="prose prose-lg prose-zinc max-w-none
                prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-zinc-900
                prose-p:text-zinc-600 prose-p:leading-[1.8]
                prose-a:text-[#003450] prose-a:no-underline hover:prose-a:underline
                prose-strong:text-zinc-800 prose-strong:font-semibold
                prose-img:rounded-2xl prose-img:shadow-sm
                prose-blockquote:border-l-[#003450]/20 prose-blockquote:text-zinc-500 prose-blockquote:italic
                prose-code:font-mono prose-code:text-[#003450] prose-code:bg-zinc-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm
                prose-pre:bg-zinc-900 prose-pre:rounded-2xl
                prose-li:text-zinc-600
              "
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: typeof translation.content === 'string'
                    ? translation.content
                    : (translation.content ? JSON.stringify(translation.content) : ''),
                }}
              />
            </motion.article>

            {/* Tags footer */}
            {news.tags && news.tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease }}
                className="mt-12 pt-8 border-t border-zinc-200/60"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Tag size={16} weight="light" className="text-zinc-400" />
                  <span className="text-xs font-medium uppercase tracking-[0.15em] text-zinc-400">Konular</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {news.tags.map((t: string) => (
                    <Link
                      key={t}
                      href={`/${lang}/haberler?tag=${encodeURIComponent(t)}`}
                      className="px-3.5 py-1.5 rounded-xl bg-zinc-100 text-zinc-500 text-sm hover:bg-zinc-200 hover:text-zinc-700 transition-all duration-700"
                      style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
                    >
                      #{t}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Share */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease }}
              className="mt-8 pt-8 border-t border-zinc-200/60"
            >
              <div className="flex items-center gap-2 mb-4">
                <ShareNetwork size={16} weight="light" className="text-zinc-400" />
                <span className="text-xs font-medium uppercase tracking-[0.15em] text-zinc-400">Bu Haberi Paylas</span>
              </div>
              <div className="flex gap-3">
                {[
                  {
                    label: 'Twitter',
                    href: `https://twitter.com/intent/tweet?url=${SITE_URL}/tr/haberler/${news.slug}`,
                    icon: (
                      <svg fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                    ),
                  },
                  {
                    label: 'Facebook',
                    href: `https://www.facebook.com/sharer/sharer.php?u=${SITE_URL}/tr/haberler/${news.slug}`,
                    icon: (
                      <svg fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    ),
                  },
                  {
                    label: 'LinkedIn',
                    href: `https://www.linkedin.com/sharing/share-offsite/?url=${SITE_URL}/tr/haberler/${news.slug}`,
                    icon: (
                      <svg fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    ),
                  },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-500 flex items-center justify-center hover:bg-[#003450] hover:text-white transition-all duration-700"
                    style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Back link */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease }}
              className="mt-8"
            >
              <Link
                href={`/${lang}/haberler`}
                className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-[#003450] transition-all duration-700 group"
                style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
              >
                <ArrowLeft size={14} weight="light" className="transition-transform duration-700 group-hover:-translate-x-1" style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }} />
                Tum Haberlere Don
              </Link>
            </motion.div>
        </div>

        {/* Related Portfolio */}
        {news.relatedPortfolioIds && news.relatedPortfolioIds.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease }}
            className="mx-auto px-6 sm:px-8 lg:px-16 pb-8"
            style={{ maxWidth: '1400px' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">Ilgili Projeler</h2>
              <div className="h-px bg-zinc-200 flex-grow" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {(news.relatedPortfolioIds as any[]).filter(Boolean).map((portfolio, i) => (
                <motion.div
                  key={portfolio._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.08, ease }}
                >
                  <Link
                    href={`/${lang}/portfolio/${portfolio.slug}`}
                    className="group relative block h-52 rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_-10px_rgba(0,52,80,0.15)] transition-all duration-700"
                    style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
                  >
                    <Image
                      src={portfolio.coverImage}
                      alt={portfolio.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-5">
                      <h3 className="text-white font-semibold text-lg line-clamp-1 group-hover:text-white/90 transition-colors duration-700">
                        {portfolio.title}
                      </h3>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Related News - Horizontal scroll */}
        {news.relatedNewsIds && news.relatedNewsIds.length > 0 && (
          <section className="mx-auto px-6 sm:px-8 lg:px-16 pb-16" style={{ maxWidth: '1400px' }}>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, ease }}
            >
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">Ilginizi Cekebilir</h2>
                <div className="h-px bg-zinc-200 flex-grow" />
              </div>
            </motion.div>

            <div className="flex gap-5 overflow-x-auto pb-4 -mx-2 px-2 snap-x snap-mandatory scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {(news.relatedNewsIds as any[]).filter(Boolean).map((relatedNews, i) => (
                <motion.div
                  key={relatedNews._id}
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.1, ease }}
                  className="flex-shrink-0 snap-start w-[280px] md:w-[320px]"
                >
                  <Link
                    href={`/${lang}/haberler/${relatedNews.slug}`}
                    className="group block rounded-2xl overflow-hidden bg-white border border-zinc-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_-10px_rgba(0,52,80,0.12)] transition-all duration-700"
                    style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
                  >
                    {relatedNews.featuredImage?.url && (
                      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100">
                        <Image
                          src={relatedNews.featuredImage.url}
                          alt={relatedNews.featuredImage.altText || ''}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                          style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
                          sizes="320px"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-zinc-900 line-clamp-2 leading-snug mb-2 group-hover:text-[#003450] transition-colors duration-700">
                        {relatedNews.translations?.tr?.title || ''}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-[#003450] transition-all duration-700 group-hover:gap-2"
                        style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
                      >
                        Okumaya basla
                        <ArrowRight size={12} weight="light" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}
        </div>
      </div>
    </>
  )
}
