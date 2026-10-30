'use client'

/**
 * HomeTemplate — FIXRAL anasayfası (redesign 2026).
 *
 * Akış sırası:
 * 1. HeroSection          — 3D FX işareti (three.js) + tez + teknik resim anteti   [koyu ada]
 * 1b. ProductLaunch       — hızlı erişim: 3D Splitter + Router Studio (three.js)     [koyu ada]
 * 2. ServiceStrip        — sekiz hizmet, marka ikonlarıyla                          [koyu ada]
 * 3. DisciplinesSection   — Mühendislik / Tasarım / Üretim altında 8 hizmet           [açık bant]
 * 4. ProcessSection       — Tara → Modelle → Doğrula → Üret, kaydırmaya bağlı 3D     [koyu ada]
 * 5. WorksSection         — seçili projeler (yönetim panelinden, 8/4/4/8 ızgara)    [açık bant]
 * 6. SoftwareSection      — Fixral 3D Splitter, Router Studio, ESP32-S3 OBD-II
 * 7. DeliverablesSection  — teslim dosyaları + örnek G-kodu / BOM / ölçüm raporu    [açık bant]
 * 8. JournalSection       — son haberler ve videolar (yönetim paneli + YouTube)
 * 9. QuoteBand            — kısa teklif formu (/api/public/contact)                [koyu ada]
 *
 * İçerik panelden gelir (Site İçeriği, Hizmetler, Yazılımlar, Slider, Projeler, Haberler,
 * Videolar); panelde kayıt yoksa `src/content/fixral.ts` + `messages/*.json` varsayılanları kullanılır.
 */
import HeroSection from '@/components/fx/home/HeroSection'
import ProductLaunch from '@/components/fx/home/ProductLaunch'
import { DisciplinesSection, ServiceStrip } from '@/components/fx/home/ServicesSections'
import ProcessSection from '@/components/fx/home/ProcessSection'
import { DeliverablesSection, JournalSection, QuoteBand, SoftwareSection, WorksSection } from '@/components/fx/home/HomeSections'
import { toFxLocale } from '@/content/fixral'
import { useFx } from '@/components/fx/FxData'

interface HomeTemplateProps {
  lang?: string
}

export default function HomeTemplate({ lang }: HomeTemplateProps) {
  const L = toFxLocale(lang)
  const { visible } = useFx(L)
  const openQuote = () => window.dispatchEvent(new Event('openProjectModal'))
  // Bölüm görünürlüğü: panel → Site İçeriği → Bölümler
  return (
    <>
      <HeroSection lang={L} onQuote={openQuote} />
      <ProductLaunch lang={L} />
      {visible('strip') && <ServiceStrip lang={L} />}
      {visible('services') && <DisciplinesSection lang={L} />}
      {visible('process') && <ProcessSection lang={L} />}
      {visible('works') && <WorksSection lang={L} />}
      {visible('software') && <SoftwareSection lang={L} />}
      {visible('deliv') && <DeliverablesSection lang={L} />}
      {visible('journal') && <JournalSection lang={L} />}
      {visible('quote') && <QuoteBand lang={L} />}
    </>
  )
}
