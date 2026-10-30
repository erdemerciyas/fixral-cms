'use client'

/**
 * Hizmetler (redesign 2026): liste sayfası ve hizmet detay sayfası görünümleri.
 * İçerik panelden gelir (Yönetim → Hizmetler, "Web sitesi" alanları ve
 * Site İçeriği → Sayfa başlıkları); kayıt yoksa `@/content/fixral` kataloğu
 * kullanılır. Kaydın uzun açıklaması ve görseli "Hizmet hakkında" bloğudur.
 */
import Image from 'next/image'
import Link from 'next/link'
import PageHero from '@/components/common/PageHero'
import HTMLContent from '@/components/HTMLContent'
import { useAppTranslations } from '@/hooks/useAppTranslations'
import { DISCIPLINES, serviceHref, softwareHref, toFxLocale } from '@/content/fixral'
import { serviceAbout, type FxService, type FxSoftware } from '@/content/fx-data'
import { useFx } from '@/components/fx/FxData'
import { ServiceIcon } from '@/components/fx/FxIcons'
import { FxSectionHead } from '@/components/fx/FxSectionHead'
import { PartViewer } from '@/components/fx/FxVisuals'
import { QuoteBand } from '@/components/fx/home/HomeSections'
import { DisciplinesSection } from '@/components/fx/home/ServicesSections'

/** fx-flow sütun sayısı adım sayısına göre (3–6) */
export const flowClass = (n: number) => `fx-flow fx-flow--n${Math.min(6, Math.max(3, n))}`

function useCrumbs(lang: string) {
  const { t } = useAppTranslations('breadcrumb')
  const L = toFxLocale(lang)
  return {
    home: { label: t('home'), href: `/${L}` },
    services: { label: t('services'), href: `/${L}/services` },
    software: { label: t('software'), href: `/${L}/software` },
  }
}

/* ------------------------------------------------------------------ /services */

export function ServicesIndexView({ lang }: { lang: string }) {
  const { t } = useAppTranslations('fx')
  const fx = useFx(lang)
  const { L } = fx
  const head = fx.page('services')
  const c = useCrumbs(lang)
  const combosHead = fx.site.combos.head[L]
  // Panelde (Site İçeriği → Hizmetler sayfası) tanımlı yollar; hizmetlerinden biri sitede yoksa yol gösterilmez
  const combos = fx.site.combos.items.flatMap((combo, i) => {
    const items = combo.services.map((k) => fx.service(k)).filter((x): x is FxService => Boolean(x))
    return items.length > 0 && items.length === combo.services.length ? [{ id: i, items, text: combo.text[L] }] : []
  })
  return (
    <>
      <PageHero
        badge={head.eyebrow}
        title={head.title}
        description={head.lede}
        crumbs={[c.home, c.services]}
      />
      <DisciplinesSection lang={lang} alt={false} />
      {combos.length > 0 && <section className="fx-sec fx-sec--alt" aria-labelledby="fx-combos-title">
        <div className="fx-wrap">
          <FxSectionHead id="fx-combos-title" eyebrow={combosHead.eyebrow} title={combosHead.title} />
          {combos.map((combo) => (
            <div key={combo.id} className="fx-block">
              <h3>{combo.text.name}</h3>
              <div className="fx-block__body">
                <ol className="fx-svc-path" aria-label={t('svcPage.pathLabel')}>
                  {combo.items.map((s, i) => {
                    return (
                      <li key={s.slug}>
                        {i > 0 && <span className="fx-svc-path__sep" aria-hidden="true">→</span>}
                        <Link href={serviceHref(lang, s)}>{s.text[L].name}</Link>
                      </li>
                    )
                  })}
                </ol>
                {combo.text.body && <p>{combo.text.body}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>}
      <QuoteBand lang={lang} />
    </>
  )
}

/* ----------------------------------------------------------- /services/[slug] */

function SoftwareMini({ sw, lang }: { sw: FxSoftware; lang: string }) {
  const tx = sw.text[toFxLocale(lang)]
  return (
    <Link className="fx-sw-mini" href={softwareHref(lang, sw)}>
      <span className="fx-eyebrow">{tx.kicker}</span>
      <b>{sw.name}</b>
      <span className="fx-small fx-muted">{tx.tagline}</span>
    </Link>
  )
}

export function ServiceDetailView({ lang, slug }: { lang: string; slug: string }) {
  const { t } = useAppTranslations('fx')
  const fx = useFx(lang)
  const { L } = fx
  const c = useCrumbs(lang)
  const s = fx.service(slug)
  if (!s) return null
  const tx = s.text[L]
  const disc = DISCIPLINES.find((d) => d.id === s.discipline) ?? DISCIPLINES[0]
  const discText = fx.discipline(disc.id)
  const siblings = fx.byDiscipline(s.discipline).filter((o) => o.slug !== s.slug)
  const software = s.software.map((id) => fx.software.find((x) => x.slug === id)).filter((x): x is FxSoftware => Boolean(x))
  const about = serviceAbout(s, L)

  return (
    <>
      <PageHero
        badge={`${disc.en} · ${discText.name}`}
        title={tx.name}
        description={tx.lede}
        crumbs={[c.home, c.services, { label: tx.name, href: serviceHref(lang, s) }]}
        aside={
          <>
            <PartViewer part={s.part} mode={s.viz} label={t('services.vizLabel', { name: tx.name })} />
            {s.files.length > 0 && (
              <div className="fx-svc-files">
                <span className="fx-tag">{t('services.files')}</span>
                <div className="fx-badges">
                  {s.files.map((f, n) => <span key={n} className="fx-badge">{f}</span>)}
                </div>
              </div>
            )}
          </>
        }
      />

      <section className="fx-sec fx-svc-detail">
        <div className="fx-wrap">
          {tx.when.length > 0 && (
            <div className="fx-block">
              <h2>{t('services.when')}</h2>
              <div className="fx-block__body">
                <ul className="fx-ticks">{tx.when.map((w, n) => <li key={n}>{w}</li>)}</ul>
              </div>
            </div>
          )}

          {tx.flow.length > 0 && (
            <div className="fx-block">
              <h2>{t('services.how')}</h2>
              <div className="fx-block__body">
                <ol className={flowClass(tx.flow.length)}>
                  {tx.flow.map(([a, b], n) => <li key={n}><b>{a}</b><span>{b}</span></li>)}
                </ol>
              </div>
            </div>
          )}

          {tx.spec.length > 0 && (
            <div className="fx-block">
              <h2>{t('services.limits')}</h2>
              <div className="fx-block__body">
                <div className="fx-table-wrap">
                  <table className="fx-spec-table fx-spec-table--fluid">
                    <tbody>
                      {tx.spec.map(([a, b], n) => <tr key={n}><th scope="row">{a}</th><td>{b}</td></tr>)}
                    </tbody>
                  </table>
                </div>
                <span className="fx-ph-note">{t('services.limitsNote')}</span>
              </div>
            </div>
          )}

          {software.length > 0 && (
            <div className="fx-block">
              <h2>{t('services.ownSoftware')}</h2>
              <div className="fx-block__body">
                <div className="fx-sw-minis" role="group" aria-label={t('svcPage.softwareLabel')}>
                  {software.map((sw) => <SoftwareMini key={sw.slug} sw={sw} lang={lang} />)}
                </div>
              </div>
            </div>
          )}

          {siblings.length > 0 && (
            <div className="fx-block">
              <h2>{t('services.sameDiscipline')}</h2>
              <div className="fx-block__body">
                <div className="fx-chips">
                  {siblings.map((o) => (
                    <Link key={o.slug} className="fx-chip" href={serviceHref(lang, o)}>
                      <ServiceIcon name={o.icon} />
                      {o.text[L].name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {about && (about.html || about.image) && (
            <div className="fx-block">
              <h2>{t('services.more')}</h2>
              <div className="fx-block__body">
                {about.image && (
                  <div className="fx-svc-about__img">
                    <Image
                      src={about.image}
                      alt={t('svcPage.aboutImageAlt', { name: about.title || tx.name })}
                      fill
                      sizes="(max-width: 900px) 100vw, 820px"
                    />
                  </div>
                )}
                {about.html && <HTMLContent content={about.html} className="fx-svc-about__text" />}
              </div>
            </div>
          )}
        </div>
      </section>

      <QuoteBand lang={lang} presetService={s.key} />
    </>
  )
}
