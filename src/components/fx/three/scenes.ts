/**
 * FIXRAL sahneleri — HeroMark (3D FX işareti), PartScene (tarama / model /
 * sapma / baskı) ve SplitScene (Fixral 3D Splitter gösterimi).
 * Her fabrika bir DOM kabına canvas ekler ve { dispose } döndürür.
 */
import { MARK_PATHS } from '../FxLogo'
import {
  THREE, C, clamp, lerp, ease, prefersReducedMotion, pathToShape, PARTS, samplePoints, pointsMaterial,
  baseRenderer, addLights, dragYaw, watchVisibility, disposeScene, vaseProfile,
  type PartName, type OrbitState, type SceneHandle,
} from './core'

/* ------------------------------------------------------------------ HeroMark */

export interface HeroMarkOptions {
  /** İmleç konumu (0–364, 0–180) ve dönüş açısı için geri çağırım */
  onReadout?: (x: number, y: number, rotDeg: number) => void
}

export function createHeroMark(el: HTMLElement, opts: HeroMarkOptions = {}): SceneHandle {
  const REDUCED = prefersReducedMotion()
  const scene = new THREE.Scene()
  const renderer = baseRenderer(el)
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
  camera.position.set(0, 0.2, 9.2)
  addLights(scene)
  const s = 0.01, ox = 182, oy = 90
  const ext = { depth: 0.38, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.02, bevelSegments: 2 }
  const mk = (d: string, color: number, rough: number) => {
    const g = new THREE.ExtrudeGeometry(pathToShape(d, s, ox, oy), ext)
    g.translate(0, 0, -0.19)
    return new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0.12 }))
  }
  const root = new THREE.Group()
  const tilt = new THREE.Group()
  scene.add(tilt)
  tilt.add(root)
  const body = mk(MARK_PATHS.body, 0xe9ecf0, 0.5)
  const up = mk(MARK_PATHS.up, C.orange, 0.45)
  const dn = mk(MARK_PATHS.dn, C.orange, 0.45)
  root.add(body, up, dn)
  const ghost = new THREE.Group()
  ;[MARK_PATHS.body, MARK_PATHS.up, MARK_PATHS.dn].forEach((d) => {
    const g = new THREE.EdgesGeometry(new THREE.ShapeGeometry(pathToShape(d, s, ox, oy)))
    ghost.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: C.line, transparent: true, opacity: 0.55 })))
  })
  ghost.position.z = -0.75
  root.add(ghost)
  const dl: number[] = []
  const W = 1.82, H = 0.9
  const seg = (a: number[], b: number[]) => dl.push(...a, ...b)
  seg([-W, H + 0.22, 0], [W, H + 0.22, 0]); seg([-W, H + 0.1, 0], [-W, H + 0.34, 0]); seg([W, H + 0.1, 0], [W, H + 0.34, 0])
  seg([-W - 0.22, -H, 0], [-W - 0.22, H, 0]); seg([-W - 0.1, -H, 0], [-W - 0.34, -H, 0]); seg([-W - 0.1, H, 0], [-W - 0.34, H, 0])
  const dg = new THREE.BufferGeometry()
  dg.setAttribute('position', new THREE.Float32BufferAttribute(dl, 3))
  root.add(new THREE.LineSegments(dg, new THREE.LineBasicMaterial({ color: C.line, transparent: true, opacity: 0.9 })))
  const fp: number[] = []
  for (let i = -14; i <= 14; i++) for (let j = -8; j <= 8; j++) fp.push(i * 0.28, -1.55, j * 0.28)
  const fg = new THREE.BufferGeometry()
  fg.setAttribute('position', new THREE.Float32BufferAttribute(fp, 3))
  tilt.add(new THREE.Points(fg, new THREE.PointsMaterial({ color: C.line, size: 0.022, transparent: true, opacity: 0.55 })))

  const labels = ([['364', [0, H + 0.36, 0], 'W'], ['180', [-W - 0.5, 0, 0], 'H'], ['45°', [1.15, 0.62, 0.2], 'α']] as [string, number[], string][]).map(([t, p, k]) => {
    const d = document.createElement('span')
    d.className = 'fx-dim'
    d.setAttribute('aria-hidden', 'true')
    d.innerHTML = `<b>${k}</b> ${t}`
    el.appendChild(d)
    return { d, v: new THREE.Vector3(p[0], p[1], p[2]) }
  })
  const st: OrbitState & { mx: number; my: number; split: number; hover: boolean } = { yaw: -0.35, pitch: 0.08, vy: 0, dragging: false, visible: true, mx: 0, my: 0, split: 0, hover: false }
  const offDrag = dragYaw(renderer.domElement, st)
  const io = watchVisibility(el, st)
  const onMove = (e: PointerEvent) => {
    const r = el.getBoundingClientRect()
    st.mx = ((e.clientX - r.left) / r.width) * 2 - 1
    st.my = ((e.clientY - r.top) / r.height) * 2 - 1
    st.hover = true
    opts.onReadout?.(clamp((st.mx + 1) / 2, 0, 1) * 364, clamp((st.my + 1) / 2, 0, 1) * 180, st.yaw * 57.2958)
  }
  const onLeave = () => { st.hover = false; st.mx = 0; st.my = 0 }
  el.addEventListener('pointermove', onMove)
  el.addEventListener('pointerleave', onLeave)
  const size = () => {
    const w = el.clientWidth, h = el.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.position.z = w / h < 1.1 ? 10.8 : 8.4
    camera.updateProjectionMatrix()
  }
  size()
  const ro = new ResizeObserver(size)
  ro.observe(el)
  const v = new THREE.Vector3()
  const t0 = performance.now()
  let last = t0, raf = 0
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame)
    if (!st.visible) return
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    const t = (now - t0) / 1000
    const intro = REDUCED ? 1 : ease(t / 1.6)
    const introB = REDUCED ? 1 : ease((t - 0.5) / 1.3)
    body.scale.z = Math.max(0.02, intro)
    ghost.position.z = lerp(0, -0.75, intro)
    const target = st.hover ? 1 : REDUCED ? 0 : Math.sin(t * 0.8) > 0.6 ? 1 : 0
    st.split = lerp(st.split, target, 1 - Math.pow(0.02, dt))
    const sp = st.split * 0.16, slide = (1 - introB) * 1.6
    up.position.set(sp + slide, sp, 0)
    dn.position.set(sp + slide, -sp, 0)
    if (!st.dragging) {
      const aim = REDUCED ? -0.35 : -0.35 + st.mx * 0.35 + Math.sin(t * 0.35) * 0.12
      st.yaw = lerp(st.yaw, aim, 1 - Math.pow(0.15, dt))
      st.pitch = lerp(st.pitch, 0.08 + st.my * 0.12, 1 - Math.pow(0.15, dt))
    }
    root.rotation.y = st.yaw
    tilt.rotation.x = st.pitch
    if (!REDUCED) root.position.y = Math.sin(t * 0.9) * 0.04
    renderer.render(scene, camera)
    const w = el.clientWidth, h = el.clientHeight
    labels.forEach(({ d, v: p }) => {
      v.copy(p)
      root.localToWorld(v)
      v.project(camera)
      d.style.transform = `translate(${(v.x * 0.5 + 0.5) * w}px, ${(-v.y * 0.5 + 0.5) * h}px) translate(-50%,-50%)`
      d.style.opacity = String(intro)
    })
  }
  raf = requestAnimationFrame(frame)
  return {
    dispose() {
      cancelAnimationFrame(raf)
      io.disconnect(); ro.disconnect(); offDrag()
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      labels.forEach(({ d }) => d.remove())
      disposeScene(scene)
      renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove()
    },
  }
}

/* ----------------------------------------------------------------- PartScene */

export interface PartState { points: number; scan: number; wire: number; dev: number; solid: number; build: number; laser: number }

export const PART_MODES: Record<'points' | 'wire' | 'dev' | 'solid', PartState> = {
  points: { points: 1, scan: -10, wire: 0, dev: 0, solid: 0, build: 1, laser: 0 },
  wire: { points: 0.18, scan: -10, wire: 0.9, dev: 0, solid: 0, build: 1, laser: 0 },
  dev: { points: 1, scan: -10, wire: 0.15, dev: 1, solid: 0, build: 1, laser: 0 },
  solid: { points: 0, scan: -10, wire: 0.12, dev: 0, solid: 1, build: 1, laser: 0 },
}

export interface PartSceneOptions {
  points?: number
  spin?: number
  interactive?: boolean
  /** Her karede durumu güncelleyen döngü (ör. baskı ya da tarama animasyonu) */
  loop?: (S: PartState, t: number, range: { yMin: number; yMax: number }) => void
}

export interface PartSceneHandle extends SceneHandle {
  set: (s: Partial<PartState>) => void
  yMin: number
  yMax: number
}

export function createPartScene(el: HTMLElement, partName: PartName, opts: PartSceneOptions = {}): PartSceneHandle {
  const REDUCED = prefersReducedMotion()
  const scene = new THREE.Scene()
  const renderer = baseRenderer(el)
  renderer.localClippingEnabled = true
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
  addLights(scene)
  const root = new THREE.Group()
  scene.add(root)
  const parts = PARTS[partName]()
  const bb = new THREE.Box3()
  parts.forEach((p) => { p.geo.computeBoundingBox(); bb.union(p.geo.boundingBox!) })
  const ctr = bb.getCenter(new THREE.Vector3())
  parts.forEach((p) => p.geo.translate(-ctr.x, -ctr.y, -ctr.z))
  bb.translate(ctr.negate())
  const yMin = bb.min.y - 0.05, yMax = bb.max.y + 0.05
  const clipTop = new THREE.Plane(new THREE.Vector3(0, -1, 0), 10)
  const cutLo = new THREE.Plane(new THREE.Vector3(0, 1, 0), -10)
  const cutHi = new THREE.Plane(new THREE.Vector3(0, -1, 0), 10)
  const solids: THREE.Mesh[] = [], cuts: THREE.Mesh[] = [], wires: THREE.LineSegments[] = []
  parts.forEach(({ geo, color }) => {
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: color === C.steel ? 0.35 : 0.1, side: THREE.DoubleSide, clippingPlanes: [clipTop], transparent: true, opacity: 1 }))
    solids.push(m); root.add(m)
    const k = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: C.orange, side: THREE.DoubleSide, clippingPlanes: [cutLo, cutHi] }))
    k.visible = false; cuts.push(k); root.add(k)
    const w = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 24), new THREE.LineBasicMaterial({ color: 0xc9d2df, transparent: true, opacity: 0 }))
    wires.push(w); root.add(w)
  })
  const pts = new THREE.Points(samplePoints(parts, opts.points ?? 9000), pointsMaterial())
  root.add(pts)
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), new THREE.MeshBasicMaterial({ color: C.orange, transparent: true, opacity: 0.07, side: THREE.DoubleSide, depthWrite: false }))
  sheet.rotation.x = -Math.PI / 2
  root.add(sheet)
  const ring = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(5, 5)), new THREE.LineBasicMaterial({ color: C.orange, transparent: true, opacity: 0.5 }))
  ring.rotation.x = -Math.PI / 2
  root.add(ring)
  const grid = new THREE.GridHelper(6, 24, 0x3b475c, 0x2a3446)
  grid.position.y = yMin - 0.02
  ;(grid.material as THREE.Material).transparent = true
  ;(grid.material as THREE.Material).opacity = 0.55
  root.add(grid)

  const st: OrbitState = { yaw: 0.6, pitch: 0.32, vy: 0, dragging: false, visible: true }
  const S: PartState = { points: 1, scan: yMin - 1, wire: 0, dev: 0, solid: 0, build: 1, laser: 0 }
  const offDrag = opts.interactive === false ? () => {} : dragYaw(renderer.domElement, st)
  const io = watchVisibility(el, st)
  const size = () => {
    const w = el.clientWidth, h = el.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    st.dist = w / h < 1 ? 10.5 : 8.6
    camera.updateProjectionMatrix()
    pts.material.uniforms.uPx.value = renderer.getPixelRatio() * (h / 600)
  }
  size()
  const ro = new ResizeObserver(size)
  ro.observe(el)
  const apply = () => {
    const u = pts.material.uniforms
    u.uScan.value = S.scan; u.uOpacity.value = S.points; u.uDev.value = S.dev
    pts.visible = S.points > 0.01
    wires.forEach((w) => { (w.material as THREE.LineBasicMaterial).opacity = S.wire; w.visible = S.wire > 0.01 })
    const by = lerp(yMin, yMax, S.build)
    clipTop.constant = by; cutHi.constant = by; cutLo.constant = -(by - 0.045)
    solids.forEach((m) => {
      const mat = m.material as THREE.MeshStandardMaterial
      m.visible = S.solid > 0.01; mat.opacity = S.solid; mat.transparent = S.solid < 0.999; mat.depthWrite = S.solid > 0.5
    })
    cuts.forEach((k) => { k.visible = S.solid > 0.01 && S.build < 0.995 })
    sheet.visible = ring.visible = S.laser > 0.01
    sheet.position.y = ring.position.y = S.scan
    ;(sheet.material as THREE.MeshBasicMaterial).opacity = 0.07 * S.laser
    ;(ring.material as THREE.LineBasicMaterial).opacity = 0.5 * S.laser
  }
  const t0 = performance.now()
  let last = t0, raf = 0
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame)
    if (!st.visible) return
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    opts.loop?.(S, (now - t0) / 1000, { yMin, yMax })
    if (!st.dragging) { st.vy *= Math.pow(0.05, dt); st.yaw += st.vy + (REDUCED ? 0 : dt * (opts.spin ?? 0.18)) }
    root.rotation.y = st.yaw
    const d = st.dist || 8.6
    camera.position.set(0, Math.sin(st.pitch) * d, Math.cos(st.pitch) * d)
    camera.lookAt(0, -0.1, 0)
    apply()
    renderer.render(scene, camera)
  }
  raf = requestAnimationFrame(frame)
  return {
    yMin, yMax,
    set(o) { Object.assign(S, o) },
    dispose() {
      cancelAnimationFrame(raf)
      io.disconnect(); ro.disconnect(); offDrag()
      disposeScene(scene)
      renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove()
    },
  }
}

/** Hizmet görünüm modundan döngü fonksiyonu (baskı ve tarama animasyonlu) */
export function loopForMode(mode: string): PartSceneOptions['loop'] {
  const REDUCED = prefersReducedMotion()
  if (mode === 'print')
    return (S, t) => { Object.assign(S, { points: 0, wire: 0.14, solid: 1, dev: 0, laser: 0, build: REDUCED ? 1 : clamp((t % 7) / 6, 0, 1) }) }
  if (mode === 'points')
    return (S, t, r) => {
      const k = REDUCED ? 1 : (t % 6) / 4.5
      Object.assign(S, { points: 1, wire: 0, solid: 0, dev: 0, laser: k < 1 ? 1 : 0, scan: lerp(r.yMax + 0.1, r.yMin - 0.1, clamp(k, 0, 1)) })
    }
  return undefined
}

/* ---------------------------------------------------------------- SplitScene */

export function createSplitScene(el: HTMLElement): SceneHandle {
  const REDUCED = prefersReducedMotion()
  const scene = new THREE.Scene()
  const renderer = baseRenderer(el)
  renderer.localClippingEnabled = true
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
  addLights(scene)
  const root = new THREE.Group()
  scene.add(root)
  const pts = [new THREE.Vector2(0, 0)]
  for (let i = 0; i <= 48; i++) { const y = (i / 48) * 3.6; pts.push(new THREE.Vector2(vaseProfile(y), y)) }
  pts.push(new THREE.Vector2(0, 3.6))
  const geo = new THREE.LatheGeometry(pts, 64)
  geo.translate(0, -1.8, 0)
  const cuts = [-0.9, 0, 0.9], N = 4, bounds = [-2, ...cuts, 2]
  const parts: { m: THREE.Mesh; g: THREE.Group; lo: THREE.Plane; hi: THREE.Plane; i: number }[] = []
  for (let i = 0; i < N; i++) {
    const lo = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const hi = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0)
    const mat = new THREE.MeshStandardMaterial({ color: i % 2 ? 0xc9d1dc : 0xe5e9ef, roughness: 0.55, metalness: 0.1, side: THREE.DoubleSide, clippingPlanes: [lo, hi] })
    const m = new THREE.Mesh(geo, mat)
    root.add(m)
    const g = new THREE.Group()
    root.add(g)
    if (i > 0) {
      const r = vaseProfile(bounds[i] + 1.8)
      const cap = new THREE.Mesh(new THREE.CircleGeometry(r, 48), new THREE.MeshStandardMaterial({ color: C.orange, roughness: 0.6 }))
      cap.rotation.x = Math.PI / 2; cap.position.y = bounds[i]; g.add(cap)
    }
    if (i < N - 1) {
      const r = vaseProfile(bounds[i + 1] + 1.8)
      const cap = new THREE.Mesh(new THREE.CircleGeometry(r, 48), new THREE.MeshStandardMaterial({ color: C.orange, roughness: 0.6 }))
      cap.rotation.x = -Math.PI / 2; cap.position.y = bounds[i + 1]; g.add(cap)
      for (let j = 0; j < 3; j++) {
        const a = (j * Math.PI * 2) / 3 + 0.4
        const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.36, 16), new THREE.MeshStandardMaterial({ color: C.graphite, roughness: 0.4 }))
        pin.position.set(Math.cos(a) * r * 0.5, bounds[i + 1] + 0.18, Math.sin(a) * r * 0.5)
        g.add(pin)
      }
    }
    parts.push({ m, g, lo, hi, i })
  }
  const vol = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.2, 2.2, 2.2)), new THREE.LineBasicMaterial({ color: C.line, transparent: true, opacity: 0.8 }))
  vol.position.set(3.1, -0.7, 0)
  root.add(vol)
  const grid = new THREE.GridHelper(9, 36, 0x3b475c, 0x223047)
  grid.position.y = -1.85
  root.add(grid)
  const labels = cuts.map((_, i) => {
    const d = document.createElement('span')
    d.className = 'fx-dim'
    d.setAttribute('aria-hidden', 'true')
    d.innerHTML = `<b>${String(i + 1).padStart(2, '0')}</b>-${String(i + 2).padStart(2, '0')}`
    el.appendChild(d)
    return d
  })
  const st: OrbitState = { yaw: 0.5, pitch: 0.3, vy: 0, dragging: false, visible: true }
  const offDrag = dragYaw(renderer.domElement, st)
  const io = watchVisibility(el, st)
  const size = () => {
    const w = el.clientWidth, h = el.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    st.dist = w / h < 1.1 ? 14 : 11.5
    camera.updateProjectionMatrix()
  }
  size()
  const ro = new ResizeObserver(size)
  ro.observe(el)
  const v = new THREE.Vector3()
  const t0 = performance.now()
  let last = t0, raf = 0
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame)
    if (!st.visible) return
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    const c = ((now - t0) / 1000) % 8
    const ex = REDUCED ? 0.8 : c < 1.5 ? 0 : c < 3 ? ease((c - 1.5) / 1.5) : c < 6 ? 1 : 1 - ease((c - 6) / 1.5)
    const gap = 0.55 * ex
    parts.forEach(({ m, g, lo, hi, i }) => {
      const off = (i - 1.5) * gap
      m.position.y = off; g.position.y = off
      lo.constant = i === 0 ? 10 : -(bounds[i] + off) + 0.0005
      hi.constant = i === N - 1 ? 10 : bounds[i + 1] + off + 0.0005
      g.visible = ex > 0.02
    })
    if (!st.dragging) { st.vy *= Math.pow(0.05, dt); st.yaw += st.vy + (REDUCED ? 0 : dt * 0.2) }
    root.rotation.y = st.yaw
    const d = st.dist || 11.5
    camera.position.set(0, Math.sin(st.pitch) * d, Math.cos(st.pitch) * d)
    camera.lookAt(0.6, -0.2, 0)
    renderer.render(scene, camera)
    const w = el.clientWidth, h = el.clientHeight
    labels.forEach((lab, i) => {
      v.set(vaseProfile(cuts[i] + 1.8) + 0.45, cuts[i] + (i - 1) * gap, 0)
      root.localToWorld(v)
      v.project(camera)
      lab.style.transform = `translate(${(v.x * 0.5 + 0.5) * w}px, ${(-v.y * 0.5 + 0.5) * h}px) translate(-50%,-50%)`
      lab.style.opacity = String(ex)
    })
  }
  raf = requestAnimationFrame(frame)
  return {
    dispose() {
      cancelAnimationFrame(raf)
      io.disconnect(); ro.disconnect(); offDrag()
      labels.forEach((d) => d.remove())
      disposeScene(scene)
      renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove()
    },
  }
}
