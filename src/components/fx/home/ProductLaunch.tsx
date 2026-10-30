'use client'

/**
 * Hızlı erişim — hero altında öne çıkan iki yazılım (Fixral 3D Splitter,
 * Router Studio). Kartın tamamı ayrıntı sayfasına gider; "Uygulamayı aç"
 * doğrudan uygulamayı yeni sekmede açar. Sahneler three.js ile çizilir,
 * kartın üzerine gelince açılır / hızlanır.
 */
import { useRef } from 'react'
import Link from 'next/link'
import { useAppTranslations } from '@/hooks/useAppTranslations'
import { softwareHref, toFxLocale } from '@/content/fixral'
import type { FxSoftware } from '@/content/fx-data'
import { useFx } from '../FxData'
import { LaunchStage } from '../FxVisuals'
import { ArrowRight, ExternalIcon } from '../FxIcons'
import type { LaunchDrive } from '../three/launch'
import { useSoftwareLabels } from './HomeSections'

function LaunchTile({ sw, lang }: { sw: FxSoftware; lang: string }) {
  const { t } = useAppTranslations('fx')
  const tx = sw.text[toFxLocale(lang)]
  const v = useSoftwareLabels(lang)(sw)
  const drive = useRef<LaunchDrive>({ hover: false, x: 0, y: 0 })
  const aim = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    drive.current.x = ((e.clientX - r.left) / r.width) * 2 - 1
    drive.current.y = ((e.clientY - r.top) / r.height) * 2 - 1
  }
  return (
    // Fare/odak yalnız 3D sahneyi sürer; tıklama hedefi kartı kaplayan bağlantıdır
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <article
      className="fx-launch__tile"
      onPointerEnter={() => { drive.current.hover = true }}
      onPointerLeave={() => { Object.assign(drive.current, { hover: false, x: 0, y: 0 }) }}
      onPointerMove={aim}
      onFocus={() => { drive.current.hover = true }}
      onBlur={() => { drive.current.hover = false }}
    >
      <LaunchStage viz={sw.viz} drive={drive} label={v.label} hud={v.hud} />
      <div className="fx-launch__body">
        <div className="fx-launch__top">
          <span className="fx-eyebrow">{tx.kicker}</span>
          <span className="fx-tag">{tx.status}{sw.version ? ` · v${sw.version}` : ''}</span>
        </div>
        <h3><Link className="fx-launch__link" href={softwareHref(lang, sw)}>{sw.name}</Link></h3>
        <p>{tx.tagline}</p>
        <div className="fx-launch__foot">
          <span className="fx-launch__go" aria-hidden="true">{t('launch.details')} <ArrowRight /></span>
          {sw.url && (
            <a className="fx-btn fx-btn--primary" href={sw.url} target="_blank" rel="noopener noreferrer">
              {t('software.open')} <ExternalIcon />
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

export default function ProductLaunch({ lang }: { lang: string }) {
  const { t } = useAppTranslations('fx')
  const fx = useFx(lang)
  const items = fx.software.filter((s) => s.viz === 'split' || s.viz === 'toolpath').slice(0, 2)
  if (!items.length) return null
  return (
    <section className="fx-launch public-theme public-dark" aria-labelledby="fx-launch-title">
      <div className="fx-wrap">
        <div className="fx-launch__head">
          <p className="fx-eyebrow">{t('launch.eyebrow')}</p>
          <h2 id="fx-launch-title">{t('launch.title')}</h2>
        </div>
        <div className={`fx-launch__grid ${items.length > 1 ? '' : 'fx-launch__grid--solo'}`}>
          {items.map((sw) => <LaunchTile key={sw.slug} sw={sw} lang={lang} />)}
        </div>
      </div>
    </section>
  )
}
