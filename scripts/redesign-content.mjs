#!/usr/bin/env node
/**
 * FIXRAL redesign 2026 — veritabanı içerik uyarlaması.
 *
 * Varsayılan olarak yalnızca ne yapacağını yazar (dry run). Uygulamak için:
 *   node scripts/redesign-content.mjs --apply
 *
 * Yaptıkları (--apply ile):
 *  1. Sayfa ayarları (PageSettingRow): "software" sayfasını ekler; menü sırasını
 *     Hizmetler · Yazılımlar · Projeler · Haberler · Videolar · İletişim yapar;
 *     portfolyo başlığını "Projeler" yapar. Var olan açıklama/ikon/aktiflik korunur.
 *  2. Hizmetler (ServiceRow): katalogdaki 8 hizmeti (src/content/fixral.ts) slug'larıyla
 *     panele "web sitesi" kaydı olarak yazar: başlık, kısa açıklama, giriş, "ne zaman",
 *     iş akışı, sınırlar ve `translations._fx` yapı alanları (disiplin, ikon,
 *     dosyalar, 3D görünüm, yazılımlar). Böylece hizmetlerin tamamı panelden düzenlenir.
 *     Görsel ve eski uzun metin ("Hizmet hakkında") korunur / eski slug'dan taşınır.
 *     Panelde web alanları zaten doldurulmuş kayıtlara dokunulmaz (--force-services ile
 *     katalog metniyle yeniden yazılır).
 *
 * İsteğe bağlı bayraklar:
 *   --deactivate-old-services  Katalogda olmayan eski hizmetleri pasife alır (silmez).
 *   --force-services           Web alanları dolu kayıtları da katalog metniyle yeniler.
 *   --hide-demo                Seed'den gelen örnek proje ve haberleri (id "seed-" ile
 *                              başlayan) pasife alır (silmez).
 *
 * Gereksinim: Node 22.18+ (TypeScript katalog dosyasını doğrudan içe aktarır),
 * .env.local içinde DATABASE_URL.
 */
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { SERVICES } from '../src/content/fixral.ts';

dotenv.config({ path: '.env.local' });
dotenv.config();

const args = new Set(process.argv.slice(2));
const APPLY = args.has('--apply');
const DEACTIVATE_OLD = args.has('--deactivate-old-services');
const HIDE_DEMO = args.has('--hide-demo');
const FORCE_SERVICES = args.has('--force-services');
const prisma = new PrismaClient();
const log = (...m) => console.log(APPLY ? '•' : '(dry run) •', ...m);

const NAV = [
  { pageId: 'home', order: 0 },
  { pageId: 'services', order: 1 },
  { pageId: 'software', order: 2, create: { title: 'Yazılımlar', path: '/software', description: 'Atölyenin araçları, herkesin tarayıcısında.', icon: 'CodeBracketIcon' } },
  { pageId: 'portfolio', order: 3, title: 'Projeler' },
  { pageId: 'news', order: 4 },
  { pageId: 'videos', order: 5 },
  { pageId: 'contact', order: 6 },
];

async function pages() {
  for (const p of NAV) {
    const row = await prisma.pageSettingRow.findUnique({ where: { pageId: p.pageId } });
    if (!row) {
      if (!p.create) { log(`sayfa "${p.pageId}" yok, atlandı`); continue; }
      log(`sayfa ekle: ${p.pageId} (${p.create.path}) sıra ${p.order}`);
      if (APPLY) await prisma.pageSettingRow.create({ data: { pageId: p.pageId, ...p.create, isActive: true, showInNavigation: true, isExternal: false, order: p.order } });
      continue;
    }
    const data = { order: p.order, ...(p.title ? { title: p.title } : {}) };
    log(`sayfa güncelle: ${p.pageId} → ${JSON.stringify(data)}`);
    if (APPLY) await prisma.pageSettingRow.update({ where: { pageId: p.pageId }, data });
  }
}

const stripTags = (h) => String(h || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

/** Katalog metni → panelin dil alanları (translations.<dil>) */
const langFields = (t, about) => ({
  title: t.name,
  excerpt: t.short,
  lede: t.lede,
  when: [...t.when],
  flow: t.flow.map((r) => [...r]),
  spec: t.spec.map((r) => [...r]),
  // Uzun metin yalnızca gerçek bir "Hizmet hakkında" içeriği varsa yazılır
  description: about && stripTags(about) !== stripTags(t.lede) ? about : '',
});

async function services() {
  const keep = new Set();
  for (const [i, s] of SERVICES.entries()) {
    keep.add(s.slug);
    const existing = await prisma.serviceRow.findUnique({ where: { slug: s.slug } });
    const prev = existing?.translations && typeof existing.translations === 'object' ? existing.translations : {};
    if (prev._fx && !FORCE_SERVICES) {
      log(`hizmet panelde düzenlenmiş, atlandı: ${s.slug} (--force-services ile yenilenir)`);
      continue;
    }
    // Eski kayıttaki görsel ve uzun metni yeni slug'a taşı (ör. 3d-baski-hizmetleri → 3d-baski)
    let image = existing?.image || '';
    let aboutTr = prev.tr?.description || existing?.description || '';
    for (const alias of s.dbSlugs) {
      if (image && aboutTr) break;
      const old = await prisma.serviceRow.findUnique({ where: { slug: alias } });
      if (!old) continue;
      const ot = old.translations && typeof old.translations === 'object' ? old.translations : {};
      if (!image && old.image) image = old.image;
      if (!stripTags(aboutTr) || stripTags(aboutTr) === stripTags(s.text.tr.lede)) aboutTr = ot.tr?.description || old.description || aboutTr;
    }
    const tr = langFields(s.text.tr, aboutTr);
    const translations = {
      ...prev,
      _fx: { enabled: true, discipline: s.discipline, icon: s.key, files: [...s.files], viz: s.viz, part: s.part, software: [...s.software] },
      tr,
    };
    delete translations.es; // site tek dilli (Türkçe)
    log(`${existing ? 'hizmet güncelle' : 'hizmet ekle'}: ${s.slug} (${s.text.tr.name})${image ? ' · görsel korunuyor' : ''}${tr.description ? ' · uzun metin korunuyor' : ''}`);
    if (!APPLY) continue;
    const base = { title: s.text.tr.name, description: tr.description || `<p>${s.text.tr.lede}</p>`, features: [...s.text.tr.when], isActive: true, order: i + 1, translations, icon: s.key, image };
    if (existing) await prisma.serviceRow.update({ where: { slug: s.slug }, data: base });
    else await prisma.serviceRow.create({ data: { slug: s.slug, ...base } });
  }
  if (DEACTIVATE_OLD) {
    const old = await prisma.serviceRow.findMany({ where: { isActive: true } });
    for (const o of old) {
      if (keep.has(o.slug)) continue;
      log(`eski hizmeti pasife al: ${o.slug} (${o.title})`);
      if (APPLY) await prisma.serviceRow.update({ where: { id: o.id }, data: { isActive: false } });
    }
  }
}

async function demo() {
  if (!HIDE_DEMO) return;
  const pf = await prisma.portfolioRow.findMany({ where: { id: { startsWith: 'seed-' }, isActive: true }, select: { id: true, title: true } });
  const nw = await prisma.newsRow.findMany({ where: { id: { startsWith: 'seed-' }, isActive: true }, select: { id: true, title: true } });
  pf.forEach((p) => log(`örnek projeyi pasife al: ${p.title}`));
  nw.forEach((n) => log(`örnek haberi pasife al: ${n.title}`));
  if (APPLY) {
    await prisma.portfolioRow.updateMany({ where: { id: { in: pf.map((p) => p.id) } }, data: { isActive: false } });
    await prisma.newsRow.updateMany({ where: { id: { in: nw.map((n) => n.id) } }, data: { isActive: false } });
  }
}

try {
  await pages();
  await services();
  await demo();
  console.log(APPLY ? '\nTamamlandı.' : '\nDry run bitti. Uygulamak için --apply ekleyin.');
} catch (e) {
  console.error('Hata:', e);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
