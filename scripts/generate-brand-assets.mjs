#!/usr/bin/env node
/**
 * FIXRAL marka dosyalarını üretir — geometri tek kaynaktan, src/components/fx/FxLogo.tsx.
 *
 *   node scripts/generate-brand-assets.mjs
 *
 * Üretilenler:
 *  - public/brand/   fixral-logo(.svg|.png)        yatay logo, açık zemin (koyu gövde)
 *                    fixral-logo-light(.svg|.png)  yatay logo, koyu zemin (beyaz gövde)
 *                    fixral-mark(.svg|.png)        yalnız FX işareti, açık zemin
 *                    fixral-icon(.svg|.png)        uygulama ikonu (koyu kare + işaret)
 *  - public/favicon.svg, public/favicon.ico, src/app/icon.svg
 *  - public/icons/icon-NxN.(svg|png), shortcut-*.png (PWA)
 *  - public/logo.png (schema.org Organization logosu), public/og-image.jpg
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..')
const src = fs.readFileSync(path.join(ROOT, 'src/components/fx/FxLogo.tsx'), 'utf8')
const pick = (re) => { const m = re.exec(src); if (!m) throw new Error(`FxLogo.tsx: ${re} bulunamadı`); return m[1] }
const MARK = { body: pick(/body: '([^']+)'/), up: pick(/up: '([^']+)'/), dn: pick(/dn: '([^']+)'/) }
const WORD = [...pick(/const WORD_PATHS = \[([\s\S]*?)\]/).matchAll(/'([^']+)'/g)].map((m) => m[1])

const ACCENT = '#F97316'
const INK = '#101828'
const WHITE = '#FFFFFF'

const markPaths = (fill) => `<path fill="${fill}" d="${MARK.body}"/><path fill="${ACCENT}" d="${MARK.up}"/><path fill="${ACCENT}" d="${MARK.dn}"/>`
const wordPaths = (fill) => `<g fill="${fill}" transform="translate(238.22 20.99) scale(1.11569) translate(-1.27 -193.73)">${WORD.map((d) => `<path d="${d}"/>`).join('')}</g>`
const svg = (viewBox, body, size = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"${size}>${body}</svg>\n`

const logo = (fill) => svg('0 0 641.222 100', `<title>FIXRAL</title><g transform="scale(0.55556)">${markPaths(fill)}</g>${wordPaths(fill)}`)
const mark = (fill) => svg('0 0 364 180', `<title>FIXRAL</title>${markPaths(fill)}`)
/** Koyu kare zeminde beyaz gövdeli işaret; işaret maskable güvenli alanında (genişlik %62) */
const icon = (px) => {
  const s = (512 * 0.62) / 364
  const x = (512 - 364 * s) / 2
  const y = (512 - 180 * s) / 2
  return svg('0 0 512 512', `<rect width="512" height="512" rx="96" fill="${INK}"/><g transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${s.toFixed(5)})">${markPaths(WHITE)}</g>`, px ? ` width="${px}" height="${px}"` : '')
}

const out = (rel, data) => {
  const file = path.join(ROOT, rel)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, data)
  console.log('•', rel)
}
const png = (svgText, width, height) => sharp(Buffer.from(svgText), { density: 600 }).resize(width, height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer()

/** PNG gömülü ICO (16, 32, 48) */
function ico(images) {
  const header = Buffer.alloc(6 + images.length * 16)
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(images.length, 4)
  let offset = header.length
  images.forEach(({ size, buf }, i) => {
    const o = 6 + i * 16
    header.writeUInt8(size >= 256 ? 0 : size, o); header.writeUInt8(size >= 256 ? 0 : size, o + 1)
    header.writeUInt16LE(1, o + 4); header.writeUInt16LE(32, o + 6)
    header.writeUInt32LE(buf.length, o + 8); header.writeUInt32LE(offset, o + 12)
    offset += buf.length
  })
  return Buffer.concat([header, ...images.map((x) => x.buf)])
}

const files = {
  'fixral-logo': logo(INK),
  'fixral-logo-light': logo(WHITE),
  'fixral-mark': mark(INK),
  'fixral-icon': icon(),
}
for (const [name, text] of Object.entries(files)) out(`public/brand/${name}.svg`, text)
out('public/brand/fixral-logo.png', await png(files['fixral-logo'], 1200))
out('public/brand/fixral-logo-light.png', await png(files['fixral-logo-light'], 1200))
out('public/brand/fixral-mark.png', await png(files['fixral-mark'], 728))
out('public/brand/fixral-icon.png', await png(files['fixral-icon'], 512, 512))

out('public/favicon.svg', icon(64))
out('src/app/icon.svg', icon(64))
out('public/favicon.ico', ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, buf: await png(icon(), size, size) })))))
for (const n of [72, 96, 128, 144, 152, 192, 384, 512]) {
  out(`public/icons/icon-${n}x${n}.svg`, icon(n))
  out(`public/icons/icon-${n}x${n}.png`, await png(icon(), n, n))
}
for (const n of ['contact', 'portfolio', 'services']) out(`public/icons/shortcut-${n}.png`, await png(icon(), 192, 192))
// Google, Organization logosunun beyaz zeminde okunmasını bekler
out('public/logo.png', await sharp(await png(files['fixral-logo'], 600)).flatten({ background: WHITE }).extend({ top: 24, bottom: 24, left: 24, right: 24, background: WHITE }).png().toBuffer())

const og = svg('0 0 1200 630', `
  <rect width="1200" height="630" fill="${INK}"/>
  <g transform="translate(80 200) scale(0.8)"><g transform="scale(0.55556)">${markPaths(WHITE)}</g>${wordPaths(WHITE)}</g>
  <text x="80" y="390" fill="#98A2B3" font-family="Arial, Helvetica, sans-serif" font-size="34">Mühendislik · Tasarım · Üretim</text>
  <rect y="606" width="1200" height="24" fill="${ACCENT}"/>`)
out('public/og-image.jpg', await sharp(Buffer.from(og)).jpeg({ quality: 90 }).toBuffer())
