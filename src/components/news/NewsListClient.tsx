'use client'

/**
 * Haber listesi (redesign 2026) — prototip `PAGES.haberler()`.
 * Etiket filtreleri (fx-chip), arama formu (GET ?search=), ilk sayfada öne çıkan
 * yazı + `.fx-newsrow` satırları, sayfalama ve tasarlanmış boş / sonuçsuz / hata durumları.
 * `search`, `tag`, `page` sorgu parametreleri sunucu bileşeninde işlenir.
 */
import Link from 'next/link'
import Image from 'next/image'
import { useAppTranslations } from '@/hooks/useAppTranslations'
import { ArrowRight, ArrowUpRight, SearchIcon, CloseIcon } from '@/components/fx/FxIcons'
import { WorkPlaceholder } from '@/components/fx/FxCards'

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
  locale?: 'tr'
  loadError?: boolean
}

function formatDate(date: Date | string, dateLocale: string) {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(dateLocale, { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/** Sorgu parametrelerini koruyarak liste adresi üretir */
function listHref(base: string, q: { page?: number; search?: string; tag?: string }) {
  const p = new URLSearchParams()
  if (q.search) p.set('search', q.search)
  if (q.tag) p.set('tag', q.tag)
  if (q.page && q.page > 1) p.set('page', String(q.page))
  const s = p.toString()
  return s ? `${base}?${s}` : base
}

/** 1 … 4 5 6 … 12 biçiminde kısaltılmış sayfa listesi */
function pageItems(page: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const set = new Set([1, total, page - 1, page, page + 1].filter((n) => n >= 1 && n <= total))
  const sorted = [...set].sort((a, b) => a - b)
  const out: (number | 'gap')[] = []
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) out.push('gap')
    out.push(n)
  })
  return out
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
  locale = 'tr',
  loadError = false,
}: NewsListClientProps) {
  const { t } = useAppTranslations('fx')
  const basePath = `/${lang}/haberler`
  const dateLocale = 'tr-TR'
  const filtered = !!(search || tag)
  const showFeatured = page === 1 && !filtered && articles.length > 0
  const [featured, ...rest] = articles
  const rows = showFeatured ? rest : articles

  const tr = (a: ArticleData) => a.translations?.[locale] || a.translations?.tr
  const kindOf = (a: ArticleData) => (a.tags?.[0] || t('news.kind')).toLocaleUpperCase(dateLocale)
  const dateOf = (a: ArticleData) => formatDate(a.publishedAt || a.createdAt, dateLocale)

  return (
    <>
      <section className="fx-sec fx-sec--tight fx-newspage" aria-labelledby="fx-news-list-title">
        <div className="fx-wrap">
          <h2 id="fx-news-list-title" className="sr-only">{t('news.listLabel')}</h2>

          {/* Arama + etiket filtreleri */}
          <div className="fx-newsbar">
            <form className="fx-newsbar__search" role="search" action={basePath} method="get">
              <label htmlFor="fx-news-q" className="sr-only">{t('news.searchLabel')}</label>
              <span className="fx-newsbar__icon" aria-hidden="true"><SearchIcon /></span>
              <input
                id="fx-news-q"
                type="search"
                name="search"
                defaultValue={search}
                placeholder={t('news.searchPlaceholder')}
                autoComplete="off"
                enterKeyHint="search"
              />
              {tag && <input type="hidden" name="tag" value={tag} />}
              <button type="submit" className="fx-btn fx-btn--ghost fx-btn--sm">{t('news.searchSubmit')}</button>
            </form>

            {allTags.length > 0 && (
              <nav className="fx-filters fx-newsbar__tags" aria-label={t('news.filtersLabel')}>
                <Link className="fx-chip" href={listHref(basePath, { search })} aria-current={!tag ? 'true' : undefined}>
                  {t('news.all')}
                </Link>
                {allTags.map((name) => (
                  <Link
                    key={name}
                    className="fx-chip"
                    href={listHref(basePath, { search, tag: name })}
                    aria-current={tag === name ? 'true' : undefined}
                  >
                    {name}
                  </Link>
                ))}
              </nav>
            )}
          </div>

          {/* Sonuç özeti */}
          {filtered && !loadError && (
            <p className="fx-newsbar__summary" role="status">
              <span className="fx-mono">{t('news.results', { count: total })}</span>
              {search && <span>{t('news.resultsFor', { q: search })}</span>}
              {tag && <span>{t('news.resultsTag', { tag })}</span>}
              <Link className="fx-link fx-newsbar__clear" href={basePath}>
                <CloseIcon /> {t('news.clear')}
              </Link>
            </p>
          )}

          {loadError ? (
            <div className="fx-empty fx-news-empty" role="alert">
              <b>{t('news.errorTitle')}</b>
              <span>{t('news.errorText')}</span>
            </div>
          ) : articles.length === 0 ? (
            <div className="fx-empty fx-news-empty">
              <b>{filtered ? t('news.noResultsTitle') : t('news.emptyTitle')}</b>
              <span>{filtered ? t('news.noResultsText') : t('news.emptyText')}</span>
              <div className="fx-news-empty__cta">
                {filtered ? (
                  <Link className="fx-btn fx-btn--ghost fx-btn--sm" href={basePath}>{t('news.showAll')}</Link>
                ) : (
                  <Link className="fx-btn fx-btn--ghost fx-btn--sm" href={`/${lang}/portfolio`}>
                    {t('news.emptyCta')} <ArrowRight />
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <>
              {showFeatured && featured && (
                <Link className="fx-newsfeat" href={`${basePath}/${featured.slug}`}>
                  <div className="fx-post__thumb fx-newsfeat__img">
                    {featured.featuredImage?.url ? (
                      <Image
                        src={featured.featuredImage.url}
                        alt={featured.featuredImage.altText || ''}
                        fill
                        priority
                        sizes="(max-width: 900px) 100vw, 640px"
                      />
                    ) : (
                      <WorkPlaceholder />
                    )}
                  </div>
                  <div className="fx-newsfeat__copy">
                    <p className="fx-eyebrow">{t('news.latest')}</p>
                    <span className="fx-tag">{kindOf(featured)} · {dateOf(featured)}</span>
                    <h3 className="fx-h2 fx-newsfeat__title">{tr(featured)?.title || featured.slug}</h3>
                    {tr(featured)?.excerpt && <p className="fx-muted fx-newsfeat__ex">{tr(featured)?.excerpt}</p>}
                    <span className="fx-link">{t('news.readMore')} <ArrowRight /></span>
                  </div>
                </Link>
              )}

              {rows.length > 0 && (
                <ul className="fx-newslist">
                  {rows.map((a) => {
                    const x = tr(a)
                    return (
                      <li key={a._id || a.slug}>
                        <Link className="fx-newsrow" href={`${basePath}/${a.slug}`}>
                          <span className="fx-tag">{kindOf(a)} · {dateOf(a)}</span>
                          <span className="fx-newsrow__t">
                            <b>{x?.title || a.slug}</b>
                            {x?.excerpt && <span className="fx-muted">{x.excerpt}</span>}
                          </span>
                          <span className="fx-svc__arrow" aria-hidden="true"><ArrowUpRight /></span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}

              {totalPages > 1 && (
                <nav className="fx-pager" aria-label={t('news.pagination')}>
                  {page > 1 ? (
                    <Link className="fx-pager__step" href={listHref(basePath, { search, tag, page: page - 1 })} rel="prev">
                      <ArrowRight className="fx-flip" /> {t('news.prev')}
                    </Link>
                  ) : (
                    <span className="fx-pager__step" aria-disabled="true"><ArrowRight className="fx-flip" /> {t('news.prev')}</span>
                  )}
                  <span className="fx-pager__compact fx-mono">{t('news.pageOf', { page, total: totalPages })}</span>
                  <ol className="fx-pager__pages">
                    {pageItems(page, totalPages).map((p, i) =>
                      p === 'gap' ? (
                        <li key={`gap-${i}`} className="fx-pager__gap" aria-hidden="true">…</li>
                      ) : (
                        <li key={p}>
                          <Link
                            className="fx-pager__num"
                            href={listHref(basePath, { search, tag, page: p })}
                            aria-current={p === page ? 'page' : undefined}
                            aria-label={t('news.pageN', { n: p })}
                          >
                            {p}
                          </Link>
                        </li>
                      ),
                    )}
                  </ol>
                  {page < totalPages ? (
                    <Link className="fx-pager__step" href={listHref(basePath, { search, tag, page: page + 1 })} rel="next">
                      {t('news.next')} <ArrowRight />
                    </Link>
                  ) : (
                    <span className="fx-pager__step" aria-disabled="true">{t('news.next')} <ArrowRight /></span>
                  )}
                </nav>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}
