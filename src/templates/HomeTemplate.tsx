'use client'

/**
 * HomeTemplate — Graphite + Lime showcase composition.
 */
import { PageShell } from '@/components/layout/PageShell'
import { Section } from '@/components/layout/Section'
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
    <PageShell>
      <NewHero />

      <Section variant="marquee" band className="!py-0">
        <ClientLogos />
      </Section>

      <Section variant="bento">
        <ServicesBentoGrid />
      </Section>

      <ProcessFlow />

      <PortfolioHorizontalShowcase />

      <Section variant="stats" band>
        <StatsCounter />
      </Section>

      <Section variant="editorial">
        <NewsEditorialGrid />
      </Section>

      <FullWidthCTA />
    </PageShell>
  )
}
