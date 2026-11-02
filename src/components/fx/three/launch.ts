/**
 * Anasayfa hızlı erişim sahneleri — Fixral 3D Splitter (tablaya sığmayan vazo
 * pimli parçalara ayrılır), Router Studio (portal router FX işaretini oyar) ve
 * CFD Simulator (rüzgâr tünelinde gövde çevresinden akım çizgileri akar).
 * Kartın üzerine gelinince / odaklanınca (drive.current.hover) sahne açılır ve hızlanır;
 * drive.current.x / .y imleç paralaksıdır (-1…1). Görünür değilken çizim durur.
 */
import { THREE, C, clamp, lerp, vaseProfile, prefersReducedMotion, baseRenderer, addLights, watchVisibility, disposeScene, type SceneHandle } from './core'
import { markToolpath } from './canvas2d'

export interface LaunchDrive { hover: boolean; x: number; y: number }
type DriveRef = { readonly current: LaunchDrive }

interface Motion { heat: number; px: number; py: number }

/** Ortak kurulum: renderer, kamera, ışık, boyut, görünürlük ve yumuşatılmış etkileşim. */
function stage(el: HTMLElement, drive: DriveRef) {
  const scene = new THREE.Scene()
  const renderer = baseRenderer(el)
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
  addLights(scene)
  const st = { visible: true }
  const io = watchVisibility(el, st)
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
  const m: Motion = { heat: 0, px: 0, py: 0 }
  let raf = 0
  return {
    scene,
    renderer,
    camera,
    run(tick: (t: number, dt: number, m: Motion) => void) {
      const t0 = performance.now()
      let last = t0
      const frame = (now: number) => {
        raf = requestAnimationFrame(frame)
        const dt = clamp((now - last) / 1000, 0, 0.05)
        last = now
        if (!st.visible) return
        // NaN kamera/kesit düzlemine sızarsa three.js uniform yüklemesi her karede çöker
        const d = drive.current
        m.heat = lerp(m.heat, d?.hover ? 1 : 0, 1 - Math.pow(0.004, dt))
        const k = 1 - Math.pow(0.02, dt)
        m.px = lerp(m.px, Number.isFinite(d?.x) ? clamp(d.x, -1, 1) : 0, k)
        m.py = lerp(m.py, Number.isFinite(d?.y) ? clamp(d.y, -1, 1) : 0, k)
        tick((now - t0) / 1000, dt, m)
        renderer.render(scene, camera)
      }
      raf = requestAnimationFrame(frame)
    },
    dispose() {
      cancelAnimationFrame(raf)
      io.disconnect(); ro.disconnect()
      disposeScene(scene)
      renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove()
    },
  }
}

/* ------------------------------------------------------------ 3D Splitter */

export function createSplitLaunch(el: HTMLElement, drive: DriveRef): SceneHandle {
  const REDUCED = prefersReducedMotion()
  const S = stage(el, drive)
  S.renderer.localClippingEnabled = true
  const root = new THREE.Group()
  S.scene.add(root)

  const pts = [new THREE.Vector2(0, 0)]
  for (let i = 0; i <= 48; i++) { const y = (i / 48) * 3.6; pts.push(new THREE.Vector2(vaseProfile(y), y)) }
  pts.push(new THREE.Vector2(0, 3.6))
  const geo = new THREE.LatheGeometry(pts, 64)
  geo.translate(0, -1.8, 0)
  const N = 4, bounds = [-2, -0.9, 0, 0.9, 2]
  const capMat = new THREE.MeshStandardMaterial({ color: C.orange, roughness: 0.6, emissive: C.orange, emissiveIntensity: 0 })
  const pinMat = new THREE.MeshStandardMaterial({ color: C.graphite, roughness: 0.4 })
  const parts: { m: THREE.Mesh; g: THREE.Group; lo: THREE.Plane; hi: THREE.Plane }[] = []
  for (let i = 0; i < N; i++) {
    const lo = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const hi = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0)
    const mat = new THREE.MeshStandardMaterial({ color: i % 2 ? 0xc9d1dc : 0xe5e9ef, roughness: 0.55, metalness: 0.1, side: THREE.DoubleSide, clippingPlanes: [lo, hi] })
    const m = new THREE.Mesh(geo, mat)
    const g = new THREE.Group()
    root.add(m, g)
    if (i > 0) {
      const cap = new THREE.Mesh(new THREE.CircleGeometry(vaseProfile(bounds[i] + 1.8), 48), capMat)
      cap.rotation.x = Math.PI / 2; cap.position.y = bounds[i]; g.add(cap)
    }
    if (i < N - 1) {
      const r = vaseProfile(bounds[i + 1] + 1.8)
      const cap = new THREE.Mesh(new THREE.CircleGeometry(r, 48), capMat)
      cap.rotation.x = -Math.PI / 2; cap.position.y = bounds[i + 1]; g.add(cap)
      for (let j = 0; j < 3; j++) {
        const a = (j * Math.PI * 2) / 3 + 0.4
        const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.36, 16), pinMat)
        pin.position.set(Math.cos(a) * r * 0.5, bounds[i + 1] + 0.18, Math.sin(a) * r * 0.5)
        g.add(pin)
      }
    }
    parts.push({ m, g, lo, hi })
  }
  // Yazıcı hacmi: vazo sığmaz → parçalara bölünür
  const volMat = new THREE.LineBasicMaterial({ color: C.line, transparent: true, opacity: 0.7 })
  const vol = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.6, 2.6, 2.6)), volMat)
  vol.position.y = -0.5
  root.add(vol)
  const bed = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.08, 3.4), new THREE.MeshStandardMaterial({ color: C.board, roughness: 0.8 }))
  bed.position.y = -1.85
  root.add(bed)
  const grid = new THREE.GridHelper(10, 40, 0x3b475c, 0x223047)
  grid.position.y = -1.9
  root.add(grid)

  let yaw = 0.5
  S.run((t, dt, { heat, px, py }) => {
    const idle = REDUCED ? 0.3 : 0.06 + 0.08 * (0.5 + 0.5 * Math.sin(t * 1.4))
    const gap = lerp(idle, 0.62, heat)
    root.position.y = -1.5 * gap
    parts.forEach(({ m, g, lo, hi }, i) => {
      const off = i * gap
      const tw = (i - 1.5) * 0.4 * heat
      m.position.y = off; g.position.y = off
      m.rotation.y = tw; g.rotation.y = tw
      // Kesit düzlemleri dünya uzayında: kök ötelemesi de eklenir
      lo.constant = i === 0 ? 10 : -(bounds[i] + off + root.position.y) + 0.0005
      hi.constant = i === N - 1 ? 10 : bounds[i + 1] + off + root.position.y + 0.0005
      g.visible = gap > 0.02
    })
    capMat.emissiveIntensity = 0.35 * heat
    volMat.opacity = 0.45 + 0.4 * heat
    if (!REDUCED) yaw += dt * (0.22 + 0.5 * heat)
    root.rotation.y = yaw + px * 0.5
    const d = lerp(11, 12.6, heat) * (S.camera.aspect < 1.2 ? 1.3 : 1)
    const pitch = 0.26 + py * 0.14
    S.camera.position.set(0, Math.sin(pitch) * d, Math.cos(pitch) * d)
    S.camera.lookAt(0, 0.05, 0)
  })
  return { dispose: S.dispose }
}

/* ---------------------------------------------------------- Router Studio */

export function createRouterLaunch(el: HTMLElement, drive: DriveRef, onHud?: (text: string) => void): SceneHandle {
  const REDUCED = prefersReducedMotion()
  const S = stage(el, drive)
  const root = new THREE.Group()
  S.scene.add(root)

  // İşaret uzayı (364 × 180, y aşağı) → tabla düzlemi (x sağa, z kameraya)
  const s = 0.011
  const P = ([x, y]: [number, number]) => [(x - 182) * s, (y - 90) * s] as const
  const moves = markToolpath()
  const lens = moves.map(([a, b]) => Math.hypot(b[0] - a[0], b[1] - a[1]) * s)
  const total = lens.reduce((a, b) => a + b, 0)

  const stock = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.34, 2.8), new THREE.MeshStandardMaterial({ color: 0x2a3448, roughness: 0.85, metalness: 0.05 }))
  stock.position.y = -0.17
  const bed = new THREE.Mesh(new THREE.BoxGeometry(5.9, 0.12, 3.7), new THREE.MeshStandardMaterial({ color: C.board, roughness: 0.8 }))
  bed.position.y = -0.4
  const grid = new THREE.GridHelper(16, 64, 0x3b475c, 0x223047)
  grid.position.y = -0.47
  root.add(stock, bed, grid)

  // Planlanan yol (soluk) + kesilen oluklar (turuncu, instanced)
  const pv = new Float32Array(moves.length * 6)
  moves.forEach(([a, b], i) => { const [ax, az] = P(a), [bx, bz] = P(b); pv.set([ax, 0.003, az, bx, 0.003, bz], i * 6) })
  const pg = new THREE.BufferGeometry()
  pg.setAttribute('position', new THREE.BufferAttribute(pv, 3))
  root.add(new THREE.LineSegments(pg, new THREE.LineBasicMaterial({ color: C.line, transparent: true, opacity: 0.5 })))
  const grooveMat = new THREE.MeshStandardMaterial({ color: C.orange, roughness: 0.5, emissive: C.orange, emissiveIntensity: 0.25 })
  const groove = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.024, 0.05), grooveMat, moves.length)
  groove.frustumCulled = false
  groove.count = 0
  root.add(groove)
  const mtx = new THREE.Matrix4(), q = new THREE.Quaternion(), pos = new THREE.Vector3(), scl = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0)
  const tip = new THREE.Vector3()
  const setGroove = (i: number, f: number) => {
    const [ax, az] = P(moves[i][0]), [bx, bz] = P(moves[i][1])
    const ex = ax + (bx - ax) * f, ez = az + (bz - az) * f
    pos.set((ax + ex) / 2, -0.008, (az + ez) / 2)
    q.setFromAxisAngle(up, -Math.atan2(bz - az, bx - ax))
    scl.set(lens[i] * f + 0.05, 1, 1)
    groove.setMatrixAt(i, mtx.compose(pos, q, scl))
    tip.set(ex, 0, ez)
  }

  // Portal: kiriş z boyunca, kafa x boyunca, iş mili y'de dalar
  const dark = new THREE.MeshStandardMaterial({ color: C.graphite, roughness: 0.5, metalness: 0.3 })
  const steel = new THREE.MeshStandardMaterial({ color: C.steel, roughness: 0.35, metalness: 0.6 })
  const mesh = (g: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number) => {
    const o = new THREE.Mesh(g, mat)
    o.position.set(x, y, z)
    return o
  }
  const gantry = new THREE.Group()
  gantry.add(
    mesh(new THREE.BoxGeometry(5.7, 0.22, 0.22), dark, 0, 1.55, -0.3),
    mesh(new THREE.BoxGeometry(0.14, 2.0, 0.5), dark, -2.85, 0.55, -0.3),
    mesh(new THREE.BoxGeometry(0.14, 2.0, 0.5), dark, 2.85, 0.55, -0.3),
  )
  const head = new THREE.Group()
  head.add(mesh(new THREE.BoxGeometry(0.46, 0.56, 0.1), dark, 0, 1.45, -0.15))
  const spindle = new THREE.Group()
  spindle.add(
    mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.8, 32), steel, 0, 0.98, 0),
    mesh(new THREE.CylinderGeometry(0.09, 0.05, 0.14, 24), steel, 0, 0.51, 0),
    mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.46, 12), steel, 0, 0.23, 0),
  )
  const glow = new THREE.PointLight(C.orange, 0, 1.6, 1.4)
  glow.position.y = 0.06
  spindle.add(glow)
  head.add(spindle)
  gantry.add(head)
  root.add(gantry)

  let prog = REDUCED ? total : 0, hold = 0, filled = 0, lastHud = 0, lift = 0.35
  const [hx, hz] = P(moves[0][0])
  const home = new THREE.Vector3(hx, 0, hz)
  const tool = home.clone()
  S.run((t, dt, { heat, px, py }) => {
    const feed = 1 + 2.5 * heat
    if (!REDUCED) {
      if (prog < total) prog = Math.min(total, prog + dt * (total / 16) * feed)
      else if ((hold += dt) > 2.4) { prog = 0; hold = 0; filled = 0 }
    }
    let rem = prog, i = 0
    while (i < moves.length - 1 && rem > lens[i]) { rem -= lens[i]; i++ }
    for (; filled < i; filled++) setGroove(filled, 1)
    setGroove(i, lens[i] ? clamp(rem / lens[i], 0, 1) : 1)
    groove.count = prog > 0 ? i + 1 : 0
    groove.instanceMatrix.needsUpdate = true

    const cutting = prog > 0 && prog < total
    if (cutting) tool.copy(tip)
    else tool.lerp(prog > 0 && !REDUCED ? home : tip, 1 - Math.pow(0.05, dt))
    lift = lerp(lift, cutting ? 0 : 0.35, 1 - Math.pow(0.001, dt))
    gantry.position.z = tool.z
    head.position.x = tool.x
    spindle.position.y = lift
    glow.intensity = cutting ? 1.6 + Math.sin(t * 40) * 0.4 : 0
    grooveMat.emissiveIntensity = 0.25 + 0.3 * heat

    if (onHud && t - lastHud > 0.09) {
      lastHud = t
      const x = tool.x / s + 182, y = 90 - tool.z / s
      onHud(`X ${x.toFixed(2).padStart(6, '0')} Y ${y.toFixed(2).padStart(6, '0')} Z ${cutting ? '-1.50' : '+5.00'} F${Math.round(800 * feed)}`)
    }

    const yaw = -0.35 + px * 0.35 + (REDUCED ? 0 : Math.sin(t * 0.25) * 0.08)
    const pitch = 0.8 + py * 0.12 - heat * 0.08
    const d = (S.camera.aspect < 1.2 ? 12.5 : 10.2) - heat * 0.8
    S.camera.position.set(Math.sin(yaw) * Math.cos(pitch) * d, Math.sin(pitch) * d, Math.cos(yaw) * Math.cos(pitch) * d)
    S.camera.lookAt(0, 0.4, 0)
  })
  return { dispose: S.dispose }
}

/* ------------------------------------------------------- CFD Simulator */

/**
 * Rüzgâr tüneli: akış +x yönünde. Akım çizgileri elipsoit çevresindeki potansiyel
 * akıştan (birim küre, gerilmiş uzay) üretilir; gövdenin arkasında hız kaybı ve
 * salınan iz eklenir. Çizgiler hıza, gövde yüzeyi basınç katsayısına (Cp) göre renklenir.
 * Kartın üzerine gelince akış hızlanır, çizgiler uzar ve parlar.
 */
export function createFlowLaunch(el: HTMLElement, drive: DriveRef, onHud?: (text: string) => void): SceneHandle {
  const REDUCED = prefersReducedMotion()
  const S = stage(el, drive)
  const root = new THREE.Group()
  S.scene.add(root)

  const SX = 1.75, SY = 0.56, SZ = 0.7, Y0 = 0.15
  const slow = new THREE.Color(0x3b82f6), mid = new THREE.Color(0xc9d1dc), fast = new THREE.Color(C.orange)
  const tmp = new THREE.Color()
  const ramp = (t: number) => (t < 0.5 ? tmp.copy(slow).lerp(mid, t * 2) : tmp.copy(mid).lerp(fast, (t - 0.5) * 2))

  // Gövde: önü elipsoit, arkası incelen damla; yüzey Cp ile renklenir
  const geo = new THREE.SphereGeometry(1, 96, 48)
  const p = geo.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i)
    if (x > 0) { const k = 1 - 0.38 * x * x; p.setY(i, p.getY(i) * k); p.setZ(i, p.getZ(i) * k) }
  }
  geo.scale(SX, SY, SZ)
  geo.computeVertexNormals()
  const nrm = geo.attributes.normal
  const col = new Float32Array(p.count * 3)
  for (let i = 0; i < p.count; i++) {
    const nx = nrm.getX(i)
    const cp = nx < 0 ? 1 - 2.25 * (1 - nx * nx) : lerp(-1.25, -0.3, nx)
    // Emme bölgesi açık mavi, durma noktası turuncu kalsın diye aralık kaydırılır
    ramp(0.3 + 0.7 * ((cp + 1.25) / 2.25))
    col.set([tmp.r, tmp.g, tmp.b], i * 3)
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
  const body = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.42, metalness: 0.15 }))
  body.position.y = Y0
  const steel = new THREE.MeshStandardMaterial({ color: C.steel, roughness: 0.35, metalness: 0.6 })
  const sting = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 1.2, 16), steel)
  sting.position.set(0.2, Y0 - SY - 0.55, 0)
  root.add(body, sting)

  // Test bölümü ve zemin
  const frameMat = new THREE.LineBasicMaterial({ color: C.line, transparent: true, opacity: 0.35 })
  const frame = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(9.6, 3.1, 3.6)), frameMat)
  frame.position.y = 0.1
  const grid = new THREE.GridHelper(16, 64, 0x3b475c, 0x223047)
  grid.position.y = -1.45
  root.add(frame, grid)

  // Akış alanı (gerilmiş uzayda, serbest akım hızı 1)
  let time = 0, amp = 0.22
  const u = new Float32Array(3)
  const field = (x: number, y: number, z: number) => {
    const r2 = Math.max(x * x + y * y + z * z, 1)
    const r = Math.sqrt(r2), k = 1 / (2 * r2 * r), m = 3 / (2 * r2 * r2 * r)
    let ux = 1 + k - m * x * x, uy = -m * x * y, uz = -m * x * z
    const w = x > 0.2 ? Math.min(1, (x - 0.2) / 1.2) * Math.exp(-(y * y + z * z) * 1.1) : 0
    if (w) {
      ux *= 1 - 0.4 * w
      uy += amp * w * Math.sin(time * 6 - x * 4)
      uz += amp * 0.6 * w * Math.cos(time * 5 - x * 3.4)
    }
    u[0] = ux; u[1] = uy; u[2] = uz
    return u
  }

  const N = 460, K = 10, XMIN = -4.7 / SX, XMAX = 4.7 / SX
  const P = new Float32Array(N * 3), age = new Float32Array(N)
  const seed = (i: number, x: number) => {
    let y = 0, z = 0
    do { y = (Math.random() * 2 - 1) * 1.35 / SY; z = (Math.random() * 2 - 1) * 1.6 / SZ } while (x * x + y * y + z * z < 1.1)
    P.set([x, y, z], i * 3)
    age[i] = 0
  }
  for (let i = 0; i < N; i++) seed(i, lerp(XMIN, XMAX, Math.random()))

  const pos = new Float32Array(N * (K - 1) * 6), clr = new Float32Array(N * (K - 1) * 6)
  const lg = new THREE.BufferGeometry()
  lg.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage))
  lg.setAttribute('color', new THREE.BufferAttribute(clr, 3).setUsage(THREE.DynamicDrawUsage))
  const lines = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }))
  lines.frustumCulled = false
  root.add(lines)

  let lastHud = 0
  S.run((t, dt, { heat, px, py }) => {
    time = t
    amp = 0.22 + 0.25 * heat
    if (!REDUCED) {
      const v = (0.55 + 1.3 * heat) * dt
      for (let i = 0; i < N; i++) {
        const o = i * 3
        const f = field(P[o], P[o + 1], P[o + 2])
        P[o] += f[0] * v; P[o + 1] += f[1] * v; P[o + 2] += f[2] * v
        age[i] += dt
        const r2 = P[o] * P[o] + P[o + 1] * P[o + 1] + P[o + 2] * P[o + 2]
        if (r2 < 1.0004) { const s = 1.01 / Math.sqrt(r2); P[o] *= s; P[o + 1] *= s; P[o + 2] *= s }
        if (P[o] > XMAX || age[i] > 18) seed(i, XMIN)
      }
    }
    // Kuyruk: baştan geriye entegre edilir (kare hızından bağımsız uzunluk)
    const h = (0.3 + 0.22 * heat) / (K - 1), glow = 0.45 + 0.2 * heat
    let w = 0
    for (let i = 0; i < N; i++) {
      let x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2]
      const f0 = field(x, y, z)
      ramp(clamp((Math.hypot(f0[0], f0[1], f0[2]) - 0.35) / 1.15, 0, 1))
      const cr = tmp.r, cg = tmp.g, cb = tmp.b
      // Girişte ve çıkışta yumuşak beliriş / sönüş
      const edge = clamp((x - XMIN) * 2, 0, 1) * clamp((XMAX - x) * 2, 0, 1) * glow
      for (let j = 0; j < K - 1; j++) {
        const f = field(x, y, z)
        const nx = x - f[0] * h, ny = y - f[1] * h, nz = z - f[2] * h
        const a = edge * Math.pow(1 - j / (K - 1), 1.4), b = edge * Math.pow(1 - (j + 1) / (K - 1), 1.4)
        pos.set([x * SX, y * SY + Y0, z * SZ, nx * SX, ny * SY + Y0, nz * SZ], w)
        clr.set([cr * a, cg * a, cb * a, cr * b, cg * b, cb * b], w)
        w += 6
        x = nx; y = ny; z = nz
      }
    }
    lg.attributes.position.needsUpdate = true
    lg.attributes.color.needsUpdate = true
    frameMat.opacity = 0.3 + 0.25 * heat

    if (onHud && t - lastHud > 0.15) {
      lastHud = t
      const U = lerp(30, 45, heat)
      const re = ((U * 1.044) / 1.5e-5).toExponential(1).replace('+', '')
      const cd = 0.295 + 0.006 * Math.sin(t * 1.3) + 0.003 * Math.sin(t * 3.1)
      onHud(`U ${U.toFixed(1)} m/s · Re ${re} · Cd ${cd.toFixed(3)}`)
    }

    const yaw = -0.62 + px * 0.35 + (REDUCED ? 0 : Math.sin(t * 0.2) * 0.1)
    const pitch = 0.32 + py * 0.12
    const d = (S.camera.aspect < 1.2 ? 13.5 : 10.4) - heat * 0.8
    S.camera.position.set(Math.sin(yaw) * Math.cos(pitch) * d, Math.sin(pitch) * d, Math.cos(yaw) * Math.cos(pitch) * d)
    S.camera.lookAt(0, -0.05, 0)
  })
  return { dispose: S.dispose }
}
