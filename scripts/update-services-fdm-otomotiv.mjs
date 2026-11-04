#!/usr/bin/env node
/**
 * Tek seferlik: canlı veritabanındaki "3d-baski" ve "otomotiv-elektronigi" hizmet
 * kayıtlarını src/content/fixral.ts katalog metniyle günceller. Görsel, sıra,
 * aktiflik ve _fx alanları korunur. Çalıştırma: node scripts/update-services-fdm-otomotiv.mjs
 */
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { SERVICES } from '../src/content/fixral.ts';

dotenv.config({ path: '.env.local' });
dotenv.config();
const p = new PrismaClient();

const DESC = {
  'otomotiv-elektronigi': '<p>Araca özel, custom otomotiv teknolojileri: harici beyin (standalone ECU) uygulamaları, custom gösterge (cluster) ve araç dashboard sistemleri, CAN-bus ve K-line iletişim çözümleri. Harici beyin tarafında çözüm ortağımız Extreme ECU ile çalışıyoruz. Detaylı bilgi için <a href="https://extremeecu.com" target="_blank" rel="noopener">extremeecu.com</a> adresini ziyaret edebilirsiniz.</p>',
  '3d-baski': '<p>FDM baskı ile prototipten küçük seri üretime kadar profesyonel 3D baskı hizmeti. PLA, PETG, ASA, ABS, naylon ve TPU gibi malzemelerle, parçanın göreceği yük ve ısıya uygun fonksiyonel test parçaları ve son kullanım ürünleri üretiyoruz. Kırık ya da yıpranmış plastik parçaların tamiri ve restorasyonunda da destek veriyoruz.</p>',
};

try {
  for (const slug of Object.keys(DESC)) {
    const s = SERVICES.find((x) => x.slug === slug);
    const row = await p.serviceRow.findUnique({ where: { slug } });
    if (!row) { console.log('kayıt yok, atlandı:', slug); continue; }
    const t = s.text.tr;
    const prev = row.translations && typeof row.translations === 'object' ? row.translations : {};
    const translations = { ...prev, tr: { ...prev.tr, title: t.name, excerpt: t.short, lede: t.lede, when: [...t.when], flow: t.flow, spec: t.spec, description: DESC[slug] } };
    await p.serviceRow.update({ where: { slug }, data: { title: t.name, description: DESC[slug], features: [...t.when], translations } });
    console.log('güncellendi:', slug, '→', t.name);
  }
  const rows = await p.serviceRow.findMany();
  const re = /\bSLA\b|\bSLS\b|DSG|chiptun|Otomotiv Elektroni|reçine/i;
  console.log('kalan eşleşme:', rows.filter((r) => re.test(JSON.stringify(r))).map((r) => r.slug).join(', ') || 'yok');
} finally {
  await p.$disconnect();
}
