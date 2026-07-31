'use client'

/**
 * HomeTemplate — anasayfa bileşim şablonu (precision engineering anlatısı).
 * 8 aktif bölüm; TechShowcase3D kaldırıldı (3D viewer hero'ya taşındı),
 * SectionTransition yerine bölüm içi hairline'lar kullanılıyor.
 *
 * Akış sırası:
 * 1. NewHero                     — full-bleed dark hero (BlueprintGrid + 3D öğe)
 * 2. ClientLogos                 — monospace yetkinlik ticker'ı (capabilities strip)
 * 3. ServicesBentoGrid           — numaralı teknik kart grid'i
 * 4. ProcessFlow                 — Tara → Modelle → Doğrula → Üret (MeasureRule)
 * 5. PortfolioHorizontalShowcase — scan-line hover + monospace metadata
 * 6. StatsCounter                — DataStat bandı (µm / mm / + birimleri)
 * 7. NewsEditorialGrid           — editorial haber grid'i
 * 8. FullWidthCTA                — BlueprintGrid'li dark panel, tek turuncu CTA
 */
import { NewHero } from '@/components/home/NewHero'
import ClientLogos from '@/components/home/ClientLogos'
import ServicesBentoGrid from '@/components/home/ServicesBentoGrid'
import ProcessFlow from '@/components/home/ProcessFlow'
import PortfolioHorizontalShowcase from '@/components/home/PortfolioHorizontalShowcase'
import NewsEditorialGrid from '@/components/home/NewsEditorialGrid'
import StatsCounter from '@/components/home/StatsCounter'
import FullWidthCTA from '@/components/home/FullWidthCTA'

interface HomeTemplateProps {
  lang?: string
}

export default function HomeTemplate({ lang: _lang }: HomeTemplateProps) {
  return (
    <>
      {/* 1. Hero — full-bleed dark panel; fixed header telafisi hero içinde (pt-14) */}
      <NewHero />

      <main className="relative isolate">
        {/* 2. Capabilities strip — monospace ticker */}
        <div className="relative border-b border-border bg-secondary">
          <ClientLogos />
        </div>

        {/* 3. Services — numaralı teknik kart grid'i */}
        <ServicesBentoGrid />

        {/* 4. Process — 4 adımlı süreç akışı */}
        <ProcessFlow />

        {/* 5. Portfolio — scan-line hover'lı showcase */}
        <PortfolioHorizontalShowcase />

        {/* 6. Stats — DataStat bandı */}
        <div className="relative border-y border-border bg-secondary">
          <StatsCounter />
        </div>

        {/* 7. News — editorial grid */}
        <NewsEditorialGrid />

        {/* 8. CTA — full width dark panel */}
        <FullWidthCTA />
      </main>
    </>
  )
}
