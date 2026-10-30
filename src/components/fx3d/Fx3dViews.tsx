'use client'

/**
 * FX 3D (Cults3D modelleri): liste ve model detay görünümleri.
 * Veri sunucuda `@/lib/cults3d` ile alınıp prop olarak gelir; satın alma her zaman
 * Cults3D'deki model sayfasına yeni sekmede yönlenir.
 */
import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import PageHero from '@/components/common/PageHero'
import HTMLContent from '@/components/HTMLContent'
import PortfolioMediaGallery from '@/components/portfolio/PortfolioMediaGallery'
import { WorkCard, type WorkCardData } from '@/components/fx/FxCards'
import { ArrowRight, ExternalIcon } from '@/components/fx/FxIcons'
import { FxSectionHead } from '@/components/fx/FxSectionHead'
import { QuoteBand } from '@/components/fx/home/HomeSections'
import { useAppTranslations } from '@/hooks/useAppTranslations'
import type { Fx3dModel, Fx3dModelDetail } from '@/lib/cults3d'

export const fx3dHref = (lang: string, slug: string) => `/${lang}/fx-3d/${slug}`

function useFx3d(lang: string) {
  const { t } = useAppTranslations('fx')
  const { t: tc } = useAppTranslations('breadcrumb')
  return {
    t: (key: string, params?: Record<string, string | number>) => t(`fx3d.${key}`, params),
    crumbs: { home: { label: tc('home'), href: `/${lang}` }, fx3d: { label: tc('fx3d'), href: `/${lang}/fx-3d` } },
  }
}

const toCard = (m: Fx3dModel, lang: string): WorkCardData => ({
  href: fx3dHref(lang, m.slug),
  title: m.name,
  image: m.image ?? undefined,
  metaLeft: m.category,
})

/* ------------------------------------------------------------------- /fx-3d */

export function Fx3dIndexView({ lang, models, error, profileUrl }: { lang: string; models: Fx3dModel[]; error: boolean; profileUrl: string }) {
  const { t, crumbs } = useFx3d(lang)
  const [category, setCategory] = useState('')
  const categories = useMemo(() => Array.from(new Set(models.map((m) => m.category).filter(Boolean))).sort((a, b) => a.localeCompare(b, lang)), [models, lang])
  const shown = category ? models.filter((m) => m.category === category) : models

  return (
    <>
      <PageHero badge={t('eyebrow')} title={t('title')} description={t('lede')} crumbs={[crumbs.home, crumbs.fx3d]} />
      <section className="fx-sec" aria-label={t('eyebrow')}>
        <div className="fx-wrap">
          {error || models.length === 0 ? (
            <div className="fx-empty fx-news-empty" role={error ? 'alert' : undefined}>
              <b>{t(error ? 'error' : 'empty')}</b>
              <span>{t(error ? 'errorBody' : 'emptyBody')}</span>
              <a className="fx-btn fx-btn--ghost fx-btn--sm" href={profileUrl} target="_blank" rel="noopener noreferrer">
                {t('profile')} <ExternalIcon />
              </a>
            </div>
          ) : (
            <>
              <div className="fx-3d-bar">
                {categories.length > 1 && (
                  <div className="fx-filters" role="group" aria-label={t('filterLabel')}>
                    <button type="button" className="fx-chip" aria-pressed={!category} onClick={() => setCategory('')}>{t('all')}</button>
                    {categories.map((c) => (
                      <button key={c} type="button" className="fx-chip" aria-pressed={category === c} onClick={() => setCategory(c)}>{c}</button>
                    ))}
                  </div>
                )}
                <span className="fx-tag" aria-live="polite">{t('count', { count: shown.length })}</span>
              </div>
              <div className="fx-works">
                {shown.map((m, i) => <WorkCard key={m.slug} data={toCard(m, lang)} span={4} priority={i < 3} />)}
              </div>
            </>
          )}
        </div>
      </section>
      <section className="fx-sec fx-sec--alt fx-sec--tight" aria-labelledby="fx-3d-custom-title">
        <div className="fx-wrap fx-sw-custom">
          <div className="fx-sw-custom__copy">
            <span className="fx-eyebrow">{t('profile')}</span>
            <h2 className="fx-h2" id="fx-3d-custom-title">{t('customTitle')}</h2>
            <p className="fx-muted">{t('customBody')}</p>
          </div>
          <div className="fx-sw-links">
            <a className="fx-btn fx-btn--ghost" href={profileUrl} target="_blank" rel="noopener noreferrer">{t('profile')} <ExternalIcon /></a>
            <Link className="fx-btn fx-btn--primary" href={`/${lang}/contact`}>{t('customCta')} <ArrowRight /></Link>
          </div>
        </div>
      </section>
    </>
  )
}

/* ------------------------------------------------------------ /fx-3d/[slug] */

/** Cults3D açıklamaları çoğu zaman İngilizce: Türkçe harf yoksa lang="en" — büyük harfli
 *  tablo başlıklarında "SETTİNG" yerine "SETTING" çıkar. */
const contentLang = (html: string) => (/[çğıöşüÇĞİÖŞÜ]/.test(html) ? undefined : 'en')

interface DetailProps {
  lang: string
  model: Fx3dModelDetail
  lede: string
  descriptionHtml: string
  detailsHtml: string
  others: Fx3dModel[]
}

export function Fx3dDetailView({ lang, model: m, lede, descriptionHtml, detailsHtml, others }: DetailProps) {
  const { t, crumbs } = useFx3d(lang)
  const locale = 'tr-TR'
  const num = (n: number) => n.toLocaleString(locale)
  const published = m.publishedAt ? new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(m.publishedAt)) : ''
  const cells = [
    { k: 'category', label: t('category'), value: m.category },
    { k: 'license', label: t('license'), value: m.license?.name ?? '' },
    { k: 'published', label: t('published'), value: published },
  ].filter((c) => c.value)

  return (
    <>
      <PageHero
        badge={[t('eyebrow'), m.category].filter(Boolean).join(' · ')}
        title={m.name}
        description={lede}
        crumbs={[crumbs.home, crumbs.fx3d, { label: m.name, href: fx3dHref(lang, m.slug) }]}
        aside={m.image ? (
          <div className="fx-3d-cover">
            <Image src={m.image} alt={m.name} fill sizes="(max-width: 960px) 360px, 440px" priority />
          </div>
        ) : undefined}
      >
        <div className="fx-3d-buy">
          <a className="fx-btn fx-btn--primary" href={m.url} target="_blank" rel="noopener noreferrer" aria-label={t('buyFor', { name: m.name })}>
            {t('buy')} <ExternalIcon />
          </a>
          <p className="fx-3d-note">{t('digital')}</p>
        </div>
      </PageHero>

      <section className="fx-sec fx-sec--tight" aria-label={t('meta')}>
        <div className="fx-wrap fx-pf-case">
          {cells.length > 0 && (
            <dl className={`fx-case-meta fx-pf-meta fx-pf-meta--n${cells.length}`}>
              {cells.map((c) => (
                <div key={c.k}>
                  <dt><small>{c.label}</small></dt>
                  <dd><span>{c.value}</span></dd>
                </div>
              ))}
            </dl>
          )}
          {m.images.length > 0 && <PortfolioMediaGallery images={m.images} title={m.name} />}
          <p className="fx-tag">
            {num(m.views)} {t('views')} · {num(m.likes)} {t('likes')} · {num(m.downloads)} {t('downloads')}
          </p>
        </div>
      </section>

      <section className="fx-sec fx-pf-body fx-pf-body--follow">
        <div className="fx-wrap">
          {descriptionHtml && (
            <div className="fx-block">
              <h2>{t('description')}</h2>
              <div className="fx-block__body" lang={contentLang(descriptionHtml)}><HTMLContent content={descriptionHtml} className="fx-pf-prose fx-3d-prose" /></div>
            </div>
          )}
          {detailsHtml && (
            <div className="fx-block">
              <h2>{t('details')}</h2>
              <div className="fx-block__body" lang={contentLang(detailsHtml)}><HTMLContent content={detailsHtml} className="fx-pf-prose fx-3d-prose" /></div>
            </div>
          )}
          {m.files.length > 0 && (
            <div className="fx-block">
              <h2>{t('files')}</h2>
              <div className="fx-block__body">
                <p className="fx-muted">{t('filesLede')}</p>
                <div className="fx-table-wrap">
                  <table className="fx-spec-table fx-spec-table--fluid fx-3d-files">
                    <thead>
                      <tr><th scope="col">{t('previewCol')}</th><th scope="col">{t('file')}</th><th scope="col">{t('format')}</th><th scope="col">{t('size')}</th><th scope="col">{t('faces')}</th></tr>
                    </thead>
                    <tbody>
                      {m.files.map((f, n) => (
                        <tr key={n}>
                          {/* eslint-disable-next-line @next/next/no-img-element -- Cults3D'nin imzalı 113px önizlemesi; optimizasyon gerekmez */}
                          <td>{f.preview ? <img src={f.preview} alt={t('preview', { name: f.name })} width={56} height={56} loading="lazy" /> : null}</td>
                          <td className="fx-mono">{f.name}</td>
                          <td className="fx-mono">{f.ext}</td>
                          <td className="fx-mono">{f.size ? `${f.size.map(num).join(' × ')} mm` : '—'}</td>
                          <td className="fx-mono">{f.faces != null ? num(f.faces) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {(m.tags.length > 0 || m.license) && (
            <div className="fx-block">
              <h2>{t('tags')}</h2>
              <div className="fx-block__body">
                {m.tags.length > 0 && <div className="fx-chips">{m.tags.map((tag) => <span key={tag} className="fx-chip fx-chip--sm">{tag}</span>)}</div>}
                {m.license && (
                  <p className="fx-tag">
                    {t('license')}: {m.license.url ? <a href={m.license.url} target="_blank" rel="noopener noreferrer">{m.license.name}</a> : m.license.name}
                    {' · '}{t('commercial')}: {t(m.license.commercial ? 'yes' : 'no')}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {others.length > 0 && (
        <section className="fx-sec fx-sec--alt" aria-labelledby="fx-3d-others">
          <div className="fx-wrap">
            <FxSectionHead id="fx-3d-others" eyebrow={t('eyebrow')} title={t('others')} />
            <div className="fx-works">
              {others.map((o) => <WorkCard key={o.slug} data={toCard(o, lang)} span={4} />)}
            </div>
            <Link className="fx-link" href={`/${lang}/fx-3d`}>{t('all3d')} <ArrowRight /></Link>
          </div>
        </section>
      )}

      <QuoteBand lang={lang} />
    </>
  )
}
