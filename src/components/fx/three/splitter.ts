/**
 * Fixral 3D Splitter ürün sayfası sahneleri.
 * - createSplitterGuide: 5 adımlı kılavuz — hazırla → ön böl → böl → parçala → bas.
 *   Yazıcı hacmine sığmayan model kesilir, pimlenir, numaralanır ve tablalara yerleşir.
 * - createJointDemo: seçili birleştirme şablonu iki parça arasında açılıp kapanır.
 * Sürükleyerek döndürülür; görünür değilken çizim durur; reduced-motion'da animasyon yok.
 */
import { THREE, C, clamp, lerp, smooth, prefersReducedMotion, baseRenderer, addLights, watchVisibility, disposeScene, dragYaw, type OrbitState } from './core'
import type { JointKind } from '@/content/splitter-showcase'

export interface GuideHandle { dispose: () => void; setStep: (i: number) => void }
export interface JointHandle { dispose: () => void; setJoint: (k: JointKind) => void }

const MINT = 0x34e3a8
const STEEL = [0xe5e9ef, 0xc9d1dc]
const PALETTE = [0x8fd3c1, 0xc3a6e8, 0xf2a7b8, 0xb9d98a]

/** Renderer, kamera, ışık, boyut, görünürlük ve sürükleyerek döndürme. */
function stage(el: HTMLElement) {
  const scene = new THREE.Scene()
  const renderer = baseRenderer(el)
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200)
  addLights(scene)
  const orbit: OrbitState = { yaw: 0, pitch: 0, vy: 0, dragging: false, visible: true }
  const io = watchVisibility(el, orbit)
  const undrag = dragYaw(el, orbit)
  const size = () => {
    const w = el.clientWidth, h = el.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  size()
  const ro = new ResizeObserver(size)
  ro.observe(el)
  const textures: THREE.Texture[] = []
  let raf = 0
  return {
    scene, camera, orbit, textures,
    run(tick: (t: number, dt: number) => void) {
      const t0 = performance.now()
      let last = t0
      const frame = (now: number) => {
        raf = requestAnimationFrame(frame)
        const dt = clamp((now - last) / 1000, 0, 0.05)
        last = now
        if (!orbit.visible) return
        if (!orbit.dragging) { orbit.yaw += orbit.vy; orbit.vy *= 0.92 }
        tick((now - t0) / 1000, dt)
        renderer.render(scene, camera)
      }
      raf = requestAnimationFrame(frame)
    },
    dispose() {
      cancelAnimationFrame(raf)
      io.disconnect(); ro.disconnect(); undrag()
      textures.forEach((x) => x.dispose())
      disposeScene(scene)
      renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove()
    },
  }
}

/** Kameraya dönük metin etiketi (her zaman üstte çizilir). */
function tag(text: string, textures: THREE.Texture[], o: { fg?: string; border?: string; scale?: number } = {}) {
  const c = document.createElement('canvas')
  const ctx = c.getContext('2d')!
  const font = '600 40px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
  ctx.font = font
  const w = Math.ceil(ctx.measureText(text).width) + 40
  c.width = w; c.height = 68
  ctx.font = font
  ctx.fillStyle = 'rgba(11,17,29,0.88)'
  ctx.strokeStyle = o.border ?? 'rgba(249,115,22,0.9)'
  ctx.lineWidth = 3
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(2, 2, w - 4, 64, 14)
  else ctx.rect(2, 2, w - 4, 64)
  ctx.fill(); ctx.stroke()
  ctx.fillStyle = o.fg ?? '#f3f4f6'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 20, 36)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  textures.push(tex)
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false, opacity: 0 }))
  const k = (o.scale ?? 0.3) / 68
  s.scale.set(w * k, 68 * k, 1)
  s.renderOrder = 10
  s.visible = false
  return s
}

/** Opaklığı hedefe yumuşakça taşır; neredeyse görünmezse çizimden çıkarır. */
function fade(o: THREE.Object3D & { material: THREE.Material }, target: number, k: number, max = 1) {
  o.material.opacity = lerp(o.material.opacity, target * max, k)
  o.visible = o.material.opacity > 0.01
}

/* ----------------------------------------------------------- Kullanım kılavuzu */

const H = 4
const BOUNDS = [0, 1, 2, 3, 4]
const profile = (y: number) => 0.5 + 0.55 * Math.sin(Math.PI * (y / H) * 0.9 + 0.15) + 0.08 * Math.sin(y * 3)

interface Pose { pos: THREE.Vector3; rot: number }
interface View { look: number; dist: number; pitch: number }

const VIEWS: View[] = [
  { look: 2, dist: 11, pitch: 0.2 },
  { look: 2, dist: 10.5, pitch: 0.3 },
  { look: 2.3, dist: 11, pitch: 0.26 },
  { look: 2.9, dist: 13, pitch: 0.22 },
  { look: 0.4, dist: 12, pitch: 0.7 },
]
const PLATES = [[-1.5, 1.5], [1.5, 1.5], [-1.5, -1.5], [1.5, -1.5]]

export function createSplitterGuide(el: HTMLElement, labels: { height: string; volume: string }): GuideHandle {
  const REDUCED = prefersReducedMotion()
  const S = stage(el)
  const N = BOUNDS.length - 1
  let step = 0

  const grid = new THREE.GridHelper(16, 64, 0x3b475c, 0x223047)
  grid.position.y = -0.004
  S.scene.add(grid)

  // Parçalar: kapalı lathe + turuncu kesim yüzü + üst kesitte pimler
  const capMat = new THREE.MeshStandardMaterial({ color: C.orange, roughness: 0.6, emissive: C.orange, emissiveIntensity: 0, transparent: true, opacity: 0 })
  const pinMat = new THREE.MeshStandardMaterial({ color: C.orange, roughness: 0.45 })
  const parts = BOUNDS.slice(0, -1).map((a, i) => {
    const b = BOUNDS[i + 1]
    const pts = [new THREE.Vector2(0, a)]
    for (let k = 0; k <= 24; k++) { const y = a + ((b - a) * k) / 24; pts.push(new THREE.Vector2(profile(y), y)) }
    pts.push(new THREE.Vector2(0, b))
    const mat = new THREE.MeshStandardMaterial({ color: STEEL[i % 2], roughness: 0.5, metalness: 0.06 })
    const g = new THREE.Group()
    const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 72), mat)
    body.visible = false
    g.add(body)
    const caps: THREE.Mesh[] = []
    if (i > 0) {
      const cap = new THREE.Mesh(new THREE.CircleGeometry(profile(a) * 0.995, 64), capMat)
      cap.rotation.x = Math.PI / 2; cap.position.y = a - 0.004; g.add(cap); caps.push(cap)
    }
    const pins = new THREE.Group()
    if (i < N - 1) {
      const cap = new THREE.Mesh(new THREE.CircleGeometry(profile(b) * 0.995, 64), capMat)
      cap.rotation.x = -Math.PI / 2; cap.position.y = b + 0.004; g.add(cap); caps.push(cap)
      const r = profile(b) * 0.52
      for (let j = 0; j < 3; j++) {
        const an = (j * Math.PI * 2) / 3 + 0.5
        const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.3, 20), pinMat)
        pin.position.set(Math.cos(an) * r, 0.15, Math.sin(an) * r)
        pins.add(pin)
      }
      pins.position.y = b
      pins.scale.set(1, 0.001, 1)
      pins.visible = false
      g.add(pins)
    }
    const name = tag(`P0${i + 1}`, S.textures, { scale: 0.34 })
    name.position.y = (a + b) / 2
    g.add(name)
    const mate = i < N - 1 ? tag(`0${i + 1}-0${i + 2}`, S.textures, { fg: '#fdba74', scale: 0.26 }) : null
    if (mate) { mate.position.set(0, b + 0.02, 0); g.add(mate) }
    S.scene.add(g)
    const plate = PLATES[i]
    const poses: Pose[] = [
      { pos: new THREE.Vector3(0, 0, 0), rot: 0 },
      { pos: new THREE.Vector3(0, 0, 0), rot: 0 },
      { pos: new THREE.Vector3(0, i * 0.2, 0), rot: 0 },
      { pos: new THREE.Vector3((i % 2 ? 0.35 : -0.35), i * 0.7, 0), rot: (i - 1.5) * 0.35 },
      { pos: new THREE.Vector3(plate[0], -a, plate[1]), rot: i * 0.6 },
    ]
    return { g, body, mat, pins, name, mate, poses, a }
  })
  // Bölünmeden önce dikişsiz tek gövde
  const wholePts = [new THREE.Vector2(0, 0)]
  for (let k = 0; k <= 96; k++) { const y = (H * k) / 96; wholePts.push(new THREE.Vector2(profile(y), y)) }
  wholePts.push(new THREE.Vector2(0, H))
  const whole = new THREE.Mesh(new THREE.LatheGeometry(wholePts, 72), new THREE.MeshStandardMaterial({ color: STEEL[0], roughness: 0.5, metalness: 0.06 }))
  S.scene.add(whole)

  // Kesim düzlemleri (ön bölme)
  const planeMat = new THREE.MeshBasicMaterial({ color: MINT, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })
  const planeLine = new THREE.LineBasicMaterial({ color: MINT, transparent: true, opacity: 0 })
  const planes = BOUNDS.slice(1, -1).map((y) => {
    const g = new THREE.Group()
    const geo = new THREE.PlaneGeometry(3.4, 3.4)
    geo.rotateX(-Math.PI / 2)
    g.add(new THREE.Mesh(geo, planeMat), new THREE.LineSegments(new THREE.EdgesGeometry(geo), planeLine))
    g.position.y = y
    S.scene.add(g)
    return g
  })

  // Yazıcı hacmi: model sığmaz
  const volMat = new THREE.LineBasicMaterial({ color: C.orange, transparent: true, opacity: 0 })
  const volGeo = new THREE.BoxGeometry(2.6, 1.25, 2.6)
  volGeo.translate(0, 0.625, 0)
  const vol = new THREE.LineSegments(new THREE.EdgesGeometry(volGeo), volMat)
  S.scene.add(vol)
  // Yükseklik ölçüsü ve hacim etiketi: hep ekranın sağında / solunda kalsın diye kamerayla döner
  const dim = new THREE.Group()
  const volTag = tag(labels.volume, S.textures, { scale: 0.26 })
  volTag.position.set(-1.9, 1.5, 0)
  dim.add(volTag)
  const dimMat = new THREE.LineBasicMaterial({ color: 0xff6b6b, transparent: true, opacity: 0 })
  const dx = 1.75
  dim.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(dx, 0, 0), new THREE.Vector3(dx, H, 0),
    new THREE.Vector3(dx - 0.15, 0, 0), new THREE.Vector3(dx + 0.15, 0, 0),
    new THREE.Vector3(dx - 0.15, H, 0), new THREE.Vector3(dx + 0.15, H, 0),
  ]), dimMat))
  const dimTag = tag(labels.height, S.textures, { border: 'rgba(255,107,107,0.9)', scale: 0.3 })
  dimTag.position.set(dx + 0.15, H / 2, 0)
  dim.add(dimTag)
  S.scene.add(dim)

  // Baskı: tablalar ve yüzeyi izleyen skirt çubukları
  const plateMat = new THREE.LineBasicMaterial({ color: 0x8aa0bf, transparent: true, opacity: 0 })
  const skirtMat = new THREE.MeshStandardMaterial({ color: MINT, roughness: 0.6 })
  const skirts = parts.map((p, i) => {
    const g = new THREE.Group()
    const [px, pz] = PLATES[i]
    g.position.set(px, 0, pz)
    const sq = new THREE.BufferGeometry().setFromPoints([[-1.3, -1.3], [1.3, -1.3], [1.3, 1.3], [-1.3, 1.3], [-1.3, -1.3]].map(([x, z]) => new THREE.Vector3(x, 0.006, z)))
    const outline = new THREE.Line(sq, plateMat)
    g.add(outline)
    const sk = new THREE.Group()
    const r = profile(p.a) + 0.1
    for (let j = 0; j < 12; j++) {
      const an = (j / 12) * Math.PI * 2
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 0.05), skirtMat)
      bar.position.set(Math.cos(an) * r, 0.025, Math.sin(an) * r)
      bar.rotation.y = -an
      sk.add(bar)
    }
    sk.scale.setScalar(0.001)
    sk.visible = false
    g.add(sk)
    S.scene.add(g)
    return { sk }
  })

  const cam = { ...VIEWS[0] }
  const col = new THREE.Color()
  S.orbit.yaw = 0.7
  S.run((t, dt) => {
    const k = REDUCED ? 1 : 1 - Math.pow(0.025, dt)
    const kf = REDUCED ? 1 : 1 - Math.pow(0.01, dt)
    whole.visible = step <= 1
    parts.forEach((p, i) => {
      const pose = p.poses[step]
      p.body.visible = !whole.visible
      p.g.position.lerp(pose.pos, k)
      p.g.rotation.y = lerp(p.g.rotation.y, pose.rot, k)
      p.mat.color.lerp(col.set(step >= 3 ? PALETTE[i] : STEEL[i % 2]), kf)
      const ps = lerp(p.pins.scale.y, step >= 2 ? 1 : 0.001, k)
      p.pins.scale.set(1, ps, 1)
      p.pins.visible = ps > 0.01
      fade(p.name, step >= 3 ? 1 : 0, kf)
      if (p.mate) fade(p.mate, step === 2 ? 1 : 0, kf)
    })
    capMat.opacity = lerp(capMat.opacity, step >= 2 ? 1 : 0, kf)
    capMat.emissiveIntensity = lerp(capMat.emissiveIntensity, step === 2 || step === 3 ? 0.35 : 0, kf)
    const pulse = REDUCED ? 1 : 0.8 + 0.2 * Math.sin(t * 3)
    planeMat.opacity = lerp(planeMat.opacity, step === 1 ? 0.16 * pulse : 0, kf)
    planeLine.opacity = lerp(planeLine.opacity, step === 1 ? 0.75 : 0, kf)
    planes.forEach((g) => { g.visible = planeLine.opacity > 0.01 })
    volMat.opacity = lerp(volMat.opacity, step <= 1 ? 0.95 : step === 2 ? 0.35 : 0, kf)
    vol.visible = volMat.opacity > 0.01
    fade(volTag, step <= 1 ? 1 : 0, kf)
    dimMat.opacity = lerp(dimMat.opacity, step === 0 ? 0.95 : 0, kf)
    fade(dimTag, step === 0 ? 1 : 0, kf)
    plateMat.opacity = lerp(plateMat.opacity, step === 4 ? 0.9 : 0, kf)
    skirts.forEach(({ sk }) => {
      const s = lerp(sk.scale.x, step === 4 ? 1 : 0.001, k)
      sk.scale.setScalar(s)
      sk.visible = s > 0.01
    })

    if (!REDUCED && !S.orbit.dragging) S.orbit.yaw += dt * 0.16
    const v = VIEWS[step]
    cam.look = lerp(cam.look, v.look, k)
    cam.dist = lerp(cam.dist, v.dist, k)
    cam.pitch = lerp(cam.pitch, v.pitch, k)
    const yaw = S.orbit.yaw
    const pitch = clamp(cam.pitch + S.orbit.pitch * 0.6, 0.02, 1.25)
    const d = cam.dist * (S.camera.aspect < 1.2 ? 1.35 : 1)
    S.camera.position.set(Math.sin(yaw) * Math.cos(pitch) * d, cam.look + Math.sin(pitch) * d, Math.cos(yaw) * Math.cos(pitch) * d)
    S.camera.lookAt(0, cam.look, 0)
    dim.rotation.y = yaw
  })

  return {
    dispose: S.dispose,
    setStep(i: number) { step = clamp(Math.round(i), 0, VIEWS.length - 1) },
  }
}

/* ---------------------------------------------------------------- Bağlantılar */

interface JointRig { a: THREE.Object3D; b: THREE.Object3D; mid?: THREE.Object3D; dir: THREE.Vector3; travel: number; pitch?: number }

const SPOTS: [number, number][] = [[0.3, 0.3], [-0.3, -0.3]]

function buildJoint(kind: JointKind): JointRig {
  const aMat = new THREE.MeshStandardMaterial({ color: 0xe5e9ef, roughness: 0.5, metalness: 0.06 })
  const bMat = new THREE.MeshStandardMaterial({ color: 0xa9b6c9, roughness: 0.5, metalness: 0.06 })
  const orange = new THREE.MeshStandardMaterial({ color: C.orange, roughness: 0.45 })
  const hole = new THREE.MeshBasicMaterial({ color: 0x0b111d })
  const a = new THREE.Group(), b = new THREE.Group()
  const X = new THREE.Vector3(1, 0, 0), Y = new THREE.Vector3(0, 1, 0)

  // Kesit profilinden (2D) çıkarılan gövdeler: kırlangıç kuyruğu ve bindirme
  const extrude = (pts: [number, number][], m: THREE.Material, axis: 'y' | 'z') => {
    const s = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)))
    const g = new THREE.ExtrudeGeometry(s, { depth: 1.2, bevelEnabled: false })
    if (axis === 'y') { g.rotateX(Math.PI / 2); g.translate(0, 0.6, 0) } else g.translate(0, 0, -0.6)
    return new THREE.Mesh(g, m)
  }
  if (kind === 'dovetail') {
    a.add(extrude([[-1.6, -0.6], [0, -0.6], [0, -0.2], [0.4, -0.36], [0.4, 0.36], [0, 0.2], [0, 0.6], [-1.6, 0.6]], aMat, 'y'))
    b.add(extrude([[0, -0.6], [1.6, -0.6], [1.6, 0.6], [0, 0.6], [0, 0.2], [0.4, 0.36], [0.4, -0.36], [0, -0.2]], bMat, 'y'))
    // Üstten bakınca genişleyen dil okunur
    return { a, b, dir: Y, travel: 1, pitch: 0.95 }
  }
  if (kind === 'lap') {
    a.add(extrude([[-1.6, -0.6], [0.6, -0.6], [0.6, 0], [0, 0], [0, 0.6], [-1.6, 0.6]], aMat, 'z'))
    b.add(extrude([[0.6, -0.6], [1.6, -0.6], [1.6, 0.6], [0, 0.6], [0, 0], [0.6, 0]], bMat, 'z'))
    return { a, b, dir: Y, travel: 0.9 }
  }

  const blk = (m: THREE.Material, x: number) => { const g = new THREE.BoxGeometry(1.6, 1.2, 1.2); g.translate(x, 0, 0); return new THREE.Mesh(g, m) }
  a.add(blk(aMat, -0.8)); b.add(blk(bMat, 0.8))
  const marker = (r: number, x: number, face: 1 | -1, parent: THREE.Object3D, y: number, z: number) => {
    const m = new THREE.Mesh(new THREE.CircleGeometry(r, 32), hole)
    m.rotation.y = (face * Math.PI) / 2
    m.position.set(x, y, z)
    parent.add(m)
  }
  let mid: THREE.Object3D | undefined
  SPOTS.forEach(([y, z]) => {
    if (kind === 'pyramid' || kind === 'cylinder') {
      const g = kind === 'pyramid' ? new THREE.ConeGeometry(0.19, 0.36, 4) : new THREE.CylinderGeometry(0.12, 0.12, 0.34, 24)
      g.rotateZ(-Math.PI / 2)
      const pin = new THREE.Mesh(g, orange)
      pin.position.set(kind === 'pyramid' ? 0.18 : 0.17, y, z)
      a.add(pin)
      marker(kind === 'pyramid' ? 0.16 : 0.13, -0.002, -1, b, y, z)
    } else if (kind === 'magnet') {
      const mag = new THREE.MeshStandardMaterial({ color: 0xb8c0cc, roughness: 0.25, metalness: 0.85 })
      ;[[a, 1], [b, -1]].forEach(([p, f]) => {
        const g = new THREE.CylinderGeometry(0.16, 0.16, 0.04, 32)
        g.rotateZ(Math.PI / 2)
        const m = new THREE.Mesh(g, mag)
        m.position.set((f as number) * 0.012, y, z)
        ;(p as THREE.Object3D).add(m)
        const ring = new THREE.Mesh(new THREE.RingGeometry(0.17, 0.21, 32), orange)
        ring.rotation.y = ((f as number) * Math.PI) / 2
        ring.position.set((f as number) * 0.003, y, z)
        ;(p as THREE.Object3D).add(ring)
      })
    } else if (kind === 'dowel') {
      if (!mid) mid = new THREE.Group()
      const g = new THREE.CylinderGeometry(0.1, 0.1, 0.9, 24)
      g.rotateZ(Math.PI / 2)
      const d = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0xc8955c, roughness: 0.85 }))
      d.position.set(0, y, z)
      mid.add(d)
      marker(0.115, 0.002, 1, a, y, z)
      marker(0.115, -0.002, -1, b, y, z)
    }
  })
  return { a, b, mid, dir: X, travel: kind === 'dowel' ? 1.2 : 0.9 }
}

export function createJointDemo(el: HTMLElement, initial: JointKind): JointHandle {
  const REDUCED = prefersReducedMotion()
  const S = stage(el)
  const grid = new THREE.GridHelper(12, 48, 0x3b475c, 0x223047)
  grid.position.y = -0.9
  S.scene.add(grid)
  const holder = new THREE.Group()
  S.scene.add(holder)
  let rig: JointRig = buildJoint(initial)
  let t0 = 0
  const mount = (r: JointRig) => { holder.add(r.a, r.b); if (r.mid) holder.add(r.mid) }
  mount(rig)

  let clock = 0
  const cam = { pitch: rig.pitch ?? 0.42 }
  S.run((t, dt) => {
    clock = t
    // 0–.4 kapalı · .4–1.6 açılır · 1.6–2.8 açık · 2.8–4 kapanır · 4–4.4 kapalı
    const p = (t - t0) % 4.4
    const s = REDUCED ? 0.6 : p < 1.6 ? smooth(0.4, 1.6, p) : 1 - smooth(2.8, 4, p)
    const off = rig.dir.clone().multiplyScalar(rig.travel * s)
    rig.b.position.copy(off)
    if (rig.mid) rig.mid.position.copy(off).multiplyScalar(0.5)
    const yaw = 0.75 + (REDUCED ? 0 : 0.35 * Math.sin(t * 0.4)) + S.orbit.yaw
    cam.pitch = lerp(cam.pitch, rig.pitch ?? 0.42, REDUCED ? 1 : 1 - Math.pow(0.05, dt))
    const pitch = clamp(cam.pitch + S.orbit.pitch * 0.6, 0.05, 1.3)
    const look = 0.2 + rig.dir.y * rig.travel * 0.35
    const d = 6.8 * (S.camera.aspect < 1.2 ? 1.3 : 1)
    S.camera.position.set(Math.sin(yaw) * Math.cos(pitch) * d, look + Math.sin(pitch) * d, Math.cos(yaw) * Math.cos(pitch) * d)
    S.camera.lookAt(0, look, 0)
  })

  return {
    dispose: S.dispose,
    setJoint(k: JointKind) {
      const old = new THREE.Scene()
      holder.children.slice().forEach((o) => old.add(o))
      disposeScene(old)
      rig = buildJoint(k)
      mount(rig)
      t0 = clock - 0.3
    },
  }
}
