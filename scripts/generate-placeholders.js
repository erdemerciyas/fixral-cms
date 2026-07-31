/**
 * generate-placeholders.js — eksik statik görselleri üretir.
 * - /public/images/placeholder.jpg : haber kartı fallback görseli (16:9, nötr yüzey)
 * - /public/og-image.jpg           : Open Graph fallback görseli (1200x630, marka)
 * Çalıştırma: node scripts/generate-placeholders.js
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const BRAND = '#FA6831';

async function makePlaceholder() {
  const dir = path.join(PUBLIC_DIR, 'images');
  fs.mkdirSync(dir, { recursive: true });
  const svg = `
    <svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
      <rect width="1280" height="720" fill="#EDEDED"/>
      <rect x="0" y="712" width="1280" height="8" fill="${BRAND}"/>
      <g transform="translate(640,340)">
        <rect x="-56" y="-44" width="112" height="88" rx="8" fill="none" stroke="#B3B3B3" stroke-width="6"/>
        <circle cx="-24" cy="-16" r="10" fill="#B3B3B3"/>
        <path d="M -44 30 L -8 -6 L 16 18 L 32 2 L 52 30 Z" fill="#B3B3B3"/>
      </g>
      <text x="640" y="460" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#767676">Fixral</text>
    </svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 80 }).toFile(path.join(dir, 'placeholder.jpg'));
  console.log('✓ public/images/placeholder.jpg');
}

async function makeOgImage() {
  const svg = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="#1C1E21"/>
      <rect x="0" y="614" width="1200" height="16" fill="${BRAND}"/>
      <text x="80" y="330" font-family="Arial, sans-serif" font-size="88" font-weight="bold" fill="#FFFFFF">Fixral</text>
      <text x="80" y="400" font-family="Arial, sans-serif" font-size="34" fill="#B3B3B3">3D Tarama · Tersine Mühendislik · Prototipleme</text>
    </svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 85 }).toFile(path.join(PUBLIC_DIR, 'og-image.jpg'));
  console.log('✓ public/og-image.jpg');
}

Promise.all([makePlaceholder(), makeOgImage()]).catch((err) => {
  console.error(err);
  process.exit(1);
});
