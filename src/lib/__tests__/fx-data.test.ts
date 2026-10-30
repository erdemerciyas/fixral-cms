/**
 * Panel ↔ site birleştirme kuralları (src/content/fx-data.ts).
 * Site, hizmetleri panel kayıtlarından (boş alanlar katalogdan) kurar; admin
 * rozetleri de aynı fonksiyonları kullandığından burada sabitlenir.
 */
import { SERVICES, SOFTWARE } from '@/content/fixral'
import { buildFxData, findService, mergeDeep, mergeServices, normalizeSoftware, resolveFxSite } from '@/content/fx-data'

const fx = (extra: Record<string, unknown> = {}) => ({ _fx: { enabled: true, discipline: 'uretim', icon: 'cnc', ...extra } })

describe('mergeServices', () => {
  it('veritabanı yoksa katalogdaki 8 hizmeti döner', () => {
    const out = mergeServices(null)
    expect(out).toHaveLength(SERVICES.length)
    expect(out.every((s) => s.source === 'catalog')).toBe(true)
  })

  it('web alanlı panel kaydı katalog hizmetinin yerine geçer ve boş alanlar katalogdan dolar', () => {
    const c = SERVICES[0]
    const out = mergeServices([{ id: 'r1', slug: c.slug, title: 'Yeni ad', isActive: true, order: 1, translations: { ...fx({ icon: c.key, discipline: c.discipline }), tr: { title: 'Yeni ad' } } }])
    const s = findService(out, c.slug)!
    expect(s.source).toBe('panel')
    expect(s.text.tr.name).toBe('Yeni ad')
    expect(s.text.tr.when).toEqual(c.text.tr.when)
    expect(out.filter((x) => x.slug === c.slug)).toHaveLength(1)
  })

  it('panelden eklenen yeni hizmet listelenir; katalog panel kayıtlarına eklenmez', () => {
    const out = mergeServices([{ id: 'n1', slug: 'lazer-kesim', title: 'Lazer kesim', isActive: true, order: 3, translations: fx() }])
    const s = findService(out, 'lazer-kesim')!
    expect(s.source).toBe('panel')
    expect(s.icon).toBe('cnc')
    expect(out).toHaveLength(1)
  })

  it('pasif ya da "Sitede göster" kapalı kayıt sitede listelenmez', () => {
    const [a, b] = SERVICES
    const out = mergeServices([
      { slug: a.slug, title: a.text.tr.name, isActive: false },
      { slug: b.slug, title: b.text.tr.name, isActive: true, translations: { _fx: { enabled: false } } },
    ])
    expect(out).toHaveLength(0)
  })

  it('web alanı olmayan aktif kayıt da listelenir', () => {
    const out = mergeServices([{ id: 'old', slug: 'eski-hizmet', title: 'Eski', isActive: true, image: '/x.jpg', description: '<p>Uzun metin</p>' }])
    const s = findService(out, 'eski-hizmet')!
    expect(s.source).toBe('panel')
    expect(s.image).toBe('/x.jpg')
    expect(s.text.tr.lede).toContain('Uzun metin')
  })
})

describe('site içeriği ve yazılımlar', () => {
  it('boş metin varsayılanı ezmez, dolu dizi bütünüyle alınır', () => {
    const merged = mergeDeep({ a: 'x', b: ['1', '2'], c: { d: 'y' } }, { a: '', b: ['3'], c: { d: 'z' } })
    expect(merged).toEqual({ a: 'x', b: ['3'], c: { d: 'z' } })
  })

  it('kısmi panel kaydı varsayılanlarla tamamlanır', () => {
    const site = resolveFxSite({ hero: { text: { tr: { titleA: 'Panelden' } } }, visibility: { journal: false } })
    expect(site.hero.text.tr.titleA).toBe('Panelden')
    expect(site.hero.text.tr.lede.length).toBeGreaterThan(0)
    expect(site.visibility.journal).toBe(false)
    expect(site.visibility.services).toBe(true)
    expect(site.process.tr.length).toBe(4)
  })

  it('yazılım kaydı yoksa katalog, varsa panel sırası ve aktifliği kullanılır', () => {
    expect(normalizeSoftware(null)).toBeNull()
    const list = normalizeSoftware({ items: [
      { slug: SOFTWARE[1].slug, order: 1 },
      { slug: SOFTWARE[0].slug, order: 2, isActive: false },
      { slug: 'yeni-arac', name: 'Yeni Araç', order: 3 },
    ] })!
    expect(list.map((s) => s.slug)).toEqual([SOFTWARE[1].slug, SOFTWARE[0].slug, 'yeni-arac'])
    expect(list[0].text.tr.lede).toBe(SOFTWARE[1].text.tr.lede)
    expect(list[1].isActive).toBe(false)
    expect(list[2].name).toBe('Yeni Araç')
  })

  it('buildFxData kaynakları raporlar', () => {
    const d = buildFxData({})
    expect(d.meta).toMatchObject({ site: 'default', services: 'catalog', software: 'catalog' })
  })
})
