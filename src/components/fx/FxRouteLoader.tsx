'use client'

/**
 * Sayfa yükleyici + rota geçişi (redesign 2026). Bir bölüm oturumda ilk kez
 * açılırken (site ilk yüklemesi dahil) ekranı karşılıklı iki ok panelle (">" soldan, "<" sağdan)
 * kapatır; three.js sahnesinde F gövdesi soldan, turuncu X kolları sağdan gelip
 * çarpışarak FX'i oluşturur. Yeni rota commit olunca paneller ve işaret
 * ayrılarak sayfayı açar. Daha önce açılmış bölümlerde yalnızca yumuşak perde
 * (soft mod) kullanılır. Admin rotalarında devre dışı; hareket azaltma
 * tercihinde 3D sahne yüklenmez, yalnızca solma kullanılır.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { FxMark, FxWordmark } from './FxLogo'
import type { FxLoaderHandle } from './three/loader'

type State = 'boot' | 'cover' | 'hold' | 'reveal' | 'idle'
/** full: FX okları + 3D sahne; soft: hafif perde + küçük işaret */
type Mode = 'full' | 'soft'

const VISITED_KEY = 'fx-loader-visited'
const COVER_MS = 620
const REVEAL_MS = 760
const SOFT_REVEAL_MS = 320
/** Bölüm anahtarı: dil önekinden sonraki ilk segment (/tr/portfolio/x → portfolio) */
const sectionOf = (path: string) => {
  const seg = path.split('/').filter(Boolean)
  if (/^[a-z]{2}$/.test(seg[0] ?? '')) seg.shift()
  return seg[0] ?? ''
}
/** Bölüm bu oturumda ilk kez mi açılıyor? Açıldı olarak işaretler. */
const firstVisit = (path: string) => {
  try {
    const visited: string[] = JSON.parse(sessionStorage.getItem(VISITED_KEY) || '[]')
    const key = sectionOf(path)
    if (visited.includes(key)) return false
    sessionStorage.setItem(VISITED_KEY, JSON.stringify([...visited, key]))
    return true
  } catch {
    return false
  }
}
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function FxRouteLoader() {
  const pathname = usePathname()
  const router = useRouter()
  const isAdmin = pathname?.startsWith('/admin') ?? false
  const [state, setState] = useState<State>('boot')
  const [mode, setModeState] = useState<Mode>('full')
  const modeRef = useRef<Mode>('full')
  const setMode = useCallback((m: Mode) => {
    modeRef.current = m
    setModeState(m)
  }, [])
  const stageRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<FxLoaderHandle | null>(null)
  const sceneLoad = useRef<Promise<FxLoaderHandle | null> | null>(null)
  /** Geçiş başlarken ayrılınan rota; pathname bundan farklılaşınca açılır */
  const leaving = useRef<string | null>(null)
  const busy = useRef(true)
  const booted = useRef(false)

  const getScene = useCallback(() => {
    if (!sceneLoad.current) {
      const el = stageRef.current
      sceneLoad.current = !el || reducedMotion()
        ? Promise.resolve(null)
        : import('./three/loader')
            .then((m) => (sceneRef.current = m.createFxLoader(el)))
            .catch(() => null)
    }
    return sceneLoad.current
  }, [])

  const reveal = useCallback(async () => {
    setState('reveal')
    if (modeRef.current === 'soft') await wait(SOFT_REVEAL_MS)
    else await Promise.all([sceneRef.current?.split(), wait(REVEAL_MS)])
    setState('idle')
    busy.current = false
  }, [])

  /* İlk yükleme: bölüm oturumda ilk kez açılıyorsa tam animasyon, değilse yumuşak solma */
  useEffect(() => {
    if (isAdmin || booted.current) return
    booted.current = true
    const full = firstVisit(location.pathname)
    ;(async () => {
      if (full) {
        const loaded = document.readyState === 'complete'
          ? Promise.resolve()
          : new Promise<void>((r) => window.addEventListener('load', () => r(), { once: true }))
        const scene = await getScene()
        await Promise.all([scene?.assemble(), Promise.race([loaded, wait(4000)]), wait(1500)])
      } else {
        setMode('soft')
      }
      await reveal()
    })()
  }, [isAdmin, getScene, reveal, setMode])

  /* İç bağlantı tıklamaları: Next Link'ten önce (capture) yakalanır.
   * İlk kez açılan bölüm → tam FX geçişi; daha önce açılmış → yumuşak perde,
   * gezinme beklemeden başlar (hızlı geçişlerde perde hiç görünmez: CSS gecikmesi). */
  useEffect(() => {
    if (isAdmin) return
    const go = async (href: string, path: string) => {
      busy.current = true
      leaving.current = location.pathname
      if (firstVisit(path)) {
        setMode('full')
        router.prefetch(href)
        setState('cover')
        const scene = await getScene()
        await Promise.all([scene?.assemble(), wait(COVER_MS)])
        setState('hold')
      } else {
        setMode('soft')
        setState('cover')
      }
      router.push(href)
      // emniyet: rota değişmezse (hata, aynı hedefe yönlendirme) yine aç
      setTimeout(() => {
        if (leaving.current === null) return
        leaving.current = null
        void reveal()
      }, 8000)
    }
    const onClick = (e: MouseEvent) => {
      if (busy.current || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element | null)?.closest?.('a[href]')
      if (!(a instanceof HTMLAnchorElement)) return
      if ((a.target && a.target !== '_self') || a.hasAttribute('download') || a.dataset.noTransition != null) return
      const url = new URL(a.href, location.href)
      if (url.origin !== location.origin || url.pathname === location.pathname) return
      if (/^\/(admin|api)(\/|$)/.test(url.pathname)) return
      e.preventDefault()
      void go(url.pathname + url.search + url.hash, url.pathname)
    }
    window.addEventListener('click', onClick, true)
    return () => window.removeEventListener('click', onClick, true)
  }, [isAdmin, router, getScene, reveal, setMode])

  /* Yeni rota commit oldu → iki kare boyansın, sonra aç */
  useEffect(() => {
    if (leaving.current === null || leaving.current === pathname) return
    leaving.current = null
    requestAnimationFrame(() => requestAnimationFrame(() => void reveal()))
  }, [pathname, reveal])

  useEffect(() => () => sceneRef.current?.dispose(), [])

  if (isAdmin) return null

  return (
    <div className="fx-loader" data-state={state} data-mode={mode} aria-hidden="true">
      <div className="fx-loader__bg" />
      <div className="fx-loader__panel fx-loader__panel--l" />
      <div className="fx-loader__panel fx-loader__panel--r" />
      <div ref={stageRef} className="fx-loader__stage" />
      <div className="fx-loader__brand">
        <FxWordmark className="fx-loader__word" />
        <span className="fx-loader__bar" />
      </div>
      <FxMark className="fx-loader__soft" />
    </div>
  )
}
