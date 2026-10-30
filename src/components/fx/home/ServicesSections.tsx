'use client'

import Link from 'next/link'
import { useAppTranslations } from '@/hooks/useAppTranslations'
import { DISCIPLINES, serviceHref } from '@/content/fixral'
import { useFx } from '../FxData'
import { ArrowUpRight, ServiceIcon } from '../FxIcons'
import { FxSectionHead } from '../FxSectionHead'

/** Hizmet şeridi — sekiz hizmet, marka ikonlarıyla (ServiceStrip bileşeni) */
export function ServiceStrip({ lang }: { lang: string }) {
  const { t } = useAppTranslations('fx')
  const { L, services } = useFx(lang)
  return (
    <nav className="fx-strip public-theme public-dark" aria-label={t('strip.label')}>
      <div className={`fx-wrap fx-strip__in ${services.length !== 8 ? 'fx-strip__in--auto' : ''}`}>
        {services.map((s) => (
          <Link key={s.key} href={serviceHref(lang, s)}>
            <ServiceIcon name={s.icon} />
            <span>{s.text[L].name.replace(/ (ve|y) (CAM|3D Çizim|dibujo 3D)$/, '')}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}

/** Disiplin dizini — sloganın üç ayağı altında sekiz hizmet */
export function DisciplinesSection({ lang, alt = true, showHead = true }: { lang: string; alt?: boolean; showHead?: boolean }) {
  const fx = useFx(lang)
  const { L } = fx
  const head = fx.section('services')
  return (
    <section className={`fx-sec ${alt ? 'fx-sec--alt' : ''}`} aria-labelledby={showHead ? 'fx-svc-title' : undefined} id="hizmetler">
      <div className="fx-wrap">
        {showHead && (
          <FxSectionHead
            id="fx-svc-title"
            eyebrow={head.eyebrow}
            title={head.title}
            aside={head.lede ? <p className="fx-lede fx-lede--narrow">{head.lede}</p> : undefined}
          />
        )}
        <div className="fx-disc">
          {DISCIPLINES.map((d) => (
            <div key={d.id} className="fx-disc__col">
              <div className="fx-disc__head">
                <span className="fx-tag">{d.en}</span>
                <h3 className="fx-h3">{fx.discipline(d.id).name}</h3>
                <p>{fx.discipline(d.id).body}</p>
              </div>
              {fx.byDiscipline(d.id).map((s) => {
                const key = s.key
                return (
                  <Link key={key} className="fx-svc" href={serviceHref(lang, s)}>
                    <span className="fx-svc__icon">
                      <ServiceIcon name={s.icon} />
                    </span>
                    <span className="fx-svc__body">
                      <span className="fx-svc__name">{s.text[L].name}</span>
                      <span className="fx-svc__short">{s.text[L].short}</span>
                      <span className="fx-badges">
                        {s.files.slice(0, 3).map((f) => (
                          <span key={f} className="fx-badge">{f}</span>
                        ))}
                      </span>
                    </span>
                    <span className="fx-svc__arrow">
                      <ArrowUpRight />
                    </span>
                  </Link>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
