// Fixral logo sistemi — tek kaynaktan SVG + showcase üretimi
// node brand/logo-v2/build.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, 'svg');
mkdirSync(OUT, { recursive: true });

/* ------------------------------------------------------------------ */
/* 1. ÇEKİRDEK GEOMETRİ                                                */
/* ------------------------------------------------------------------ */
// X kutusu: 200 x 160, 45° bıçaklar, yatay kalınlık 40 (dik kalınlık ≈ 28.3)
// Çentikler: üst (100,60) · sol (80,80) · sağ (120,80) · alt (100,100)
const X_POLY = '0,0 40,0 100,60 160,0 200,0 120,80 200,160 160,160 100,100 40,160 0,160 80,80';
const X_SW = '80,80 100,100 40,160 0,160'; // güneybatı kolu — vurgu rengi
const X_NE = '120,80 200,0 160,0 100,60';  // kuzeydoğu kolu — ikinci vurgu seçeneği

// F kutusu: 118 x 160, gövde kalınlığı 28, kollar 45° kesilir
const F_TOP = '0,0 90,0 118,28 0,28';
const F_MID = '0,66 86,66 114,94 0,94';
const F_STEM = { x: 0, y: 0, w: 28, h: 160 };
// Üç parçanın birleşik dış konturu — wireframe varyantında tek çizgi olarak gerekiyor
const F_UNION = '0,0 90,0 118,28 28,28 28,66 86,66 114,94 28,94 28,160 0,160';
const X_DX = 90; // F'in üst kolu tam burada X'in NW bıçağına akar

const MARK_W = 290, MARK_H = 160;

// FIXRAL kelime markası — mevcut logodan alınan outline path'ler (font bağımsız)
const WORD_W = 360.57, WORD_H = 52.01;
const WORD_PATHS = [
  'M1.27,193.73h54.98v12.23H17.11v9.83h37.22v11.96H17.11v17.98H1.27v-52Z',
  'M59.86,193.73h16.65v52h-16.65v-52Z',
  'M81.62,193.73h21.68l16.04,18.25,16.15-18.25h21.94l-25.03,25.72,26.25,26.29h-22.29l-17.03-18.71-16.92,18.71h-22.82l26.59-26.29-24.57-25.72Z',
  'M161.81,245.74v-52h38.29c9.17,0,14.55.1,16.15.3,1.78.15,3.49.74,5.14,1.75,1.96,1.17,3.31,2.81,4.06,4.91.75,2.11,1.12,5.41,1.12,9.91,0,3.81-.24,6.58-.71,8.32-.47,1.74-1.37,3.17-2.69,4.29-1.32,1.12-3.42,1.91-6.29,2.36,1.57,0,2.96.25,4.17.76,1.21.51,2.22,1.23,3.03,2.17.81.94,1.33,2.11,1.56,3.5.23,1.4.34,4.36.34,8.88v4.84h-15.62v-2.78c0-2.9-.11-4.96-.32-6.19-.22-1.23-.62-2.17-1.2-2.8-.58-.63-1.26-1.01-2.04-1.12-.78-.11-1.69-.2-2.74-.25-1.05-.05-2.42-.08-4.1-.08h-22.33v13.22h-15.85ZM177.66,219.53h22.29c1.37,0,2.71-.01,4-.04,1.3-.03,2.31-.08,3.03-.15s1.34-.28,1.85-.61c.66-.41,1.14-1.05,1.43-1.92.29-.88.44-2.17.44-3.87s-.16-2.97-.48-3.81c-.32-.84-.87-1.45-1.66-1.83-.53-.23-1.21-.38-2.02-.46l-6.63-.11h-22.25v12.8Z',
  'M288.49,245.74l-4.46-8.8h-34.4l-4.46,8.8h-18.1l27.58-52h24.61l27.2,52h-17.98ZM278.47,225.55l-10.02-19.7h-3.16l-10.02,19.7h23.2Z',
  'M308.84,193.73h16.65v38.75h36.99v13.26h-53.64v-52Z',
];
const word = (c) =>
  `<g transform="translate(-1.26,-193.73)" fill="${c.ink}">${WORD_PATHS.map((d) => `<path d="${d}"/>`).join('')}</g>`;

/* ------------------------------------------------------------------ */
/* 2. YARDIMCILAR                                                      */
/* ------------------------------------------------------------------ */
const pts = (s) => s.trim().split(/\s+/).map((p) => p.split(',').map(Number));

function inPoly(x, y, poly) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

// Halka (pad) — evenodd ile delik
const ring = (cx, cy, r, ri, fill) =>
  `<path fill-rule="evenodd" fill="${fill}" d="M${cx - r},${cy}a${r},${r} 0 1,0 ${r * 2},0a${r},${r} 0 1,0 ${-r * 2},0ZM${cx - ri},${cy}a${ri},${ri} 0 1,0 ${ri * 2},0a${ri},${ri} 0 1,0 ${-ri * 2},0Z"`;

// Temel FX markası
const fxMark = (c) => `
<g fill="${c.ink}">
  <polygon points="${F_TOP}"/>
  <rect x="${F_STEM.x}" y="${F_STEM.y}" width="${F_STEM.w}" height="${F_STEM.h}"/>
  <polygon points="${F_MID}"/>
</g>
<g transform="translate(${X_DX},0)">
  <polygon points="${X_POLY}" fill="${c.ink}"/>
  <polygon points="${X_SW}" fill="${c.accent}"/>
</g>`;

// Clip/mask için sadece siluet
const fxSilhouette = () => `
<polygon points="${F_TOP}"/>
<rect x="0" y="0" width="28" height="160"/>
<polygon points="${F_MID}"/>
<polygon points="${X_POLY}" transform="translate(${X_DX},0)"/>`;

/* ------------------------------------------------------------------ */
/* 3. KONSEPTLER                                                       */
/* ------------------------------------------------------------------ */
const concepts = [];
const add = (o) => concepts.push(o);

/* 01 — BLADE : ana marka */
add({
  id: 'fx-blade',
  name: 'Blade',
  tag: 'Ana marka',
  note: 'F’in üst kolu 45° kesilip X’in kuzeybatı bıçağına akıyor — tek bir sürekli hareket. Turuncu sadece güneybatı kolunda.',
  vb: `0 0 ${MARK_W} ${MARK_H}`,
  body: (c) => fxMark(c),
});

/* 02 — APEX : yalnız X */
add({
  id: 'fx-apex',
  name: 'Apex',
  tag: 'İkon / avatar',
  note: 'Markanın en küçük okunabilir hali. 16 px favicon’dan YouTube kanal ikonuna kadar aynı kalıyor.',
  vb: '0 0 200 160',
  body: (c) => `<polygon points="${X_POLY}" fill="${c.ink}"/><polygon points="${X_SW}" fill="${c.accent}"/>`,
});

/* 03 — SLICE : 3D baskı katmanları */
add({
  id: 'fx-slice',
  name: 'Slice',
  tag: 'Slicer / 3D baskı',
  note: 'Marka katman katman dilimlenmiş. Slicer ve additive üretim tarafı için doğrudan okunan bir kod.',
  vb: `0 0 ${MARK_W} ${MARK_H}`,
  body: (c, uid) => {
    let bands = '';
    for (let y = -4; y < 164; y += 13) bands += `<rect x="-10" y="${y}" width="320" height="9"/>`;
    return `<defs><clipPath id="sl-${uid}">${bands}</clipPath></defs><g clip-path="url(#sl-${uid})">${fxMark(c)}</g>`;
  },
});

/* 04 — CLOUD : nokta bulutu */
add({
  id: 'fx-cloud',
  name: 'Cloud',
  tag: '3D tarama',
  note: 'Nokta bulutu. Tarama verisinin ham hâli — marka, ölçülen bir nesne gibi davranıyor.',
  vb: `0 0 ${MARK_W} ${MARK_H}`,
  body: (c) => {
    const shapes = [
      pts(F_TOP),
      [[0, 0], [28, 0], [28, 160], [0, 160]],
      pts(F_MID),
      pts(X_POLY).map(([x, y]) => [x + X_DX, y]),
    ];
    const sw = pts(X_SW).map(([x, y]) => [x + X_DX, y]);
    let dots = '';
    const P = 8.6;
    for (let gy = 0, j = 0; gy <= MARK_H; gy += P, j++) {
      for (let gx = 0, i = 0; gx <= MARK_W; gx += P, i++) {
        const x = gx + (j % 2 ? P / 2 : 0);
        if (!shapes.some((s) => inPoly(x, gy, s))) continue;
        const r = 2.2 + 1.5 * (((i * 7 + j * 13) % 5) / 4);
        const fill = inPoly(x, gy, sw) ? c.accent : c.ink;
        dots += `<circle cx="${x.toFixed(1)}" cy="${gy.toFixed(1)}" r="${r.toFixed(2)}" fill="${fill}"/>`;
      }
    }
    return dots;
  },
});

/* 05 — MESH : wireframe + vertex */
add({
  id: 'fx-mesh',
  name: 'Mesh',
  tag: 'Tersine mühendislik',
  note: 'Kontur + vertex. CAD ekranındaki tel kafes görünümü; ölçülen yüzeyin yeniden kurulması.',
  vb: `0 0 ${MARK_W} ${MARK_H}`,
  body: (c) => {
    const v = (x, y, fill) => `<rect x="${x - 4.5}" y="${y - 4.5}" width="9" height="9" fill="${fill}"/>`;
    const X = (x) => x + X_DX;
    // Sadece merkez elmas — fazlası tel kafesi okunmaz hâle getiriyor
    const diamond = `<polygon points="${X(100)},60 ${X(120)},80 ${X(100)},100 ${X(80)},80"/>`;
    const verts = [
      ...pts(X_POLY).map(([x, y]) => [X(x), y]),
      ...pts(F_UNION),
    ].map(([x, y]) => v(x, y, c.ink)).join('');
    const swv = [[80, 80], [100, 100], [40, 160], [0, 160]].map(([x, y]) => v(X(x), y, c.accent)).join('');
    return `
<g fill="none" stroke="${c.ink}" stroke-width="6.5" stroke-linejoin="miter">
  <polygon points="${F_UNION}"/>
  <polygon points="${X_POLY}" transform="translate(${X_DX},0)"/>
  ${diamond}
</g>
<polygon points="${X_SW}" transform="translate(${X_DX},0)" fill="none" stroke="${c.accent}" stroke-width="6"/>
${verts}${swv}`;
  },
});

/* 06 — SCAN : tarama süpürmesi */
add({
  id: 'fx-scan',
  name: 'Scan',
  tag: 'Lazer tarama',
  note: 'Markanın içinden geçen tarama çizgisi. Hareketli versiyonu intro/bumper için birebir.',
  vb: `0 0 ${MARK_W} ${MARK_H}`,
  body: (c, uid) => {
    // Taranmış bölge üstte veri çizgileriyle, süpürme çubuğu, altı henüz dokunulmamış
    let lines = '';
    for (let y = 3; y < 98; y += 7.6) {
      const o = (0.2 + 0.62 * (y / 98)).toFixed(2);
      lines += `<rect x="-10" y="${y.toFixed(1)}" width="320" height="2.8" fill="${c.accent}" opacity="${o}"/>`;
    }
    return `
<defs><clipPath id="sc-${uid}">${fxSilhouette()}</clipPath></defs>
<g clip-path="url(#sc-${uid})">
  <rect x="-10" y="-10" width="320" height="190" fill="${c.ink}"/>
  ${lines}
  <rect x="-10" y="102" width="320" height="9" fill="${c.accent}"/>
</g>`;
  },
});

/* 07 — BRACKET : teknik köşe işaretleri */
add({
  id: 'fx-bracket',
  name: 'Bracket',
  tag: 'Sosyal medya kartı',
  note: 'Ölçü çerçevesi. Kare ve 16:9 alanlarda markayı kendi başına ayakta tutuyor.',
  vb: '0 0 362 232',
  body: (c) => {
    const t = 9, L = 48, P = 4, W = 362, H = 232;
    const br = (x, y, sx, sy) =>
      `<path d="M${x},${y + sy * L}L${x},${y}L${x + sx * L},${y}L${x + sx * L},${y + sy * t}L${x + sx * t},${y + sy * t}L${x + sx * t},${y + sy * L}Z" fill="${c.accent}"/>`;
    return `
${br(P, P, 1, 1)}${br(W - P, P, -1, 1)}${br(P, H - P, 1, -1)}${br(W - P, H - P, -1, -1)}
<g transform="translate(36,36)">${fxMark(c)}</g>`;
  },
});

/* 08 — CORE : uygulama ikonu */
add({
  id: 'fx-core',
  name: 'Core',
  tag: 'App icon',
  note: 'Yuvarlatılmış kare içinde Apex. iOS/Android ikonu, Discord ve YouTube kanal görseli için.',
  vb: '0 0 512 512',
  square: true,
  body: (c) => `
<rect width="512" height="512" rx="114" fill="${c.ink}"/>
<g transform="translate(126,152) scale(1.3)">
  <polygon points="${X_POLY}" fill="${c.onInk}"/>
  <polygon points="${X_SW}" fill="${c.accent}"/>
</g>`,
});

/* 09 — STACK : ekstrüzyon */
add({
  id: 'fx-stack',
  name: 'Stack',
  tag: 'Derinlik / üretim',
  note: 'Katı modelin ekstrüzyonu. Fiziksel ürün, kalıp ve CNC tarafına bakan hacimli varyant.',
  vb: '0 0 304 174',
  body: (c) => `
<g transform="translate(14,14)">${fxMark({ ink: c.mute, accent: c.mute })}</g>
<g>${fxMark(c)}</g>`,
});

/* 10 — TRACE : PCB yolu */
add({
  id: 'fx-trace',
  name: 'Trace',
  tag: 'PCB / elektronik',
  note: 'İnce yol + pad. ESP32, gerber ve otomotiv elektroniği hattı için alt marka olarak çalışır.',
  vb: `0 0 ${MARK_W} ${MARK_H}`,
  body: (c) => {
    const X = (x) => x + X_DX;
    return `
<g stroke="${c.ink}" stroke-width="15" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path d="M14,14 L14,152"/>
  <path d="M14,14 L100,14"/>
  <path d="M14,80 L96,80"/>
  <path d="M${X(20)},6 L${X(180)},154"/>
</g>
<path d="M${X(180)},6 L${X(20)},154" stroke="${c.accent}" stroke-width="15" fill="none" stroke-linecap="round"/>
${ring(100, 14, 15, 6, c.ink)}/>
${ring(96, 80, 15, 6, c.ink)}/>
${ring(14, 152, 15, 6, c.ink)}/>
${ring(X(180), 154, 15, 6, c.ink)}/>
${ring(X(20), 6, 15, 6, c.ink)}/>
${ring(X(180), 6, 15, 6, c.accent)}/>
${ring(X(20), 154, 15, 6, c.accent)}/>`;
  },
});

/* ------------------------------------------------------------------ */
/* 4. KİLİTLENMELER (LOCKUP)                                           */
/* ------------------------------------------------------------------ */
const MS = 0.625, WS = 0.846; // yatay kilit ölçekleri
const lockups = [
  {
    id: 'fx-lockup-h',
    name: 'Yatay kilit',
    tag: 'Web header · antetli kâğıt',
    note: 'Varsayılan kullanım. Marka yüksekliği 100 birim, kelime markası optik olarak ortalanmış.',
    vb: '0 0 515 100',
    body: (c) => `
<g transform="scale(${MS})">${fxMark(c)}</g>
<g transform="translate(209.25,29) scale(${WS})">${word(c)}</g>`,
  },
  {
    id: 'fx-lockup-v',
    name: 'Dikey kilit',
    tag: 'Avatar · damga · ambalaj',
    note: 'Kare alanlarda ve dar yerlerde. Kelime markası genişliği, marka genişliğine kilitli.',
    vb: '0 0 290 226',
    body: (c) => `
${fxMark(c)}
<g transform="translate(0,184) scale(${(290 / WORD_W).toFixed(4)})">${word(c)}</g>`,
  },
  {
    id: 'fixral-wordmark',
    name: 'Kelime markası',
    tag: 'Tek başına',
    note: 'Markanın zaten tanındığı yerlerde: fatura altlığı, sponsor şeridi, merch.',
    vb: `0 0 ${WORD_W} ${WORD_H}`,
    body: (c) => word(c),
  },
];

/* ------------------------------------------------------------------ */
/* 5. RENK VARYANTLARI + SVG DOSYALARI                                 */
/* ------------------------------------------------------------------ */
const INK = '#101828', ACCENT = '#F97316', MUTE = '#3A3F46';
const variants = {
  '': { ink: INK, accent: ACCENT, mute: MUTE, onInk: '#FFFFFF' },
  '-white': { ink: '#FFFFFF', accent: ACCENT, mute: '#6E7681', onInk: '#FFFFFF' },
  '-mono': { ink: INK, accent: INK, mute: '#6E7681', onInk: '#FFFFFF' },
  '-mono-white': { ink: '#FFFFFF', accent: '#FFFFFF', mute: '#9AA1AB', onInk: '#101828' },
};

const all = [...concepts, ...lockups];
let count = 0;
for (const cpt of all) {
  for (const [sfx, c] of Object.entries(variants)) {
    const [, , w, h] = cpt.vb.split(' ').map(Number);
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${cpt.vb}" width="${w}" height="${h}" role="img" aria-label="Fixral ${cpt.name}">
<title>Fixral — ${cpt.name}${sfx}</title>
${cpt.body(c, cpt.id + sfx).trim()}
</svg>
`;
    writeFileSync(join(OUT, `${cpt.id}${sfx}.svg`), svg, 'utf8');
    count++;
  }
}

/* ------------------------------------------------------------------ */
/* 6. SHOWCASE                                                         */
/* ------------------------------------------------------------------ */
const V = { ink: 'var(--mk)', accent: 'var(--mk-ac)', mute: 'var(--mk-mute)', onInk: 'var(--mk-on)' };
const svgTag = (cpt, cls = '') =>
  `<svg class="mk ${cls}" viewBox="${cpt.vb}" role="img" aria-label="Fixral ${cpt.name}">${cpt.body(V, 'ui-' + cpt.id)}</svg>`;

const num = (n) => String(n).padStart(2, '0');

const conceptCards = concepts
  .map(
    (c, i) => `
<article class="card${c.square ? ' card--sq' : ''}">
  <div class="stage">${svgTag(c)}</div>
  <div class="meta">
    <p class="idx">${num(i + 1)} <span>${c.tag}</span></p>
    <h3>FX ${c.name}</h3>
    <p class="desc">${c.note}</p>
    <p class="file">${c.id}.svg</p>
  </div>
</article>`
  )
  .join('');

const lockCards = lockups
  .map(
    (c) => `
<article class="card card--wide">
  <div class="stage stage--lock">${svgTag(c)}</div>
  <div class="meta">
    <p class="idx"><span>${c.tag}</span></p>
    <h3>${c.name}</h3>
    <p class="desc">${c.note}</p>
    <p class="file">${c.id}.svg</p>
  </div>
</article>`
  )
  .join('');

const blade = concepts[0], apex = concepts[1], core = concepts[7];

const swatches = [
  ['#101828', 'Ink', 'Ana yüzey ve marka'],
  ['#3A3F46', 'Graphite', 'İkincil, ekstrüzyon gölgesi'],
  ['#F97316', 'Torch', 'Tek vurgu — asla ikinci bir renk'],
  ['#F3F4F6', 'Paper', 'Açık zemin'],
  ['#FFFFFF', 'White', 'Ters kullanım'],
]
  .map(
    ([hex, n, u]) => `<li class="sw"><span class="chip" style="background:${hex}"></span>
    <b>${n}</b><code>${hex}</code><em>${u}</em></li>`
  )
  .join('');

const html = `<meta name="claude:viewport-fit-sides" content="cover">
<title>Fixral Mark System</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
/* Düzen: tam genişlikte koyu atölye şeritleri, içte 1180px ızgara */
:root{
  --bg:#0C0E12; --panel:#14171D; --line:#242931; --fg:#EEF1F5; --dim:#8E97A3;
  --ac:#F97316; --ac-soft:#F9731622;
  --mk:#FFFFFF; --mk-ac:#F97316; --mk-mute:#4A515B; --mk-on:#FFFFFF;
  --display:'Space Grotesk','Arial Narrow',system-ui,sans-serif;
  --body:'Inter',system-ui,-apple-system,sans-serif;
  --mono:'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace;
  color-scheme:dark;
}
@media (prefers-color-scheme:light){
  :root:not([data-theme="dark"]){
    --bg:#FAFAFB; --panel:#F1F2F4; --line:#DFE2E7; --fg:#101828; --dim:#5C646F;
    --ac:#D9600A; --ac-soft:#F9731618;
    --mk:#101828; --mk-ac:#F97316; --mk-mute:#C3C8CF; --mk-on:#FFFFFF;
    color-scheme:light;
  }
}
:root[data-theme="light"]{
  --bg:#FAFAFB; --panel:#F1F2F4; --line:#DFE2E7; --fg:#101828; --dim:#5C646F;
  --ac:#D9600A; --ac-soft:#F9731618;
  --mk:#101828; --mk-ac:#F97316; --mk-mute:#C3C8CF; --mk-on:#FFFFFF;
  color-scheme:light;
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font-family:var(--body);line-height:1.6;-webkit-font-smoothing:antialiased}
.wrap{max-width:1180px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
section{padding-block:clamp(44px,6vw,86px)}
section+section{border-top:1px solid var(--line)}

.eyebrow{font-family:var(--mono);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--ac);margin:0 0 14px}
h1{font-family:var(--display);font-weight:700;font-size:clamp(34px,6vw,60px);line-height:1.02;letter-spacing:-.02em;margin:0 0 18px;text-wrap:balance}
h2{font-family:var(--display);font-weight:700;font-size:clamp(22px,3vw,30px);letter-spacing:-.015em;margin:0 0 8px;text-wrap:balance}
h3{font-family:var(--display);font-weight:500;font-size:19px;letter-spacing:-.01em;margin:0 0 6px}
.lede{color:var(--dim);max-width:62ch;font-size:16px;margin:0}
.sec-head{margin-bottom:clamp(24px,3vw,40px)}

/* Başlık */
.hero{padding-block:clamp(40px,6vw,76px) clamp(32px,4vw,56px)}
.hero-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.85fr);gap:clamp(24px,4vw,56px);align-items:center}
@media(max-width:760px){.hero-grid{grid-template-columns:1fr}}
.hero-mark{background:var(--panel);border:1px solid var(--line);padding:clamp(26px,4vw,48px);display:grid;place-items:center;min-width:0}
.hero-mark svg{width:100%;max-width:420px;height:auto}
.rule{display:flex;gap:10px;align-items:center;font-family:var(--mono);font-size:11px;letter-spacing:.14em;color:var(--dim);text-transform:uppercase;margin-top:18px}
.rule::before{content:"";height:1px;flex:0 0 42px;background:var(--ac)}

/* Izgara */
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:18px}
.grid--lock{grid-template-columns:repeat(auto-fill,minmax(340px,1fr))}
.card{border:1px solid var(--line);background:var(--panel);display:flex;flex-direction:column;min-width:0}
.stage{aspect-ratio:16/9;display:grid;place-items:center;padding:30px;border-bottom:1px solid var(--line);background:
  linear-gradient(var(--line) 1px,transparent 1px) 0 0/100% 34px,
  linear-gradient(90deg,var(--line) 1px,transparent 1px) 0 0/34px 100%;
  background-color:transparent;min-width:0}
.stage--lock{aspect-ratio:21/9}
.mk{width:100%;height:100%;max-height:150px;object-fit:contain;display:block}
.card--sq .mk{max-height:128px}
.meta{padding:18px 20px 20px;display:flex;flex-direction:column;gap:2px;flex:1}
.idx{font-family:var(--mono);font-size:11px;letter-spacing:.14em;color:var(--ac);margin:0 0 8px;text-transform:uppercase}
.idx span{color:var(--dim);margin-left:8px}
.desc{color:var(--dim);font-size:14px;margin:4px 0 0}
.file{font-family:var(--mono);font-size:11px;color:var(--dim);opacity:.65;margin:14px 0 0}

/* Renk varyantları */
.vars{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:14px}
.var{border:1px solid var(--line);padding:26px 18px;display:grid;place-items:center;gap:0;min-height:128px}
.var svg{width:100%;max-width:170px;height:auto}
.var p{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;margin:16px 0 0;opacity:.7}
.v-dark{background:#101828;color:#fff}
.v-light{background:#F3F4F6;color:#101828}
.v-ac{background:#F97316;color:#1a1005}
.v-out{background:transparent;color:var(--fg)}

/* Renk + tipografi */
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:clamp(24px,4vw,48px)}
.sws{list-style:none;padding:0;margin:0;display:grid;gap:10px}
.sw{display:grid;grid-template-columns:40px auto 1fr;align-items:center;gap:12px;border-bottom:1px solid var(--line);padding-bottom:10px}
.chip{width:40px;height:40px;border:1px solid var(--line);display:block}
.sw b{font-family:var(--display);font-weight:500;font-size:15px}
.sw code{font-family:var(--mono);font-size:12px;color:var(--dim);grid-column:2}
.sw em{grid-column:3;grid-row:1/3;font-style:normal;font-size:13px;color:var(--dim);text-align:right}
.type-row{border-bottom:1px solid var(--line);padding:14px 0;display:flex;justify-content:space-between;gap:16px;align-items:baseline;flex-wrap:wrap}
.type-row span:last-child{font-family:var(--mono);font-size:11px;color:var(--dim);letter-spacing:.1em;text-transform:uppercase}
.t1{font-family:var(--display);font-weight:700;font-size:26px;letter-spacing:-.01em}
.t2{font-family:var(--body);font-size:17px}
.t3{font-family:var(--mono);font-size:15px}

/* Uygulamalar */
.apps{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:18px;align-items:start}
.app{min-width:0}
.app .frame{border:1px solid var(--line);background:var(--panel);display:grid;place-items:center;padding:22px;min-height:168px}
.app p{font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);margin:10px 0 0}
.avatar{width:120px;height:120px;border-radius:50%;background:#101828;display:grid;place-items:center;overflow:hidden}
.avatar svg{width:62px;height:auto}
.appicon{width:120px;height:120px}
.appicon svg{width:100%;height:100%;display:block;border-radius:26px}
.fav{display:flex;gap:16px;align-items:flex-end}
.fav i{display:grid;place-items:center;background:#101828;border-radius:4px}
.fav i svg{width:70%;height:auto}
.f32{width:32px;height:32px}.f16{width:16px;height:16px;border-radius:2px}.f48{width:48px;height:48px;border-radius:6px}
.banner{grid-column:1/-1}
.banner .frame{padding:0;min-height:0;position:relative;aspect-ratio:16/5;background:#101828;overflow:hidden}
.banner .safe{position:absolute;inset:14% 26%;border:1px dashed #F9731655;display:grid;place-items:center}
.banner .safe svg{width:min(70%,320px);height:auto}
.banner .tagline{position:absolute;left:50%;bottom:11%;transform:translateX(-50%);font-family:var(--mono);font-size:clamp(8px,1.1vw,13px);letter-spacing:.3em;color:#8E97A3;text-transform:uppercase;white-space:nowrap}
.card-mock{aspect-ratio:1.75/1;background:#101828;display:grid;place-items:center;width:100%;max-width:260px}
.card-mock svg{width:62%;height:auto}

/* Boşluk kuralı */
.clear{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:22px;align-items:center}
.clearbox{position:relative;border:1px dashed var(--line);padding:11.5%;background:var(--panel)}
.clearbox svg{width:100%;height:auto;display:block}
.clearbox::after{content:"x = F gövde kalınlığı × 2";position:absolute;left:10px;bottom:8px;font-family:var(--mono);font-size:10px;letter-spacing:.1em;color:var(--dim)}
.rules{list-style:none;margin:0;padding:0;display:grid;gap:12px}
.rules li{display:grid;grid-template-columns:18px 1fr;gap:12px;font-size:14px;color:var(--dim);border-bottom:1px solid var(--line);padding-bottom:12px}
.rules b{color:var(--fg);font-weight:500;font-family:var(--display)}
.rules i{font-style:normal;color:var(--ac);font-family:var(--mono);font-size:12px}

/* Toggle */
.bar{position:sticky;top:env(safe-area-inset-top,0px);z-index:10;background:var(--bg);border-bottom:1px solid var(--line)}
body::before{content:"";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);z-index:10;background:var(--bg)}
.bar .wrap{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-block:12px}
.brandline{display:flex;align-items:center;gap:10px;font-family:var(--mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--dim);min-width:0}
.brandline svg{height:17px;width:auto;flex:0 0 auto}
.brandline span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
button{font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;background:transparent;color:var(--fg);border:1px solid var(--line);padding:7px 13px;cursor:pointer;flex:0 0 auto}
button:hover{border-color:var(--ac);color:var(--ac)}
button:focus-visible{outline:2px solid var(--ac);outline-offset:2px}
footer{padding-block:34px;color:var(--dim);font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style>

<div class="bar"><div class="wrap">
  <span class="brandline">${svgTag(blade)}<span>Mark System · v2</span></span>
  <button id="themeBtn" type="button">Tema</button>
</div></div>

<header class="hero wrap">
  <div class="hero-grid">
    <div>
      <p class="eyebrow">Fixral · Kimlik Çalışması</p>
      <h1>On marka, tek geometri.</h1>
      <p class="lede">Hepsi aynı 45° ızgaradan türüyor: F’in üst kolu kesilip X’in bıçağına akıyor, turuncu yalnızca güneybatı kolunda duruyor. Konseptler birbirinin alternatifi değil — biri ana marka, diğerleri aynı ailenin iş koluna göre konuşan versiyonları.</p>
      <p class="rule">45° ızgara · 28 birim gövde · tek vurgu rengi</p>
    </div>
    <div class="hero-mark">${svgTag(lockups[0])}</div>
  </div>
</header>

<section class="wrap">
  <div class="sec-head">
    <p class="eyebrow">01 — Konseptler</p>
    <h2>Marka ailesi</h2>
    <p class="lede">Her kart 16:9 bir sahnede duruyor; ızgara çizgileri markanın optik ağırlığını göstermek için.</p>
  </div>
  <div class="grid">${conceptCards}</div>
</section>

<section class="wrap">
  <div class="sec-head">
    <p class="eyebrow">02 — Renk varyantları</p>
    <h2>Her zeminde aynı marka</h2>
    <p class="lede">Dört zorunlu varyant. Gradyan, gölge, dış çizgi ve ikinci bir vurgu rengi yok.</p>
  </div>
  <div class="vars">
    <div class="var v-dark">${svgTag(blade)}<p>Koyu zemin</p></div>
    <div class="var v-light">${svgTag(blade)}<p>Açık zemin</p></div>
    <div class="var v-ac">${svgTag(blade)}<p>Turuncu zemin · tek renk</p></div>
    <div class="var v-out">${svgTag(blade)}<p>Tek renk baskı · gravür</p></div>
  </div>
</section>

<section class="wrap">
  <div class="sec-head">
    <p class="eyebrow">03 — Kilitlenmeler</p>
    <h2>Marka + kelime markası</h2>
    <p class="lede">Kelime markası mevcut logonuzdan alınan outline’lar — font kurulumuna bağlı değil, her yerde aynı açılır.</p>
  </div>
  <div class="grid grid--lock">${lockCards}</div>
</section>

<section class="wrap">
  <div class="sec-head">
    <p class="eyebrow">04 — Uygulama</p>
    <h2>Gerçek yüzeylerde</h2>
    <p class="lede">16 px favicon’dan YouTube banner’ına kadar aynı geometri okunuyor.</p>
  </div>
  <div class="apps">
    <div class="app"><div class="frame"><span class="avatar">${svgTag(apex)}</span></div><p>Sosyal avatar</p></div>
    <div class="app"><div class="frame"><span class="appicon">${svgTag(core)}</span></div><p>App icon · 512</p></div>
    <div class="app"><div class="frame"><span class="fav">
      <i class="f48">${svgTag(apex)}</i><i class="f32">${svgTag(apex)}</i><i class="f16">${svgTag(apex)}</i>
    </span></div><p>Favicon 48 / 32 / 16</p></div>
    <div class="app"><div class="frame"><span class="card-mock">${svgTag(lockups[1])}</span></div><p>Kartvizit · ön yüz</p></div>
    <div class="app banner"><div class="frame">
      <span class="safe">${svgTag(lockups[0])}</span>
      <span class="tagline">Reverse Engineering · 3D Scan · CAD · CNC · Electronics</span>
    </div><p>YouTube banner · kesikli çizgi mobil güvenli alan</p></div>
  </div>
</section>

<section class="wrap">
  <div class="sec-head">
    <p class="eyebrow">05 — Sistem</p>
    <h2>Renk ve tipografi</h2>
  </div>
  <div class="cols">
    <div><ul class="sws">${swatches}</ul></div>
    <div>
      <div class="type-row"><span class="t1">Space Grotesk Bold</span><span>Başlık · marka</span></div>
      <div class="type-row"><span class="t2">Inter Regular — gövde metni, ürün açıklaması, web içeriği</span><span>Gövde</span></div>
      <div class="type-row"><span class="t3">JetBrains Mono — Ø42.5 ±0.02 mm</span><span>Teknik veri · etiket</span></div>
      <p class="desc" style="margin-top:18px">Üçü de Google Fonts’ta; web, Figma ve baskıda aynı. Ölçü, tolerans ve dosya adı gibi her şey mono ile yazılıyor — markanın mühendislik tarafını taşıyan asıl detay bu.</p>
    </div>
  </div>
</section>

<section class="wrap">
  <div class="sec-head">
    <p class="eyebrow">06 — Kullanım</p>
    <h2>Boşluk ve sınırlar</h2>
  </div>
  <div class="clear">
    <div class="clearbox">${svgTag(blade)}</div>
    <ul class="rules">
      <li><i>→</i><span><b>Koruma alanı:</b> her yönde x = 56 birim (F gövdesinin iki katı). İçine hiçbir şey girmez.</span></li>
      <li><i>→</i><span><b>Minimum boy:</b> yatay kilit 120 px / 32 mm. Altında Apex’e geç.</span></li>
      <li><i>→</i><span><b>Turuncu tek yerde:</b> güneybatı kolu. İkinci bir vurgu rengi eklenmez.</span></li>
      <li><i>→</i><span><b>Yapılmaz:</b> germek, eğmek, gölge/gradyan eklemek, kelime markasını yeniden dizmek, turuncuyu başka bir kola taşımak.</span></li>
      <li><i>→</i><span><b>Fotoğraf üzerinde:</b> beyaz varyant + en az %45 koyultma. Doğrudan desenli zemine konmaz.</span></li>
    </ul>
  </div>
</section>

<footer class="wrap">${count} SVG dosyası · brand/logo-v2/svg/ · node brand/logo-v2/build.mjs</footer>

<script>
(function(){
  var b=document.getElementById('themeBtn');
  b.addEventListener('click',function(){
    var r=document.documentElement;
    var dark=r.getAttribute('data-theme')==='dark'||(!r.getAttribute('data-theme')&&matchMedia('(prefers-color-scheme: dark)').matches);
    r.setAttribute('data-theme',dark?'light':'dark');
  });
})();
</script>
`;

writeFileSync(join(HERE, 'showcase.html'), html, 'utf8');
console.log(`${count} SVG yazıldı -> ${OUT}`);
console.log(`showcase.html yazıldı -> ${join(HERE, 'showcase.html')}`);
