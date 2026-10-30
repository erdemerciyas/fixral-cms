/**
 * Panel: FX 3D (Cults3D modelleri).
 *   GET  /api/admin/fx-3d  → { configured, nick, profileUrl, models (gizliler dahil, canlı), hidden, updatedAt, error? }
 *   PUT  /api/admin/fx-3d  body: { hidden: slug[] } → görünürlüğü kaydeder, siteyi tazeler
 *   POST /api/admin/fx-3d  → yalnızca Cults3D önbelleğini yeniler
 * Kayıt yeri: ContentSettingRow (key 'fx-3d'), yedeklemeye dahildir.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { FX3D_KEY, cultsCredentials, cultsProfileUrl, fetchCultsModels, readFx3dSettings, revalidateFx3d } from '@/lib/cults3d';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  return session?.user && role === 'admin' ? session : null;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  const cred = cultsCredentials();
  const { settings, updatedAt } = await readFx3dSettings().catch(() => ({ settings: { hidden: [] as string[] }, updatedAt: null }));
  const base = { configured: !!cred, nick: cred?.nick ?? null, profileUrl: cultsProfileUrl(cred?.nick), hidden: settings.hidden, updatedAt };
  if (!cred) return NextResponse.json({ ...base, models: [], error: 'CULTS3D_USERNAME ve CULTS3D_API_KEY ortam değişkenleri tanımlı değil.' });
  try {
    const models = await fetchCultsModels('tr');
    return NextResponse.json({ ...base, models });
  } catch (e) {
    console.error('[fx-3d] GET', e);
    return NextResponse.json({ ...base, models: [], error: e instanceof Error ? e.message : 'Cults3D API yanıt vermedi' });
  }
}

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  let body: { hidden?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON' }, { status: 400 });
  }
  const hidden = body?.hidden;
  if (!Array.isArray(hidden) || hidden.some((s) => typeof s !== 'string' || !/^[a-z0-9-]{1,200}$/.test(s)) || hidden.length > 2000) {
    return NextResponse.json({ error: 'hidden: slug dizisi gerekli' }, { status: 400 });
  }
  try {
    const value = { hidden: Array.from(new Set(hidden as string[])) };
    const row = await prisma.contentSettingRow.upsert({
      where: { key: FX3D_KEY },
      update: { value },
      create: { key: FX3D_KEY, value },
    });
    revalidateFx3d();
    return NextResponse.json({ ok: true, updatedAt: row.updatedAt });
  } catch (e) {
    console.error('[fx-3d] PUT', e);
    return NextResponse.json({ error: 'Kaydedilemedi' }, { status: 500 });
  }
}

export async function POST() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  revalidateFx3d();
  return NextResponse.json({ ok: true });
}
