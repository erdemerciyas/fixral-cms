/**
 * Panel: FIXRAL site içeriği ve yazılımlar.
 *   GET  /api/admin/fx-content?key=site|software → { stored, resolved, defaults, updatedAt }
 *   PUT  /api/admin/fx-content?key=site|software  body: { value } → kaydeder, siteyi tazeler
 * Kayıt yeri: ContentSettingRow (key 'fx-site' / 'fx-software'), yedeklemeye dahildir.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { FX_SITE_KEY, FX_SOFTWARE_KEY, revalidateFx } from '@/lib/fx-data-server';
import { catalogSoftware, defaultFxSite, normalizeSoftware, resolveFxSite } from '@/content/fx-data';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const KEYS = { site: FX_SITE_KEY, software: FX_SOFTWARE_KEY } as const;
type Key = keyof typeof KEYS;

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  return session?.user && role === 'admin' ? session : null;
}

function parseKey(req: NextRequest): Key | null {
  const k = req.nextUrl.searchParams.get('key');
  return k === 'site' || k === 'software' ? k : null;
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  const key = parseKey(req);
  if (!key) return NextResponse.json({ error: 'Geçersiz anahtar (site | software)' }, { status: 400 });
  try {
    const row = await prisma.contentSettingRow.findUnique({ where: { key: KEYS[key] } });
    const stored = row?.value ?? null;
    if (key === 'site') {
      return NextResponse.json({ key, stored, resolved: resolveFxSite(stored), defaults: defaultFxSite(), updatedAt: row?.updatedAt ?? null });
    }
    return NextResponse.json({ key, stored, resolved: normalizeSoftware(stored) ?? catalogSoftware(), defaults: catalogSoftware(), updatedAt: row?.updatedAt ?? null });
  } catch (e) {
    console.error('[fx-content] GET', e);
    return NextResponse.json({ error: 'İçerik okunamadı' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  const key = parseKey(req);
  if (!key) return NextResponse.json({ error: 'Geçersiz anahtar (site | software)' }, { status: 400 });
  let body: { value?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON' }, { status: 400 });
  }
  const value = body?.value;
  if (!value || typeof value !== 'object') return NextResponse.json({ error: 'value alanı gerekli' }, { status: 400 });
  if (JSON.stringify(value).length > 500_000) return NextResponse.json({ error: 'İçerik çok büyük' }, { status: 413 });
  if (key === 'software') {
    const items = (value as { items?: unknown }).items;
    if (!Array.isArray(items)) return NextResponse.json({ error: 'items dizisi gerekli' }, { status: 400 });
    const slugs = items.map((i) => (i && typeof i === 'object' ? String((i as { slug?: unknown }).slug || '') : ''));
    if (slugs.some((s) => !/^[a-z0-9-]{2,80}$/.test(s))) return NextResponse.json({ error: 'Her yazılımın slug alanı küçük harf, rakam ve tire içermeli' }, { status: 400 });
    if (new Set(slugs).size !== slugs.length) return NextResponse.json({ error: 'Slug alanları benzersiz olmalı' }, { status: 400 });
  }
  try {
    const json = JSON.parse(JSON.stringify(value));
    const row = await prisma.contentSettingRow.upsert({
      where: { key: KEYS[key] },
      update: { value: json },
      create: { key: KEYS[key], value: json },
    });
    revalidateFx();
    return NextResponse.json({ ok: true, key, updatedAt: row.updatedAt });
  } catch (e) {
    console.error('[fx-content] PUT', e);
    return NextResponse.json({ error: 'Kaydedilemedi' }, { status: 500 });
  }
}

/** Kaydı silip varsayılana döner */
export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  const key = parseKey(req);
  if (!key) return NextResponse.json({ error: 'Geçersiz anahtar (site | software)' }, { status: 400 });
  try {
    await prisma.contentSettingRow.deleteMany({ where: { key: KEYS[key] } });
    revalidateFx();
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[fx-content] DELETE', e);
    return NextResponse.json({ error: 'Sıfırlanamadı' }, { status: 500 });
  }
}
