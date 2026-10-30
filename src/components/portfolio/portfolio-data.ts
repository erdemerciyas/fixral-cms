/**
 * Portfolyo veri yardımcıları (redesign 2026) — sunucu ve istemcide ortak.
 *
 * Prisma adaptöründe `populate()` işlem yapmaz; `categoryIds` ham kimlik
 * dizisi olarak gelir. Bu modül kategori adlarını/slug'larını aktif kategori
 * listesinden çözer, çeviri alanlarını uygular ve kart verisini üretir.
 */
import type { WorkCardData, WorkSpan } from '@/components/fx/FxCards'

export interface PfCategory {
  _id: string
  name: string
  slug: string
}

export interface PfModel3D {
  _id?: string
  url: string
  name: string
  format: string
  size?: number
  downloadable?: boolean
  publicId?: string
  uploadedAt?: string
}

/** Sayfaların kullandığı normalize proje kaydı */
export interface PfProject {
  _id: string
  slug: string
  title: string
  description: string
  excerpt?: string
  content?: string
  client?: string
  completionDate?: string
  createdAt?: string
  technologies: string[]
  categories: PfCategory[]
  coverImage?: string
  images: string[]
  models3D: PfModel3D[]
  projectUrl?: string
  githubUrl?: string
  externalUrl?: string
  featured?: boolean
}

type Raw = Record<string, unknown>

const str = (v: unknown) => (typeof v === 'string' ? v : '')
const strArr = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim() !== '') : [])

/** Kategori kaydını (DB satırı) güvenli biçime getirir */
export function normalizeCategoryList(list: unknown): PfCategory[] {
  if (!Array.isArray(list)) return []
  return list
    .map((c) => {
      const o = (c || {}) as Raw
      const _id = str(o._id) || str(o.id)
      const name = str(o.name)
      return { _id, name, slug: str(o.slug) || name }
    })
    .filter((c) => c.name)
}

function resolveCategories(item: Raw, all: PfCategory[]): PfCategory[] {
  const out: PfCategory[] = []
  const push = (c?: PfCategory) => { if (c && c.name && !out.some((x) => x.slug === c.slug)) out.push(c) }
  const find = (key: string) => all.find((c) => c._id === key || c.slug === key || c.name === key)
  const fromValue = (v: unknown) => {
    if (typeof v === 'string' && v) push(find(v))
    else if (v && typeof v === 'object') {
      const o = v as Raw
      const name = str(o.name)
      const known = find(str(o._id) || str(o.id) || str(o.slug) || name)
      push(known || (name ? { _id: str(o._id) || name, name, slug: str(o.slug) || name } : undefined))
    }
  }
  for (const key of ['categoryIds', 'categories']) {
    const v = item[key]
    if (Array.isArray(v)) v.forEach(fromValue)
  }
  if (!out.length) {
    const legacy = item.category ?? item.categoryId
    if (typeof legacy === 'string' && legacy) {
      const known = find(legacy)
      // Eski tek kategori alanı bazen düz ad tutar
      push(known || (/^[a-z0-9]{20,}$/i.test(legacy) ? undefined : { _id: legacy, name: legacy, slug: legacy }))
    } else fromValue(legacy)
  }
  return out
}

/** Çeviri alanı (translations[lang]) varsa başlık/açıklama/özet onunla değişir */
function localized(item: Raw, lang: string) {
  const tr = (item.translations && typeof item.translations === 'object' ? (item.translations as Raw)[lang] : undefined) as Raw | undefined
  const pick = (k: string) => (tr && str(tr[k]).trim() ? str(tr[k]) : str(item[k]))
  return { title: pick('title'), description: pick('description'), excerpt: pick('excerpt') || pick('metaDescription') }
}

export function normalizeProject(raw: unknown, lang: string, categories: PfCategory[] = []): PfProject | null {
  if (!raw || typeof raw !== 'object') return null
  const item = raw as Raw
  const _id = str(item._id) || str(item.id)
  const slug = str(item.slug) || _id
  const l = localized(item, lang)
  if (!slug || !l.title) return null
  const models = Array.isArray(item.models3D) ? (item.models3D as Raw[]).filter((x) => x && str(x.url)) : []
  return {
    _id: _id || slug,
    slug,
    title: l.title,
    description: l.description,
    excerpt: l.excerpt || undefined,
    content: str(item.content) || undefined,
    client: str(item.client).trim() || undefined,
    completionDate: str(item.completionDate) || undefined,
    createdAt: str(item.createdAt) || undefined,
    technologies: strArr(item.technologies),
    categories: resolveCategories(item, categories),
    coverImage: str(item.coverImage) || undefined,
    images: strArr(item.images),
    models3D: models.map((x) => ({
      _id: str(x._id) || undefined,
      url: str(x.url),
      name: str(x.name) || str(x.url).split('/').pop() || 'model',
      format: (str(x.format) || str(x.url).split('.').pop() || '').toLowerCase(),
      size: typeof x.size === 'number' ? x.size : undefined,
      downloadable: Boolean(x.downloadable),
      publicId: str(x.publicId) || undefined,
    })),
    projectUrl: str(item.projectUrl).trim() || undefined,
    githubUrl: str(item.githubUrl).trim() || undefined,
    externalUrl: str(item.externalUrl).trim() || undefined,
    featured: Boolean(item.featured),
  }
}

export const stripTags = (s?: string) =>
  (s || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim()

/** HTML açıklamanın ilk paragrafı (düz metin); paragraf yoksa boş */
export function leadText(html?: string) {
  const m = (html || '').match(/^\s*<p\b[^>]*>([\s\S]*?)<\/p>/i)
  return m ? stripTags(m[1]) : ''
}

/** Kelime sınırında kısaltır */
export function clip(s: string, max: number) {
  if (s.length <= max) return s
  const cut = s.slice(0, max)
  const sp = cut.lastIndexOf(' ')
  return `${(sp > max * 0.6 ? cut.slice(0, sp) : cut).replace(/[.,;:\s]+$/, '')}…`
}

const toDate = (v?: string) => {
  if (!v) return null
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? null : d
}

export const projectYear = (p: Pick<PfProject, 'completionDate'>) => {
  const d = toDate(p.completionDate)
  return d ? String(d.getFullYear()) : ''
}

export const fmtMonthYear = (v: string | undefined, lang: string) => {
  const d = toDate(v)
  if (!d) return ''
  const s = d.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
  return s.charAt(0).toLocaleUpperCase(lang) + s.slice(1)
}

export const upper = (s: string, lang: string) => s.toLocaleUpperCase('tr-TR')

export function toProjectCard(p: PfProject, lang: string): WorkCardData {
  return {
    href: `/${lang}/portfolio/${encodeURIComponent(p.slug)}`,
    title: p.title,
    summary: clip(p.excerpt || leadText(p.description) || stripTags(p.description), 160) || undefined,
    image: p.coverImage || p.images[0],
    tags: p.categories.map((c) => upper(c.name, lang)),
    metaLeft: p.client || p.technologies.slice(0, 2).join(' · '),
    metaRight: projectYear(p),
  }
}

/**
 * Masonry ritmi 8/4 · 4/8 · 6/6 — her satır iki kart, toplam 12 kolon.
 * Tek kalan son kart tüm satırı kaplar.
 */
export function masonrySpans(n: number): WorkSpan[] {
  const cycle: WorkSpan[] = [8, 4, 4, 8, 6, 6]
  const out = Array.from({ length: n }, (_, i) => cycle[i % 6])
  if (n % 2 === 1) out[n - 1] = 12
  return out
}
