/**
 * FIXRAL 3D çekirdeği — three.js r160 yardımcıları, prosedürel parça modelleri
 * ve nokta bulutu shader'ı. Yalnızca istemci tarafında (dynamic import, ssr:false)
 * yüklenen sahne modülleri tarafından kullanılır.
 */
import * as THREE from 'three'

export { THREE }

export const C = {
  ink: 0x101828,
  paper: 0xf3f4f6,
  steel: 0xd9dee5,
  graphite: 0x3a3f46,
  orange: 0xf97316,
  line: 0x5b6b86,
  board: 0x1b2436,
}

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3)
export const smooth = (a: number, b: number, t: number) => {
  const x = clamp((t - a) / (b - a), 0, 1)
  return x * x * (3 - 2 * x)
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** SVG yolunu (yalnız M/L/H/V/Z) THREE.Shape'e çevirir; y ekseni çevrilir. */
export function pathToShape(d: string, s: number, ox: number, oy: number) {
  const shape = new THREE.Shape()
  let x = 0
  let y = 0
  const re = /([MLHVZ])([^MLHVZ]*)/g
  let m: RegExpExecArray | null
  const P = (px: number, py: number): [number, number] => [(px - ox) * s, -(py - oy) * s]
  while ((m = re.exec(d))) {
    const nums = m[2].trim().split(/[\s,]+/).filter(Boolean).map(Number)
    if (m[1] === 'M') {
      x = nums[0]
      y = nums[1]
      shape.moveTo(...P(x, y))
    } else if (m[1] === 'L') {
      for (let i = 0; i < nums.length; i += 2) {
        x = nums[i]
        y = nums[i + 1]
        shape.lineTo(...P(x, y))
      }
    } else if (m[1] === 'H') {
      for (const n of nums) {
        x = n
        shape.lineTo(...P(x, y))
      }
    } else if (m[1] === 'V') {
      for (const n of nums) {
        y = n
        shape.lineTo(...P(x, y))
      }
    }
  }
  return shape
}

/** SVG yolunu düz nokta listesine çevirir (2D takım yolu için). */
export function pathToPoints(d: string): [number, number][] {
  const pts: [number, number][] = []
  let x = 0
  let y = 0
  const re = /([MLHVZ])([^MLHVZ]*)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(d))) {
    const n = m[2].trim().split(/[\s,]+/).filter(Boolean).map(Number)
    if (m[1] === 'M' || m[1] === 'L') for (let i = 0; i < n.length; i += 2) { x = n[i]; y = n[i + 1]; pts.push([x, y]) }
    if (m[1] === 'H') n.forEach((v) => { x = v; pts.push([x, y]) })
    if (m[1] === 'V') n.forEach((v) => { y = v; pts.push([x, y]) })
  }
  return pts
}

/* ------------------------------------------------------------------ Parçalar */

export interface PartPiece { geo: THREE.BufferGeometry; color: number }

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape()
  const x = -w / 2
  const y = -h / 2
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r)
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r)
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y)
  return s
}
function circlePath(cx: number, cy: number, r: number, ccw = false) {
  const p = new THREE.Path()
  p.absarc(cx, cy, r, 0, Math.PI * 2, ccw)
  return p
}
function box(w: number, h: number, d: number, x: number, y: number, z: number, color: number): PartPiece {
  const g = new THREE.BoxGeometry(w, h, d)
  g.translate(x, y, z)
  return { geo: g, color }
}
function cyl(r: number, h: number, x: number, y: number, z: number, color: number, seg = 32): PartPiece {
  const g = new THREE.CylinderGeometry(r, r, h, seg)
  g.translate(x, y, z)
  return { geo: g, color }
}

export const vaseProfile = (y: number) => {
  const t = y / 3.6
  return 0.62 + 0.62 * Math.sin(Math.min(t * 1.35, 1) * Math.PI * 0.92) * (1 - t * 0.35) + (t > 0.82 ? (t - 0.82) * 1.6 : 0)
}

export type PartName = 'gear' | 'bracket' | 'pcb' | 'enclosure' | 'impeller' | 'vase'

export const PARTS: Record<PartName, () => PartPiece[]> = {
  gear() {
    const N = 22, R = 1.62, Rr = 1.4, a = (Math.PI * 2) / N
    const s = new THREE.Shape()
    for (let i = 0; i < N; i++) {
      const b = i * a
      const pts: [number, number][] = [[Rr, b - a * 0.5], [Rr, b - a * 0.27], [R, b - a * 0.13], [R, b + a * 0.13], [Rr, b + a * 0.27]]
      pts.forEach(([r, t], j) => {
        const px = Math.cos(t) * r, py = Math.sin(t) * r
        if (i === 0 && j === 0) s.moveTo(px, py)
        else s.lineTo(px, py)
      })
    }
    s.closePath()
    const bore = new THREE.Path()
    bore.moveTo(0.42, -0.1); bore.lineTo(0.52, -0.1); bore.lineTo(0.52, 0.1); bore.lineTo(0.42, 0.1)
    bore.absarc(0, 0, 0.42, Math.asin(0.1 / 0.42), Math.PI * 2 - Math.asin(0.1 / 0.42), false)
    s.holes.push(bore)
    for (let i = 0; i < 6; i++) {
      const t = (i * Math.PI) / 3 + Math.PI / 6
      s.holes.push(circlePath(Math.cos(t) * 0.92, Math.sin(t) * 0.92, 0.2, true))
    }
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.5, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.02, bevelSegments: 1, curveSegments: 18 })
    g.translate(0, 0, -0.25)
    const hub = new THREE.CylinderGeometry(0.62, 0.62, 0.9, 40, 1, true)
    hub.rotateX(Math.PI / 2)
    return [{ geo: g, color: C.steel }, { geo: hub, color: C.steel }]
  },
  bracket() {
    const s = roundedRect(3.4, 2.2, 0.18)
    ;[[-1.4, -0.9], [1.4, -0.9], [-1.4, 0.9], [1.4, 0.9]].forEach(([x, y]) => s.holes.push(circlePath(x, y, 0.1, true)))
    const slot = new THREE.Path()
    slot.moveTo(-0.6, -0.12); slot.lineTo(0.6, -0.12); slot.absarc(0.6, 0, 0.12, -Math.PI / 2, Math.PI / 2, false)
    slot.lineTo(-0.6, 0.12); slot.absarc(-0.6, 0, 0.12, Math.PI / 2, Math.PI * 1.5, false)
    s.holes.push(slot)
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.26, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 1 })
    g.rotateX(-Math.PI / 2)
    g.translate(0, -0.5, 0)
    const parts: PartPiece[] = [{ geo: g, color: C.steel }]
    parts.push(box(0.5, 0.7, 1.6, -1.2, -0.05, 0, C.steel), box(0.5, 0.7, 1.6, 1.2, -0.05, 0, C.steel))
    ;[[-1.2, 0.55], [1.2, -0.55]].forEach(([x, z]) => parts.push(cyl(0.09, 0.4, x, 0.48, z, C.orange, 20)))
    parts.push(box(1.1, 0.12, 0.3, 0, -0.18, 0.7, C.graphite))
    return parts
  },
  pcb() {
    const s = roundedRect(3.4, 2.3, 0.12)
    ;[[-1.5, -1], [1.5, -1], [-1.5, 1], [1.5, 1]].forEach(([x, y]) => s.holes.push(circlePath(x, y, 0.07, true)))
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.07, bevelEnabled: false })
    g.rotateX(-Math.PI / 2)
    g.translate(0, -0.1, 0)
    const parts: PartPiece[] = [{ geo: g, color: C.board }]
    parts.push(box(1.0, 0.1, 1.3, -0.7, 0.0, -0.1, C.steel), box(0.85, 0.03, 0.38, -0.7, 0.06, -0.52, C.graphite))
    parts.push(box(0.42, 0.08, 0.42, 0.55, -0.02, 0.2, C.graphite), box(0.3, 0.08, 0.2, 0.5, -0.02, -0.55, C.graphite))
    parts.push(box(0.7, 0.35, 0.45, 1.25, 0.12, 0.55, C.steel), box(0.5, 0.3, 0.8, 1.3, 0.1, -0.45, C.orange))
    for (let i = 0; i < 8; i++) parts.push(box(0.1, 0.06, 0.05, 0.05 + i * 0.14, -0.03, 0.85, C.paper))
    for (let i = 0; i < 6; i++) parts.push(cyl(0.06, 0.16, -1.45 + i * 0.14, 0.02, 0.95, C.paper, 12))
    for (let i = 0; i < 5; i++) parts.push(box(0.9 - i * 0.1, 0.005, 0.025, 0.2, -0.025, -0.95 + i * 0.09 + 0.4, C.orange))
    return parts
  },
  enclosure() {
    const s = roundedRect(3, 2, 0.3)
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.9, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 2 })
    g.rotateX(-Math.PI / 2)
    g.translate(0, -0.55, 0)
    const parts: PartPiece[] = [{ geo: g, color: C.graphite }]
    for (let i = 0; i < 9; i++) parts.push(box(0.07, 0.22, 1.5, -1.1 + i * 0.275, 0.52, 0, C.graphite))
    parts.push(box(1.1, 0.45, 0.35, 0.6, -0.15, 1.1, C.ink), box(0.95, 0.3, 0.1, 0.6, -0.15, 1.3, C.orange))
    ;[[-1.65, -0.7], [1.65, 0.7]].forEach(([x, z]) => {
      const e = roundedRect(0.5, 0.5, 0.12)
      e.holes.push(circlePath(0, 0, 0.09, true))
      const eg = new THREE.ExtrudeGeometry(e, { depth: 0.12, bevelEnabled: false })
      eg.rotateX(-Math.PI / 2)
      eg.translate(x, -0.58, z)
      parts.push({ geo: eg, color: C.graphite })
    })
    return parts
  },
  impeller() {
    const parts: PartPiece[] = [cyl(1.65, 0.14, 0, -0.5, 0, C.steel, 64), cyl(0.45, 0.9, 0, -0.05, 0, C.steel, 40)]
    for (let i = 0; i < 7; i++) {
      const sh = new THREE.Shape()
      sh.moveTo(0.45, -0.04); sh.quadraticCurveTo(1.1, 0.25, 1.6, 0.55); sh.lineTo(1.6, 0.66); sh.quadraticCurveTo(1.05, 0.38, 0.45, 0.08); sh.closePath()
      const g = new THREE.ExtrudeGeometry(sh, { depth: 0.55, bevelEnabled: false, curveSegments: 10 })
      g.rotateX(-Math.PI / 2)
      g.translate(0, -0.44, 0)
      g.rotateY((i * Math.PI * 2) / 7)
      parts.push({ geo: g, color: C.orange })
    }
    return parts
  },
  vase() {
    const parts: PartPiece[] = []
    ;[[0, 0.9], [0.9, 1.8], [1.8, 2.7], [2.7, 3.6]].forEach(([a, b], i) => {
      const pts = [new THREE.Vector2(0, a)]
      for (let k = 0; k <= 12; k++) { const y = a + ((b - a) * k) / 12; pts.push(new THREE.Vector2(vaseProfile(y), y)) }
      pts.push(new THREE.Vector2(0, b))
      const g = new THREE.LatheGeometry(pts, 56)
      g.translate(0, i * 0.32 - 1.8, 0)
      parts.push({ geo: g, color: i % 2 ? 0xc9d1dc : 0xe5e9ef })
      if (i < 3)
        for (let j = 0; j < 3; j++) {
          const r = vaseProfile(b) * 0.5, an = j * 2.094 + 0.4
          parts.push(cyl(0.06, 0.3, Math.cos(an) * r, b - 1.8 + i * 0.32 + 0.16, Math.sin(an) * r, C.orange, 12))
        }
    })
    return parts
  },
}

/** Üçgen alanına göre düzgün dağılımlı yüzey noktaları + sözde sapma değeri. */
export function samplePoints(parts: PartPiece[], count: number) {
  const tris: [THREE.Vector3, THREE.Vector3, THREE.Vector3, number][] = []
  let total = 0
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), ab = new THREE.Vector3(), ac = new THREE.Vector3()
  parts.forEach(({ geo }) => {
    const g = geo.index ? geo.toNonIndexed() : geo
    const p = g.attributes.position
    for (let i = 0; i < p.count; i += 3) {
      a.fromBufferAttribute(p, i); b.fromBufferAttribute(p, i + 1); c.fromBufferAttribute(p, i + 2)
      const area = ab.subVectors(b, a).cross(ac.subVectors(c, a)).length() * 0.5
      if (area <= 0) continue
      total += area
      tris.push([a.clone(), b.clone(), c.clone(), total])
    }
    if (g !== geo) g.dispose()
  })
  const pos = new Float32Array(count * 3)
  const dev = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const r = Math.random() * total
    let lo = 0, hi = tris.length - 1
    while (lo < hi) { const mid = (lo + hi) >> 1; if (tris[mid][3] < r) lo = mid + 1; else hi = mid }
    const [A, B, Cc] = tris[lo]
    let u = Math.random(), v = Math.random()
    if (u + v > 1) { u = 1 - u; v = 1 - v }
    const x = A.x + (B.x - A.x) * u + (Cc.x - A.x) * v
    const y = A.y + (B.y - A.y) * u + (Cc.y - A.y) * v
    const z = A.z + (B.z - A.z) * u + (Cc.z - A.z) * v
    pos.set([x, y, z], i * 3)
    const n = Math.sin(x * 2.7 + y * 1.3) * Math.cos(z * 3.1 - y * 2.2) * 0.5 + Math.sin(x * 7.1 + z * 5.3) * 0.18
    dev[i] = clamp(0.5 + n * 0.8, 0, 1)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setAttribute('aDev', new THREE.BufferAttribute(dev, 1))
  return g
}

export function pointsMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uScan: { value: 10 }, uOpacity: { value: 1 }, uDev: { value: 0 }, uSize: { value: 2.2 }, uPx: { value: 1 } },
    vertexShader: `attribute float aDev; uniform float uScan, uOpacity, uDev, uSize, uPx; varying vec3 vC; varying float vA;
      void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mv;
        float d = position.y - uScan; float edge = 1.0 - smoothstep(0.0, 0.14, abs(d)); float rev = step(0.0, d);
        vec3 base = vec3(0.84,0.87,0.91); vec3 hot = vec3(0.976,0.451,0.086); vec3 cold = vec3(0.36,0.42,0.53); vec3 mid = vec3(0.94,0.95,0.96);
        vec3 dc = aDev < 0.5 ? mix(cold, mid, aDev*2.0) : mix(mid, hot, (aDev-0.5)*2.0);
        vC = mix(mix(base, hot, edge), dc, uDev); vA = uOpacity * max(rev, edge);
        gl_PointSize = uSize * uPx * (1.0 + edge * 1.6) * (6.0 / -mv.z); }`,
    fragmentShader: `varying vec3 vC; varying float vA; void main(){ vec2 c = gl_PointCoord - 0.5; if (dot(c,c) > 0.25) discard; if (vA < 0.01) discard; gl_FragColor = vec4(vC, vA); }`,
  })
}

export function baseRenderer(el: HTMLElement) {
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
  r.outputColorSpace = THREE.SRGBColorSpace
  r.setClearColor(0x000000, 0)
  r.domElement.setAttribute('aria-hidden', 'true')
  el.appendChild(r.domElement)
  return r
}

export function addLights(scene: THREE.Scene) {
  scene.add(new THREE.HemisphereLight(0xdce3ee, 0x0b111d, 1.15))
  const key = new THREE.DirectionalLight(0xffffff, 2.1)
  key.position.set(3, 5, 4)
  scene.add(key)
  const rim = new THREE.DirectionalLight(0xf97316, 0.9)
  rim.position.set(-5, 1.5, -3)
  scene.add(rim)
  const fill = new THREE.DirectionalLight(0x9fb3d1, 0.5)
  fill.position.set(-3, -2, 4)
  scene.add(fill)
}

export interface OrbitState { yaw: number; pitch: number; vy: number; dragging: boolean; visible: boolean; dist?: number }

/** Sürükleyerek yatay döndürme (dikey kaydırmayı engellemez: touch-action pan-y). */
export function dragYaw(el: HTMLElement, st: OrbitState) {
  let down = false, lx = 0, ly = 0
  const onDown = (e: PointerEvent) => { down = true; lx = e.clientX; ly = e.clientY; st.dragging = true; el.setPointerCapture?.(e.pointerId) }
  const onMove = (e: PointerEvent) => {
    if (!down) return
    const dx = e.clientX - lx, dy = e.clientY - ly
    lx = e.clientX; ly = e.clientY
    st.vy = dx * 0.008; st.yaw += dx * 0.008; st.pitch = clamp(st.pitch + dy * 0.004, -0.5, 0.6)
  }
  const up = () => { down = false; st.dragging = false }
  el.addEventListener('pointerdown', onDown)
  el.addEventListener('pointermove', onMove)
  el.addEventListener('pointerup', up)
  el.addEventListener('pointercancel', up)
  return () => {
    el.removeEventListener('pointerdown', onDown)
    el.removeEventListener('pointermove', onMove)
    el.removeEventListener('pointerup', up)
    el.removeEventListener('pointercancel', up)
  }
}

export function watchVisibility(el: HTMLElement, st: { visible: boolean }) {
  const io = new IntersectionObserver(([en]) => { st.visible = en.isIntersecting }, { rootMargin: '120px' })
  io.observe(el)
  return io
}

/** Sahnedeki tüm geometri/materyalleri serbest bırakır. */
export function disposeScene(scene: THREE.Scene) {
  scene.traverse((o) => {
    const obj = o as THREE.Mesh
    obj.geometry?.dispose?.()
    const mat = obj.material as THREE.Material | THREE.Material[] | undefined
    if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
    else mat?.dispose?.()
  })
}

export interface SceneHandle { dispose: () => void }
