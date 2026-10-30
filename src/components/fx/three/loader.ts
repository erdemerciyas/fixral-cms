/**
 * FX geçiş sahnesi — işaretin iki yarısı karşılıklı ok gibi uçar: gövde
 * (F + ">") soldan, turuncu kollar ("<") sağdan gelir; uçlar çarpışınca
 * kıvılcım, şok halkası ve parlama ile FX oluşur. split() yarıları ayırır.
 * Tek WebGL bağlamı yaşar; sahne boştayken render döngüsü durur.
 */
import { MARK_PATHS } from '../FxLogo'
import { THREE, C, clamp, lerp, ease, pathToShape, baseRenderer, disposeScene } from './core'

export interface FxLoaderHandle {
  /** Oklar kenarlardan gelip çarpışır; çarpışmadan kısa süre sonra çözülür */
  assemble: () => Promise<void>
  /** Yarılar ekran dışına ayrılır; tamamlanınca çözülür */
  split: () => Promise<void>
  dispose: () => void
}

const IN = 0.56
const OUT = 0.6
const SETTLE = 0.26
const SPARKS = 160
const SPARK_LIFE = 0.9
/** Çarpışma noktası (işaret uzayında: F ucu 256, kol uçları ~276 → merkez 182) */
const CX = 0.84

function canvasTexture(w: number, h: number, paint: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  paint(c.getContext('2d')!)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export function createFxLoader(el: HTMLElement): FxLoaderHandle {
  const scene = new THREE.Scene()
  const renderer = baseRenderer(el)
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200)
  scene.add(new THREE.HemisphereLight(0xdce3ee, 0x0b111d, 1.2))
  const key = new THREE.DirectionalLight(0xffffff, 2.2)
  key.position.set(3, 4, 5)
  scene.add(key)
  const rim = new THREE.DirectionalLight(C.orange, 1.1)
  rim.position.set(-4, 1, -3)
  scene.add(rim)

  const glow = canvasTexture(64, 64, (g) => {
    const r = g.createRadialGradient(32, 32, 0, 32, 32, 32)
    r.addColorStop(0, 'rgba(255,255,255,1)')
    r.addColorStop(0.25, 'rgba(255,200,140,0.7)')
    r.addColorStop(1, 'rgba(249,115,22,0)')
    g.fillStyle = r
    g.fillRect(0, 0, 64, 64)
  })
  const fade = canvasTexture(128, 1, (g) => {
    const r = g.createLinearGradient(0, 0, 128, 0)
    r.addColorStop(0, 'rgba(255,255,255,0)')
    r.addColorStop(1, 'rgba(255,255,255,1)')
    g.fillStyle = r
    g.fillRect(0, 0, 128, 1)
  })
  const additive = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }

  /* İşaret: iki grup, yerinde birleşik FX */
  const s = 0.01, ox = 182, oy = 90
  const ext = { depth: 0.34, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.022, bevelSegments: 2 }
  const mk = (d: string, mat: THREE.Material) => {
    const g = new THREE.ExtrudeGeometry(pathToShape(d, s, ox, oy), ext)
    g.translate(0, 0, -0.17)
    return new THREE.Mesh(g, mat)
  }
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe9ecf0, roughness: 0.42, metalness: 0.2 })
  const armMat = new THREE.MeshStandardMaterial({ color: C.orange, roughness: 0.38, metalness: 0.15, emissive: C.orange, emissiveIntensity: 0 })
  const root = new THREE.Group()
  root.rotation.x = 0.06
  scene.add(root)
  const left = new THREE.Group()
  const right = new THREE.Group()
  left.add(mk(MARK_PATHS.body, bodyMat))
  right.add(mk(MARK_PATHS.up, armMat), mk(MARK_PATHS.dn, armMat))
  root.add(left, right)

  /* Hız izleri: okların arkasında sönen çizgiler */
  const L = 3.2
  const streakMats = [
    new THREE.MeshBasicMaterial({ map: fade, color: 0xcfd6e2, opacity: 0, ...additive }),
    new THREE.MeshBasicMaterial({ map: fade, color: C.orange, opacity: 0, ...additive }),
  ]
  ;[0.62, 0, -0.62].forEach((y) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(L, y ? 0.012 : 0.02), streakMats[0])
    m.position.set(-1.82 - L / 2, y, 0)
    left.add(m)
  })
  ;[0.5, -0.5].forEach((y) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(L, 0.016), streakMats[1])
    m.rotation.z = Math.PI
    m.position.set(1.82 + L / 2, y, 0)
    right.add(m)
  })

  /* Çarpışma efektleri: kıvılcım, iki şok halkası, parlama, nokta ışık */
  const sp = new Float32Array(SPARKS * 3)
  const sv = new Float32Array(SPARKS * 3)
  const sc = new Float32Array(SPARKS * 3)
  for (let i = 0; i < SPARKS; i++) {
    const hot = Math.random() < 0.4
    sc.set(hot ? [1, 0.88, 0.7] : [1, 0.45, 0.09], i * 3)
  }
  const sg = new THREE.BufferGeometry()
  sg.setAttribute('position', new THREE.BufferAttribute(sp, 3))
  sg.setAttribute('color', new THREE.BufferAttribute(sc, 3))
  const sparkMat = new THREE.PointsMaterial({ size: 0.07, map: glow, vertexColors: true, opacity: 0, ...additive })
  const sparks = new THREE.Points(sg, sparkMat)
  sparks.frustumCulled = false
  root.add(sparks)
  const ringMats = [
    new THREE.MeshBasicMaterial({ color: C.orange, opacity: 0, side: THREE.DoubleSide, ...additive }),
    new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0, side: THREE.DoubleSide, ...additive }),
  ]
  const rings = [new THREE.RingGeometry(0.95, 1, 72), new THREE.RingGeometry(0.985, 1, 72)].map((g, i) => {
    const m = new THREE.Mesh(g, ringMats[i])
    m.position.set(CX, 0, 0.2)
    root.add(m)
    return m
  })
  const flare = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: 0xffb27a, opacity: 0, ...additive }))
  flare.position.set(CX, 0, 0.3)
  root.add(flare)
  const flash = new THREE.PointLight(C.orange, 0, 6, 1.6)
  flash.position.set(CX, 0, 1.2)
  root.add(flash)

  const burst = () => {
    for (let i = 0; i < SPARKS; i++) {
      const j = i * 3
      sp[j] = CX + (Math.random() - 0.5) * 0.12
      sp[j + 1] = (Math.random() - 0.5) * 0.3
      sp[j + 2] = 0.2
      // çarpışma yatay → kıvılcımlar çoğunlukla dikey fışkırır
      const a = (Math.random() < 0.5 ? 1 : -1) * Math.PI / 2 + (Math.random() - 0.5) * 1.7
      const v = 1.6 + Math.random() * 3.6
      sv[j] = Math.cos(a) * v
      sv[j + 1] = Math.sin(a) * v
      sv[j + 2] = (Math.random() - 0.5) * 2 + 0.8
    }
  }

  /* Boyut: işaret ekranda clamp(180px, 34vw, 340px) genişlikte (CSS ile eş) */
  let travel = 8, camZ = 10
  const size = () => {
    const w = el.clientWidth, h = el.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    const px = clamp(w * 0.34, 180, 340)
    const visW = (3.64 * w) / px
    camZ = visW / (2 * Math.tan(THREE.MathUtils.degToRad(15)) * camera.aspect)
    camera.position.set(0, 0, camZ)
    camera.updateProjectionMatrix()
    travel = visW / 2 + 3.2
  }
  size()
  const ro = new ResizeObserver(size)
  ro.observe(el)

  type Phase = 'idle' | 'in' | 'hold' | 'out'
  let phase: Phase = 'idle'
  let p0 = 0, hit = -1, last = 0, raf = 0, streak = 0, yaw = -0.55
  let settle: (() => void) | null = null
  const now = () => performance.now() / 1000
  const done = () => {
    settle?.()
    settle = null
  }
  left.position.x = -travel
  right.position.x = travel

  const frame = () => {
    const t = now()
    const dt = Math.min(t - last, 0.05)
    last = t
    const k = clamp((t - p0) / (phase === 'out' ? OUT : IN), 0, 1)
    let off = phase === 'idle' ? travel : 0, yawAim = -0.2 + Math.sin(t * 0.8) * 0.1, streakAim = 0
    if (phase === 'in') {
      off = travel * (1 - k * k)
      yawAim = lerp(-0.55, -0.2, ease(k))
      streakAim = k
      if (k >= 1) {
        phase = 'hold'
        hit = t
        burst()
      }
    } else if (phase === 'out') {
      off = travel * k * k
      if (k >= 1) {
        phase = 'idle'
        done()
      }
    }
    const age = hit < 0 ? 99 : t - hit
    if (phase === 'hold' && age >= SETTLE) done()

    // çarpışma geri tepmesi + kamera sarsıntısı
    const rc = 0.09 * Math.exp(-age * 8) * Math.sin(age * 30)
    left.position.x = -(off + Math.max(rc, 0))
    right.position.x = off + Math.max(rc, 0)
    const sh = 0.05 * Math.exp(-age * 10)
    camera.position.set(Math.sin(t * 93) * sh, Math.cos(t * 71) * sh, camZ)
    yaw = lerp(yaw, yawAim, 1 - Math.pow(0.05, dt))
    root.rotation.y = yaw

    streak = lerp(streak, streakAim, 1 - Math.pow(0.0005, dt))
    streakMats[0].opacity = streak * 0.7
    streakMats[1].opacity = streak * 0.85
    armMat.emissiveIntensity = phase === 'hold' ? 0.12 + 1.3 * Math.exp(-age * 5) : 0.25
    flash.intensity = 14 * Math.exp(-age * 7)
    flare.material.opacity = Math.exp(-age * 5)
    flare.scale.setScalar(0.6 + age * 3.2)
    rings.forEach((r, i) => {
      const a = Math.max(age - i * 0.08, 0)
      r.scale.setScalar(0.12 + a * (4.4 - i))
      ringMats[i].opacity = 0.9 * clamp(1 - a / 0.55, 0, 1) * (age - i * 0.08 >= 0 ? 1 : 0)
    })
    if (age < SPARK_LIFE) {
      const drag = Math.pow(0.05, dt)
      for (let i = 0; i < SPARKS * 3; i += 3) {
        sv[i] *= drag
        sv[i + 1] = sv[i + 1] * drag - 2.6 * dt
        sv[i + 2] *= drag
        sp[i] += sv[i] * dt
        sp[i + 1] += sv[i + 1] * dt
        sp[i + 2] += sv[i + 2] * dt
      }
      sg.attributes.position.needsUpdate = true
    }
    sparkMat.opacity = clamp(1 - age / SPARK_LIFE, 0, 1)

    renderer.render(scene, camera)
    raf = phase === 'idle' && age > SPARK_LIFE ? 0 : requestAnimationFrame(frame)
  }
  const run = () => {
    if (raf) return
    last = now()
    raf = requestAnimationFrame(frame)
  }
  const start = (p: Phase) => {
    done()
    phase = p
    p0 = now()
    run()
    return new Promise<void>((r) => (settle = r))
  }

  return {
    assemble() {
      hit = -1
      yaw = -0.55
      return start('in')
    },
    split() {
      return start('out')
    },
    dispose() {
      done()
      cancelAnimationFrame(raf)
      ro.disconnect()
      disposeScene(scene)
      glow.dispose()
      fade.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    },
  }
}
