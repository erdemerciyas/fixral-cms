'use client'

/**
 * FIXRAL görselleri için React kabukları. three.js ve sahne modülleri yalnızca
 * istemcide, görünür kaba bağlanınca dinamik import ile yüklenir (ayrı chunk).
 * prefers-reduced-motion'da sahneler otomatik dönüş/intro olmadan statik çalışır.
 */
import { useEffect, useRef, useState } from 'react'
import type { PartName, SoftwareViz, VizMode } from '@/content/fixral'
import type { PartSceneHandle, PartState } from './three/scenes'
import type { LaunchDrive } from './three/launch'
import { FxMark } from './FxLogo'

type Handle = { dispose: () => void }

const FLOW_HUD = 'U 30.0 m/s · Re 2.0e6 · Cd 0.300'

function useMount(factory: (el: HTMLDivElement) => Promise<Handle | null>, deps: unknown[] = []) {
  const ref = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let handle: Handle | null = null
    let cancelled = false
    factory(el)
      .then((h) => {
        if (cancelled) { h?.dispose(); return }
        handle = h
        if (h) setReady(true)
      })
      .catch((err) => { console.warn('[fx] 3D sahne yüklenemedi', err) })
    return () => { cancelled = true; handle?.dispose() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return { ref, ready }
}

const webglAvailable = () => {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/* ------------------------------------------------------------------ Hero */

export function HeroStage({ label }: { label: string }) {
  const [read, setRead] = useState({ x: '182.00', y: '090.00', r: '0.0°' })
  const { ref, ready } = useMount(async (el) => {
    if (!webglAvailable()) return null
    const m = await import('./three/scenes')
    return m.createHeroMark(el, {
      onReadout: (x, y, r) => setRead({ x: x.toFixed(2).padStart(6, '0'), y: y.toFixed(2).padStart(6, '0'), r: `${r.toFixed(1)}°` }),
    })
  })
  return (
    <div ref={ref} className="fx-hero__stage" role="img" aria-label={label}>
      {!ready && (
        <div className="fx-fallback-mark">
          <FxMark tone="light" />
        </div>
      )}
      <div className="fx-readout" aria-hidden="true">
        X <span>{read.x}</span> · Y <span>{read.y}</span>
        <br />
        ROT <span>{read.r}</span>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------- Part viewer */

const MODE_KEYS = ['points', 'wire', 'dev', 'solid'] as const

export function PartViewer({
  part,
  mode = 'solid',
  className = 'fx-phero__viz',
  label,
  switcher,
}: {
  part: PartName
  mode?: VizMode
  className?: string
  label: string
  /** Tarama / Model / Sapma / Parça düğmeleri (etiketler sırayla) */
  switcher?: [string, string, string, string]
}) {
  const [current, setCurrent] = useState<VizMode>(mode)
  const handleRef = useRef<PartSceneHandle | null>(null)
  const { ref } = useMount(async (el) => {
    if (!webglAvailable()) return null
    const m = await import('./three/scenes')
    const h = m.createPartScene(el, part, { points: 11000, spin: 0.15, loop: m.loopForMode(mode) })
    const initial: PartState = (m.PART_MODES as Record<string, PartState>)[mode] ?? m.PART_MODES.solid
    h.set(initial)
    handleRef.current = h
    return h
  }, [part, mode])
  const choose = async (k: (typeof MODE_KEYS)[number]) => {
    setCurrent(k)
    const m = await import('./three/scenes')
    handleRef.current?.set(m.PART_MODES[k])
  }
  return (
    <div ref={ref} className={className} role="img" aria-label={label}>
      {switcher && (
        <div className="fx-viewer__modes" role="group">
          {MODE_KEYS.map((k, i) => (
            <button key={k} type="button" aria-pressed={current === k} onClick={() => choose(k)}>
              {switcher[i]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------ Hızlı erişim */

export function LaunchStage({ viz, drive, label, hud }: { viz: SoftwareViz; drive: { readonly current: LaunchDrive }; label: string; hud?: string }) {
  const [read, setRead] = useState(viz === 'toolpath' ? 'X 000.00 Y 000.00 Z +5.00 F800' : viz === 'flow' ? FLOW_HUD : hud)
  const { ref, ready } = useMount(async (el) => {
    if (!webglAvailable()) return null
    const m = await import('./three/launch')
    if (viz === 'split') return m.createSplitLaunch(el, drive)
    if (viz === 'flow') return m.createFlowLaunch(el, drive, setRead)
    return m.createRouterLaunch(el, drive, setRead)
  }, [viz])
  return (
    <div ref={ref} className="fx-launch__stage" role="img" aria-label={label}>
      {!ready && (
        <div className="fx-fallback-mark">
          <FxMark tone="light" />
        </div>
      )}
      {read && <span className="fx-sw-hud fx-mono">{read}</span>}
    </div>
  )
}

/* ----------------------------------------------------------- Software visuals */

export function SoftwareVisual({
  viz,
  label,
  hud,
  gaugeLabels,
}: {
  viz: SoftwareViz
  label: string
  hud?: string
  gaugeLabels?: { rpm: string; speed: string; coolant: string; volt: string }
}) {
  if (viz === 'split') return <SplitVisual label={label} hud={hud} />
  if (viz === 'toolpath') return <ToolpathVisual label={label} />
  if (viz === 'flow') return <FlowVisual label={label} />
  return <GaugeVisual label={label} labels={gaugeLabels ?? { rpm: 'RPM', speed: 'KM/H', coolant: '°C', volt: 'V' }} />
}

function SplitVisual({ label, hud }: { label: string; hud?: string }) {
  const { ref } = useMount(async (el) => {
    if (!webglAvailable()) return null
    const m = await import('./three/scenes')
    return m.createSplitScene(el)
  })
  return (
    <div ref={ref} className="fx-sw-viz fx-sw-viz--3d" role="img" aria-label={label}>
      {hud && <span className="fx-sw-hud fx-mono">{hud}</span>}
    </div>
  )
}

/** CFD Simulator: hızlı erişim sahnesinin kendi kendine dönen hali (etkileşim yok) */
const IDLE_DRIVE = { current: { hover: false, x: 0, y: 0 } } as const

function FlowVisual({ label }: { label: string }) {
  const [hud, setHud] = useState(FLOW_HUD)
  const { ref } = useMount(async (el) => {
    if (!webglAvailable()) return null
    const m = await import('./three/launch')
    return m.createFlowLaunch(el, IDLE_DRIVE, setHud)
  })
  return (
    <div ref={ref} className="fx-sw-viz" role="img" aria-label={label}>
      <span className="fx-sw-hud fx-mono">{hud}</span>
    </div>
  )
}

function ToolpathVisual({ label }: { label: string }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [hud, setHud] = useState('X 000.00 Y 000.00 Z -1.50 F800')
  useEffect(() => {
    const cv = canvas.current
    if (!cv) return
    let h: Handle | null = null
    let cancelled = false
    import('./three/canvas2d').then((m) => {
      if (cancelled) return
      h = m.createToolpath(cv, setHud)
    })
    return () => { cancelled = true; h?.dispose() }
  }, [])
  return (
    <div className="fx-sw-viz" role="img" aria-label={label}>
      <canvas ref={canvas} aria-hidden="true" />
      <span className="fx-sw-hud fx-mono">{hud}</span>
    </div>
  )
}

function GaugeVisual({ label, labels }: { label: string; labels: { rpm: string; speed: string; coolant: string; volt: string } }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = canvas.current
    if (!cv) return
    let h: Handle | null = null
    let cancelled = false
    import('./three/canvas2d').then((m) => {
      if (cancelled) return
      h = m.createGauge(cv, labels)
    })
    return () => { cancelled = true; h?.dispose() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div className="fx-sw-viz fx-sw-viz--gauge" role="img" aria-label={label}>
      <div className="fx-bezel">
        <canvas ref={canvas} aria-hidden="true" />
      </div>
      <span className="fx-sw-hud fx-mono">480 × 480 · LVGL</span>
    </div>
  )
}
