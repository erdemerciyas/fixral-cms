'use client'

/**
 * Yazılımlar (redesign 2026): liste ve ürün detay sayfası görünümleri.
 * İçerik panelden gelir (Yönetim → Yazılımlar, `fx-software`); kayıt yoksa
 * `@/content/fixral` içindeki SOFTWARE kataloğu (GitHub README) kullanılır.
 */
import Link from 'next/link'
import PageHero from '@/components/common/PageHero'
import { useAppTranslations } from '@/hooks/useAppTranslations'
import { serviceHref, softwareHref, toFxLocale } from '@/content/fixral'
import type { FxSoftware } from '@/content/fx-data'
import { useFx } from '@/components/fx/FxData'
import { ArrowRight, ExternalIcon, GithubIcon, ServiceIcon } from '@/components/fx/FxIcons'
import { FxSectionHead } from '@/components/fx/FxSectionHead'
import { SoftwareVisual } from '@/components/fx/FxVisuals'
import { QuoteBand, SoftwareCard, useSoftwareLabels } from '@/components/fx/home/HomeSections'
import { flowClass } from '@/components/services/FxServicesViews'
import { SplitterShowcase, SplitterVideoSection } from './SplitterShowcase'
import { SPLITTER_SLUG } from '@/content/splitter-showcase'

const statusLine = (sw: FxSoftware, status: string) => [status, sw.version ? `v${sw.version}` : ''].filter(Boolean).join(' · ')

function useSoftwareCrumbs(lang: string) {
  const { t } = useAppTranslations('breadcrumb')
  const L = toFxLocale(lang)
  return { home: { label: t('home'), href: `/${L}` }, software: { label: t('software'), href: `/${L}/software` } }
}

/** "Uygulamayı aç" + "GitHub" düğmeleri (detay sayfasının sağ kolonu) */
function SoftwareLinks({ sw }: { sw: FxSoftware }) {
  const { t } = useAppTranslations('fx')
  return (
    <div className="fx-sw-links" role="group" aria-label={t('swPage.linksLabel', { name: sw.name })}>
      {sw.url && (
        <a className="fx-btn fx-btn--primary" href={sw.url} target="_blank" rel="noopener noreferrer" aria-label={t('swPage.openFor', { name: sw.name })}>
          {t('software.open')} <ExternalIcon />
        </a>
      )}
      {sw.repo && (
        <a className="fx-btn fx-btn--ghost" href={sw.repo} target="_blank" rel="noopener noreferrer" aria-label={t('swPage.repoFor', { name: sw.name })}>
          <GithubIcon /> {t('software.github')}
        </a>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ /software */

export function SoftwareIndexView({ lang }: { lang: string }) {
  const { t } = useAppTranslations('fx')
  const fx = useFx(lang)
  const L = fx.L
  const head = fx.page('software')
  const c = useSoftwareCrumbs(lang)
  const labels = useSoftwareLabels(lang)
  return (
    <>
      <PageHero
        badge={head.eyebrow}
        title={head.title}
        description={head.lede}
        crumbs={[c.home, c.software]}
      />
      <section className="fx-sec">
        <div className="fx-wrap fx-sw-list">
          {fx.software.map((sw, i) => {
            const tx = sw.text[L]
            const v = labels(sw)
            const id = `fx-sw-${sw.slug}`
            return (
              <article key={sw.slug} className={`fx-sw-row ${i % 2 ? 'fx-sw-row--flip' : ''}`} aria-labelledby={id}>
                <SoftwareVisual viz={sw.viz} label={v.label} hud={v.hud} gaugeLabels={v.gauge} />
                <div className="fx-sw-row__body">
                  <div className="fx-sw-card__top">
                    <span className="fx-eyebrow">{tx.kicker}</span>
                    <span className="fx-tag">{statusLine(sw, tx.status)}</span>
                  </div>
                  <h2 className="fx-h2" id={id}>{sw.name}</h2>
                  <p className="fx-lede">{tx.lede}</p>
                  <dl className="fx-spec" aria-label={t('swPage.factsLabel', { name: sw.name })}>
                    {tx.facts.slice(0, 3).map(([a, b], n) => (
                      <div key={n} className="fx-spec__row"><dt>{a}</dt><dd>{b}</dd></div>
                    ))}
                  </dl>
                  <div className="fx-sw-links">
                    <Link className="fx-btn fx-btn--ghost" href={softwareHref(lang, sw)}>
                      {t('software.details')} <ArrowRight />
                    </Link>
                    {sw.url ? (
                      <a className="fx-btn fx-btn--primary" href={sw.url} target="_blank" rel="noopener noreferrer" aria-label={t('swPage.openFor', { name: sw.name })}>
                        {t('software.open')} <ExternalIcon />
                      </a>
                    ) : sw.repo ? (
                      <a className="fx-btn fx-btn--primary" href={sw.repo} target="_blank" rel="noopener noreferrer" aria-label={t('swPage.repoFor', { name: sw.name })}>
                        <GithubIcon /> {t('software.github')}
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>
      <section className="fx-sec fx-sec--alt fx-sec--tight" aria-labelledby="fx-sw-custom-title">
        <div className="fx-wrap fx-sw-custom">
          <div className="fx-sw-custom__copy">
            <span className="fx-eyebrow">{t('software.customEyebrow')}</span>
            <h2 className="fx-h2" id="fx-sw-custom-title">{t('software.customTitle')}</h2>
            <p className="fx-muted">{t('software.customBody')}</p>
          </div>
          <Link className="fx-btn fx-btn--primary" href={`/${L}/contact`}>
            {t('nav.quote')} <ArrowRight />
          </Link>
        </div>
      </section>
    </>
  )
}

/* ----------------------------------------------------------- /software/[slug] */

export function SoftwareDetailView({ lang, slug }: { lang: string; slug: string }) {
  const { t } = useAppTranslations('fx')
  const fx = useFx(lang)
  const L = fx.L
  const c = useSoftwareCrumbs(lang)
  const labels = useSoftwareLabels(lang)
  const sw = fx.softwareBySlug(slug)
  if (!sw) return null
  const tx = sw.text[L]
  const v = labels(sw)
  const others = fx.software.filter((x) => x.slug !== sw.slug)
  const related = sw.services.map((k) => fx.service(k)).filter((s): s is NonNullable<typeof s> => !!s)
  // Splitter: vitrin (video, interaktif kılavuz, galeri…) eklenir; akış kılavuzda anlatıldığından tekrarlanmaz
  const showcase = sw.slug === SPLITTER_SLUG
  const flow = showcase ? [] : tx.flow

  return (
    <>
      <PageHero
        badge={[tx.kicker, statusLine(sw, tx.status)].filter(Boolean).join(' · ')}
        title={sw.name}
        description={tx.lede}
        crumbs={[c.home, c.software, { label: sw.name, href: softwareHref(lang, sw) }]}
        aside={
          <>
            <SoftwareVisual viz={sw.viz} label={v.label} hud={v.hud} gaugeLabels={v.gauge} />
            <SoftwareLinks sw={sw} />
          </>
        }
      />

      {showcase && <SplitterVideoSection />}

      {tx.features.length > 0 && (
        <section className="fx-sec" aria-labelledby="fx-swd-feat">
          <div className="fx-wrap">
            <FxSectionHead id="fx-swd-feat" eyebrow={t('software.features')} title={tx.tagline || sw.name} />
            <div className="fx-feat">
              {tx.features.map(([a, b], n) => (
                <div key={n} className="fx-feat__item"><h3>{a}</h3><p>{b}</p></div>
              ))}
            </div>
          </div>
        </section>
      )}

      {showcase && <SplitterShowcase />}

      {(flow.length > 0 || tx.facts.length > 0 || related.length > 0) && (
        <section className={`fx-sec ${showcase ? 'fx-sec--tight' : 'fx-sec--alt'}`}>
          <div className="fx-wrap">
            {flow.length > 0 && (
              <div className="fx-block">
                <h2>{t('software.how')}</h2>
                <div className="fx-block__body">
                  <ol className={flowClass(flow.length)}>
                    {flow.map(([a, b], n) => <li key={n}><b>{a}</b><span>{b}</span></li>)}
                  </ol>
                </div>
              </div>
            )}
            {(tx.facts.length > 0 || sw.repo) && (
              <div className="fx-block">
                <h2>{t('software.tech')}</h2>
                <div className="fx-block__body">
                  {tx.facts.length > 0 && (
                    <div className="fx-table-wrap">
                      <table className="fx-spec-table fx-spec-table--fluid">
                        <tbody>
                          {tx.facts.map(([a, b], n) => <tr key={n}><th scope="row">{a}</th><td>{b}</td></tr>)}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {sw.repo && <a className="fx-tag fx-sw-source" href={sw.repo} target="_blank" rel="noopener noreferrer">{t('software.source')}</a>}
                </div>
              </div>
            )}
            {related.length > 0 && (
              <div className="fx-block">
                <h2>{t('software.relatedServices')}</h2>
                <div className="fx-block__body">
                  <div className="fx-chips">
                    {related.map((s) => (
                      <Link key={s.slug} className="fx-chip" href={serviceHref(lang, s)}>
                        <ServiceIcon name={s.icon} />
                        {s.text[L].name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section className="fx-sec fx-sec--tight" aria-labelledby="fx-swd-others">
          <div className="fx-wrap">
            <h2 className="fx-callout__ref fx-sw-others__head" id="fx-swd-others">
              <span className="fx-eyebrow">{t('software.others')}</span>
            </h2>
            <div className={`fx-sw-pair ${others.length === 1 ? 'fx-sw-pair--solo' : others.length === 3 ? 'fx-sw-pair--trio' : ''}`}>
              {others.map((o) => <SoftwareCard key={o.slug} sw={o} lang={lang} />)}
            </div>
          </div>
        </section>
      )}

      <QuoteBand lang={lang} />
    </>
  )
}
