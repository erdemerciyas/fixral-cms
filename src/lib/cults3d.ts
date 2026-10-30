/**
 * FX 3D: Cults3D GraphQL istemcisi (yalnızca sunucu).
 * Kimlik bilgileri env'den gelir (CULTS3D_USERNAME / CULTS3D_API_KEY, Basic auth).
 * Liste ve detaylar 1 saat önbelleklenir (etiket 'cults3d'); panelde "Önbelleği yenile"
 * ve görünürlük kaydı `revalidateFx3d()` ile anında tazeler.
 * Panelde gizlenen modeller ContentSettingRow 'fx-3d' → { hidden: slug[] } içinde tutulur.
 *
 * GÜVENLİK: Blueprint.fileUrl hesap sahibine ücretli dosyanın imzalı indirme linkini
 * döndürür; sorgularda ASLA istenmez. Satın alma her zaman Cults3D'ye yönlenir.
 */
import { cache } from 'react'
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'
import { prisma, hasDatabaseUrl } from './prisma'

const ENDPOINT = 'https://cults3d.com/graphql'
export const CULTS_TAG = 'cults3d'
export const FX3D_KEY = 'fx-3d'

export interface Fx3dSettings { hidden: string[] }

export interface Fx3dModel {
  slug: string
  name: string
  url: string
  image: string | null
  /** Örn. "€ 30"; ücretsiz modelde null */
  price: string | null
  discount: number | null
  category: string
  tags: string[]
  publishedAt: string | null
  views: number
  likes: number
  downloads: number
}

export interface Fx3dFile {
  name: string
  ext: string
  faces: number | null
  /** X × Y × Z (mm) */
  size: [number, number, number] | null
  preview: string | null
}

export interface Fx3dModelDetail extends Fx3dModel {
  description: string
  details: string
  images: string[]
  license: { name: string; url: string | null; commercial: boolean } | null
  files: Fx3dFile[]
  videos: { url: string; image: string | null }[]
}

type Locale = 'tr'

export function cultsCredentials() {
  const user = process.env.CULTS3D_USERNAME?.trim()
  const key = process.env.CULTS3D_API_KEY?.trim()
  return user && key ? { user, key, nick: process.env.CULTS3D_NICK?.trim() || user } : null
}

export const cultsProfileUrl = (nick = cultsCredentials()?.nick || 'FIXRAL') => `https://cults3d.com/en/users/${encodeURIComponent(nick)}/3d-models`

async function cultsQuery<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const cred = cultsCredentials()
  if (!cred) throw new Error('CULTS3D_USERNAME / CULTS3D_API_KEY tanımlı değil')
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${cred.user}:${cred.key}`).toString('base64')}`,
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  })
  if (!res.ok) throw new Error(`Cults3D API ${res.status}`)
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] }
  if (json.errors?.length) throw new Error(`Cults3D API: ${json.errors.map((e) => e.message).join('; ')}`)
  if (!json.data) throw new Error('Cults3D API boş yanıt döndü')
  return json.data
}

const CARD_FIELDS = `
  slug name(locale: $locale) url(locale: $locale) illustrationImageUrl
  price(currency: EUR) { cents formatted }
  discount { percentage }
  category { name(locale: $locale) }
  tags(locale: $locale)
  publishedAt viewsCount likesCount downloadsCount`

interface RawCard {
  slug: string
  name: string
  url: string
  illustrationImageUrl: string | null
  price: { cents: number; formatted: string } | null
  discount: { percentage: number } | null
  category: { name: string | null } | null
  tags: string[]
  publishedAt: string | null
  viewsCount: number
  likesCount: number
  downloadsCount: number
}

const toModel = (c: RawCard): Fx3dModel => ({
  slug: c.slug,
  name: c.name,
  url: c.url,
  image: c.illustrationImageUrl,
  price: c.price && c.price.cents > 0 ? c.price.formatted : null,
  discount: c.discount?.percentage ?? null,
  category: c.category?.name || '',
  tags: c.tags,
  publishedAt: c.publishedAt,
  views: c.viewsCount,
  likes: c.likesCount,
  downloads: c.downloadsCount,
})

const PAGE = 100

/** Hesaptaki tüm modeller (gizliler dahil), en yeni önce */
export async function fetchCultsModels(lang: Locale): Promise<Fx3dModel[]> {
  const cred = cultsCredentials()
  if (!cred) throw new Error('CULTS3D_USERNAME / CULTS3D_API_KEY tanımlı değil')
  const out: Fx3dModel[] = []
  for (let offset = 0; offset < 2000; offset += PAGE) {
    const data = await cultsQuery<{ user: { creations: RawCard[] } | null }>(
      `query($nick: String!, $locale: LocaleEnum, $limit: Int, $offset: Int) {
        user(nick: $nick) { creations(limit: $limit, offset: $offset, sort: BY_PUBLICATION, direction: DESC) { ${CARD_FIELDS} } }
      }`,
      { nick: cred.nick, locale: lang.toUpperCase(), limit: PAGE, offset },
    )
    if (!data.user) throw new Error(`Cults3D kullanıcısı bulunamadı: ${cred.nick}`)
    out.push(...data.user.creations.map(toModel))
    if (data.user.creations.length < PAGE) break
  }
  return out
}

interface RawDetail extends RawCard {
  creator: { nick: string }
  description: string
  details: string
  illustrations: { imageUrl: string | null }[]
  license: { name: string | null; url: string | null; allowsCommercialUse: boolean | null } | null
  // fileUrl BİLEREK yok (bkz. dosya başı)
  blueprints: {
    fileName: string | null; fileExtension: string | null; faces: number | null; imageUrl: string | null
    minimumX: number | null; maximumX: number | null; minimumY: number | null; maximumY: number | null; minimumZ: number | null; maximumZ: number | null
  }[]
  videos: { url: string | null; imageUrl: string | null }[]
}

const mm = (a: number | null, b: number | null) => (a == null || b == null ? null : Math.round((b - a) * 10) / 10)

async function fetchCultsModel(slug: string, lang: Locale): Promise<Fx3dModelDetail | null> {
  const cred = cultsCredentials()
  if (!cred) return null
  const data = await cultsQuery<{ creation: RawDetail | null }>(
    `query($slug: String!, $locale: LocaleEnum) {
      creation(slug: $slug) {
        ${CARD_FIELDS}
        creator { nick }
        description(locale: $locale) details(locale: $locale)
        illustrations { imageUrl }
        license { name(locale: $locale) url(locale: $locale) allowsCommercialUse }
        blueprints { fileName fileExtension faces imageUrl minimumX maximumX minimumY maximumY minimumZ maximumZ }
        videos { url imageUrl }
      }
    }`,
    { slug, locale: lang.toUpperCase() },
  )
  const c = data.creation
  // Yalnızca kendi modellerimiz: başka bir yaratıcının slug'ı 404 verir
  if (!c || c.creator.nick.toLowerCase() !== cred.nick.toLowerCase()) return null
  return {
    ...toModel(c),
    description: c.description || '',
    details: c.details || '',
    images: c.illustrations.map((i) => i.imageUrl).filter((x): x is string => !!x),
    license: c.license?.name ? { name: c.license.name, url: c.license.url, commercial: !!c.license.allowsCommercialUse } : null,
    files: c.blueprints.map((b) => {
      const x = mm(b.minimumX, b.maximumX), y = mm(b.minimumY, b.maximumY), z = mm(b.minimumZ, b.maximumZ)
      return {
        name: b.fileName || '',
        ext: (b.fileExtension || '').replace(/^\./, '').toUpperCase(),
        faces: b.faces,
        size: x != null && y != null && z != null ? [x, y, z] : null,
        preview: b.imageUrl,
      }
    }),
    videos: c.videos.filter((v) => !!v.url).map((v) => ({ url: v.url as string, image: v.imageUrl })),
  }
}

/* -------------------------------------------------------------- ayarlar */

export function normalizeFx3dSettings(v: unknown): Fx3dSettings {
  const hidden = v && typeof v === 'object' ? (v as { hidden?: unknown }).hidden : undefined
  return { hidden: Array.isArray(hidden) ? hidden.filter((s): s is string => typeof s === 'string') : [] }
}

export async function readFx3dSettings(): Promise<{ settings: Fx3dSettings; updatedAt: Date | null }> {
  if (!hasDatabaseUrl()) return { settings: { hidden: [] }, updatedAt: null }
  const row = await prisma.contentSettingRow.findUnique({ where: { key: FX3D_KEY } })
  return { settings: normalizeFx3dSettings(row?.value), updatedAt: row?.updatedAt ?? null }
}

/* ------------------------------------------------------- public okuyucular */

/** Fiyat sitede gösterilmez (kullanıcı Cults3D'de görür); sayfa verisine de girmez */
const withoutPrice = <T extends Fx3dModel>(m: T): T => ({ ...m, price: null, discount: null })

const cachedList = unstable_cache(
  async (lang: Locale) => {
    const [models, { settings }] = await Promise.all([fetchCultsModels(lang), readFx3dSettings()])
    const hidden = new Set(settings.hidden)
    return models.filter((m) => !hidden.has(m.slug)).map(withoutPrice)
  },
  ['fx3d-list-v2'],
  { revalidate: 3600, tags: [CULTS_TAG] },
)

const cachedDetail = unstable_cache(
  async (slug: string, lang: Locale) => {
    const { settings } = await readFx3dSettings()
    if (settings.hidden.includes(slug)) return null
    const m = await fetchCultsModel(slug, lang)
    return m && withoutPrice(m)
  },
  ['fx3d-detail-v2'],
  { revalidate: 3600, tags: [CULTS_TAG] },
)

/** Sitede gösterilen modeller (panelde gizlenenler hariç). API hatasında fırlatır. */
export const getFx3dModels = cache((lang: Locale) => cachedList(lang))

/** Tek model; bulunamaz, gizli ya da başka yaratıcıya aitse null */
export const getFx3dModel = cache((slug: string, lang: Locale) =>
  /^[a-z0-9-]{1,200}$/.test(slug) ? cachedDetail(slug, lang) : Promise.resolve(null),
)

export function revalidateFx3d() {
  try {
    revalidateTag(CULTS_TAG, { expire: 0 })
    revalidatePath('/[lang]/fx-3d', 'layout')
    revalidatePath('/sitemap.xml')
  } catch (e) {
    console.error('[fx-3d] revalidate', e)
  }
}
