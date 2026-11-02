/**
 * FIXRAL site verisi — yönetim panelinden düzenlenebilen içerik şeması,
 * varsayılanlar ve birleştirme kuralları (istemci + sunucu ortak, Prisma içermez).
 *
 * Kaynaklar:
 *  - Site içeriği (hero, antet, bölüm başlıkları, süreç, teslimat, sayfa başlıkları,
 *    disiplinler, anasayfa bölüm görünürlüğü): ContentSettingRow key = 'fx-site'
 *  - Yazılımlar: ContentSettingRow key = 'fx-software'
 *  - Hizmetler: ServiceRow (panel → Hizmetler). Sitedeki hizmet listesi yalnızca
 *    paneldeki aktif kayıtlardan oluşur. Web sitesi alanları `translations._fx`
 *    (disiplin, ikon, dosyalar, 3D görünüm, yazılım) ve
 *    `translations.<dil>.{lede, when, flow, spec}` içinde tutulur.
 * Site içeriği kaydı yoksa varsayılanlar (src/content/fixral.ts + messages/*.json → fx.*)
 * kullanılır; hizmet kataloğu yalnızca veritabanına ulaşılamazsa devreye girer.
 */
import trMessages from '../../messages/tr.json'
import {
  DELIVERABLES, DISCIPLINES, PROCESS, SAMPLE_DOCS, SERVICES, SOFTWARE,
  type DisciplineId, type DocLine, type FxLocale, type PartName, type ProcessStep,
  type ServiceKey, type ServiceText, type SoftwareDef, type SoftwareText, type VizMode,
} from './fixral'

export const FX_LOCALES: FxLocale[] = ['tr']
type L<T> = Record<FxLocale, T>

/* -------------------------------------------------------------------- Tipler */

export interface FxHeroText { eyebrow: string; titleA: string; titleB: string; lede: string; ctaQuote: string; ctaProjects: string; ctaSoftware: string }
export interface FxSectionText { eyebrow: string; title: string; lede: string }
export type FxHomeSection = 'strip' | 'services' | 'process' | 'works' | 'software' | 'deliv' | 'journal' | 'quote'
export type FxPageKey = 'services' | 'software' | 'portfolio' | 'news' | 'videos' | 'contact'
export const FX_HOME_SECTIONS: FxHomeSection[] = ['strip', 'services', 'process', 'works', 'software', 'deliv', 'journal', 'quote']
export const FX_PAGES: FxPageKey[] = ['services', 'software', 'portfolio', 'news', 'videos', 'contact']

export interface FxTitleCell { label: L<string>; value: string }
export interface FxDoc { id: string; file: string; lines: DocLine[] }
/** Hizmetler sayfası → "Birlikte çalışan hizmetler": sırayla izlenen hizmet yolu (slug'lar) */
export interface FxCombo { services: string[]; text: L<{ name: string; body: string }> }

export interface FxSiteContent {
  hero: { text: L<FxHeroText>; /** Aktif slider kayıtları hero metninde döner (yalnız TR; slider tek dilli) */ useSlider: boolean }
  titleblock: FxTitleCell[]
  sections: Record<Exclude<FxHomeSection, 'strip'>, L<FxSectionText>>
  visibility: Record<FxHomeSection, boolean>
  disciplines: Record<DisciplineId, L<{ name: string; body: string }>>
  process: L<ProcessStep[]>
  deliverables: L<[string, string][]>
  docs: FxDoc[]
  pages: Record<FxPageKey, L<FxSectionText>>
  combos: { head: L<{ eyebrow: string; title: string }>; items: FxCombo[] }
}

export interface FxService {
  /** Sitedeki kimlik: katalog anahtarı ya da panel kaydının slug'ı */
  key: string
  slug: string
  /** Panel kaydı varsa id'si */
  id?: string
  icon: ServiceKey
  discipline: DisciplineId
  files: string[]
  viz: VizMode
  part: PartName
  software: string[]
  order: number
  image?: string
  /** Panelde girilen uzun açıklama (HTML), dil başına */
  about?: Partial<L<string>>
  dbSlugs: string[]
  text: L<ServiceText>
  source: 'panel' | 'catalog'
}

export interface FxSoftware extends Omit<SoftwareDef, 'slug' | 'services'> {
  slug: string
  services: string[]
  isActive: boolean
  order: number
}

export interface FxData {
  site: FxSiteContent
  services: FxService[]
  software: FxSoftware[]
  /** İçeriğin nereden geldiği (panel/katalog) ve son güncelleme */
  meta: { site: 'panel' | 'default'; services: 'panel' | 'catalog' | 'mixed'; software: 'panel' | 'catalog'; slides: FxSlide[] }
}

export interface FxSlide { title: string; subtitle: string; description: string; buttonText: string; buttonLink: string; badge: string; duration: number }

/* --------------------------------------------------------------- Varsayılanlar */

type Msg = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
const M: L<Msg> = { tr: (trMessages as Msg).fx }
const both = <T,>(fn: (m: Msg, l: FxLocale) => T): L<T> => ({ tr: fn(M.tr, 'tr') })
const sec = (k: string): L<FxSectionText> => both((m) => ({ eyebrow: m[k]?.eyebrow ?? '', title: m[k]?.title ?? '', lede: m[k]?.lede ?? '' }))

export function defaultFxSite(): FxSiteContent {
  return {
    hero: {
      useSlider: false,
      text: both((m) => ({ eyebrow: m.hero.eyebrow, titleA: m.hero.titleA, titleB: m.hero.titleB, lede: m.hero.lede, ctaQuote: m.hero.ctaQuote, ctaProjects: m.hero.ctaProjects, ctaSoftware: m.hero.ctaSoftware })),
    },
    titleblock: [
      { label: both((m) => m.hero.tbSheet), value: 'FX-000' },
      { label: both((m) => m.hero.tbTolerance), value: '±0,05 mm' },
      { label: both((m) => m.hero.tbScan), value: '20 µm' },
      { label: both((m) => m.hero.tbOutput), value: 'STL · STEP · OBJ' },
      { label: both((m) => m.hero.tbRev), value: 'B' },
    ],
    sections: {
      services: sec('services'), process: sec('process'), works: both((m) => ({ eyebrow: m.works.eyebrow, title: m.works.title, lede: '' })),
      software: sec('software'), deliv: sec('deliv'), journal: both((m) => ({ eyebrow: m.journal.eyebrow, title: m.journal.title, lede: '' })), quote: sec('quote'),
    },
    visibility: { strip: true, services: true, process: true, works: true, software: true, deliv: true, journal: true, quote: true },
    disciplines: Object.fromEntries(DISCIPLINES.map((d) => [d.id, { tr: { ...d.text.tr } }])) as FxSiteContent['disciplines'],
    process: { tr: PROCESS.tr.map((s) => ({ ...s, spec: s.spec.map((r) => [...r] as [string, string]) })) },
    deliverables: { tr: DELIVERABLES.tr.map((r) => [...r] as [string, string]) },
    docs: SAMPLE_DOCS.map((d) => ({ id: d.id, file: d.file, lines: d.lines.map((l) => [...l] as DocLine) })),
    pages: {
      services: both((m) => ({ eyebrow: m.services.pageEyebrow, title: m.services.pageTitle, lede: m.services.pageLede })),
      software: both((m) => ({ eyebrow: m.software.pageEyebrow, title: m.software.pageTitle, lede: m.software.pageLede })),
      portfolio: both((m) => ({ eyebrow: m.portfolio?.eyebrow ?? '', title: m.portfolio?.title ?? '', lede: m.portfolio?.lede ?? '' })),
      news: both((m) => ({ eyebrow: m.news?.eyebrow ?? '', title: m.news?.title ?? '', lede: m.news?.lede ?? '' })),
      videos: both((m) => ({ eyebrow: m.videos?.eyebrow ?? '', title: m.videos?.title ?? '', lede: m.videos?.lede ?? '' })),
      contact: both((m) => ({ eyebrow: m.contact?.hero?.eyebrow ?? '', title: m.contact?.hero?.title ?? '', lede: m.contact?.hero?.lede ?? '' })),
    },
    combos: {
      head: both((m) => ({ eyebrow: m.services.combosEyebrow ?? '', title: m.services.combosTitle ?? '' })),
      items: DEFAULT_COMBOS.map(({ id, services }) => ({
        services: [...services],
        text: both((m) => ({ name: m.svcPage?.combos?.[id]?.name ?? '', body: m.svcPage?.combos?.[id]?.body ?? '' })),
      })),
    },
  }
}

/** Varsayılan hizmet yolları (metinleri messages → fx.svcPage.combos) */
const DEFAULT_COMBOS = [
  { id: 'restoration', services: ['3d-tarama', 'tersine-muhendislik', '3d-baski'] },
  { id: 'spare', services: ['tersine-muhendislik', 'cad-3d-cizim', 'cnc-cam'] },
  { id: 'electronics', services: ['otomotiv-elektronigi', 'pcb-gerber', 'gomulu-sistemler'] },
]

export function catalogServices(): FxService[] {
  return SERVICES.map((s, i) => ({
    key: s.key, slug: s.slug, icon: s.key, discipline: s.discipline, files: [...s.files], viz: s.viz, part: s.part,
    software: [...s.software], order: i + 1, dbSlugs: [...s.dbSlugs], text: { tr: { ...s.text.tr } }, source: 'catalog',
  }))
}

export function catalogSoftware(): FxSoftware[] {
  return SOFTWARE.map((s, i) => ({ ...s, services: [...s.services], isActive: true, order: i + 1, text: { tr: { ...s.text.tr } } }))
}

/* ----------------------------------------------------------------- Birleştirme */

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)

/**
 * Kaydedilmiş (kısmi) içeriği varsayılanların üstüne yazar. Boş metinler
 * varsayılanı ezmez; diziler (süreç adımları, satırlar) kayıtlıysa bütünüyle alınır.
 */
export function mergeDeep<T>(base: T, over: unknown): T {
  if (over === undefined || over === null) return base
  if (Array.isArray(base)) return (Array.isArray(over) && over.length ? over : base) as T
  if (isObj(base) && isObj(over)) {
    const out: Record<string, unknown> = { ...base }
    for (const k of Object.keys(over)) out[k] = k in base ? mergeDeep((base as Record<string, unknown>)[k], over[k]) : over[k]
    return out as T
  }
  if (typeof base === 'string') return (typeof over === 'string' && over.trim() !== '' ? over : base) as T
  if (typeof base === 'boolean') return (typeof over === 'boolean' ? over : base) as T
  if (typeof base === 'number') return (typeof over === 'number' && Number.isFinite(over) ? over : base) as T
  return (over ?? base) as T
}

export const resolveFxSite = (stored: unknown): FxSiteContent => mergeDeep(defaultFxSite(), stored)

const ICONS: ServiceKey[] = ['tarama', 'tersine', 'otomotiv', 'cad', 'pcb', 'gomulu', 'baski', 'cnc']
const VIZ: VizMode[] = ['points', 'wire', 'dev', 'solid', 'print']
const PARTS: PartName[] = ['gear', 'bracket', 'pcb', 'enclosure', 'impeller', 'vase']
const DISC: DisciplineId[] = ['muhendislik', 'tasarim', 'uretim']
const strArr = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x.trim()).map((x) => (x as string).trim()) : [])
const pairArr = (v: unknown): [string, string][] =>
  Array.isArray(v) ? v.filter((p) => Array.isArray(p) && typeof p[0] === 'string' && (p[0] || p[1])).map((p) => [String(p[0] ?? ''), String(p[1] ?? '')] as [string, string]) : []
const stripTags = (s: string) => s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

/** Panelde web sitesi alanlarını taşıyan hizmet kaydı (ServiceRow) */
export interface ServiceRowLike {
  id?: string; _id?: string; title: string; slug: string; description?: string; image?: string; icon?: string
  isActive?: boolean; order?: number; features?: string[]; translations?: unknown
}

/** translations._fx — web sitesi yapı alanları */
export interface FxServiceMeta { enabled?: boolean; discipline?: DisciplineId; icon?: ServiceKey; files?: string[]; viz?: VizMode; part?: PartName; software?: string[] }
/** translations.<dil> içindeki web sitesi metin alanları */
export interface FxServiceLangFields { title?: string; excerpt?: string; description?: string; lede?: string; when?: string[]; flow?: [string, string][]; spec?: [string, string][] }

export function readServiceMeta(row: ServiceRowLike): FxServiceMeta | null {
  const tr = row.translations as Record<string, unknown> | undefined
  const m = tr && isObj(tr._fx) ? (tr._fx as FxServiceMeta) : null
  return m && m.enabled !== false ? m : null
}

/** Panelde "Sitede göster" bilerek kapatılmış kayıt */
export function isWebDisabled(row: ServiceRowLike): boolean {
  const tr = row.translations as Record<string, unknown> | undefined
  return !!tr && isObj(tr._fx) && (tr._fx as FxServiceMeta).enabled === false
}

/**
 * Sitedeki hizmet listesi = paneldeki aktif kayıtlar ("Sitede göster" kapalı olanlar hariç),
 * panel sırasıyla. Slug'ı katalog hizmetiyle aynı olan kayıtta boş bırakılan alanlar
 * katalog içeriğiyle dolar. Katalog yalnızca veritabanı okunamazsa (rows = null) kullanılır.
 */
export function mergeServices(rows: ServiceRowLike[] | null): FxService[] {
  const catalog = catalogServices()
  if (!rows) return catalog
  const out: FxService[] = []

  for (const row of rows) {
    if (row.isActive === false || isWebDisabled(row)) continue
    const meta: FxServiceMeta = readServiceMeta(row) ?? {}
    const base = catalog.find((c) => c.slug === row.slug)
    const tr = (row.translations || {}) as Record<string, FxServiceLangFields>
    const text = {} as L<ServiceText>
    const about: Partial<L<string>> = {}
    for (const l of FX_LOCALES) {
      const f = tr[l] || {}
      const b = base?.text[l]
      const name = (f.title || (l === 'tr' ? row.title : '') || b?.name || row.title || '').trim()
      text[l] = {
        name,
        short: (f.excerpt || b?.short || '').trim(),
        lede: (f.lede || b?.lede || stripTags(f.description || (l === 'tr' ? row.description || '' : '')).slice(0, 360)).trim(),
        when: strArr(f.when).length ? strArr(f.when) : b?.when ?? [],
        flow: pairArr(f.flow).length ? pairArr(f.flow) : b?.flow ?? [],
        spec: pairArr(f.spec).length ? pairArr(f.spec) : b?.spec ?? [],
      }
      const html = f.description || (l === 'tr' ? row.description : '')
      // Yalnızca kısa açıklamayı tekrar eden metin "Hizmet hakkında" bloğu olmaz
      if (html && stripTags(html) && stripTags(html) !== text[l].lede) about[l] = html
    }
    out.push({
      key: base ? base.key : row.slug,
      slug: row.slug,
      id: row.id || row._id,
      icon: meta.icon && ICONS.includes(meta.icon) ? meta.icon : base?.icon ?? 'cad',
      discipline: meta.discipline && DISC.includes(meta.discipline) ? meta.discipline : base?.discipline ?? 'uretim',
      files: strArr(meta.files).length ? strArr(meta.files) : base?.files ?? [],
      viz: meta.viz && VIZ.includes(meta.viz) ? meta.viz : base?.viz ?? 'solid',
      part: meta.part && PARTS.includes(meta.part) ? meta.part : base?.part ?? 'bracket',
      software: Array.isArray(meta.software) ? strArr(meta.software) : base?.software ?? [],
      order: typeof row.order === 'number' ? row.order : 999,
      image: row.image || undefined,
      about,
      dbSlugs: base?.dbSlugs ?? [],
      text,
      source: 'panel',
    })
  }
  return out.sort((a, b) => a.order - b.order)
}

export function normalizeSoftware(stored: unknown): FxSoftware[] | null {
  const items = isObj(stored) && Array.isArray(stored.items) ? stored.items : Array.isArray(stored) ? stored : null
  if (!items || !items.length) return null
  const catalog = catalogSoftware()
  const out: FxSoftware[] = []
  items.forEach((raw, i) => {
    if (!isObj(raw) || typeof raw.slug !== 'string' || !raw.slug.trim()) return
    const base = catalog.find((c) => c.slug === raw.slug)
    const def: FxSoftware = base ?? {
      slug: raw.slug, name: String(raw.name || raw.slug), viz: 'toolpath', repo: '', services: [], isActive: true, order: i + 1,
      text: { tr: emptySwText() },
    }
    const merged = mergeDeep(def, raw) as FxSoftware
    merged.viz = (['split', 'toolpath', 'flow', 'gauge'] as const).includes(merged.viz) ? merged.viz : 'toolpath'
    merged.url = typeof raw.url === 'string' ? raw.url.trim() || undefined : def.url
    merged.version = typeof raw.version === 'string' ? raw.version.trim() || undefined : def.version
    merged.order = typeof raw.order === 'number' ? raw.order : i + 1
    merged.isActive = raw.isActive !== false
    out.push(merged)
  })
  return out.sort((a, b) => a.order - b.order)
}

export const emptySwText = (): SoftwareText => ({ kicker: '', status: '', tagline: '', lede: '', chips: [], facts: [], features: [], flow: [] })

/* ------------------------------------------------------------ İstemci yardımcıları */

export function buildFxData(input: { site?: unknown; serviceRows?: ServiceRowLike[] | null; software?: unknown; slides?: FxSlide[] }): FxData {
  const sw = normalizeSoftware(input.software)
  const services = mergeServices(input.serviceRows ?? null)
  return {
    site: resolveFxSite(input.site),
    services,
    software: sw ?? catalogSoftware(),
    meta: {
      site: input.site ? 'panel' : 'default',
      services: !input.serviceRows ? 'catalog' : services.every((s) => s.source === 'panel') ? 'panel' : services.some((s) => s.source === 'panel') ? 'mixed' : 'catalog',
      software: sw ? 'panel' : 'catalog',
      slides: input.slides ?? [],
    },
  }
}

export const defaultFxData = (): FxData => buildFxData({})

export interface ServiceAbout { title: string; html: string; image?: string }

/** Panel kaydının uzun açıklaması (dil yoksa TR) ve görseli — "Hizmet hakkında" bloğu */
export function serviceAbout(s: FxService, L: FxLocale): ServiceAbout | null {
  const html = (s.about?.[L] || s.about?.tr || '').trim()
  const image = (s.image || '').trim()
  if (!html && !image) return null
  return { title: s.text[L].name, html, image: image || undefined }
}

export const servicesByDiscipline = (services: FxService[], d: DisciplineId) => services.filter((s) => s.discipline === d)
export const findService = (services: FxService[], slugOrKey: string) =>
  services.find((s) => s.slug === slugOrKey || s.key === slugOrKey || s.dbSlugs.includes(slugOrKey))
export const visibleSoftware = (software: FxSoftware[]) => software.filter((s) => s.isActive)
