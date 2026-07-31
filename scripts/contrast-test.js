/**
 * WCAG Contrast Test — taste-skill token doğrulaması
 * globals.css içindeki :root, .dark, .public-theme ve .public-theme.public-dark
 * token'larını okur, kritik renk çiftlerinin WCAG AA kontrast oranlarını doğrular.
 *
 * Kullanım: node scripts/contrast-test.js
 */
const fs = require('fs');
const path = require('path');

const css = fs.readFileSync(path.join(__dirname, '../src/app/globals.css'), 'utf8');

// ── CSS blok ayrıştırma ──
function extractBlock(source, selector) {
  const start = source.indexOf(selector);
  if (start === -1) throw new Error(`Selector not found: ${selector}`);
  const open = source.indexOf('{', start);
  let depth = 1;
  let i = open + 1;
  while (depth > 0 && i < source.length) {
    if (source[i] === '{') depth++;
    if (source[i] === '}') depth--;
    i++;
  }
  return source.slice(open + 1, i - 1);
}

function parseTokens(block) {
  const tokens = {};
  const re = /--([\w-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(block))) tokens[m[1]] = m[2].trim();
  return tokens;
}

// ── Renk dönüşümleri ──
function hslTripletToRgb(triplet) {
  const m = triplet.match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
  if (!m) return null;
  const h = parseFloat(m[1]) / 360;
  const s = parseFloat(m[2]) / 100;
  const l = parseFloat(m[3]) / 100;
  if (s === 0) return [l, l, l];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue = (t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [hue(h + 1 / 3), hue(h), hue(h - 1 / 3)];
}

function hexToRgb(hex) {
  const m = hex.trim().match(/^#([0-9a-f]{6})$/i);
  if (!m) return null;
  const v = m[1];
  return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16) / 255);
}

function luminance([r, g, b]) {
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(rgb1, rgb2) {
  const l1 = luminance(rgb1);
  const l2 = luminance(rgb2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// alpha kompoziti: fg rengini α oranında bg üzerine bindir
function composite(fg, bg, alpha) {
  return fg.map((c, i) => c * alpha + bg[i] * (1 - alpha));
}

// ── Token setleri ──
// Admin: :root (light) + .dark
// Public: .public-theme (light) + .public-theme.public-dark
// Public bloklar :root üzerine biner; tanımlamadıkları token'lar :root'tan miras alınır.
const root = parseTokens(extractBlock(css, ':root'));
const adminLight = root;
const adminDark = { ...root, ...parseTokens(extractBlock(css, '.dark')) };
const publicTheme = parseTokens(extractBlock(css, '.public-theme'));
const publicLight = { ...root, ...publicTheme };
const publicDark = { ...publicLight, ...parseTokens(extractBlock(css, '.public-theme.public-dark')) };

// HSL üçlüsü token'ı → rgb
function rgb(tokens, name) {
  const v = tokens[name];
  if (!v) throw new Error(`Token missing: --${name}`);
  const c = hslTripletToRgb(v);
  if (!c) throw new Error(`Not an HSL triplet: --${name}: ${v}`);
  return c;
}

// hex token'ı (--color-*) → rgb
function hex(tokens, name) {
  const v = tokens[name];
  if (!v) throw new Error(`Token missing: --${name}`);
  const c = hexToRgb(v);
  if (!c) throw new Error(`Not a hex color: --${name}: ${v}`);
  return c;
}

// ── Admin test tanımları (sidebar dahil, badge zemini kart üzerine tint) ──
// [ad, önplan, arkaplan, minimum oran]
function buildAdminCases(t) {
  const bg = rgb(t, 'background');
  const card = rgb(t, 'card');
  return [
    // Metin çiftleri (AA: 4.5)
    ['foreground / background', rgb(t, 'foreground'), bg, 4.5],
    ['card-foreground / card', rgb(t, 'card-foreground'), card, 4.5],
    ['popover-foreground / popover', rgb(t, 'popover-foreground'), rgb(t, 'popover'), 4.5],
    ['muted-foreground / background', rgb(t, 'muted-foreground'), bg, 4.5],
    ['muted-foreground / card', rgb(t, 'muted-foreground'), card, 4.5],
    ['muted-foreground / muted', rgb(t, 'muted-foreground'), rgb(t, 'muted'), 4.5],
    ['sidebar-foreground / sidebar-bg', rgb(t, 'sidebar-foreground'), rgb(t, 'sidebar-background'), 4.5],

    // Buton çiftleri (AA: 4.5 — taste-skill BUTTON CONTRAST CHECK)
    ['primary-foreground / primary (default btn)', rgb(t, 'primary-foreground'), rgb(t, 'primary'), 4.5],
    ['destructive-foreground / destructive (danger btn)', rgb(t, 'destructive-foreground'), rgb(t, 'destructive'), 4.5],
    ['secondary-foreground / secondary', rgb(t, 'secondary-foreground'), rgb(t, 'secondary'), 4.5],
    ['accent-foreground / accent (ghost hover)', rgb(t, 'accent-foreground'), rgb(t, 'accent'), 4.5],
    ['sidebar-accent-fg / sidebar-accent', rgb(t, 'sidebar-accent-foreground'), rgb(t, 'sidebar-accent'), 4.5],

    // Status metinleri düz zeminde (AA: 4.5)
    ['success / background', rgb(t, 'success'), bg, 4.5],
    ['warning / background', rgb(t, 'warning'), bg, 4.5],
    ['info / background', rgb(t, 'info'), bg, 4.5],
    ['destructive / background (text-destructive)', rgb(t, 'destructive'), bg, 4.5],

    // Badge: %15 tint zemin üzerinde status metni (AA: 4.5)
    ['success / success-15% tint on card', rgb(t, 'success'), composite(rgb(t, 'success'), card, 0.15), 4.5],
    ['warning / warning-15% tint on card', rgb(t, 'warning'), composite(rgb(t, 'warning'), card, 0.15), 4.5],
    ['info / info-15% tint on card', rgb(t, 'info'), composite(rgb(t, 'info'), card, 0.15), 4.5],
    ['destructive / destructive-15% tint on card', rgb(t, 'destructive'), composite(rgb(t, 'destructive'), card, 0.15), 4.5],
    ['primary / primary-10% tint on card (badge primary)', rgb(t, 'primary'), composite(rgb(t, 'primary'), card, 0.10), 4.5],

    // UI bileşenleri — metin dışı (AA: 3.0)
    ['ring / background (focus ring)', rgb(t, 'ring'), bg, 3.0],
    ['primary / background (link text ≥ 4.5)', rgb(t, 'primary'), bg, 4.5],
  ];
}

// ── Public test tanımları ──
// Public scope'ta --primary marka turuncusudur (#FA6831): SADECE dolgu rengi olarak
// kullanılır, metin rengi olarak değil. Etiket kontrastı primary-foreground üzerinden,
// satır içi/link metni ise accent-foreground (brand 700/800 ink) üzerinden doğrulanır.
// Badge zeminleri public scope'ta açıkça tanımlı --color-*-light token'larıdır,
// bu yüzden kompozit tint yerine gerçek token çiftleri test edilir.
function buildPublicCases(t) {
  const bg = rgb(t, 'background');
  const card = rgb(t, 'card');
  return [
    // Metin çiftleri (AA: 4.5)
    ['foreground / background', rgb(t, 'foreground'), bg, 4.5],
    ['card-foreground / card', rgb(t, 'card-foreground'), card, 4.5],
    ['popover-foreground / popover', rgb(t, 'popover-foreground'), rgb(t, 'popover'), 4.5],
    ['muted-foreground / background', rgb(t, 'muted-foreground'), bg, 4.5],
    ['muted-foreground / card', rgb(t, 'muted-foreground'), card, 4.5],
    ['muted-foreground / muted', rgb(t, 'muted-foreground'), rgb(t, 'muted'), 4.5],

    // Buton çiftleri (AA: 4.5)
    ['primary-foreground / primary (brand btn)', rgb(t, 'primary-foreground'), rgb(t, 'primary'), 4.5],
    ['destructive-foreground / destructive (danger btn)', rgb(t, 'destructive-foreground'), rgb(t, 'destructive'), 4.5],
    ['secondary-foreground / secondary', rgb(t, 'secondary-foreground'), rgb(t, 'secondary'), 4.5],
    ['accent-foreground / accent (brand subtle fill)', rgb(t, 'accent-foreground'), rgb(t, 'accent'), 4.5],
    ['success-foreground / success (solid btn)', rgb(t, 'success-foreground'), rgb(t, 'success'), 4.5],
    ['warning-foreground / warning (solid btn)', rgb(t, 'warning-foreground'), rgb(t, 'warning'), 4.5],
    ['info-foreground / info (solid btn)', rgb(t, 'info-foreground'), rgb(t, 'info'), 4.5],

    // Marka ink'i satır içi metin / link olarak (AA: 4.5)
    ['accent-foreground / background (link text)', rgb(t, 'accent-foreground'), bg, 4.5],
    ['accent-foreground / card (link on card)', rgb(t, 'accent-foreground'), card, 4.5],
    ['accent-foreground / primary-10% tint on card (badge brand)', rgb(t, 'accent-foreground'), composite(rgb(t, 'primary'), card, 0.10), 4.5],

    // Status metinleri düz zeminde (AA: 4.5)
    ['success / background', rgb(t, 'success'), bg, 4.5],
    ['warning / background', rgb(t, 'warning'), bg, 4.5],
    ['info / background', rgb(t, 'info'), bg, 4.5],
    ['destructive / background (text-destructive)', rgb(t, 'destructive'), bg, 4.5],

    // Badge: semantic *-light zemin üzerinde semantic metin (AA: 4.5)
    ['color-success / color-success-light (badge)', hex(t, 'color-success'), hex(t, 'color-success-light'), 4.5],
    ['color-warning / color-warning-light (badge)', hex(t, 'color-warning'), hex(t, 'color-warning-light'), 4.5],
    ['color-danger / color-danger-light (badge)', hex(t, 'color-danger'), hex(t, 'color-danger-light'), 4.5],
    ['color-info / color-info-light (badge)', hex(t, 'color-info'), hex(t, 'color-info-light'), 4.5],

    // UI bileşenleri — metin dışı (AA: 3.0)
    ['ring / background (focus ring)', rgb(t, 'ring'), bg, 3.0],
  ];
}

// ── Çalıştır ──
const suites = [
  ['ADMIN LIGHT (:root)', adminLight, buildAdminCases],
  ['ADMIN DARK (.dark)', adminDark, buildAdminCases],
  ['PUBLIC LIGHT (.public-theme)', publicLight, buildPublicCases],
  ['PUBLIC DARK (.public-theme.public-dark)', publicDark, buildPublicCases],
];

let failures = 0;
for (const [mode, tokens, build] of suites) {
  console.log(`\n━━ ${mode} ━━`);
  for (const [name, fg, bgc, min] of build(tokens)) {
    const ratio = contrast(fg, bgc);
    const ok = ratio >= min;
    if (!ok) failures++;
    console.log(`${ok ? '  PASS' : '✗ FAIL'}  ${ratio.toFixed(2)}:1 (min ${min}:1)  ${name}`);
  }
}

console.log(failures === 0 ? '\n✅ Tüm kontrast testleri geçti.' : `\n❌ ${failures} test başarısız.`);
process.exit(failures === 0 ? 0 : 1);
