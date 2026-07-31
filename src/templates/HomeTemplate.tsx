'use client'

/**
 * HomeTemplate — anasayfa bileşim şablonu.
 * 9 section; Printables tarzı düz kart grid'leri ve token tabanlı yüzey bandı.
 *
 * Akış sırası:
 * 1. NewHero                   — boxed banner carousel (Printables paradigması)
 * 2. SectionTransition         — hairline ayırıcı
 * 3. ClientLogos               — compact band (marquee layout)
 * 4. ServicesBentoGrid         — kart grid (2/3/4 kolon)
 * 5. PortfolioHorizontalShowcase — kart grid (2/3/4 kolon)
 * 6. TechShowcase3D            — split column
 * 7. NewsEditorialGrid         — kart grid (1/2/3 kolon)
 * 8. StatsCounter              — compact strip (counter layout)
 * 9. FullWidthCTA              — full width (CTA layout)
 */
import { NewHero } from '@/components/home/NewHero'
import { SectionTransition } from '@/components/home/SectionTransition'
import ClientLogos from '@/components/home/ClientLogos'
import ServicesBentoGrid from '@/components/home/ServicesBentoGrid'
import PortfolioHorizontalShowcase from '@/components/home/PortfolioHorizontalShowcase'
import TechShowcase3D from '@/components/home/TechShowcase3D'
import NewsEditorialGrid from '@/components/home/NewsEditorialGrid'
import StatsCounter from '@/components/home/StatsCounter'
import FullWidthCTA from '@/components/home/FullWidthCTA'

interface HomeTemplateProps {
  lang?: string
}

export default function HomeTemplate({ lang: _lang }: HomeTemplateProps) {
  return (
    <>
      {/* 1. Hero — boxed banner carousel: fixed header (h-14) telafisi + 1280px kutu */}
      <div className="bg-background pt-14">
        <div className="container-boxed pt-4 sm:pt-6">
          <NewHero />
        </div>
      </div>

      {/* 2. Transition — hairline ayırıcı */}
      <SectionTransition />

      <main className="relative isolate">
        {/* 3. Client logos — marquee band */}
        <div className="relative bg-secondary border-b border-border">
          <ClientLogos />
        </div>

        {/* 4. Services — kart grid */}
        <ServicesBentoGrid />

        {/* 5. Portfolio — kart grid */}
        <PortfolioHorizontalShowcase />

        {/* 6. Tech showcase — split column */}
        <div className="relative bg-secondary border-b border-border">
          <TechShowcase3D />
        </div>

        {/* 7. News — kart grid */}
        <NewsEditorialGrid />

        {/* 8. Stats — animated counter strip */}
        <div className="relative bg-accent border-y border-border">
          <StatsCounter />
        </div>

        {/* 9. CTA — full width */}
        <FullWidthCTA />
      </main>
    </>
  )
}
