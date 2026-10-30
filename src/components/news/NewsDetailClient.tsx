'use client'

/**
 * Haber detayı (redesign 2026) — prototip `PAGES.article()`.
 * PageHero (konum, tür · tarih · okuma süresi, başlık, özet), 16/8 kapak görseli,
 * ~720px `public-prose` gövde, konu çipleri, paylaşım, ilgili içerik ve teklif bandı.
 * Okuma ilerlemesi: yapışkan 64px başlığın hemen altında 2px turuncu çizgi.
 */
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import PageHero from '@/components/common/PageHero'
import { FxSectionHead } from '@/components/fx/FxSectionHead'
import { PostCard, stripHtml, type PostCardData } from '@/components/fx/FxCards'
import { ArrowRight } from '@/components/fx/FxIcons'
import { QuoteBand } from '@/components/fx/home/HomeSections'
import { useAppTranslations } from '@/hooks/useAppTranslations'
import { toFxLocale } from '@/content/fixral'
import { SITE_URL } from '@/lib/seo-utils'

interface RelatedPortfolio { _id?: string; title?: string; slug?: string; coverImage?: string }
interface RelatedNews {
  _id?: string
  slug?: string
  featuredImage?: { url?: string; altText?: string }
  translations?: Record<string, { title?: string } | undefined>
}

interface NewsDetailClientProps {
  lang: string
  locale?: 'tr'
  news: {
    slug: string
    status: string
    tags?: string[]
    publishedAt?: string | Date
    createdAt: string | Date
    updatedAt: string | Date
    featuredImage?: { url: string; altText?: string }
    author?: { name?: string; email?: string }
    relatedPortfolioIds?: RelatedPortfolio[]
    relatedNewsIds?: RelatedNews[]
  }
  translation: {
    title: string
    excerpt?: string
    content: string
    metaDescription?: string
    keywords?: string[]
  }
}

/** Makale gövdesine göre ilerleme; transform doğrudan DOM'a yazılır (inline style prop'u yok) */
function ReadingProgress({ target, label }: { target: React.RefObject<HTMLElement | null>; label: string }) {
  const bar = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const el = target.current
      const b = bar.current
      if (!el || !b) return
      const rect = el.getBoundingClientRect()
      const header = 64
      const span = rect.height - (window.innerHeight - header)
      const done = span <= 0 ? (rect.top < header ? 1 : 0) : (header - rect.top) / span
      const p = Math.min(1, Math.max(0, done))
      b.style.transform = `scaleX(${p})`
      b.parentElement?.setAttribute('aria-valuenow', String(Math.round(p * 100)))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [target])
  return (
    <div className="fx-readbar" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={0}>
      <div ref={bar} className="fx-readbar__fill" />
    </div>
  )
}

const SHARE_ICONS: Record<string, string> = {
  X: 'M18.9 2H22l-7.6 8.7L23.3 22h-7l-5.5-7.2L4.5 22H1.4l8.1-9.3L1 2h7.1l5 6.6zm-1.2 18h1.7L7.2 3.9H5.4z',
  LinkedIn: 'M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13M7.12 20.45H3.56V9h3.56zM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z',
  Facebook: 'M24 12.07C24 5.44 18.63.07 12 .07S0 5.44 0 12.07c0 5.99 4.39 10.95 10.13 11.85v-8.38H7.08v-3.47h3.05V9.43c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.69.24 2.69.24v2.95h-1.51c-1.49 0-1.96.93-1.96 1.87v2.25h3.33l-.53 3.47h-2.8v8.38C19.61 23.03 24 18.06 24 12.07',
}

export default function NewsDetailClient({ lang, locale, news, translation }: NewsDetailClientProps) {
  const L = locale ?? toFxLocale(lang)
  const { t } = useAppTranslations('fx')
  const { t: tb } = useAppTranslations('breadcrumb')
  const articleRef = useRef<HTMLElement>(null)
  const [copied, setCopied] = useState(false)

  const basePath = `/${lang}/haberler`
  const dateLocale = 'tr-TR'
  const rawDate = new Date(news.publishedAt || news.createdAt)
  const validDate = !Number.isNaN(rawDate.getTime())
  const dateLabel = validDate ? rawDate.toLocaleDateString(dateLocale, { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''
  const words = stripHtml(translation.content).split(' ').filter(Boolean).length
  const minutes = Math.max(1, Math.round(words / 200))
  const kind = (news.tags?.[0] || t('news.kind')).toLocaleUpperCase(dateLocale)
  const eyebrow = [kind, dateLabel, t('news.readingTime', { n: minutes })].filter(Boolean).join(' · ')
  const title = translation.title || news.slug
  const pageUrl = `${SITE_URL}${basePath}/${news.slug}`
  const enc = encodeURIComponent(pageUrl)
  const share = [
    { name: 'X', href: `https://twitter.com/intent/tweet?url=${enc}&text=${encodeURIComponent(title)}` },
    { name: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc}` },
    { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${enc}` },
  ]

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2400)
    } catch {
      /* pano erişimi yoksa sessizce geç */
    }
  }

  const relatedNews: PostCardData[] = (news.relatedNewsIds || [])
    .filter((r): r is RelatedNews => !!r?.slug)
    .map((r) => ({
      href: `${basePath}/${r.slug}`,
      title: r.translations?.[L]?.title || r.translations?.tr?.title || r.slug || '',
      image: r.featuredImage?.url || undefined,
      kind: t('news.kind').toLocaleUpperCase(dateLocale),
    }))
    .filter((p) => p.title)
  const relatedProjects: PostCardData[] = (news.relatedPortfolioIds || [])
    .filter((p): p is RelatedPortfolio => !!p?.slug)
    .map((p) => ({
      href: `/${lang}/portfolio/${p.slug}`,
      title: p.title || p.slug || '',
      image: p.coverImage || undefined,
      kind: t('news.projectKind').toLocaleUpperCase(dateLocale),
    }))

  return (
    <>
      <ReadingProgress target={articleRef} label={t('news.progress')} />

      <PageHero
        title={title}
        description={translation.excerpt || undefined}
        badge={eyebrow}
        showButton={false}
        crumbs={[
          { label: tb('home'), href: `/${lang}` },
          { label: t('news.crumb'), href: basePath },
          { label: title, href: `${basePath}/${news.slug}` },
        ]}
      >
        {news.author?.name && (
          <p className="fx-tag fx-newsart__by">
            {t('news.author')} <span>{news.author.name}</span>
            {validDate && (
              <> · <time dateTime={rawDate.toISOString()}>{rawDate.toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' })}</time></>
            )}
          </p>
        )}
      </PageHero>

      <section className="fx-sec fx-sec--tight">
        <div className="fx-wrap">
          <article ref={articleRef} className="fx-newsart" aria-labelledby="page-hero-title">
            {news.featuredImage?.url && (
              <div className="fx-post__thumb fx-newsart__img">
                <Image
                  src={news.featuredImage.url}
                  alt={news.featuredImage.altText || ''}
                  fill
                  priority
                  sizes="(max-width: 800px) 100vw, 720px"
                />
              </div>
            )}

            <div
              className="public-prose fx-newsart__body"
              dangerouslySetInnerHTML={{ __html: typeof translation.content === 'string' ? translation.content : '' }}
            />

            <footer className="fx-newsart__foot">
              {news.tags && news.tags.length > 0 && (
                <nav className="fx-newsart__row" aria-label={t('news.topics')}>
                  <span className="fx-tag">{t('news.topics')}</span>
                  <div className="fx-chips">
                    {news.tags.map((name) => (
                      <Link key={name} className="fx-chip" href={`${basePath}?tag=${encodeURIComponent(name)}`}>
                        #{name}
                      </Link>
                    ))}
                  </div>
                </nav>
              )}

              <div className="fx-newsart__row" role="group" aria-label={t('news.share')}>
                <span className="fx-tag">{t('news.share')}</span>
                <div className="fx-chips">
                  {share.map((s) => (
                    <a
                      key={s.name}
                      className="fx-chip fx-share"
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t('news.shareOn', { name: s.name })}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={SHARE_ICONS[s.name]} /></svg>
                    </a>
                  ))}
                  <button type="button" className="fx-chip" onClick={copyLink}>
                    {copied ? t('news.copied') : t('news.copyLink')}
                  </button>
                  <span className="sr-only" role="status">{copied ? t('news.copied') : ''}</span>
                </div>
              </div>

              <Link className="fx-link fx-newsart__back" href={basePath}>
                <ArrowRight className="fx-flip" /> {t('news.back')}
              </Link>
            </footer>
          </article>
        </div>
      </section>

      {(relatedNews.length > 0 || relatedProjects.length > 0) && (
        <section className="fx-sec fx-sec--alt fx-sec--tight" aria-labelledby="fx-news-related">
          <div className="fx-wrap fx-newsrel">
            <FxSectionHead
              id="fx-news-related"
              eyebrow={t('news.relatedEyebrow')}
              title={relatedNews.length > 0 ? t('news.relatedNews') : t('news.relatedProjects')}
              aside={<Link className="fx-link" href={basePath}>{t('news.showAll')} <ArrowRight /></Link>}
            />
            {relatedNews.length > 0 && (
              <div className="fx-journal">{relatedNews.slice(0, 3).map((p) => <PostCard key={p.href} data={p} />)}</div>
            )}
            {relatedProjects.length > 0 && (
              <>
                {relatedNews.length > 0 && <h3 className="fx-h3">{t('news.relatedProjects')}</h3>}
                <div className="fx-journal">{relatedProjects.slice(0, 3).map((p) => <PostCard key={p.href} data={p} />)}</div>
              </>
            )}
          </div>
        </section>
      )}

      <QuoteBand lang={lang} />
    </>
  )
}
