/**
 * FIXRAL site verisinin sunucu tarafı yükleyicisi.
 * Panel kayıtlarını (ContentSettingRow 'fx-site' / 'fx-software', ServiceRow,
 * aktif SliderRow) okur, varsayılanlarla birleştirir. İstek içinde React cache,
 * istekler arasında unstable_cache (60 sn, etiket 'fx-content') kullanılır;
 * paneldeki her kayıtta `revalidateFx()` önbelleği anında tazeler.
 */
import { cache } from 'react'
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'
import { prisma, hasDatabaseUrl } from './prisma'
import { buildFxData, defaultFxData, type FxData, type FxSlide, type ServiceRowLike } from '@/content/fx-data'

export const FX_TAG = 'fx-content'
export const FX_SITE_KEY = 'fx-site'
export const FX_SOFTWARE_KEY = 'fx-software'

async function loadFxData(): Promise<FxData> {
  if (!hasDatabaseUrl()) return defaultFxData()
  const safe = <T,>(p: Promise<T>, fallback: T) => p.catch((e) => { console.error('[fx-data]', e?.message || e); return fallback })
  const [site, software, rows, slides] = await Promise.all([
    safe(prisma.contentSettingRow.findUnique({ where: { key: FX_SITE_KEY } }), null),
    safe(prisma.contentSettingRow.findUnique({ where: { key: FX_SOFTWARE_KEY } }), null),
    safe(prisma.serviceRow.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] }), null),
    safe(prisma.sliderRow.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }), []),
  ])
  return buildFxData({
    site: site?.value ?? undefined,
    software: software?.value ?? undefined,
    serviceRows: rows as unknown as ServiceRowLike[] | null,
    slides: (slides || []).map((s): FxSlide => ({
      title: s.title, subtitle: s.subtitle, description: s.description, buttonText: s.buttonText,
      buttonLink: s.buttonLink, badge: s.badge, duration: s.duration || 5000,
    })),
  })
}

export const getFxData = cache(unstable_cache(loadFxData, ['fx-data-v1'], { revalidate: 60, tags: [FX_TAG] }))

/** Panelde içerik değişince çağrılır: site verisi önbelleği + tüm public sayfalar tazelenir. */
export function revalidateFx() {
  try {
    revalidateTag(FX_TAG, { expire: 0 })
    revalidatePath('/', 'layout')
  } catch (e) {
    console.error('[fx-data] revalidate', e)
  }
}
