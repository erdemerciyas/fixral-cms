/**
 * 2D canvas gösterimleri — Router Studio takım yolu ve ESP32-S3 OBD-II göstergesi.
 * three.js gerektirmez; görünür değilken çizim durur.
 */
import { MARK_PATHS } from '../FxLogo'
import { pathToPoints, prefersReducedMotion, type SceneHandle } from './core'

const watch = (el: Element, st: { visible: boolean }) => {
  const io = new IntersectionObserver(([e]) => { st.visible = e.isIntersecting })
  io.observe(el)
  return io
}

type Pt = [number, number]

/** FX işareti için tarama cebi + kontur hareketleri (işaret uzayı 364 × 180). */
export function markToolpath(): [Pt, Pt][] {
  const polys = [MARK_PATHS.body, MARK_PATHS.up, MARK_PATHS.dn].map(pathToPoints)
  const moves: [Pt, Pt][] = []
  const step = 7
  polys.forEach((poly) => {
    let flip = false
    const ys = poly.map((p) => p[1])
    const y0 = Math.min(...ys) + 3, y1 = Math.max(...ys) - 3
    for (let y = y0; y <= y1; y += step) {
      const xs: number[] = []
      for (let i = 0; i < poly.length; i++) {
        const [ax, ay] = poly[i], [bx, by] = poly[(i + 1) % poly.length]
        if ((ay <= y && by > y) || (by <= y && ay > y)) xs.push(ax + ((y - ay) / (by - ay)) * (bx - ax))
      }
      xs.sort((a, b) => a - b)
      const segs: [number, number][] = []
      for (let i = 0; i + 1 < xs.length; i += 2) if (xs[i + 1] - xs[i] > 6) segs.push([xs[i] + 3, xs[i + 1] - 3])
      ;(flip ? segs.reverse() : segs).forEach(([a, b]) => moves.push(flip ? [[b, y], [a, y]] : [[a, y], [b, y]]))
      flip = !flip
    }
    for (let i = 0; i < poly.length; i++) moves.push([poly[i], poly[(i + 1) % poly.length]])
  })
  return moves
}

/* Router Studio: FX işareti içinde tarama cebi + kontur takım yolu (üstten görünüm) */
export function createToolpath(cv: HTMLCanvasElement, onHud?: (text: string) => void): SceneHandle {
  const REDUCED = prefersReducedMotion()
  const moves = markToolpath()
  const lens = moves.map(([a, b]) => Math.hypot(b[0] - a[0], b[1] - a[1]))
  const total = lens.reduce((a, b) => a + b, 0)
  const ctx = cv.getContext('2d')!
  const st = { visible: true }
  let raf = 0, w = 0, h = 0, dpr = 1, lastHud = 0
  const t0 = performance.now()
  const size = () => { dpr = Math.min(window.devicePixelRatio || 1, 2); w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr }
  size()
  const ro = new ResizeObserver(size)
  ro.observe(cv)
  const io = watch(cv, st)
  const draw = (now: number) => {
    raf = requestAnimationFrame(draw)
    if (!st.visible || !w) return
    const dur = 11
    const k = REDUCED ? 1 : Math.min((((now - t0) / 1000) % (dur + 2)) / dur, 1)
    let done = k * total
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)
    ctx.strokeStyle = 'rgba(91,107,134,.18)'
    ctx.lineWidth = 1
    const g = 20
    for (let x = (w % g) / 2; x < w; x += g) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke() }
    for (let y = (h % g) / 2; y < h; y += g) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke() }
    const sc = Math.min((w - 48) / 364, (h - 72) / 180), ox = (w - 364 * sc) / 2, oy = (h - 180 * sc) / 2 - 6
    const P = ([x, y]: Pt): Pt => [ox + x * sc, oy + y * sc]
    ctx.strokeStyle = 'rgba(155,163,175,.35)'
    ctx.setLineDash([4, 4])
    ctx.strokeRect(ox - 12, oy - 12, 364 * sc + 24, 180 * sc + 24)
    ctx.setLineDash([])
    ctx.strokeStyle = 'rgba(155,163,175,.22)'
    ctx.beginPath()
    moves.forEach(([a, b]) => { ctx.moveTo(...P(a)); ctx.lineTo(...P(b)) })
    ctx.stroke()
    ctx.strokeStyle = '#F97316'
    ctx.lineWidth = Math.max(1.25, sc * 2)
    ctx.lineCap = 'round'
    ctx.globalAlpha = 0.9
    ctx.beginPath()
    let tool = P(moves[0][0])
    let hud = ''
    for (let i = 0; i < moves.length && done > 0; i++) {
      const [a, b] = moves[i]
      const f = Math.min(done / lens[i], 1)
      const e: Pt = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]
      ctx.moveTo(...P(a)); ctx.lineTo(...P(e))
      tool = P(e)
      done -= lens[i]
      if (f < 1 || i === moves.length - 1) hud = `X ${e[0].toFixed(2).padStart(6, '0')} Y ${(180 - e[1]).toFixed(2).padStart(6, '0')} Z -1.50 F800`
    }
    ctx.stroke()
    ctx.globalAlpha = 1
    ctx.fillStyle = '#F3F4F6'
    ctx.beginPath(); ctx.arc(tool[0], tool[1], Math.max(4, sc * 5), 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = '#F97316'
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.arc(tool[0], tool[1], Math.max(9, sc * 10), 0, Math.PI * 2); ctx.stroke()
    if (onHud && hud && now - lastHud > 90) { lastHud = now; onHud(hud) }
  }
  raf = requestAnimationFrame(draw)
  return { dispose() { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect() } }
}

/* ESP32-S3 OBD-II: firmware düzeninde yuvarlak gösterge (270° yay, 9 segment vites ışığı, 3 değer kartı) */
export function createGauge(cv: HTMLCanvasElement, labels: { rpm: string; speed: string; coolant: string; volt: string }): SceneHandle {
  const REDUCED = prefersReducedMotion()
  const ctx = cv.getContext('2d')!
  const st = { visible: true }
  let raf = 0, S = 0, dpr = 1
  const t0 = performance.now()
  const size = () => { dpr = Math.min(window.devicePixelRatio || 1, 2); S = cv.clientWidth; cv.width = S * dpr; cv.height = S * dpr }
  size()
  const ro = new ResizeObserver(size)
  ro.observe(cv)
  const io = watch(cv, st)
  const A0 = Math.PI * 0.75, A1 = Math.PI * 2.25, MAX = 8000
  const rr = (x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath()
    if (typeof ctx.roundRect === 'function') ctx.roundRect(x, y, w, h, r)
    else ctx.rect(x, y, w, h)
  }
  const draw = (now: number) => {
    raf = requestAnimationFrame(draw)
    if (!st.visible || !S) return
    const t = (now - t0) / 1000
    const cyc = t % 6
    const rpm = REDUCED ? 3400 : (cyc < 3.6 ? 900 + 6300 * Math.pow(cyc / 3.6, 1.3) : 7200 - 6300 * Math.min((cyc - 3.6) / 1.6, 1)) + Math.sin(t * 9) * 40
    const u = S / 480
    ctx.setTransform(dpr * u, 0, 0, dpr * u, 0, 0)
    ctx.clearRect(0, 0, 480, 480)
    ctx.fillStyle = '#02060A'
    ctx.beginPath(); ctx.arc(240, 240, 240, 0, Math.PI * 2); ctx.fill()
    for (let i = 0; i <= 40; i++) {
      const a = A0 + ((A1 - A0) * i) / 40, r1 = 196, r2 = i % 5 ? 186 : 176
      ctx.strokeStyle = i >= 35 ? '#EF4444' : 'rgba(229,231,235,.45)'
      ctx.lineWidth = i % 5 ? 2 : 3
      ctx.beginPath(); ctx.moveTo(240 + Math.cos(a) * r1, 240 + Math.sin(a) * r1); ctx.lineTo(240 + Math.cos(a) * r2, 240 + Math.sin(a) * r2); ctx.stroke()
    }
    ctx.lineCap = 'round'
    ctx.lineWidth = 18
    ctx.strokeStyle = '#111A24'
    ctx.beginPath(); ctx.arc(240, 240, 212, A0, A1); ctx.stroke()
    const k = Math.min(rpm / MAX, 1)
    let stroke: string | CanvasGradient = '#F97316'
    if (typeof ctx.createConicGradient === 'function') {
      const grad = ctx.createConicGradient(A0, 240, 240)
      grad.addColorStop(0, '#00F0FF'); grad.addColorStop(0.45, '#F97316'); grad.addColorStop(0.75, '#EF4444'); grad.addColorStop(1, '#EF4444')
      stroke = grad
    }
    ctx.strokeStyle = stroke
    ctx.beginPath(); ctx.arc(240, 240, 212, A0, A0 + (A1 - A0) * k); ctx.stroke()
    for (let i = 0; i < 9; i++) {
      const on = rpm > 4500 + i * 300, x = 240 - 4 * 26 + i * 26
      ctx.fillStyle = on ? (i < 3 ? '#00F0FF' : i < 6 ? '#F97316' : '#EF4444') : '#16202B'
      rr(x - 10, 92, 20, 10, 3); ctx.fill()
    }
    ctx.fillStyle = '#F3F4F6'
    ctx.textAlign = 'center'
    ctx.font = '700 92px "Space Grotesk", system-ui, sans-serif'
    ctx.fillText(String(Math.round(rpm / 10) * 10), 240, 250)
    ctx.fillStyle = '#7C8A9A'
    ctx.font = '500 16px "JetBrains Mono", monospace'
    ctx.fillText(labels.rpm, 240, 284)
    const kmh = Math.round(18 + k * 96)
    const stats: [string, string | number][] = [[labels.speed, kmh], [labels.coolant, 88], [labels.volt, '13.9']]
    stats.forEach(([l, v], i) => {
      const x = 240 + (i - 1) * 92
      ctx.fillStyle = '#0B141D'; ctx.strokeStyle = '#1C2A38'; ctx.lineWidth = 1.5
      rr(x - 40, 318, 80, 58, 10); ctx.fill(); ctx.stroke()
      ctx.fillStyle = '#F3F4F6'; ctx.font = '700 22px "Space Grotesk", system-ui'; ctx.fillText(String(v), x, 350)
      ctx.fillStyle = '#7C8A9A'; ctx.font = '400 11px "JetBrains Mono", monospace'; ctx.fillText(l, x, 367)
    })
  }
  raf = requestAnimationFrame(draw)
  return { dispose() { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect() } }
}
