'use client'

/**
 * Fixral 3D Splitter ürün vitrini (yazılım detay sayfasına eklenir):
 * video oynatıcı + bölümler, three.js ile 5 adımlı interaktif kullanım kılavuzu,
 * bağlantı tipleri demosu, ekran görüntüsü galerisi (lightbox), v0.5 notları,
 * canlı klavye kısayolları ve SSS. İçerik: `@/content/splitter-showcase`.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { FxSectionHead } from '@/components/fx/FxSectionHead'
import { ArrowRight, ExternalIcon } from '@/components/fx/FxIcons'
import type { GuideHandle, JointHandle } from '@/components/fx/three/splitter'
import {
  SPLITTER_APP, SPLITTER_FAQ, SPLITTER_JOINTS, SPLITTER_KEYS, SPLITTER_RELEASE, SPLITTER_SHORTS,
  SPLITTER_SHOTS, SPLITTER_STEPS, SPLITTER_VIDEOS, type JointKind,
} from '@/content/splitter-showcase'

const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function webglAvailable() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/** three.js sahnesini görünür kaba bağlar; WebGL yoksa `failed` döner. */
function useScene<T extends { dispose: () => void }>(factory: (el: HTMLDivElement) => Promise<T>) {
  const ref = useRef<HTMLDivElement>(null)
  const handle = useRef<T | null>(null)
  const [state, setState] = useState<'idle' | 'ready' | 'failed'>('idle')
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let cancelled = false
    ;(webglAvailable() ? factory(el) : Promise.reject(null))
      .then((h) => {
        if (cancelled) { h.dispose(); return }
        handle.current = h
        setState('ready')
      })
      .catch((err) => {
        if (err) console.warn('[fx] 3D sahne yüklenemedi', err)
        if (!cancelled) setState('failed')
      })
    return () => { cancelled = true; handle.current?.dispose(); handle.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return { ref, handle, state }
}

/* ------------------------------------------------------------------ Video */

function YouTubeLite({ id, title, start = 0, playing, onPlay, vertical }: { id: string; title: string; start?: number; playing: boolean; onPlay: () => void; vertical?: boolean }) {
  return (
    <div className={`fx-spl-player ${vertical ? 'fx-spl-player--short' : ''}`}>
      {playing ? (
        <iframe
          key={`${id}-${start}`}
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1${start ? `&start=${start}` : ''}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <button type="button" className="fx-spl-player__poster" onClick={onPlay} aria-label={`Videoyu oynat: ${title}`}>
          <Image src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" fill sizes={vertical ? '200px' : '(max-width: 900px) 100vw, 800px'} />
          <span className="fx-spl-player__play" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l10.5-6.5z" /></svg>
          </span>
        </button>
      )}
    </div>
  )
}

export function SplitterVideoSection() {
  const [vi, setVi] = useState(0)
  const [start, setStart] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [short, setShort] = useState<string | null>(null)
  const v = SPLITTER_VIDEOS[vi]
  return (
    <section className="fx-sec fx-sec--tight" aria-labelledby="fx-spl-video">
      <div className="fx-wrap">
        <FxSectionHead id="fx-spl-video" eyebrow="Video · 5 adımda" title="Bir dakikada izleyin" />
        <div className="fx-chips fx-spl-tabs" role="group" aria-label="Video seçimi">
          {SPLITTER_VIDEOS.map((x, i) => (
            <button key={x.id} type="button" className="fx-chip" aria-pressed={i === vi} onClick={() => { setVi(i); setStart(0); setPlaying(false) }}>
              {x.tab}
            </button>
          ))}
        </div>
        <div className="fx-spl-video">
          <YouTubeLite id={v.id} title={v.title} start={start} playing={playing} onPlay={() => setPlaying(true)} />
          <aside className="fx-spl-video__side">
            <h3 className="fx-spl-video__title">{v.title}</h3>
            <ol className="fx-spl-chapters" aria-label="Video bölümleri">
              {v.chapters.map((c) => (
                <li key={c.at}>
                  <button type="button" aria-current={playing && start === c.at ? 'true' : undefined} onClick={() => { setStart(c.at); setPlaying(true) }}>
                    <span className="fx-tag">{fmtTime(c.at)}</span>
                    <span>{c.label}</span>
                  </button>
                </li>
              ))}
            </ol>
            <div className="fx-spl-shorts">
              {SPLITTER_SHORTS.map((s) => (
                <figure key={s.id}>
                  <YouTubeLite id={s.id} title={s.title} playing={short === s.id} onPlay={() => setShort(s.id)} vertical />
                  <figcaption>{s.title}</figcaption>
                </figure>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------- Kullanım kılavuzu */

const STEP_MS = 7000

function SplitterGuide({ openShot }: { openShot: (key: string) => void }) {
  const [step, setStep] = useState(0)
  const [auto, setAuto] = useState(false)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const section = useRef<HTMLElement>(null)
  const { ref, handle, state } = useScene<GuideHandle>(async (el) => {
    const m = await import('@/components/fx/three/splitter')
    return m.createSplitterGuide(el, { height: '412 mm', volume: 'Baskı hacmi 256³ mm' })
  })
  const n = SPLITTER_STEPS.length
  useEffect(() => { handle.current?.setStep(step) }, [step, state, handle])
  // Otomatik oynatma bölüm ilk kez görünür olunca başlar (reduced-motion'da hiç başlamaz)
  useEffect(() => {
    const el = section.current
    if (!el || reducedMotion()) return
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return
      setAuto(true)
      io.disconnect()
    }, { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  useEffect(() => {
    if (!auto) return
    const id = window.setTimeout(() => setStep((s) => (s + 1) % n), STEP_MS)
    return () => window.clearTimeout(id)
  }, [auto, step, n])

  const go = (i: number, focus = false) => {
    const next = (i + n) % n
    setStep(next)
    setAuto(false)
    if (focus) tabs.current[next]?.focus()
  }
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); go(step + 1, true) }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); go(step - 1, true) }
    else if (e.key === 'Home') { e.preventDefault(); go(0, true) }
    else if (e.key === 'End') { e.preventDefault(); go(n - 1, true) }
  }
  const s = SPLITTER_STEPS[step]
  const shot = SPLITTER_SHOTS.find((x) => x.key === s.shot)

  return (
    <section ref={section} className="fx-sec fx-spl-guide public-theme public-dark" aria-labelledby="fx-spl-guide">
      <div className="fx-wrap">
        <FxSectionHead
          id="fx-spl-guide"
          eyebrow="Kullanım kılavuzu · interaktif"
          title="Beş adımda tablaya sığdırın"
          aside={<p className="fx-muted fx-spl-guide__lede">Adımlara tıklayın ya da ok tuşlarıyla gezin; 3D sahneyi sürükleyerek döndürebilirsiniz.</p>}
        />
        <div className="fx-spl-guide__grid">
          <div className="fx-spl-stage" data-state={state}>
            <div ref={ref} className="fx-spl-stage__canvas" role="img" aria-label={`3D kılavuz, adım ${step + 1}: ${s.title}. ${s.short}.`} />
            {state === 'failed' && shot && (
              <Image src={shot.src} alt={shot.caption} fill sizes="(max-width: 1000px) 100vw, 760px" className="fx-spl-stage__fallback" />
            )}
            <div className="fx-spl-stage__hud" aria-hidden="true">
              <span>ADIM {step + 1} / {n}</span>
              <span>{s.short}</span>
            </div>
            <div className="fx-spl-stage__ctrl">
              <button type="button" className="fx-spl-icon" onClick={() => go(step - 1)} aria-label="Önceki adım">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 6l-6 6 6 6" /></svg>
              </button>
              <button type="button" className="fx-spl-icon" onClick={() => setAuto((a) => !a)} aria-pressed={auto} aria-label={auto ? 'Otomatik oynatmayı durdur' : 'Adımları otomatik oynat'}>
                {auto
                  ? <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /></svg>
                  : <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l10.5-6.5z" /></svg>}
              </button>
              <button type="button" className="fx-spl-icon" onClick={() => go(step + 1)} aria-label="Sonraki adım">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
              </button>
              {auto && <span className="fx-spl-progress" key={step} aria-hidden="true" />}
            </div>
          </div>

          <div className="fx-spl-guide__side">
            <div className="fx-spl-steps" role="tablist" aria-label="Kullanım adımları" aria-orientation="vertical">
              {SPLITTER_STEPS.map((x, i) => (
                <button
                  key={x.key}
                  ref={(b) => { tabs.current[i] = b }}
                  type="button"
                  role="tab"
                  id={`fx-spl-tab-${x.key}`}
                  aria-selected={i === step}
                  aria-controls="fx-spl-panel"
                  tabIndex={i === step ? 0 : -1}
                  className="fx-spl-steps__btn"
                  onClick={() => go(i)}
                  onKeyDown={onKey}
                >
                  <span className="fx-spl-steps__n">{i + 1}</span>
                  <span><b>{x.title}</b><small>{x.short}</small></span>
                </button>
              ))}
            </div>
            <div className="fx-spl-panel" role="tabpanel" id="fx-spl-panel" aria-labelledby={`fx-spl-tab-${s.key}`} tabIndex={0}>
              <p>{s.body}</p>
              <ul className="fx-spl-panel__list">
                {s.actions.map((a) => <li key={a}>{a}</li>)}
              </ul>
              <p className="fx-spl-panel__tip"><b>İpucu</b> {s.tip}</p>
              {shot && (
                <button type="button" className="fx-spl-panel__shot" onClick={() => openShot(shot.key)}>
                  <Image src={shot.src} alt="" width={160} height={Math.round((160 * shot.h) / shot.w)} />
                  <span>Uygulamada nasıl görünür? <b>{shot.title}</b> ekran görüntüsünü büyüt</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ----------------------------------------------------------------- Bağlantılar */

function SplitterJoints() {
  const [kind, setKind] = useState<JointKind>('pyramid')
  const { ref, handle, state } = useScene<JointHandle>(async (el) => {
    const m = await import('@/components/fx/three/splitter')
    return m.createJointDemo(el, 'pyramid')
  })
  useEffect(() => { handle.current?.setJoint(kind) }, [kind, handle])
  const j = SPLITTER_JOINTS.find((x) => x.kind === kind)!
  return (
    <section className="fx-sec fx-sec--alt" aria-labelledby="fx-spl-joints">
      <div className="fx-wrap">
        <FxSectionHead id="fx-spl-joints" eyebrow="Birleştirme şablonları" title="Parçalar nasıl birleşir?" />
        <div className="fx-spl-joints">
          <div className="fx-spl-joints__stage" data-state={state}>
            <div ref={ref} className="fx-spl-stage__canvas" role="img" aria-label={`${j.name} bağlantısının açılıp kapanma animasyonu`} />
            {state === 'failed' && <p className="fx-spl-joints__nogl">3D önizleme bu tarayıcıda açılamadı.</p>}
          </div>
          <div className="fx-spl-joints__side">
            <div className="fx-chips" role="group" aria-label="Bağlantı tipi">
              {SPLITTER_JOINTS.map((x) => (
                <button key={x.kind} type="button" className="fx-chip" aria-pressed={x.kind === kind} onClick={() => setKind(x.kind)}>{x.name}</button>
              ))}
            </div>
            <div className="fx-spl-joint" aria-live="polite">
              <h3>{j.name}</h3>
              <p>{j.body}</p>
              <dl className="fx-spec">
                <div className="fx-spec__row"><dt>Ölçü</dt><dd>{j.size}</dd></div>
                <div className="fx-spec__row"><dt>En uygun</dt><dd>{j.best}</dd></div>
                <div className="fx-spec__row"><dt>Satın alınacak</dt><dd>{j.buy ?? 'Yok, parçayla birlikte basılır'}</dd></div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------- Galeri */

function SplitterGallery({ openShot }: { openShot: (key: string) => void }) {
  return (
    <section className="fx-sec" aria-labelledby="fx-spl-gallery">
      <div className="fx-wrap">
        <FxSectionHead id="fx-spl-gallery" eyebrow="Ekran görüntüleri · v0.5" title="Uygulamanın içinden" />
        <ul className="fx-spl-gallery">
          {SPLITTER_SHOTS.map((s) => (
            <li key={s.key}>
              <button type="button" onClick={() => openShot(s.key)} aria-label={`Büyüt: ${s.title}`}>
                <Image src={s.src} alt={s.caption} width={s.w} height={s.h} sizes="(max-width: 560px) 100vw, (max-width: 1000px) 50vw, 25vw" />
              </button>
              <p><b>{s.title}</b> {s.caption}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Lightbox({ index, onClose, onMove }: { index: number | null; onClose: () => void; onMove: (d: number) => void }) {
  const dlg = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = dlg.current
    if (!d) return
    if (index !== null && !d.open) d.showModal()
    if (index === null && d.open) d.close()
  }, [index])
  // Ok tuşlarıyla gezinme; arka plana (dialog'un kendisine) tıklayınca kapanır
  useEffect(() => {
    const d = dlg.current
    if (!d) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') onMove(1)
      if (e.key === 'ArrowLeft') onMove(-1)
    }
    const onClick = (e: MouseEvent) => { if (e.target === d) onClose() }
    d.addEventListener('keydown', onKey)
    d.addEventListener('click', onClick)
    return () => { d.removeEventListener('keydown', onKey); d.removeEventListener('click', onClick) }
  }, [onMove, onClose])
  const s = index !== null ? SPLITTER_SHOTS[index] : null
  return (
    <dialog ref={dlg} className="fx-spl-lightbox" aria-label={s ? s.title : 'Ekran görüntüsü'} onClose={onClose}>
      {s && (
        <figure>
          <Image src={s.src} alt={s.caption} width={s.w} height={s.h} sizes="96vw" />
          <figcaption>
            <span className="fx-tag">{(index ?? 0) + 1} / {SPLITTER_SHOTS.length}</span>
            <span><b>{s.title}</b> {s.caption}</span>
            <span className="fx-spl-lightbox__nav">
              <button type="button" className="fx-spl-icon" onClick={() => onMove(-1)} aria-label="Önceki görüntü">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 6l-6 6 6 6" /></svg>
              </button>
              <button type="button" className="fx-spl-icon" onClick={() => onMove(1)} aria-label="Sonraki görüntü">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
              </button>
              <button type="button" className="fx-spl-icon" onClick={onClose} aria-label="Kapat">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </span>
          </figcaption>
        </figure>
      )}
    </dialog>
  )
}

/* ------------------------------------------------------- v0.5 ve kısayollar */

function SplitterRelease() {
  const [hit, setHit] = useState<string | null>(null)
  useEffect(() => {
    const keys = new Map(SPLITTER_KEYS.map(([k]) => [k.toLowerCase(), k]))
    let timer = 0
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return
      const k = keys.get(e.key.toLowerCase())
      // Enter düğme/bağlantı etkinleştirmesi; yalnız sayfa gövdesindeyken gösterilir
      if (!k || (k === 'Enter' && t && t !== document.body)) return
      setHit(k)
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setHit(null), 1400)
    }
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); window.clearTimeout(timer) }
  }, [])
  const active = SPLITTER_KEYS.find(([k]) => k === hit)
  return (
    <section className="fx-sec fx-sec--alt" aria-labelledby="fx-spl-release">
      <div className="fx-wrap">
        <FxSectionHead id="fx-spl-release" eyebrow={`Sürüm ${SPLITTER_RELEASE.version} · ${SPLITTER_RELEASE.date}`} title="Neler yeni?" />
        <div className="fx-spl-release">
          <div className="fx-feat fx-spl-release__list">
            {SPLITTER_RELEASE.items.map(([a, b]) => (
              <div key={a} className="fx-feat__item"><h3>{a}</h3><p>{b}</p></div>
            ))}
          </div>
          <div className="fx-spl-keys">
            <h3>Klavye kısayolları</h3>
            <p className="fx-muted">Bu sayfada da deneyin: bir tuşa basın, karşılığı yanar.</p>
            <ul>
              {SPLITTER_KEYS.map(([k, d]) => (
                <li key={k} data-hit={hit === k ? 'true' : undefined}>
                  <kbd>{k}</kbd><span>{d}</span>
                </li>
              ))}
            </ul>
            <p className="fx-spl-keys__live" aria-live="polite">{active ? `${active[0]}: ${active[1]}` : ' '}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------- SSS */

function SplitterFaq() {
  return (
    <section className="fx-sec" aria-labelledby="fx-spl-faq">
      <div className="fx-wrap fx-spl-faq">
        <div className="fx-spl-faq__head">
          <FxSectionHead id="fx-spl-faq" eyebrow="Sıkça sorulanlar" title="Merak edilenler" />
          <a className="fx-btn fx-btn--primary" href={SPLITTER_APP} target="_blank" rel="noopener noreferrer">
            Ücretsiz deneyin <ExternalIcon />
          </a>
        </div>
        <div className="fx-spl-faq__list">
          {SPLITTER_FAQ.map(([q, a]) => (
            <details key={q}>
              <summary>{q}<ArrowRight /></summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------- Vitrin */

export function SplitterShowcase() {
  const [shot, setShot] = useState<number | null>(null)
  const openShot = useCallback((key: string) => {
    const i = SPLITTER_SHOTS.findIndex((s) => s.key === key)
    if (i >= 0) setShot(i)
  }, [])
  const close = useCallback(() => setShot(null), [])
  const move = useCallback((d: number) => setShot((i) => (i === null ? i : (i + d + SPLITTER_SHOTS.length) % SPLITTER_SHOTS.length)), [])
  return (
    <>
      <SplitterGuide openShot={openShot} />
      <SplitterJoints />
      <SplitterGallery openShot={openShot} />
      <SplitterRelease />
      <SplitterFaq />
      <Lightbox index={shot} onClose={close} onMove={move} />
    </>
  )
}
