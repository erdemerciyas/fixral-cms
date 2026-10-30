'use client'

/**
 * Süreç sahnesi — Tara → Modelle → Doğrula → Üret. Sol kolonda adımlar akışta
 * (her zaman okunur), sağda yapışkan 3D sahne kaydırma ilerlemesine göre
 * nokta bulutundan basılmış parçaya dönüşür. reduced-motion'da otomatik dönüş yok.
 */
import { useEffect, useRef, useState } from 'react'
import { useAppTranslations } from '@/hooks/useAppTranslations'
import { useFx } from '../FxData'
import type { PartSceneHandle } from '../three/scenes'

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const smooth = (a: number, b: number, t: number) => { const x = clamp((t - a) / (b - a), 0, 1); return x * x * (3 - 2 * x) }

export default function ProcessSection({ lang, headingLevel = 2 }: { lang: string; headingLevel?: 1 | 2 }) {
  const { t } = useAppTranslations('fx')
  const fx = useFx(lang)
  const { L } = fx
  const steps = fx.site.process[L]
  const head = fx.section('process')
  const total = steps.length
  const stageRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)
  const barsRef = useRef<HTMLSpanElement[]>([])
  const [active, setActive] = useState(0)
  const [hud, setHud] = useState('')
  const H = headingLevel === 1 ? 'h1' : 'h2'

  useEffect(() => {
    const el = stageRef.current
    const stepsEl = stepsRef.current
    if (!el || !stepsEl) return
    let scene: PartSceneHandle | null = null
    let cancelled = false
    let ticking = false
    let lastStep = -1
    const nf = new Intl.NumberFormat('tr-TR')
    const update = () => {
      const vh = window.innerHeight
      let s = 0
      stepsEl.querySelectorAll<HTMLElement>('[data-step]').forEach((node) => {
        const r = node.getBoundingClientRect()
        s += clamp((vh * 0.62 - r.top) / r.height, 0, 1)
      })
      const scanT = smooth(0, 1, s)
      if (scene) {
        const { yMin, yMax } = scene
        scene.set({
          scan: lerp(yMax + 0.1, yMin - 0.1, scanT),
          laser: s < 1.05 ? 1 - smooth(0.95, 1.05, s) : 0,
          points: s < 1 ? 1 : s < 2 ? lerp(1, 0.22, smooth(1, 1.6, s)) : s < 3 ? lerp(0.22, 1, smooth(2, 2.4, s)) : lerp(1, 0, smooth(3, 3.3, s)),
          wire: s < 1 ? 0.1 : s < 2 ? lerp(0.1, 0.95, smooth(1, 1.6, s)) : s < 3 ? lerp(0.95, 0.25, smooth(2, 2.4, s)) : lerp(0.25, 0.1, smooth(3, 3.4, s)),
          dev: s < 2 ? 0 : s < 3 ? smooth(2, 2.4, s) : 1 - smooth(3, 3.3, s),
          solid: smooth(3, 3.15, s),
          build: smooth(3.05, 3.9, s),
        })
      }
      barsRef.current.forEach((b, i) => { if (b) b.style.transform = `scaleX(${clamp(s - i, 0, 1)})` })
      const step = clamp(Math.floor(s), 0, Math.max(0, stepsEl.querySelectorAll('[data-step]').length - 1))
      if (step !== lastStep) { lastStep = step; setActive(step) }
      const vals = [
        `${t('process.points')} ${nf.format(Math.round(scanT * 2412880))}`,
        `${t('process.edges')} ${Math.round(clamp(s - 1, 0, 1) * 412)} · ${t('process.faces')} ${Math.round(clamp(s - 1, 0, 1) * 96)}`,
        `${t('process.maxDev')} ±0,04 mm`,
        `${t('process.layer')} ${Math.round(smooth(3.05, 3.9, s) * 180)} / 180`,
      ]
      setHud(vals[Math.min(step, 3)])
    }
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => { ticking = false; update() })
    }
    const webgl = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch { return false } })()
    if (webgl) {
      import('../three/scenes').then((m) => {
        if (cancelled) return
        scene = m.createPartScene(el, 'gear', { points: 16000, spin: 0.12 })
        update()
      }).catch((e) => console.warn('[fx] süreç sahnesi yüklenemedi', e))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    update()
    return () => {
      cancelled = true
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      scene?.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [L])

  const modes = [t('process.modeScan'), t('process.modeModel'), t('process.modeVerify'), t('process.modeMake')]

  return (
    <section className="fx-proc public-theme public-dark" aria-labelledby="fx-proc-title" id="surec">
      <div className="fx-wrap fx-proc__in">
        <div className="fx-proc__steps" ref={stepsRef}>
          <div className="fx-proc__intro">
            <div className="fx-callout__ref"><span className="fx-eyebrow">{head.eyebrow}</span></div>
            <H className="fx-h2" id="fx-proc-title">{head.title}</H>
            {head.lede && <p className="fx-lede">{head.lede}</p>}
          </div>
          <ol className="fx-proc__list">
            {steps.map((s, i) => (
              <li key={i} className={`fx-step ${active === i ? 'is-active' : ''}`} data-step={i}>
                <div className="fx-step__no"><b>{i + 1}</b><span>{t('process.step')} {i + 1} {t('process.of')} {total}</span></div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
                <dl className="fx-spec">
                  {s.spec.map(([a, b]) => (
                    <div key={a} className="fx-spec__row"><dt>{a}</dt><dd>{b}</dd></div>
                  ))}
                </dl>
              </li>
            ))}
          </ol>
        </div>
        <div className="fx-proc__stage">
          <div className="fx-proc__canvas" ref={stageRef} role="img" aria-label={`${head.title} — ${modes[Math.min(active, 3)]}`}>
            <div className="fx-hud fx-hud--top" aria-hidden="true">
              <span className="fx-live">{modes[Math.min(active, 3)]}</span>
              <span>{t('process.part')} · <b>Ø64</b></span>
            </div>
            <div className="fx-progress" aria-hidden="true">
              {steps.map((s, i) => (
                <span key={i}><i ref={(n) => { if (n) barsRef.current[i] = n }} /></span>
              ))}
            </div>
            <div className="fx-hud fx-hud--bot" aria-hidden="true">
              <span>{hud}</span>
              {Math.min(active, 3) === 2 && <span className="fx-legend">-0,05<i />+0,05 mm</span>}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
