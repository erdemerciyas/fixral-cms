'use client'

/**
 * FIXRAL site verisi bağlamı. Root layout sunucuda panel verisini okur
 * (getFxData) ve buraya verir; bileşenler `useFx(lang)` ile yerelleştirilmiş
 * içerik alır. Bağlam yoksa (ör. test) varsayılan katalog kullanılır.
 */
import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { defaultFxData, type FxData, type FxHomeSection, type FxPageKey, type FxSectionText } from '@/content/fx-data'
import { toFxLocale, type DisciplineId } from '@/content/fixral'

const Ctx = createContext<FxData | null>(null)
/** Sağlayıcı dışında (test, izole render) kullanılan katalog verisi */
const fallbackRef: { current: FxData | null } = { current: null }
const getFallback = () => (fallbackRef.current ??= defaultFxData())

export function FxDataProvider({ data, children }: { data: FxData; children: ReactNode }) {
  return <Ctx.Provider value={data}>{children}</Ctx.Provider>
}

export function useFxData(): FxData {
  const v = useContext(Ctx)
  return v ?? getFallback()
}

/** Aktif dile göre çözümlenmiş içerik ve yardımcılar */
export function useFx(lang?: string | null) {
  const data = useFxData()
  const L = toFxLocale(lang)
  return useMemo(() => {
    const site = data.site
    const services = data.services
    const software = data.software.filter((s) => s.isActive)
    return {
      L,
      data,
      site,
      services,
      software,
      hero: site.hero.text[L],
      section: (k: Exclude<FxHomeSection, 'strip'>): FxSectionText => site.sections[k][L],
      page: (k: FxPageKey): FxSectionText => site.pages[k][L],
      discipline: (id: DisciplineId) => site.disciplines[id][L],
      byDiscipline: (id: DisciplineId) => services.filter((s) => s.discipline === id),
      service: (slugOrKey: string) => services.find((s) => s.slug === slugOrKey || s.key === slugOrKey || s.dbSlugs.includes(slugOrKey)),
      softwareBySlug: (slug: string) => data.software.find((s) => s.slug === slug),
      visible: (k: FxHomeSection) => site.visibility[k] !== false,
    }
  }, [data, L])
}
